package com.writemd.backend.ai;

import com.writemd.backend.config.SseEmitterManager;
import com.writemd.backend.service.ChatService;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatManager {

    private final ChatService chatService;
    private final SseEmitterManager sseEmitterManager;
    private final Map<Long, CompletableFuture<Void>> connectionWaiters = new ConcurrentHashMap<>();

    public void processChatRequest(Long sessionId, Long userId, Long apiId, String model, String content,
        String processedContent) {

        // 대화의 Future를 가져오거나 없다면 새로 생성
        CompletableFuture<Void> sseReadyFuture = connectionWaiters.computeIfAbsent(
            sessionId, k -> new CompletableFuture<>()
        );

        // 콜백 등록
        sseReadyFuture.orTimeout(30, TimeUnit.SECONDS)
            .thenRun(() -> {
                log.info("SSE 연결 확인. LLM 처리 시작 (sessionId: {})", sessionId);
                chatService.chat(sessionId, userId, apiId, model, content, processedContent);
            })
            .exceptionally(ex -> {
                log.warn("SSE 연결 요청 타임아웃. 제거 (sessionId: {})", sessionId);
                connectionWaiters.remove(sessionId);
                return null;
            });

        if (sseEmitterManager.getEmitter(sessionId) != null) {
            triggerPendingChat(sessionId);
        } else {
            log.info("SSE 미연결 상태. 대기열 등록 완료 (sessionId: {})", sessionId);
        }
    }

    public void triggerPendingChat(Long sessionId) {
        CompletableFuture<Void> sseReadyFuture = connectionWaiters.remove(sessionId);

        if (sseReadyFuture != null && !sseReadyFuture.isDone()) {
            log.info("대기 중인 채팅 요청 트리거 (sessionId: {})", sessionId);
            sseReadyFuture.complete(null);
        }
    }
}