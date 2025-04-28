package com.writemd.backend.controller;

import com.writemd.backend.dto.ChatDTO;
import com.writemd.backend.dto.SessionDTO;
import com.writemd.backend.service.ChatService;
import com.writemd.backend.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final UserService userService;
    private final ChatService chatService;

    // 연결 확인
    @GetMapping("/connected")
    public ResponseEntity<String> checkConnection() {
        boolean isConnected = chatService.isConnected();
        if (isConnected) {
            return ResponseEntity.ok("연결 성공");
        } else {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("연결 실패");
        }
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

    // chat
    @PostMapping("/{userId}/{sessionId}/{apiId}")
    public ResponseEntity<String> chat(@PathVariable Long userId, @PathVariable Long sessionId,
        @PathVariable Long apiId, @RequestBody Map<String, Object> requestPayload) {
        String content = (String) requestPayload.get("content");
        String model = (String) requestPayload.get("model");

        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body("content 없음");
        }

        try {
            String response = chatService.chat(sessionId, userId, apiId, model, content);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // API 키 없음, 세션 없음, 빈 메시지 등..
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            // 상태. ChatClient 에러
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("ChatClient 에러");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("AI 응답 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    }


    // 채팅 리스트 조회
    @GetMapping("/{sessionId}")
    public List<ChatDTO> getChats(@PathVariable Long sessionId) {
        return userService.chatList(sessionId);
    }


    // 세션 리스트 조회
    @GetMapping("/sessions/{noteId}")
    public List<SessionDTO> getSessions(@PathVariable Long noteId) {
        return userService.sessionList(noteId);
    }

    // 세션 삭제
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long sessionId) {
        chatService.deleteSession(sessionId);
        // 204
        return ResponseEntity.noContent().build();
    }
}
