package com.writemd.backend.service;

import com.writemd.backend.dto.APIDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.entity.APIs;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.ApiRepository;
import com.writemd.backend.repository.UserRepository;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
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
        Users user = userRepository.findByGithubId(githubId)
            .orElseThrow(() -> {
                return new RuntimeException("유저 찾을 수 없음: " + githubId);
            });

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
        Cache cache = cacheManager.getCache("user");
        if (cache != null) {
            cache.put(githubId, user);
        }
    }

    // API 키
    @Cacheable(value = "api-key", key = "#userId + ':' + #apiId")
    public APIDTO findApiKey(Long userId, Long apiId) {
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

    // 모든 API 키
    @Cacheable(value = "user-api-keys", key = "#userId")
    public List<APIDTO> findApiKeysByUserId(Long userId) {
        List<APIs> apiEntities = apiRepository.findByUsersId(userId);

        return apiEntities.stream()
            .map(api -> APIDTO.builder()
                .apiId(api.getId())
                .aiModel(api.getAiModel())
                .apiKey(api.getApiKey())
                .build())
            .collect(Collectors.toList());
    }

    // API 키 캐시 갱신/삭제
    @CacheEvict(value = "api-key", key = "#userId + ':' + #apiId")
    public void evictApiKeyCache(Long userId, Long apiId) {
        // API 키 업데이트/삭제 시 캐시 무효화
    }

    @CachePut(value = "api-key", key = "#userId + ':' + #result.apiId")
    public APIDTO updateApiKeyCache(Long userId, APIDTO apiDto) {
        return apiDto;
    }
}
