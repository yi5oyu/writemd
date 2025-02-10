package com.writemd.backend.controller;

import com.writemd.backend.service.ChatService;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;


    // 모델 목록 가져오기
    @GetMapping("/models")
    public ResponseEntity<String> getModels() {
        String models = chatService.getModels();
        return ResponseEntity.ok(models);
    }

    // 채팅 요청
    @PostMapping("/lmstudio")
    public ResponseEntity<String> chatCompletion(@RequestBody Map<String, Object> requestPayload) {
        Long sessionId = Long.parseLong(requestPayload.get("sessionId").toString());
        String content = (String) requestPayload.get("content");

        chatService.saveChat(sessionId, "user", content);

        String response = chatService.chatCompletion(sessionId);
        return ResponseEntity.ok(response);
    }

    // 세션 생성
    @PostMapping("/session")
    public ResponseEntity<Map<String, Object>> createSession(
            @RequestBody Map<String, Object> requestPayload) {
        Long sessionId = chatService.createSession(requestPayload);

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", sessionId);

        return ResponseEntity.ok(response);
    }

    // 세션 삭제
    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long sessionId) {
        chatService.deleteSession(sessionId);
        // 204
        return ResponseEntity.noContent().build();
    }
}
