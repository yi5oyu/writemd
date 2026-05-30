package com.writemd.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // 키 직렬화(String)
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // 값 직렬화(JSON)
        GenericJackson2JsonRedisSerializer serializer = customJsonSerializer();
        template.setValueSerializer(serializer);
        template.setHashValueSerializer(serializer);

        template.afterPropertiesSet();

        return template;
    }

    // Stream 전용 템플릿 — 필드/값 모두 String, GenericJackson2Json 이중 인코딩 방지
    @Bean
    @Qualifier("streamRedisTemplate")
    public RedisTemplate<String, String> streamRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        StringRedisSerializer str = new StringRedisSerializer();
        template.setKeySerializer(str);
        template.setValueSerializer(str);
        template.setHashKeySerializer(str);
        template.setHashValueSerializer(str);
        template.afterPropertiesSet();
        return template;
    }

    // 자동 캐싱 설정
    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {

        // 기본 캐시 설정(기본 30분) — JavaTimeModule이 등록된 커스텀 직렬화기 사용
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .disableCachingNullValues()
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(customJsonSerializer()));

        // 캐시별 개별 설정
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // 유저 캐시
        cacheConfigurations.put("user",
            defaultConfig.entryTtl(Duration.ofHours(12)));

        // API 키 캐시
        cacheConfigurations.put("api-key",
            defaultConfig.entryTtl(Duration.ofHours(1)));

        // 모든 API 키
        cacheConfigurations.put("user-api-keys",
            defaultConfig.entryTtl(Duration.ofMinutes(30)));

        // 노트 목록 — 생성/수정/삭제 시 즉시 evict하므로 TTL은 안전망 역할
        cacheConfigurations.put("user-notes",
            defaultConfig.entryTtl(Duration.ofMinutes(5)));

//        cacheConfigurations.put("template-data",
//            defaultConfig.entryTtl(Duration.ofDays(365)));

        // Duration.ofDays(365), .ofHours(1), .ofMinutes(30), .ofMinutes(5)

        return RedisCacheManager.builder(redisConnectionFactory)
            .cacheDefaults(defaultConfig)
            .withInitialCacheConfigurations(cacheConfigurations)
            .build();
    }

    // 로컬 캐시 (Caffeine)
    @Bean(name = "localCacheManager")
    public CacheManager localCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .initialCapacity(10)
            .maximumSize(50)
            .expireAfterWrite(Duration.ofHours(12))
        );
        cacheManager.setCacheNames(List.of("template-data"));
        return cacheManager;
    }

    private GenericJackson2JsonRedisSerializer customJsonSerializer() {
        ObjectMapper objectMapper = new ObjectMapper();

        // Java 8 LocalDateTime 지원 모듈 등록
        objectMapper.registerModule(new JavaTimeModule());
        // 날짜를 타임스탬프(배열) 형식이 아닌 ISO-8601 문자열 포맷으로 직렬화
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Redis 역직렬화를 위해 패키지/클래스 타입 정보 저장 (기본 GenericJackson2Json 동작 유지)
        objectMapper.activateDefaultTyping(
            BasicPolymorphicTypeValidator.builder().allowIfBaseType(Object.class).build(),
            ObjectMapper.DefaultTyping.NON_FINAL
        );

        return new GenericJackson2JsonRedisSerializer(objectMapper);
    }
}