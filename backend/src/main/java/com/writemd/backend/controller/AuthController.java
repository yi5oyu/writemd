package com.writemd.backend.controller;

import com.writemd.backend.dto.TokenResponseDTO;
import com.writemd.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    // 쿠키 maxAge 계산 시 초 단위로 환산 필요(ms)
    @Value("${jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    // 환경별 쿠키 보안 설정
    @Value("${cookie.secure:true}")
    private boolean cookieSecure;

    @Value("${cookie.same-site:Lax}")
    private String cookieSameSite;

    // Refresh Token으로 Access Token 갱신
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDTO> refreshToken(
        @CookieValue(value = "REFRESH_TOKEN", required = false) String refreshToken,
        @RequestBody(required = false) Map<String, String> request,
        HttpServletResponse response,
        HttpServletRequest httpRequest) {

        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String deviceId = (request != null && request.get("deviceId") != null)
            ? request.get("deviceId")
            : extractDeviceId(httpRequest);

        TokenResponseDTO tokens = authService.refreshToken(refreshToken, deviceId);

        // 새 Refresh Token 쿠키 재발급
        ResponseCookie refreshCookie = ResponseCookie.from("REFRESH_TOKEN", tokens.refreshToken())
            .path("/api/auth")
            .secure(cookieSecure)
            .httpOnly(true)
            .sameSite(cookieSameSite)
            .maxAge(refreshTokenValidity / 1000)
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        // 응답 바디에는 새 Access Token만 포함 (refreshToken 필드는 null)
        return ResponseEntity.ok(new TokenResponseDTO(tokens.accessToken(), null));
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        HttpServletResponse response,
        HttpServletRequest request) {

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            String deviceId = extractDeviceId(request);
            authService.logout(accessToken, deviceId);
        }

        // Refresh Token 쿠키 즉시 만료 파기
        ResponseCookie clearCookie = ResponseCookie.from("REFRESH_TOKEN", "")
            .path("/api/auth")
            .secure(cookieSecure)
            .httpOnly(true)
            .sameSite(cookieSameSite)
            .maxAge(0)
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());

        return ResponseEntity.ok(Map.of("message", "로그아웃 성공"));
    }

    // 모든 디바이스 로그아웃
    @PostMapping("/logout-all")
    public ResponseEntity<Map<String, String>> logoutAllDevices(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        HttpServletResponse response) {

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            authService.logoutAllDevices(accessToken);
        }

        // Refresh Token 쿠키 즉시 만료 파기
        ResponseCookie clearCookie = ResponseCookie.from("REFRESH_TOKEN", "")
            .path("/api/auth")
            .secure(cookieSecure)
            .httpOnly(true)
            .sameSite(cookieSameSite)
            .maxAge(0)
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());

        return ResponseEntity.ok(Map.of("message", "모든 디바이스에서 로그아웃 성공"));
    }

    // 디바이스 ID 추출
    private String extractDeviceId(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = request.getRemoteAddr();
        return userAgent + "-" + ipAddress;
    }
}
