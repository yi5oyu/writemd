package com.writemd.backend.config.security;

import com.writemd.backend.controller.ChatController;
import com.writemd.backend.dto.TokenResponseDTO;
import com.writemd.backend.service.AuthService;
import com.writemd.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        String principalName = oauthToken.getName();
        String githubId = oAuth2User.getAttribute("login");
        String name = oAuth2User.getAttribute("name");
        String deviceId = request.getHeader("User-Agent") + "-" + request.getRemoteAddr();

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

        /*
         OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;

         String principalName = oauthToken.getName();
         String githubId = oauthToken.getPrincipal().getAttribute("login");
         System.out.println("id: " + principalName);
         OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
         oauthToken.getAuthorizedClientRegistrationId(), principalName);

         if (client != null) {
         githubService.saveGitInfo(githubId, principalName);
         } else {
         System.out.println("OAuth2AuthorizedClient 값 없음 : " + principalName);
         }
        */

        response.sendRedirect(frontendUrl + "/login-success" +
            "?accessToken=" + tokens.getAccessToken() +
            "&refreshToken=" + tokens.getRefreshToken());
    }

}