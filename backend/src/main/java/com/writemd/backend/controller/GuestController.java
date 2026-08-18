package com.writemd.backend.controller;

import com.writemd.backend.service.GuestService;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/guest")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService guestService;

    // 환경별 쿠키 보안 설정
    @Value("${cookie.secure:true}")
    private boolean cookieSecure;

    @Value("${cookie.same-site:Lax}")
    private String cookieSameSite;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> guestLogin(HttpServletResponse response) {
        Map<String, Object> responseInfo = guestService.loginGuest();

        String accessToken = (String) responseInfo.get("accessToken");
        String refreshToken = (String) responseInfo.get("refreshToken");
        String deviceId = (String) responseInfo.get("deviceId");
        long cookieMaxAge = (Long) responseInfo.get("cookieMaxAge");

        // 게스트 Refresh Token을 HttpOnly 쿠키로 발급
        ResponseCookie refreshCookie = ResponseCookie.from("REFRESH_TOKEN", refreshToken)
            .path("/api/auth")
            .secure(cookieSecure)
            .httpOnly(true)
            .sameSite(cookieSameSite)
            .maxAge(cookieMaxAge)
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        // 응답 바디에는 Access Token과 deviceId만 반환
        return ResponseEntity.ok(Map.of(
            "accessToken", accessToken,
            "deviceId", deviceId
        ));
    }
}