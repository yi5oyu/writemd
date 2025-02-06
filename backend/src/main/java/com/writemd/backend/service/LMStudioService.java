package com.writemd.backend.service;

import com.writemd.backend.entity.Chats;
import com.writemd.backend.entity.Notes;
import com.writemd.backend.entity.Sessions;
import com.writemd.backend.repository.ChatRepository;
import com.writemd.backend.repository.NoteRepository;
import com.writemd.backend.repository.SessionRepository;
import java.time.LocalDateTime;
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

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private NoteRepository noteRepository;

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

    public void saveMessage(Long sessionId, String content, String role) {
        Sessions session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("세션 없음"));

        Chats chat = Chats.builder().sessions(session).role(role).content(content)
                .time(LocalDateTime.now()).build();

        chatRepository.save(chat);
    }

    public Long createSession(Map<String, Object> requestPayload) {
        Long noteId = Long.parseLong(requestPayload.get("noteId").toString());
        Notes note = noteRepository.findById(noteId)
                .orElseThrow(() -> new IllegalArgumentException("노트 없음"));

        Sessions session = Sessions.builder().notes(note).title("Chat" + noteId).build();

        sessionRepository.save(session);
        return session.getId();
    }
}
