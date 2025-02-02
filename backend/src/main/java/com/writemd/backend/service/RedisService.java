package com.writemd.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class RedisService {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    // 데이터 저장
    public void saveValue(String key, String value) {
        redisTemplate.opsForValue().set(key, value);
    }
    // 데이터 조회
    public String getValue(String key) {
        return (String) redisTemplate.opsForValue().get(key);
    }
    // 데이터 삭제
    public void deleteValue(String key) {
        redisTemplate.delete(key);
    }
}