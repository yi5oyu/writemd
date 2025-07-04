package com.writemd.backend.cache;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CacheInitializer {

    private final ObjectMapper objectMapper;
    private final CacheManager cacheManager;

    @EventListener(ApplicationReadyEvent.class)
    public void initializeCache() {
        log.info("캐시 데이터 초기화 시작");
        try {
            // 내 템플릿 데이터
            loadAndCacheTemplateData("template-data", "my-templates",
                "data/template.json", "내 템플릿");

            // 깃 템플릿 데이터
            loadAndCacheTemplateData("template-data", "git-templates",
                "data/git_template.json", "깃 템플릿");

            log.info("캐시 데이터 초기화 완료");
        } catch (Exception e) {
            log.error("캐시 초기화 실패", e);
        }
    }

    private void loadAndCacheTemplateData(String cacheName, String cacheKey, String filePath, String description) {
        try {
            // JSON 파일 로드
            Resource resource = new ClassPathResource(filePath);
            List<Map<String, String>> templateData = objectMapper.readValue(
                resource.getInputStream(),
                new TypeReference<List<Map<String, String>>>() {
                }
            );

            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.put(cacheKey, templateData);
            }

        } catch (IOException e) {
            log.error("{} 파일 로드 실패: {}", description, filePath, e);
        }
    }
}
