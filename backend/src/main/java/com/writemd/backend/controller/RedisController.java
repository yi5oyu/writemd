package com.writemd.backend.controller;

import com.writemd.backend.service.RedisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RedisController {
    @Autowired
    private RedisService redisService;
    // 저장 /save?key=이름&value=데이터
    @PostMapping("/save")
    public void save(String key, String value) {
        redisService.saveValue(key, value);
    }
    // 조회 /get?key=이름
    @GetMapping("/get")
    public String get(String key) {
        return redisService.getValue(key);
    }
    // 삭제 /delete?key=이름
    @DeleteMapping("/delete")
    public void delete(String key) {
        redisService.deleteValue(key);
    }
}