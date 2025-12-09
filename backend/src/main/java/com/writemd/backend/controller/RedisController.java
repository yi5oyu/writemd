package com.writemd.backend.controller;

import com.writemd.backend.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/redis")
@RequiredArgsConstructor
@Slf4j
public class RedisController {

    private final RedisService redisService;

    // 저장 /set?key=이름&value=데이터
    @PostMapping("/set")
    public void set(String key, String value) {
        redisService.setValue(key, value);
    }

    // 조회 /get?key=이름
    @GetMapping("/get")
    public String get(String key) {
        return redisService.getValue(key);
    }

    // 삭제 /del?key=이름
    @DeleteMapping("/del")
    public void delete(String key) {
        redisService.deleteValue(key);
    }
}