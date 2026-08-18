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
    // 1회(정상 Consumer) + 2회(PEL 재시도) = 총 3회 이후 실패 처리
    private static final int MAX_DELIVERY_COUNT = 3;

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

            List<PendingMessage> staleMessages = pendingMessages.stream()
                .filter(msg -> msg.getElapsedTimeSinceLastDelivery().compareTo(CLAIM_THRESHOLD) > 0)
                .toList();

            if (staleMessages.isEmpty()) {
                continue;
            }

            // 실패 처리 대상: MAX_DELIVERY_COUNT 초과
            List<RecordId> deadIds = staleMessages.stream()
                .filter(msg -> msg.getTotalDeliveryCount() > MAX_DELIVERY_COUNT)
                .map(PendingMessage::getId)
                .toList();

            // 재시도 대상: 아직 시도 가능
            List<RecordId> retryIds = staleMessages.stream()
                .filter(msg -> msg.getTotalDeliveryCount() <= MAX_DELIVERY_COUNT)
                .map(PendingMessage::getId)
                .toList();

            // 실패 처리 먼저 (PEL에서 제거)
            if (!deadIds.isEmpty()) {
                handleDeadLetters(ops, deadIds, consumerName);
            }

            // 정상 재시도
            if (!retryIds.isEmpty()) {
                List<MapRecord<String, String, String>> claimed = ops.claim(
                    StreamKey.NOTE_UPDATE,
                    StreamKey.CONSUMER_GROUP,
                    StreamKey.CONSUMER_NAME_PREFIX + "reprocessor",
                    CLAIM_THRESHOLD,
                    retryIds.toArray(new RecordId[0])
                );

                for (MapRecord<String, String, String> record : claimed) {
                    log.warn("PEL 재처리 시작. messageId={}, consumer={}", record.getId(), consumerName);
                    noteTextSaveConsumer.onMessage(record);
                }
            }
        }
    }

    private void handleDeadLetters(
        StreamOperations<String, String, String> ops,
        List<RecordId> deadIds,
        String consumerName
    ) {
        // 실패 처리 메시지 내용 확인용 claim (로그 출력)
        List<MapRecord<String, String, String>> deadRecords = ops.claim(
            StreamKey.NOTE_UPDATE,
            StreamKey.CONSUMER_GROUP,
            StreamKey.CONSUMER_NAME_PREFIX + "reprocessor",
            CLAIM_THRESHOLD,
            deadIds.toArray(new RecordId[0])
        );

        for (MapRecord<String, String, String> record : deadRecords) {
            log.error("Dead-letter: 최대 재시도({}) 초과. messageId={}, consumer={}, data={}",
                MAX_DELIVERY_COUNT, record.getId(), consumerName, record.getValue());
        }

        // PEL에서 강제 제거 (무한 루프 차단)
        ops.acknowledge(StreamKey.NOTE_UPDATE, StreamKey.CONSUMER_GROUP,
            deadIds.toArray(new RecordId[0]));

        log.warn("Dead-letter {}건 PEL에서 제거 완료. consumer={}", deadIds.size(), consumerName);
    }
}
