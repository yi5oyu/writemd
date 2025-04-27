package com.writemd.backend.service;

import com.writemd.backend.entity.APIs;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.ApiRepository;
import com.writemd.backend.repository.UserRepository;
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
}
