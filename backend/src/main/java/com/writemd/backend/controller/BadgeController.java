package com.writemd.backend.controller;

import com.writemd.backend.service.BadgeService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/badge")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping("/list")
    public ResponseEntity<List<Map<String, Object>>> getBadgeList() {
        return ResponseEntity.ok(badgeService.getBadgeList());
    }
}