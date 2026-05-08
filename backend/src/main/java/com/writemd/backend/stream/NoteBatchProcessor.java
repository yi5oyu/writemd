package com.writemd.backend.stream;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.connection.stream.StreamReadOptions;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NoteBatchProcessor {

    private static final Duration BLOCK_TIMEOUT = Duration.ofMillis(100);
    private final String consumerName = StreamKey.CONSUMER_NAME_PREFIX + "batch";

    @Qualifier("streamRedisTemplate")
    private final RedisTemplate<String, String> streamRedisTemplate;
    private final JdbcTemplate jdbcTemplate;

    private final MeterRegistry meterRegistry;
    private Counter totalMessagesCounter;
    private Counter uniqueNotesCounter;
    private Timer batchTimer;

    @Value("${app.stream.note-update.batch-size:100}")
    private int batchSize;

    @PostConstruct
    public void init() {
        // 메트릭 등록
        this.totalMessagesCounter = Counter.builder("stream.note.update.messages.total")
            .description("Redis 스트림에서 읽어온 전체 메시지 누적 수")
            .register(meterRegistry);

        this.uniqueNotesCounter = Counter.builder("stream.note.update.unique.total")
            .description("중복 제거 후 실제 DB에 반영된 유니크 노트 수")
            .register(meterRegistry);

        this.batchTimer = Timer.builder("stream.note.update.batch.duration")
            .description("배치 처리 1회당 소요 시간")
            .register(meterRegistry);

        log.info("NoteBatchProcessor 메트릭 초기화 완료.");
    }

    @Scheduled(fixedDelayString = "${app.stream.note-update.batch-delay:200}")
    public void processBatch() {
        // 배치 처리 시간 측정
        batchTimer.record(() -> {
            // Redis에서 가져온 데이터 읽기
            List<MapRecord<String, String, String>> messages = readMessages();
            if (messages.isEmpty()) {
                return;
            }
            int totalMessages = messages.size();
            // 중복 제거
            Map<Long, MapRecord<String, String, String>> deduped = deduplicate(messages);
            int uniqueNotes = deduped.size();
            boolean success = batchUpdate(deduped);

            Map<Long, List<RecordId>> allIdsByNoteId = groupAllIdsByNoteId(messages);

            if (success) {
                bulkAck(messages.stream().map(MapRecord::getId).toList());
                recordMetrics(true, totalMessages, uniqueNotes);
            } else {
                handlePartial(deduped, allIdsByNoteId);
                recordMetrics(false, totalMessages, uniqueNotes);
            }
        });
    }

    // 지표 수집
    private void recordMetrics(boolean success, int total, int unique) {
        // 지표 카운트 증가
        totalMessagesCounter.increment(total);
        uniqueNotesCounter.increment(unique);

        meterRegistry.counter("stream.note.update.process.total", "status", success ? "success" : "failure")
            .increment();

        if (total > 0) {
            double ratio = (double) (total - unique) / total;
            meterRegistry.gauge("stream.note.update.dedup.ratio", ratio);
        }
    }

    // batchSize만큼 메시지 가져옴
    @SuppressWarnings("unchecked")
    private List<MapRecord<String, String, String>> readMessages() {
        List<?> result = streamRedisTemplate.opsForStream()
            .read(
                Consumer.from(StreamKey.CONSUMER_GROUP, consumerName),
                StreamReadOptions.empty().count(batchSize).block(BLOCK_TIMEOUT),
                StreamOffset.create(StreamKey.NOTE_UPDATE, ReadOffset.lastConsumed())
            );
        return result == null ? List.of() : (List<MapRecord<String, String, String>>) result;
    }

    // 중복 처리: 같은 noteId는 Stream ID 순(시간 순)으로 마지막 메시지만 유지
    private Map<Long, MapRecord<String, String, String>> deduplicate(
        List<MapRecord<String, String, String>> messages) {
        Map<Long, MapRecord<String, String, String>> map = new LinkedHashMap<>();
        for (MapRecord<String, String, String> msg : messages) {
            long noteId = Long.parseLong(msg.getValue().get("noteId"));
            map.put(noteId, msg);
        }
        return map;
    }

    // 중복 제거된 메세지 처리: ACK 보내 PEL에서 제거시킴
    private Map<Long, List<RecordId>> groupAllIdsByNoteId(
        List<MapRecord<String, String, String>> messages) {
        Map<Long, List<RecordId>> result = new LinkedHashMap<>();
        for (MapRecord<String, String, String> msg : messages) {
            long noteId = Long.parseLong(msg.getValue().get("noteId"));
            result.computeIfAbsent(noteId, k -> new ArrayList<>()).add(msg.getId());
        }
        return result;
    }

    // UPDATE 배치 처리
    private boolean batchUpdate(Map<Long, MapRecord<String, String, String>> deduped) {
        try {
            List<Object[]> batchArgs = deduped.entrySet().stream()
                .map(e -> new Object[]{
                    e.getValue().getValue().get("markdownText"),
                    e.getKey()
                })
                .toList();

            jdbcTemplate.batchUpdate(
                "UPDATE texts SET markdown_text = ? WHERE note_id = ?",
                batchArgs
            );
            log.debug("Batch UPDATE 완료. uniqueNoteId={}, totalMessages={}",
                deduped.size(), batchArgs.size());
            return true;
        } catch (Exception e) {
            log.error("Batch UPDATE 실패", e);
            return false;
        }
    }

    // 처리 완료된 메시지 ID 리스트를 Redis에 전달
    private void bulkAck(List<RecordId> ids) {
        streamRedisTemplate.opsForStream()
            .acknowledge(StreamKey.NOTE_UPDATE, StreamKey.CONSUMER_GROUP,
                ids.toArray(new RecordId[0]));
    }

    // 배치 업데이트 중 오류 처리
    private void handlePartial(
        Map<Long, MapRecord<String, String, String>> deduped,
        Map<Long, List<RecordId>> allIdsByNoteId) {
        for (var entry : deduped.entrySet()) {
            long noteId = entry.getKey();
            try {
                jdbcTemplate.update(
                    "UPDATE texts SET markdown_text = ? WHERE note_id = ?",
                    entry.getValue().getValue().get("markdownText"),
                    noteId
                );
                // 이 noteId의 구버전 메시지 포함 전체 ACK
                List<RecordId> idsToAck = allIdsByNoteId.getOrDefault(noteId, List.of());
                bulkAck(idsToAck);
            } catch (Exception e) {
                log.error("개별 UPDATE 실패. noteId={}", noteId, e);
                // ACK 생략해 모든 메시지 PEL 잔류되어 PendingMessageReprocessor 재처리
            }
        }
    }
}
