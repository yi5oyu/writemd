package com.writemd.backend.event;

import com.writemd.backend.service.CachingDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApiEventListener {

    private final CachingDataService cachingDataService;

    // API 키 저장
    @Async
    @TransactionalEventListener(
        classes = ApiKeySavedEvent.class,
        phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleApiKeySaved(ApiKeySavedEvent event) {
        try {
            log.info("API 키 저장 이벤트(비동기 캐시 업데이트): userId={}", event.getUserId());
            cachingDataService.handleApiKeySaved(event.getUserId(), event.getApiDto());
            log.info("비동기 캐시 업데이트 성공: userId={}", event.getUserId());
        } catch (Exception e) {
            log.error("비동기 캐시 업데이트 오류: userId={}, error={}", event.getUserId(), e.getMessage(), e);
        }
    }

    // API 키 삭제
    @Async
    @TransactionalEventListener(
        classes = ApiKeyDeletedEvent.class,
        phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleApiKeyDeleted(ApiKeyDeletedEvent event) {
        try {
            log.info("API 키 삭제 이벤트(비동기 캐시 삭제): userId={}, apiId={}", event.getUserId(), event.getApiId());
            cachingDataService.handleApiKeyDeleted(event.getUserId(), event.getApiId());
            log.info("비동기 캐시 삭제 성공: userId={}, apiId={}", event.getUserId(), event.getApiId());
        } catch (Exception e) {
            log.error("비동기 캐시 삭제 오류: userId={}, apiId={}, error={}", event.getUserId(), event.getApiId(),
                e.getMessage(), e);
        }
    }
}
