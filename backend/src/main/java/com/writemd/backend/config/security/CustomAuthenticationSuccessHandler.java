package com.writemd.backend.config.security;

import com.writemd.backend.service.GithubService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    @Autowired
    private GithubService githubService;
    @Autowired
    private OAuth2AuthorizedClientService authorizedClientService;


    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
        Authentication authentication) throws IOException {

//        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
//
//        String principalName = oauthToken.getName();
//        String githubId = oauthToken.getPrincipal().getAttribute("login");
//        System.out.println("id: " + principalName);
//        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
//            oauthToken.getAuthorizedClientRegistrationId(), principalName);
//
//        if (client != null) {
//            githubService.saveGitInfo(githubId, principalName);
//        } else {
//            System.out.println("OAuth2AuthorizedClient 값 없음 : " + principalName);
//        }

        response.sendRedirect("http://localhost:5173");
    }

}
