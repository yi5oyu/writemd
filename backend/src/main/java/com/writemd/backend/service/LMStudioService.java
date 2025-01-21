package com.writemd.backend.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class LMStudioService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String LMSTUDIO_BASE_URL = "http://localhost:1234/v1";

    // 모델
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

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);
        ResponseEntity<String> response =
                restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        return response.getBody();
    }
}
