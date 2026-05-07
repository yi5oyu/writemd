package com.writemd.backend.config;

import com.writemd.backend.stream.NoteTextSaveConsumer;
import com.writemd.backend.stream.StreamKey;
import java.time.Duration;
import java.util.concurrent.Executor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;
import org.springframework.data.redis.stream.StreamMessageListenerContainer.StreamMessageListenerContainerOptions;

@Configuration
@RequiredArgsConstructor
public class StreamConsumerConfig {

    private final RedisConnectionFactory connectionFactory;
    private final NoteTextSaveConsumer noteTextSaveConsumer;

    @Qualifier("taskExecutor")
    private final Executor taskExecutor;

    // 메시지 수신 환경 설정
    @Bean(destroyMethod = "stop")
    public StreamMessageListenerContainer<String, MapRecord<String, String, String>> noteStreamContainer() {

        /** 컨테이너 옵션 설정 (스레드 풀, 직렬화 설정 병합)
         *  pollTimeout 0.1초마다 대기열 확인
         *  taskExecutor 스레드풀 사용
         */
        StreamMessageListenerContainerOptions<String, MapRecord<String, String, String>> options =
            StreamMessageListenerContainerOptions.builder()
                .pollTimeout(Duration.ofMillis(100))
                .executor(taskExecutor)
                .serializer(new StringRedisSerializer())
                .build();

        // 컨테이너 생성
        StreamMessageListenerContainer<String, MapRecord<String, String, String>> container =
            StreamMessageListenerContainer.create(connectionFactory, options);

        // Consumer(수신기) 연결
        // XREADGROUP GROUP note-writers worker-0 COUNT 10 BLOCK 100 STREAMS stream:note:update >
        container.receive(
            Consumer.from(StreamKey.CONSUMER_GROUP, StreamKey.CONSUMER_NAME_PREFIX + "0"),
            StreamOffset.create(StreamKey.NOTE_UPDATE, ReadOffset.lastConsumed()),
            noteTextSaveConsumer
        );

        // RedisStreamInitializer.run()에서 그룹 생성 완료 후 호출
        return container;
    }
}
