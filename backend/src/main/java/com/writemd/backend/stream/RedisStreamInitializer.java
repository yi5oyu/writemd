package com.writemd.backend.stream;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisStreamInitializer implements ApplicationRunner {

    @Qualifier("streamRedisTemplate")
    private final RedisTemplate<String, String> streamRedisTemplate;
    private final StreamMessageListenerContainer<String, MapRecord<String, String, String>> noteStreamContainer;

    // 메시지 수신 셋업
    @Override
    public void run(ApplicationArguments args) {
        initStream(StreamKey.NOTE_UPDATE);
        noteStreamContainer.start();
        log.info("Redis Stream Consumer 기동 완료.");
    }

    // 스트림에 대한 컨슈머 그룹 생성
    private void initStream(String streamKey) {
        try {
            streamRedisTemplate.opsForStream().createGroup(streamKey, ReadOffset.from("0"), StreamKey.CONSUMER_GROUP);
            log.info("Redis Stream 그룹 생성 완료. stream={}, group={}", streamKey, StreamKey.CONSUMER_GROUP);
        } catch (Exception e) {
            if (isBusyGroupError(e)) {
                log.info("Redis Stream 그룹 이미 존재. stream={}, group={}", streamKey, StreamKey.CONSUMER_GROUP);
            } else {
                log.error("Redis Stream 초기화 실패 (stream={}): {}", streamKey, e.getMessage(), e);
                throw e;
            }
        }
    }

    //예외 체인을 순회하며 BUSYGROUP 에러가 포함되어 있는지 확인
    private boolean isBusyGroupError(Throwable e) {
        Throwable cause = e;
        while (cause != null) {
            if (cause.getMessage() != null && cause.getMessage().contains("BUSYGROUP")) {
                return true;
            }
            cause = cause.getCause();
        }
        return false;
    }
}