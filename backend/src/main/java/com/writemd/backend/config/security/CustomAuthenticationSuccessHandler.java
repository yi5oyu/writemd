package com.writemd.backend.config.security;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.writemd.backend.service.GithubService;
// import com.writemd.backend.service.UserService;
// import jakarta.servlet.ServletException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Value("${app.frontend.url:http://localhost:5173}")  // 추가!
    private String frontendUrl;

    // private final GithubService githubService;
    // private final OAuth2AuthorizedClientService authorizedClientService;
    // private final UserService userService;
    // private final ObjectMapper objectMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
        Authentication authentication) throws IOException {

        // OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        //
        // String principalName = oauthToken.getName();
        // String githubId = oauthToken.getPrincipal().getAttribute("login");
        // System.out.println("id: " + principalName);
        // OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
        // oauthToken.getAuthorizedClientRegistrationId(), principalName);
        //
        // if (client != null) {
        // githubService.saveGitInfo(githubId, principalName);
        // } else {
        // System.out.println("OAuth2AuthorizedClient 값 없음 : " + principalName);
        // }

        response.sendRedirect(frontendUrl + "/login-success");
    }

}
