package com.writemd.backend.controller;

import com.writemd.backend.service.GuestService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/guest")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService guestService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> guestLogin() {
        Map<String, String> responseInfo = guestService.loginGuest();

        // JSON, 200
        return ResponseEntity.ok(responseInfo);
    }
}