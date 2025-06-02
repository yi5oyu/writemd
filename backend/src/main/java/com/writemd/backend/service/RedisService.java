package com.writemd.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    // 값 저장
    public void setValue(String key, String value) {
        redisTemplate.opsForValue().set(key, value);
    }

    // 값 조회
    public String getValue(String key) {
        Object value = redisTemplate.opsForValue().get(key);
        return value != null ? value.toString() : null;
    }

    // 값 삭제
    public void deleteValue(String key) {
        redisTemplate.delete(key);
    }
}