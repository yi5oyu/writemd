package com.writemd.backend.cache;

import com.writemd.backend.service.CachingDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CacheInitializer {

    private final CachingDataService cachingDataService;

    @EventListener(ApplicationReadyEvent.class)
    public void initializeCache() {
        log.info("로컬 캐시 적재");
        try {
            cachingDataService.getMyTemplates();
            cachingDataService.getGitTemplates();
        } catch (Exception e) {
            log.error("로컬 캐시 적재 실패", e);
        }
    }
}
