package com.writemd.backend.stream;

import com.writemd.backend.repository.TextRepository;
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
            // 메시지 변환, DB 저장
            NoteTextSaveMessage msg = NoteTextSaveMessage.fromMap(message.getValue());
            textRepository.updateMarkdownText(msg.noteId(), msg.markdownText());

            // 처리 완료 후 ACK -> Pending Entry List(PEL)에서 제거
            streamRedisTemplate.opsForStream()
                .acknowledge(StreamKey.NOTE_UPDATE, StreamKey.CONSUMER_GROUP, message.getId());
        } catch (Exception e) {
            // ACK 없이 종료 -> PEL에 남아 재처리
            log.error("노트 텍스트 저장 실패. messageId={}, noteId={}", message.getId(), message.getValue().get("noteId"), e);
        }
    }
}
