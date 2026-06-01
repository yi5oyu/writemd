package com.writemd.backend.service;

import com.writemd.backend.dto.APIDTO;
import com.writemd.backend.dto.NoteDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.entity.APIs;
import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.ApiRepository;
import com.writemd.backend.repository.NoteRepository;
import com.writemd.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class CachingDataService {

    private final ObjectMapper objectMapper;
    private final CacheManager cacheManager;
    private final UserRepository userRepository;
    private final ApiRepository apiRepository;
    private final NoteRepository noteRepository;

    @Value("${app.guest.openai-api-key}")
    private String guestOpenaiApiKey;

    @Cacheable(value = "template-data", key = "'my-templates'", cacheManager = "localCacheManager", sync = true)
    public List<Map<String, String>> getMyTemplates() {
        log.info("로컬 캐시 Miss: 파일로부터 '내 템플릿' 데이터 동적 로딩 및 적재 (Pull)");
        return loadTemplateDataFromFile("data/template.json");
    }

    @Cacheable(value = "template-data", key = "'git-templates'", cacheManager = "localCacheManager", sync = true)
    public List<Map<String, String>> getGitTemplates() {
        log.info("로컬 캐시 Miss: 파일로부터 '깃 템플릿' 데이터 동적 로딩 및 적재 (Pull)");
        return loadTemplateDataFromFile("data/git_template.json");
    }

    private List<Map<String, String>> loadTemplateDataFromFile(String filePath) {
        try {
            Resource resource = new ClassPathResource(filePath);
            List<Map<String, String>> rawData = objectMapper.readValue(
                resource.getInputStream(),
                new TypeReference<List<Map<String, String>>>() {}
            );
            return rawData.stream().map(Map::copyOf).toList();
        } catch (IOException e) {
            log.error("템플릿 정적 파일 로딩 실패. path={}", filePath, e);
            return Collections.emptyList();
        }
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

    // 노트 목록 캐시 조회
    @Cacheable(value = "user-notes", key = "#userId")
    public List<NoteDTO> findNotesByUserId(Long userId) {
        log.info("DB에서 노트 목록 조회: userId={}", userId);
        List<Notes> notes = noteRepository.findNotesByUserId(userId);
        return notes.stream()
            .map(n -> NoteDTO.builder()
                .noteId(n.getId())
                .noteName(n.getNoteName())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build())
            .collect(Collectors.toList());
    }

    // 노트 생성/수정/삭제 시 해당 유저 노트 목록 캐시 무효화
    public void evictNoteCache(Long userId) {
        Cache noteCache = cacheManager.getCache("user-notes");
        if (noteCache != null) {
            noteCache.evict(userId);
            log.info("노트 목록 캐시 무효화: userId={}", userId);
        }
    }

    // 노트 생성 시 캐시 목록에 직접 추가
    public void addNoteToCache(Long userId, NoteDTO newNote) {
        Cache noteCache = cacheManager.getCache("user-notes");
        if (noteCache == null) {
            return;
        }
        Cache.ValueWrapper wrapper = noteCache.get(userId);
        if (wrapper != null) {
            @SuppressWarnings("unchecked")
            List<NoteDTO> list = new ArrayList<>((List<NoteDTO>) wrapper.get());
            list.add(newNote);
            noteCache.put(userId, list);
            log.info("노트 목록 캐시 추가: userId={}, noteId={}", userId, newNote.noteId());
        }
    }

    // 노트 이름 변경 시 캐시 내 해당 항목만 수정
    public void updateNoteNameInCache(Long userId, Long noteId, String newName) {
        Cache noteCache = cacheManager.getCache("user-notes");
        if (noteCache == null) {
            return;
        }
        Cache.ValueWrapper wrapper = noteCache.get(userId);
        if (wrapper != null) {
            @SuppressWarnings("unchecked")
            List<NoteDTO> updated = ((List<NoteDTO>) wrapper.get()).stream()
                .map(n -> n.noteId().equals(noteId)
                    ? n.toBuilder().noteName(newName).updatedAt(LocalDateTime.now()).build()
                    : n)
                .collect(Collectors.toList());
            noteCache.put(userId, updated);
            log.info("노트 이름 캐시 갱신: userId={}, noteId={}", userId, noteId);
        }
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
        if (apiId == 0) {
            return APIDTO.builder()
                .apiId(0L)
                .aiModel("openai")
                .apiKey(guestOpenaiApiKey)
                .build();
        }

        Optional<APIs> apiEntity = apiRepository.findById(apiId);
        log.info("DB에서 API 키 조회: userId={}", userId);

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
            String key = userId + ":" + savedApiDto.apiId();
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
                        .filter(api -> !api.apiId().equals(apiId))
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
