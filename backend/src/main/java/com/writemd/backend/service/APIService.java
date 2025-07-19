package com.writemd.backend.service;

import com.writemd.backend.dto.APIDTO;
import com.writemd.backend.entity.APIs;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.ApiRepository;
import com.writemd.backend.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;


@Service
@RequiredArgsConstructor
@Slf4j
public class APIService {

    private final CachingDataService cachingDataService;
    private final ApiRepository apiRepository;
    private final UserRepository userRepository;

    // API 키 저장
    @Transactional
    public APIDTO saveAPIKey(Long userId, String githubId, String aiModel, String apikey) {
        Users users = userRepository.findByGithubId(githubId)
            .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음: " + githubId));

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

        // 캐싱
        TransactionSynchronizationManager.registerSynchronization(
            new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        APIDTO cacheDto = APIDTO.builder()
                            .apiId(api.getId())
                            .aiModel(aiModel)
                            .apiKey(apikey)
                            .build();

                        cachingDataService.handleApiKeySaved(userId, cacheDto);
                    } catch (Exception e) {
                        log.error("캐시 업데이트 실패: userId={}, apiId={}, error={}", userId, api.getId(), e.getMessage());
                    }
                }
            }
        );
        return apiDTO;
    }

    // API 키 조회
    @Transactional(readOnly = true)
    public List<APIDTO> getAPIKeys(Long userId) {
        List<APIDTO> apiKeys = cachingDataService.findApiKeysByUserId(userId);

        return apiKeys.stream()
            .map(dto -> APIDTO.builder()
                .apiId(dto.getApiId())
                .aiModel(dto.getAiModel())
                .apiKey(maskApiKey(dto.getApiKey()))
                .build())
            .collect(Collectors.toList());
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
        return apiKey.substring(0, prefixLength) + mask + apiKey.substring(totalLength - suffixLength);
    }

    // API 키 삭제
    @Transactional
    public void deleteAPIKey(Long apiId) {
        APIs api = apiRepository.findById(apiId)
            .orElseThrow(() -> new RuntimeException("삭제할 API 키를 찾을 수 없습니다. ID: " + apiId));

        Long userId = api.getUsers().getId();

        apiRepository.deleteById(apiId);

        TransactionSynchronizationManager.registerSynchronization(
            new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        cachingDataService.handleApiKeyDeleted(userId, apiId); // 이것으로 변경
                        log.info("API 키 삭제 후 캐시 업데이트 완료: userId={}, apiId={}", userId, apiId);
                    } catch (Exception e) {
                        log.error("캐시 삭제 실패: userId={}, apiId={}, error={}", userId, apiId, e.getMessage());
                    }
                }
            }
        );

    }
}
