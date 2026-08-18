package com.writemd.backend.config.security;

import com.writemd.backend.controller.ChatController;
import com.writemd.backend.dto.TokenResponseDTO;
import com.writemd.backend.service.AuthService;
import com.writemd.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final AuthService authService;
    private final UserService userService;
    private final OAuth2AuthorizedClientService authorizedClientService;

    /*
     private final GithubService githubService;
     private final ObjectMapper objectMapper;
    */

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    // 쿠키 maxAge 계산 시 초 단위로 환산 필수 (ms)
    @Value("${jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    // 환경별 쿠키 보안 설정
    @Value("${cookie.secure:true}")
    private boolean cookieSecure;

    @Value("${cookie.same-site:Lax}")
    private String cookieSameSite;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        String principalName = oauthToken.getName();
        String githubId = oAuth2User.getAttribute("login");
        String name = oAuth2User.getAttribute("name");
        String deviceId = UUID.randomUUID().toString();

        // GitHub Access Token 저장
        try {
            OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                "github", principalName);

            if (client != null && client.getAccessToken() != null) {
                String githubAccessToken = client.getAccessToken().getTokenValue();

                // DB 업데이트/Redis 캐싱
                userService.saveGithubAccessToken(githubId, githubAccessToken);

                log.info("GitHub Access Token 저장 성공. githubId: {}", githubId);
            } else {
                log.warn("GitHub Access Token을 가져올 수 없음. githubId: {}", githubId);
            }
        } catch (Exception e) {
            log.error("GitHub Access Token 저장 실패. githubId: {}, 오류: {}", githubId, e.getMessage());
        }

        TokenResponseDTO tokens = authService.issueToken(githubId, name, deviceId);

        // Refresh Token은 HttpOnly 쿠키로 발급 — JS 접근 불가로 XSS 탈취 차단
        // path를 /api/auth로 한정하여 불필요한 요청에 쿠키가 실리지 않도록 노출 범위 최소화
        ResponseCookie refreshCookie = ResponseCookie.from("REFRESH_TOKEN", tokens.refreshToken())
            .path("/api/auth")
            .secure(cookieSecure)
            .httpOnly(true)
            .sameSite(cookieSameSite)
            .maxAge(refreshTokenValidity / 1000) // ms → s 변환
            .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        // refreshToken은 URL에서 제거 — 브라우저 히스토리/로그 노출 방지
        response.sendRedirect(frontendUrl + "/login-success" +
            "?accessToken=" + tokens.accessToken() +
            "&deviceId=" + deviceId);
    }

}