package com.writemd.backend.controller;

import com.writemd.backend.dto.TokenResponseDTO;
import com.writemd.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // Refresh Token으로 Access Token 갱신
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDTO> refreshToken(@RequestBody Map<String, String> request,
        HttpServletRequest httpRequest) {

        String refreshToken = request.get("refreshToken");
        String deviceId = request.get("deviceId") != null ? request.get("deviceId") : extractDeviceId(httpRequest);

        TokenResponseDTO tokens = authService.refreshToken(refreshToken, deviceId);

        return ResponseEntity.ok(tokens);
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
        @RequestHeader("Authorization") String authHeader, HttpServletRequest request) {

        String accessToken = authHeader.substring(7);
        String deviceId = extractDeviceId(request);

        authService.logout(accessToken, deviceId);

        return ResponseEntity.ok(Map.of("message", "로그아웃 성공"));
    }

    // 모든 디바이스 로그아웃
    @PostMapping("/logout-all")
    public ResponseEntity<Map<String, String>> logoutAllDevices(
        @RequestHeader("Authorization") String authHeader) {

        String accessToken = authHeader.substring(7);
        authService.logoutAllDevices(accessToken);

        return ResponseEntity.ok(Map.of("message", "모든 디바이스에서 로그아웃 성공"));
    }

    // 디바이스 ID 추출
    private String extractDeviceId(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = request.getRemoteAddr();
        return userAgent + "-" + ipAddress;
    }
}
