package com.writemd.backend.service;

import com.writemd.backend.repository.ChatRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class LMStudioService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String LMSTUDIO_BASE_URL = "http://localhost:1234/v1";

    private final List<Map<String, Object>> chatHistory = new ArrayList<>();

    @Autowired
    private ChatRepository chatRepository;

    // 모델 가져오기
    public String getModels() {
        String url = LMSTUDIO_BASE_URL + "/models";
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return response.getBody();
    }

    // 채팅
    public String chatCompletion(Map<String, Object> requestPayload) {
        String url = LMSTUDIO_BASE_URL + "/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 대화 추가
        Map<String, Object> userMessageMap = new HashMap<>();
        userMessageMap.put("role", "user");
        userMessageMap.put("content", requestPayload.get("content"));
        chatHistory.add(userMessageMap);

        // LM Studio 요청 데이터
        Map<String, Object> payload = new HashMap<>();
        payload.put("messages", chatHistory);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        ResponseEntity<String> response =
                restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        // LM Studio 응답을 저장
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("role", "assistant");
        responseMap.put("content", response.getBody());
        chatHistory.add(responseMap);

        return response.getBody();
    }
}
