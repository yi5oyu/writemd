package com.writemd.backend.service;

import com.writemd.backend.dto.APIDTO;
import com.writemd.backend.entity.APIs;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.ApiRepository;
import com.writemd.backend.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class APIService {

    private final UserRepository userRepository;
    private final ApiRepository apiRepository;

    @Transactional
    public APIs saveAPIKey(Long userId, String aiModel ,String apikey) {
        Users users = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User 찾을 수 없음"));

        APIs newapi = APIs.builder()
            .aiModel(aiModel)
            .apiKey(apikey)
            .users(users)
            .build();

        return apiRepository.save(newapi);
    }

    @Transactional
    public List<APIDTO> getAPIKeys(Long userId){
        List<APIs> apiEntities = apiRepository.findByUsersId(userId);

        List<APIDTO> apiDtos = apiEntities.stream()
            .map(api -> APIDTO.builder()
                .apiId(api.getId())
                .aiModel(api.getAiModel())
                .apiKey(maskApiKey(api.getApiKey()))
                .build())
            .collect(Collectors.toList());

        return apiDtos;
    }

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
}
