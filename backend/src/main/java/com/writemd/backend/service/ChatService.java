package com.writemd.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class ChatService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String LMSTUDIO_BASE_URL = "http://localhost:1234/v1";

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

    // 채팅 요청
    public String chatCompletion(Long sessionId) {
        List<Chats> chatHistory = chatRepository.findBySessions_Id(sessionId);

        List<Map<String, Object>> messages = new ArrayList<>();

        Map<String, Object> messageMap = new HashMap<>();

        for (Chats chat : chatHistory) {
            messageMap.put("role", chat.getRole());
            messageMap.put("content", chat.getContent());
            messages.add(messageMap);
        }

        // LM Studio 요청 데이터
        Map<String, Object> payload = new HashMap<>();
        payload.put("messages", messages);

        // Lm Studio 호출
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        ResponseEntity<String> response = restTemplate.exchange(
                LMSTUDIO_BASE_URL + "/chat/completions", HttpMethod.POST, entity, String.class);

        JsonNode rootNode;
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            rootNode = objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            return "오류";
        }

        // LM Studio 응답 저장
        saveChat(sessionId, "assistant",
                rootNode.path("choices").get(0).path("message").path("content").asText());

        return response.getBody();
    }

    public void saveChat(Long sessionId, String role, String content) {
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

    // 채팅 세션 삭제
    @Transactional
    public void deleteSession(Long sessionId) {
        sessionRepository.deleteById(sessionId);
    }

}
