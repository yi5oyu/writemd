package com.writemd.backend.service;

import com.writemd.backend.dto.APIDTO;
import com.writemd.backend.entity.APIs;
import com.writemd.backend.entity.Users;
import com.writemd.backend.event.ApiKeyDeletedEvent;
import com.writemd.backend.event.ApiKeySavedEvent;
import com.writemd.backend.repository.ApiRepository;
import com.writemd.backend.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Slf4j
public class APIService {

    private final CachingDataService cachingDataService;
    private final ApiRepository apiRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

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

        APIDTO cacheDto = APIDTO.builder()
            .apiId(api.getId())
            .aiModel(aiModel)
            .apiKey(apikey)
            .build();

        // 이벤트 발행
        eventPublisher.publishEvent(new ApiKeySavedEvent(this, userId, cacheDto));

        // 마스킹
        String maskedApiKey = maskApiKey(apikey);
        return APIDTO.builder()
            .apiId(api.getId())
            .aiModel(aiModel)
            .apiKey(maskedApiKey)
            .build();
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
            .orElseThrow(() -> new RuntimeException("삭제할 API 키 없음 ID: " + apiId));

        Long userId = api.getUsers().getId();

        apiRepository.deleteById(apiId);

        // 이벤트 발행
        eventPublisher.publishEvent(new ApiKeyDeletedEvent(this, userId, apiId));
    }
}
