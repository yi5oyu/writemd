package com.writemd.backend.service;

import com.writemd.backend.dto.APIDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.entity.APIs;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.ApiRepository;
import com.writemd.backend.repository.UserRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CachingDataService {

    private final CacheManager cacheManager;
    private final UserRepository userRepository;
    private final ApiRepository apiRepository;

    @Cacheable(value = "template-data", key = "'my-templates'")
    public List<Map<String, String>> getMyTemplates() {
        return Collections.emptyList();
    }

    @Cacheable(value = "template-data", key = "'git-templates'")
    public List<Map<String, String>> getGitTemplates() {
        return Collections.emptyList();
    }

    // 유저 정보 찾기
    @Cacheable(value = "user", key = "#githubId")
    public UserDTO findUserByGithubId(String githubId) {
        log.info("DB에서 유저 조회: githubId={}", githubId);

        Users user = userRepository.findByGithubId(githubId)
            .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음: " + githubId));

        return UserDTO.builder()
            .userId(user.getId())
            .githubId(user.getGithubId())
            .name(user.getName())
            .avatarUrl(user.getAvatarUrl())
            .htmlUrl(user.getHtmlUrl())
            .build();
    }

    // 유저 정보 저장
    @Async
    public void updateUserCache(String githubId, UserDTO user) {
        log.info("유저 캐시 업데이트: githubId={}", githubId);
        Cache cache = cacheManager.getCache("user");
        if (cache != null) {
            cache.put(githubId, user);
        }
    }

    // 모든 API 키
    @Cacheable(value = "user-api-keys", key = "#userId")
    public List<APIDTO> findApiKeysByUserId(Long userId) {
        log.info("DB에서 API 키 목록 조회: userId={}", userId);
        List<APIs> apiEntities = apiRepository.findByUsersId(userId);

        return apiEntities.stream()
            .map(api -> APIDTO.builder()
                .apiId(api.getId())
                .aiModel(api.getAiModel())
                .apiKey(api.getApiKey())
                .build())
            .collect(Collectors.toList());
    }

    // API 키
    @Cacheable(value = "api-key", key = "#userId + ':' + #apiId")
    public APIDTO findApiKey(Long userId, Long apiId) {
        log.info("DB에서 API 키 조회: userId={}", userId);
        Optional<APIs> apiEntity = apiRepository.findById(apiId);

        if (apiEntity.isPresent()) {
            APIs api = apiEntity.get();
            return APIDTO.builder()
                .apiId(api.getId())
                .aiModel(api.getAiModel())
                .apiKey(api.getApiKey())
                .build();
        }
        return null;
    }

    // API 키 저장 캐시
    public void handleApiKeySaved(Long userId, APIDTO savedApiDto) {
        Cache apiKeyCache = cacheManager.getCache("api-key");
        if (apiKeyCache != null) {
            String key = userId + ":" + savedApiDto.getApiId();
            apiKeyCache.put(key, savedApiDto);
            log.info("개별 API 키 캐시 추가: key={}", key);
        }

        Cache userApiKeysCache = cacheManager.getCache("user-api-keys");
        if (userApiKeysCache != null) {
            Cache.ValueWrapper wrapper = userApiKeysCache.get(userId);
            if (wrapper != null) {
                @SuppressWarnings("unchecked")
                List<APIDTO> cachedList = (List<APIDTO>) wrapper.get();
                if (cachedList != null) {
                    List<APIDTO> updatedList = new ArrayList<>(cachedList);
                    updatedList.add(savedApiDto);
                    userApiKeysCache.put(userId, updatedList);
                    log.info("캐시 업데이트 완료: userId={}, 총 개수={}", userId, updatedList.size());
                    return;
                }
            }
            // 캐시가 없거나 null이면 무효화
            userApiKeysCache.evict(userId);
            log.info("캐시 무효화: userId={}", userId);
        }
    }

    // API 키 삭제 시 캐시 관리
    public void handleApiKeyDeleted(Long userId, Long apiId) {
        Cache apiKeyCache = cacheManager.getCache("api-key");
        if (apiKeyCache != null) {
            String key = userId + ":" + apiId;
            apiKeyCache.evict(key);
            log.info("개별 API 키 캐시 삭제: key={}", key);
        }

        Cache userApiKeysCache = cacheManager.getCache("user-api-keys");
        if (userApiKeysCache != null) {
            Cache.ValueWrapper wrapper = userApiKeysCache.get(userId);
            if (wrapper != null) {
                @SuppressWarnings("unchecked")
                List<APIDTO> cachedList = (List<APIDTO>) wrapper.get();
                if (cachedList != null) {
                    List<APIDTO> updatedList = cachedList.stream()
                        .filter(api -> !api.getApiId().equals(apiId))
                        .collect(Collectors.toList());
                    userApiKeysCache.put(userId, updatedList);
                    log.info("캐시 업데이트 완료: userId={}, 총 개수={}", userId, updatedList.size());
                    return;
                }
            }
            // 캐시가 없거나 null 무효화
            userApiKeysCache.evict(userId);
            log.info("캐시 무효화: userId={}", userId);
        }
    }
}
