package com.writemd.backend.stream;

import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.RedisStreamCommands.XAddOptions;
import org.springframework.data.redis.connection.stream.ByteRecord;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;


@Slf4j
@Service
@RequiredArgsConstructor
public class NoteStreamProducer {

    @Qualifier("streamRedisTemplate")
    private final RedisTemplate<String, String> streamRedisTemplate;

    @Value("${app.stream.note-update.max-len}")
    private long maxLen;

    // 노트 markdownText 업데이트 이벤트 발행
    public void publishSave(long noteId, String markdownText) {
        // body 생성 (데이터를 byte 배열 형태의 맵으로 변환)
        Map<byte[], byte[]> body = new LinkedHashMap<>();
        body.put("noteId".getBytes(StandardCharsets.UTF_8), String.valueOf(noteId).getBytes(StandardCharsets.UTF_8));
        body.put("markdownText".getBytes(StandardCharsets.UTF_8),
            (markdownText != null ? markdownText : "").getBytes(StandardCharsets.UTF_8));
        body.put("requestedAt".getBytes(StandardCharsets.UTF_8),
            ZonedDateTime.now(ZoneId.of("Asia/Seoul"))
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                .getBytes(StandardCharsets.UTF_8));

        // 레코드 생성/발행
        ByteRecord record = StreamRecords.newRecord().ofBytes(body)
            .withStreamKey(StreamKey.NOTE_UPDATE.getBytes(StandardCharsets.UTF_8));

        // 데이터를 redis 스트림에 추가
        // XADD stream:note:update MAXLEN ~ {maxLen} * noteId "..." markdownText "..." requestedAt
        streamRedisTemplate.execute((RedisCallback<RecordId>) conn -> conn.streamCommands()
            .xAdd(record, XAddOptions.maxlen(maxLen).approximateTrimming(true)));
    }
}
