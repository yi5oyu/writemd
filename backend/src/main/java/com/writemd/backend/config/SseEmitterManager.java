package com.writemd.backend.config;

import static org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class SseEmitterManager {
    private static final Logger log = LoggerFactory.getLogger(SseEmitterManager.class);
    // 동시성 관리를 위해 ConcurrentHashMap 사용
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final Map<String, SseEmitter> namedEmitters = new ConcurrentHashMap<>();
    private final AtomicInteger activeEmitters = new AtomicInteger(0);

    // SseEmitter 추가
    public void addEmitter(Long sessionId, SseEmitter emitter) {
        // 같은 sessionId로 등록된 emitter 있다면 완료 처리
        SseEmitter existingEmitter = this.emitters.put(sessionId, emitter);
        if (existingEmitter != null) {
            log.warn("기존 Emitter {}. 이전 연결을 완료 처리", sessionId);
            try {
                existingEmitter.complete();
            } catch (Exception e) {
                log.debug("기존 Emitter 완료 처리 중 오류 {}: {}", sessionId, e.getMessage());
            }
        } else {
            activeEmitters.incrementAndGet();
        }

        log.info("Emitter 추가됨 {}. 현재 활성 Emitter 수: {}", sessionId, activeEmitters.get());

        // Emitter 완료
        emitter.onCompletion(() -> {
            log.info("Emitter 완료됨 {}", sessionId);
            this.removeEmitterInternal(sessionId, emitter, "completion");
        });

        // Emitter 타임아웃
        emitter.onTimeout(() -> {
            log.warn("Emitter 타임아웃 {}", sessionId);
            this.removeEmitterInternal(sessionId, emitter, "timeout");
        });

        // Emitter 에러 발생
        emitter.onError(e -> {
            log.error("Emitter 오류 발생 {}: {}", sessionId, e.getMessage());
            this.removeEmitterInternal(sessionId, emitter, "error");
        });
    }

    // Emitter 제거
    private void removeEmitterInternal(Long sessionId, SseEmitter emitter, String reason) {
        // sessionId와 emitter 객체가 정확히 일치할 때 제거
        boolean removed = this.emitters.remove(sessionId, emitter);
        if (removed) {
            int currentCount = activeEmitters.decrementAndGet();
            log.info("Emitter 제거됨 {}, 이유: {}, 현재 활성 Emitter 수: {}",
                sessionId, reason, currentCount);
            try {
                emitter.complete();
            } catch (Exception e) {
                log.debug("Emitter 제거 중 오류 {}: {}", sessionId, e.getMessage());
            }
        } else {
            log.warn("Emitter 제거 실패 - 찾을 수 없거나 일치하지 않음 {}, 이유: {}", sessionId, reason);
        }
    }

    public void removeNamedEmitter(String emitterId) {
        SseEmitter emitter = namedEmitters.get(emitterId);
        if (emitter != null) {
            removeNamedEmitterInternal(emitterId, emitter, "explicit removal");
        } else {
            log.warn("제거할 Named Emitter를 찾을 수 없음: {}", emitterId);
        }
    }

    public SseEmitter getNamedEmitter(String emitterId) {
        return namedEmitters.get(emitterId);
    }

    // SSE 이벤트(chunk) 전송
    public void sendToSession(Long sessionId, String eventName, Object data) {
        SseEmitter emitter = emitters.get(sessionId);
        if (emitter != null) {
            try {
                emitter.send(event().name(eventName).data(data));
                log.debug("이벤트 전송 성공 {}, {}", eventName, sessionId);
            } catch (IOException | IllegalStateException e) {
                log.warn("이벤트 전송 실패 {}, {}, {}. Emitter 제거 시도.",
                    eventName, sessionId, e.getMessage());
                removeEmitterInternal(sessionId, emitter, "전송 실패");
            } catch (Exception e) {
                // 기타 예외 처리
                log.error("이벤트 전송 중 예상치 못한 오류 {}, {}, {}", eventName, sessionId, e.getMessage(), e);
                removeEmitterInternal(sessionId, emitter, "전송 에러");
            }
        } else {
            log.warn("활성 Emitter 없음 - 이벤트 전송 불가 {}, {}", eventName, sessionId);
        }
    }

    // SSE 완료
    public void completeSession(Long sessionId) {
        SseEmitter emitter = emitters.get(sessionId);
        if (emitter != null) {
            try {
                log.info("세션 {}에 대한 SseEmitter를 명시적으로 완료 처리합니다.", sessionId);
                emitter.complete(); // Emitter 완료 호출

            } catch (Exception e) {
                log.warn("SseEmitter 완료 처리 중 오류 발생 (sessionId: {}): {}. Emitter 제거 시도.", sessionId, e.getMessage());
                removeEmitterInternal(sessionId, emitter, "explicit complete failure");
            }
        } else {
            log.warn("명시적으로 완료 처리할 세션 {}의 활성 Emitter를 찾을 수 없습니다.", sessionId);
        }
    }

    public void addNamedEmitter(String emitterId, SseEmitter emitter) {
        // 같은 emitterId로 등록된 emitter 있다면 완료 처리
        SseEmitter existingEmitter = this.namedEmitters.put(emitterId, emitter);
        if (existingEmitter != null) {
            log.warn("기존 Named Emitter {}. 이전 연결을 완료 처리", emitterId);
            try {
                existingEmitter.complete();
            } catch (Exception e) {
                log.debug("기존 Named Emitter 완료 처리 중 오류 {}: {}", emitterId, e.getMessage());
            }
        } else {
            activeEmitters.incrementAndGet();
        }

        log.info("Named Emitter 추가됨 {}. 현재 활성 Emitter 수: {}", emitterId, activeEmitters.get());

        // Emitter 완료
        emitter.onCompletion(() -> {
            log.info("Named Emitter 완료됨 {}", emitterId);
            this.removeNamedEmitterInternal(emitterId, emitter, "completion");
        });

        // Emitter 타임아웃
        emitter.onTimeout(() -> {
            log.warn("Named Emitter 타임아웃 {}", emitterId);
            this.removeNamedEmitterInternal(emitterId, emitter, "timeout");
        });

        // Emitter 에러 발생
        emitter.onError(e -> {
            log.error("Named Emitter 오류 발생 {}: {}", emitterId, e.getMessage());
            this.removeNamedEmitterInternal(emitterId, emitter, "error");
        });
    }

    private void removeNamedEmitterInternal(String emitterId, SseEmitter emitter, String reason) {
        // emitterId와 emitter 객체가 정확히 일치할 때 제거
        boolean removed = this.namedEmitters.remove(emitterId, emitter);
        if (removed) {
            int currentCount = activeEmitters.decrementAndGet();
            log.info("Named Emitter 제거됨 {}, 이유: {}, 현재 활성 Emitter 수: {}",
                emitterId, reason, currentCount);
            try {
                emitter.complete();
            } catch (Exception e) {
                log.debug("Named Emitter 제거 중 오류 {}: {}", emitterId, e.getMessage());
            }
        } else {
            log.warn("Named Emitter 제거 실패 - 찾을 수 없거나 일치하지 않음 {}, 이유: {}", emitterId, reason);
        }
    }

    // 문자열 식별자로 SSE 이벤트(chunk) 전송
    public void sendToNamedSession(String emitterId, String eventName, Object data) {
        SseEmitter emitter = namedEmitters.get(emitterId);
        if (emitter != null) {
            try {
                emitter.send(event().name(eventName).data(data));
                log.debug("Named 이벤트 전송 성공 {}, {}", eventName, emitterId);
            } catch (IOException | IllegalStateException e) {
                log.warn("Named 이벤트 전송 실패 {}, {}, {}. Emitter 제거 시도.",
                    eventName, emitterId, e.getMessage());
                removeNamedEmitterInternal(emitterId, emitter, "전송 실패");
            } catch (Exception e) {
                // 기타 예외 처리
                log.error("Named 이벤트 전송 중 예상치 못한 오류 {}, {}, {}", eventName, emitterId, e.getMessage(), e);
                removeNamedEmitterInternal(emitterId, emitter, "전송 에러");
            }
        } else {
            log.warn("활성 Named Emitter 없음 - 이벤트 전송 불가 {}, {}", eventName, emitterId);
        }
    }

    // 문자열 식별자로 SSE 완료
    public void completeNamedSession(String emitterId) {
        SseEmitter emitter = namedEmitters.get(emitterId);
        if (emitter != null) {
            try {
                log.info("Named 세션 {}에 대한 SseEmitter를 명시적으로 완료 처리합니다.", emitterId);
                emitter.complete(); // Emitter 완료 호출
            } catch (Exception e) {
                log.warn("Named SseEmitter 완료 처리 중 오류 발생 (emitterId: {}): {}. Emitter 제거 시도.",
                    emitterId, e.getMessage());
                removeNamedEmitterInternal(emitterId, emitter, "explicit complete failure");
            }
        } else {
            log.warn("명시적으로 완료 처리할 Named 세션 {}의 활성 Emitter를 찾을 수 없습니다.", emitterId);
        }
    }

    // 하트비트 전송 메서드 (Scheduler에서 주기적으로 호출)
    public void sendHeartbeatToAll() {
        if (emitters.isEmpty() && namedEmitters.isEmpty()) return;

        int count = 0;
        String heartbeatContent = "heartbeat";

        // 기존 숫자 ID 기반 Emitter에 하트비트 전송
        for (Map.Entry<Long, SseEmitter> entry : emitters.entrySet()) {
            Long sessionId = entry.getKey();
            SseEmitter emitter = entry.getValue();
            try {
                emitter.send(SseEmitter.event().comment(heartbeatContent));
                log.debug("하트비트 전송 성공 {}", sessionId);
                count++;
            } catch (IOException | IllegalStateException e) {
                log.warn("하트비트 전송 실패 {}, {}, Emitter 제거", sessionId, e.getMessage());
                removeEmitterInternal(sessionId, emitter, "heartbeat 실패");
            } catch (Exception e) {
                log.error("하트비트 전송 중 예상치 못한 오류 {}, {}", sessionId, e.getMessage(), e);
                removeEmitterInternal(sessionId, emitter, "heartbeat 에러");
            }
        }

        // 문자열 ID 기반 Emitter에 하트비트 전송
        for (Map.Entry<String, SseEmitter> entry : namedEmitters.entrySet()) {
            String emitterId = entry.getKey();
            SseEmitter emitter = entry.getValue();
            try {
                emitter.send(SseEmitter.event().comment(heartbeatContent));
                log.debug("Named 하트비트 전송 성공 {}", emitterId);
                count++;
            } catch (IOException | IllegalStateException e) {
                log.warn("Named 하트비트 전송 실패 {}, {}, Emitter 제거", emitterId, e.getMessage());
                removeNamedEmitterInternal(emitterId, emitter, "heartbeat 실패");
            } catch (Exception e) {
                log.error("Named 하트비트 전송 중 예상치 못한 오류 {}, {}", emitterId, e.getMessage(), e);
                removeNamedEmitterInternal(emitterId, emitter, "heartbeat 에러");
            }
        }

        if (count > 0) {
            log.info("하트비트 전송 완료 ({}개 Emitter)", count);
        }
    }
}