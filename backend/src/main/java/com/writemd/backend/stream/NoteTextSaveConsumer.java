package com.writemd.backend.stream;

import com.writemd.backend.repository.TextRepository;
import java.time.Instant;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.stream.StreamListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class NoteTextSaveConsumer implements StreamListener<String, MapRecord<String, String, String>> {

    private final TextRepository textRepository;

    @Qualifier("streamRedisTemplate")
    private final RedisTemplate<String, String> streamRedisTemplate;

    // 메시지 받아 실제 작업 수행. Consumer(수신자/작업자)
    @Transactional
    @Override
    public void onMessage(MapRecord<String, String, String> message) {
        log.info("백그라운드 저장 작업 시작 noteId={}", message.getValue().get("noteId"));
        try {
            NoteTextSaveMessage msg = NoteTextSaveMessage.fromMap(message.getValue());

            String requestedAtStr = msg.requestedAt();
            String versionKey = StreamKey.NOTE_VERSION_KEY_PREFIX + msg.noteId();

            // Redis에서 현재 버전(마지막 성공 처리 시각) 조회 (오류 시 null 반환(건너뜀))
            String currentVersionStr = streamRedisTemplate.opsForValue().get(versionKey);

            if (currentVersionStr != null) {
                // 실제 시간(Instant)으로 비교
                Instant requestedTime = OffsetDateTime.parse(requestedAtStr).toInstant();
                Instant currentTime = OffsetDateTime.parse(currentVersionStr).toInstant();

                // 현재 메시지가 이미 처리된 버전보다 오래됐거나 같음 (오래된 데이터 덮어쓰기 방지)
                if (!requestedTime.isAfter(currentTime)) {
                    log.info("스킵: 이미 최신 버전 처리 완료. noteId={}, requestedAt={}, currentVersion={}",
                        msg.noteId(), requestedAtStr, currentVersionStr);

                    // 스킵되더라도 PEL에 남지 않도록 ACK 처리
                    streamRedisTemplate.opsForStream()
                        .acknowledge(StreamKey.NOTE_UPDATE, StreamKey.CONSUMER_GROUP, message.getId());
                    return;
                }
            }

            // DB UPDATE 수행 (새로운 내용이거나, 최초 저장일 때)
            textRepository.updateMarkdownText(msg.noteId(), msg.markdownText());

            // Redis 버전 갱신 — TTL 7일
            streamRedisTemplate.opsForValue().set(
                versionKey, requestedAtStr,
                java.time.Duration.ofSeconds(StreamKey.NOTE_VERSION_TTL_SECONDS)
            );

            // 성공 시 ACK → PEL에서 제거
            streamRedisTemplate.opsForStream()
                .acknowledge(StreamKey.NOTE_UPDATE, StreamKey.CONSUMER_GROUP, message.getId());

        } catch (Exception e) {
            // ACK 없이 종료 → PEL 잔류 → PendingMessageReprocessor가 재처리
            log.error("노트 텍스트 저장 실패. messageId={}, noteId={}",
                message.getId(), message.getValue().get("noteId"), e);
        }
    }
}
