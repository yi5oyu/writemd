package com.writemd.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class SchedulerConfig {

    private static final Logger log = LoggerFactory.getLogger(SchedulerConfig.class);
    private final SseEmitterManager sseEmitterManager;

    @Scheduled(fixedRate = 30000) // 30 * 1000 ms
    public void sendHeartbeat() {
        log.debug("하트비트 전송 스케줄러 실행");
        sseEmitterManager.sendHeartbeatToAll();
    }
}