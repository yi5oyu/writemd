package com.writemd.backend.controller;

import com.writemd.backend.dto.ChatDTO;
import com.writemd.backend.service.ChatService;
import com.writemd.backend.service.UserService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private UserService userService;

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

    // 채팅 리스트 조회
    @GetMapping("/{sessionId}")
    public List<ChatDTO> getChats(@PathVariable Long sessionId) {
        return userService.chatList(sessionId);
    }


    // 세션 삭제
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long sessionId) {
        chatService.deleteSession(sessionId);
        // 204
        return ResponseEntity.noContent().build();
    }
}
