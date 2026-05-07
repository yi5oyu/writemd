package com.writemd.backend.stream;

import java.time.Duration;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Range;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.PendingMessage;
import org.springframework.data.redis.connection.stream.PendingMessages;
import org.springframework.data.redis.connection.stream.PendingMessagesSummary;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StreamOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PendingMessageReprocessor {

    // 5분
    private static final Duration CLAIM_THRESHOLD = Duration.ofMinutes(5);
    private static final int BATCH_SIZE = 100;

    @Qualifier("streamRedisTemplate")
    private final RedisTemplate<String, String> streamRedisTemplate;

    private final NoteTextSaveConsumer noteTextSaveConsumer;

    // 미처리 메시지 재처리
    @Scheduled(fixedDelay = 60_000)
    public void reprocess() {
        // 패딩 메시지 확인
        PendingMessagesSummary summary = streamRedisTemplate.opsForStream()
            .pending(StreamKey.NOTE_UPDATE, StreamKey.CONSUMER_GROUP);

        if (summary == null || summary.getTotalPendingMessages() == 0) {
            return;
        }

        StreamOperations<String, String, String> ops = streamRedisTemplate.opsForStream();

        for (String consumerName : summary.getPendingMessagesPerConsumer().keySet()) {
            PendingMessages pendingMessages = ops.pending(
                StreamKey.NOTE_UPDATE,
                Consumer.from(StreamKey.CONSUMER_GROUP, consumerName),
                Range.unbounded(),
                BATCH_SIZE
            );

            List<RecordId> staleIds = pendingMessages.stream()
                .filter(msg -> msg.getElapsedTimeSinceLastDelivery().compareTo(CLAIM_THRESHOLD) > 0)
                .map(PendingMessage::getId)
                .toList();

            if (staleIds.isEmpty()) {
                continue;
            }

            // 호출
            List<MapRecord<String, String, String>> claimed = ops.claim(
                StreamKey.NOTE_UPDATE,
                StreamKey.CONSUMER_GROUP,
                StreamKey.CONSUMER_NAME_PREFIX + "reprocessor",
                CLAIM_THRESHOLD,
                staleIds.toArray(new RecordId[0])
            );

            for (MapRecord<String, String, String> record : claimed) {
                log.warn("PEL 재처리 시작. messageId={}, consumer={}", record.getId(), consumerName);
                noteTextSaveConsumer.onMessage(record);
            }
        }
    }
}
