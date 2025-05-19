package com.writemd.backend.controller;

import com.writemd.backend.config.SseEmitterManager;
import com.writemd.backend.dto.ChatDTO;
import com.writemd.backend.dto.SessionDTO;
import com.writemd.backend.service.ChatService;
import com.writemd.backend.service.UserService;
import io.netty.handler.timeout.TimeoutException;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.model.function.FunctionCallback;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final ToolCallbackProvider toolCallbackProvider;

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
            chatService.chat(sessionId, userId, apiId, model, content, false);
            return ResponseEntity.accepted().body("채팅 시작. SSE 연결 중...");
        }  catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("채팅 시작 실패: " + e.getMessage());
        }
    }

    // 채팅
    @PostMapping("/direct/{userId}/{apiId}")
    public CompletableFuture<ResponseEntity<String>> directChat(
        @PathVariable Long userId,
        @PathVariable Long apiId,
        @RequestBody Map<String, Object> requestPayload) {

        String content = (String) requestPayload.get("content");
        String model = (String) requestPayload.get("model");

        if (content == null || content.isBlank()) {
            return CompletableFuture.completedFuture(
                ResponseEntity.badRequest().body("내용이 비어있습니다")
            );
        }

        log.info("Simple Chat 요청: userId={}, apiId={}, model={}, enableTools={}",
            userId, apiId, model, true);

        return chatService.directChat(userId, apiId, model, content, true)
            .thenApply(response -> {
                log.info("Simple Chat 응답 완료: userId={}", userId);
                return ResponseEntity.ok(response);
            })
            .exceptionally(ex -> {
                log.error("Simple Chat 처리 중 오류 발생: {}", ex.getMessage(), ex);
                Throwable cause = ex;

                if (ex instanceof ExecutionException && ex.getCause() != null) {
                    cause = ex.getCause();
                }

                String errorMessage = "처리 중 오류가 발생했습니다: " + cause.getMessage();

                // API 키 오류나 인증 오류 확인
                if (cause.getMessage() != null &&
                    (cause.getMessage().contains("invalid_api_key") ||
                        cause.getMessage().contains("401"))) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("잘못된 API 키가 제공되었습니다");
                }

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorMessage);
            });
    }

    // 레포지토리 구조
    @PostMapping("/structure/{userId}/{apiId}")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> getRepoStructure(
        @AuthenticationPrincipal(expression = "name") String principalName,
        @PathVariable Long userId,
        @PathVariable Long apiId,
        @RequestBody Map<String, Object> requestPayload) {

        String repo = (String) requestPayload.get("repo");
        String model = (String) requestPayload.get("model");
        String branch = (String) requestPayload.get("branch");
        String githubId = (String) requestPayload.get("githubId");
        Integer maxDepth = (Integer) requestPayload.get("maxDepth");

        if (repo == null || repo.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "repo는 필수 값입니다.");
            return CompletableFuture.completedFuture(
                ResponseEntity.badRequest().body(errorResponse)
            );
        }

        if (model == null || model.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "model은 필수 값입니다.");
            return CompletableFuture.completedFuture(
                ResponseEntity.badRequest().body(errorResponse)
            );
        }

        return chatService.githubRepoStructure(principalName, userId, apiId, model, repo, githubId, branch, maxDepth)
            .thenApply(response -> {
                log.info("GitHub 레포지토리 구조 응답 완료: repo={}", repo);
                return ResponseEntity.ok(response);
            })
            .exceptionally(ex -> {
                log.error("GitHub 레포지토리 구조 조회 중 오류: {}", ex.getMessage(), ex);

                // 오류 응답 처리
                Map<String, Object> errorResponse = new HashMap<>();

                if (ex.getCause() instanceof IllegalArgumentException) {
                    errorResponse.put("error", ex.getMessage());
                    return ResponseEntity.badRequest().body(errorResponse);
                } else if (ex.getMessage() != null && ex.getMessage().contains("로그인")) {
                    errorResponse.put("error", "GitHub 로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
                } else {
                    errorResponse.put("error", "GitHub 레포지토리 구조 조회 중 오류가 발생했습니다: " + ex.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                }
            });
    }

    @PostMapping("/analysis/{userId}/{apiId}")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> analyzeRepository(
        @AuthenticationPrincipal(expression = "name") String principalName,
        @PathVariable Long userId,
        @PathVariable Long apiId,
        @RequestBody Map<String, Object> requestPayload) {

        // 요청 파라미터 추출
        String repo = (String) requestPayload.get("repo");
        String model = (String) requestPayload.get("model");
        String branch = (String) requestPayload.get("branch");
        String githubId = (String) requestPayload.get("githubId");
        Integer maxDepth = (Integer) requestPayload.get("maxDepth");

        // 필수 파라미터 검증
        if (repo == null || repo.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "repo는 필수 값입니다.");
            return CompletableFuture.completedFuture(
                ResponseEntity.badRequest().body(errorResponse)
            );
        }

        if (model == null || model.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "model은 필수 값입니다.");
            return CompletableFuture.completedFuture(
                ResponseEntity.badRequest().body(errorResponse)
            );
        }

        log.info("GitHub 레포지토리 단계별 분석 요청: userId={}, repo={}, model={}, branch={}",
            userId, repo, model, branch);

        // 단계별 분석 서비스 호출 (noteId 파라미터 제거)
        return chatService.githubRepoStageAnalysis(
                principalName, userId, apiId, model, repo, githubId, branch, maxDepth)
            .thenApply(response -> {
                log.info("GitHub 레포지토리 단계별 분석 응답 완료: repo={}, 내용 길이: {} 자",
                    repo,
                    response.containsKey("content") ? ((String) response.get("content")).length() : 0);

                // 토큰 사용량 로깅 (있는 경우)
                if (response.containsKey("tokenUsage")) {
                    log.info("토큰 사용량: {}", response.get("tokenUsage"));
                }

                return ResponseEntity.ok(response);
            })
            .exceptionally(ex -> {
                // 원인 추출
                Throwable cause = ex;
                if (ex instanceof CompletionException && ex.getCause() != null) {
                    cause = ex.getCause();
                }

                log.error("GitHub 레포지토리 단계별 분석 중 오류: {}", cause.getMessage(), cause);

                // 오류 응답 처리
                Map<String, Object> errorResponse = new HashMap<>();

                if (cause instanceof IllegalArgumentException) {
                    // 잘못된 인자 오류
                    errorResponse.put("error", cause.getMessage());
                    return ResponseEntity.badRequest().body(errorResponse);
                } else if (cause instanceof TimeoutException) {
                    // 시간 초과 오류
                    errorResponse.put("error", "분석 시간이 초과되었습니다. 나중에 다시 시도해주세요.");
                    errorResponse.put("errorType", "TIMEOUT");
                    return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).body(errorResponse);
                } else if (cause.getMessage() != null && cause.getMessage().contains("로그인")) {
                    // GitHub 인증 오류
                    errorResponse.put("error", "GitHub 로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
                } else if (cause instanceof NonTransientAiException &&
                    cause.getMessage() != null &&
                    cause.getMessage().toLowerCase().contains("rate_limit")) {
                    // API 사용량 제한 오류
                    errorResponse.put("error", "API 사용량 제한을 초과했습니다. 잠시 후 다시 시도해주세요.");
                    errorResponse.put("errorType", "RATE_LIMIT_EXCEEDED");
                    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(errorResponse);
                } else {
                    // 기타 오류
                    errorResponse.put("error", "GitHub 레포지토리 단계별 분석 중 오류가 발생했습니다: " + cause.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                }
            });
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

    @GetMapping("/tool-callbacks")
    public ResponseEntity<String> getToolCallbacks() {
        FunctionCallback[] callbacks = toolCallbackProvider.getToolCallbacks();

        StringBuilder sb = new StringBuilder();
        sb.append("등록된 도구 콜백 수: ").append(callbacks.length).append("\n");

        for (int i = 0; i < callbacks.length; i++) {
            FunctionCallback callback = callbacks[i];
            sb.append(i + 1).append(". 도구명: ").append(callback.getName()).append("\n");
            sb.append("   설명: ").append(callback.getDescription()).append("\n");
            sb.append("   입력 스키마: ").append(callback.getInputTypeSchema()).append("\n\n");
        }

        return ResponseEntity.ok(sb.toString());
    }

}
