package com.writemd.backend.config.security;

import com.writemd.backend.dto.TokenResponseDTO;
import com.writemd.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    /*
     private final GithubService githubService;
     private final OAuth2AuthorizedClientService authorizedClientService;
     private final UserService userService;
     private final ObjectMapper objectMapper;
    */

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = ((OAuth2AuthenticationToken) authentication).getPrincipal();
        String githubId = oAuth2User.getAttribute("login");
        String name = oAuth2User.getAttribute("name");
        String deviceId = request.getHeader("User-Agent") + "-" + request.getRemoteAddr();

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