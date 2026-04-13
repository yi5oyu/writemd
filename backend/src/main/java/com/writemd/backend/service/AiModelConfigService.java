package com.writemd.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiModelConfigService {

    // https://gist.github.com/yi5oyu
    private static final String REMOTE_CONFIG_URL = "https://gist.githubusercontent.com/yi5oyu/eecf7c235ea403bc78a051b765504eef/raw/model.json";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    // volatile: 멀티스레드 환경에서 읽기/쓰기 일관성 보장
    private volatile JsonNode currentModelConfig;

    // 서버 실행시 최초 1회 초기화
    @PostConstruct
    public void init() {
        log.info("서버 시작: AI 모델 원격 설정 초기화 진행...");
        fetchModelConfiguration();
    }

    // 매일 새벽 4시에 자동으로 원격 설정을 갱신
    @Scheduled(cron = "0 0 4 * * *", zone = "Asia/Seoul")
    public void fetchModelConfiguration() {
        try {
            log.info("AI 모델 원격 설정 동기화 시작...");

            String responseBody = restClient.get()
                .uri(REMOTE_CONFIG_URL)
                .retrieve()
                .body(String.class);

            if (responseBody != null && !responseBody.isEmpty()) {
                this.currentModelConfig = objectMapper.readTree(responseBody);
                log.info("AI 모델 원격 설정 동기화 완료! (RestClient 사용)");
            }
        } catch (Exception e) {
            log.error("AI 모델 설정 동기화 실패. 기존 설정을 유지합니다: {}", e.getMessage());
        }
    }

    // 최신 모델 설정 데이터 반환
    public JsonNode getLatestModelConfig() {
        if (this.currentModelConfig == null) {
            log.warn("메모리에 로드된 AI 모델 설정이 없어 재시도합니다.");
            fetchModelConfiguration();
        }
        return this.currentModelConfig;
    }
}