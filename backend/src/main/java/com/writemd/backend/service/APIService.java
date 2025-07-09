package com.writemd.backend.service;

import com.writemd.backend.dto.APIDTO;
import com.writemd.backend.entity.APIs;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.ApiRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;


@Service
@RequiredArgsConstructor
public class APIService {


    private final CachingDataService cachingDataService;
    private final ApiRepository apiRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    // hash 키
    private String getUserHashKey(Long userId) {
        return "ai:" + userId;
    }

    // API 키 저장
    @Transactional
    public APIDTO saveAPIKey(Long userId, String githubId, String aiModel, String apikey) {
        Users users = cachingDataService.findUserByGithubId(githubId);

        APIs newapi = APIs.builder()
            .aiModel(aiModel)
            .apiKey(apikey)
            .users(users)
            .build();

        APIs api = apiRepository.save(newapi);

        String maskedApiKey = maskApiKey(apikey);
        APIDTO apiDTO = APIDTO.builder()
            .apiId(api.getId())
            .aiModel(aiModel)
            .apiKey(maskedApiKey)
            .build();

        // 커밋 후 Redis 업데이트
        TransactionSynchronizationManager.registerSynchronization(
            new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        String hashKey = getUserHashKey(userId);
                        String fieldKey = "key:" + api.getId();

                        redisTemplate.opsForHash().put(hashKey, fieldKey,
                            APIDTO.builder()
                                .apiId(api.getId())
                                .aiModel(aiModel)
                                .apiKey(apikey)
                                .build()
                        );
                        redisTemplate.expire(hashKey, 12, TimeUnit.HOURS);
                    } catch (Exception e) {
                        // Redis 실패해도 DB는 정상 동작
                    }
                }
            }
        );
        return apiDTO;
    }

    // API 키 조회
    @Transactional(readOnly = true)
    public List<APIDTO> getAPIKeys(Long userId) {
        // 모든 API 키 조회
        String hashKey = getUserHashKey(userId);
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(hashKey);

        if (!entries.isEmpty()) {
            return entries.values().stream()
                .map(dto -> {
                    APIDTO apiDto = (APIDTO) dto;
                    return APIDTO.builder()
                        .apiId(apiDto.getApiId())
                        .aiModel(apiDto.getAiModel())
                        .apiKey(maskApiKey(apiDto.getApiKey()))
                        .build();
                })
                .collect(Collectors.toList());
        }

        // DB에서 모든 API 키 조회
        List<APIs> apiEntities = apiRepository.findByUsersId(userId);
        List<APIDTO> dtos = new ArrayList<>();

        // Redis에 없는 키만 저장
        Map<String, APIDTO> hashEntries = new HashMap<>();
        for (APIs api : apiEntities) {
            APIDTO dto = APIDTO.builder()
                .apiId(api.getId())
                .aiModel(api.getAiModel())
                .apiKey(api.getApiKey())
                .build();

            hashEntries.put("key:" + api.getId(), dto);
            dtos.add(APIDTO.builder()
                .apiId(dto.getApiId())
                .aiModel(dto.getAiModel())
                .apiKey(maskApiKey(dto.getApiKey()))
                .build());
        }

        redisTemplate.opsForHash().putAll(hashKey, hashEntries);
        redisTemplate.expire(hashKey, 12, TimeUnit.HOURS);

        return dtos;
    }

    // 마스킹
    private String maskApiKey(String apiKey) {
        if (apiKey == null || apiKey.length() <= 7) {
            return "**********";
        }
        int prefixLength = 5;
        int suffixLength = 3;
        int totalLength = apiKey.length();

        String mask = "**********";

        return apiKey.substring(0, prefixLength) +
            mask +
            apiKey.substring(totalLength - suffixLength);
    }

    // API 키 삭제
    @Transactional
    public void deleteAPIKey(Long apiId) {
        APIs api = apiRepository.findById(apiId)
            .orElseThrow(() -> new RuntimeException("삭제할 API 키를 찾을 수 없습니다. ID: " + apiId));

        apiRepository.deleteById(apiId);

        String hashKey = getUserHashKey(api.getUsers().getId());
        String fieldKey = "key:" + apiId;
        redisTemplate.opsForHash().delete(hashKey, fieldKey);
    }
}
