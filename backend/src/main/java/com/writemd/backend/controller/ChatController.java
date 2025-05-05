package com.writemd.backend.controller;

import com.writemd.backend.config.SseEmitterManager;
import com.writemd.backend.dto.ChatDTO;
import com.writemd.backend.dto.SessionDTO;
import com.writemd.backend.service.ChatService;
import com.writemd.backend.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final UserService userService;
    private final ChatService chatService;
    private final SseEmitterManager sseEmitterManager;

    // 채팅 시작
    @PostMapping("/{userId}/{sessionId}/{apiId}")
    public ResponseEntity<String> chat(@PathVariable Long userId, @PathVariable Long sessionId,
        @PathVariable Long apiId, @RequestBody Map<String, Object> requestPayload) {
        String content = (String) requestPayload.get("content");
        String model = (String) requestPayload.get("model");

        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body("content 없음");
        }

        try {
            chatService.chat(sessionId, userId, apiId, model, content);
            return ResponseEntity.accepted().body("채팅 시작. SSE 연결 중...");
        }  catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("채팅 시작 실패: " + e.getMessage());
        }
    }

    // SSE 채팅
    @GetMapping(value = "/stream/{sessionId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(@PathVariable Long sessionId) {
        SseEmitter emitter = new SseEmitter(300_000L);
        // SseEmitter 객체 등록
        try {
            sseEmitterManager.addEmitter(sessionId, emitter);
        } catch (Exception e) {
            log.error("{}연결 등록 실패", sessionId, e);
            emitter.completeWithError(new RuntimeException("SSE 연결 등록 실패 " + sessionId));
            return emitter;
        }
        // 연결 확인 메세지 전송
        try {
            sseEmitterManager.sendToSession(sessionId, "connect", "세션에 SSE 연결 시작" + sessionId);
            log.info("연결 시작 {}:", sessionId);
        } catch (Exception e) {
            log.warn("연결 시작 실패 {}", sessionId, e);
        }
        return emitter;
    }

    // SSE 중지
    @PostMapping("/stop/{sessionId}")
    public ResponseEntity<String> stopChatStream(@PathVariable Long sessionId) {
        log.info("채팅 스트림 중지 요청 수신 {}", sessionId);
        try {
            chatService.stopChatStream(sessionId);
            log.info("채팅 스트림 중지 완료 {}", sessionId);
            return ResponseEntity.ok("채팅 스트림 중지" + sessionId);
        } catch (Exception e) {
            log.error("채팅 스트림 중지 처리 중 오류 발생 {}, {}", sessionId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("채팅 스트림 중지 처리 중 오류가 발생: " + e.getMessage());
        }
    }

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
