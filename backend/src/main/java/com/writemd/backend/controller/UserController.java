package com.writemd.backend.controller;

import com.writemd.backend.dto.ChatDTO;
import com.writemd.backend.dto.GitContentDTO;
import com.writemd.backend.dto.GitRepoDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.entity.Templates;
import com.writemd.backend.service.GithubService;
import com.writemd.backend.service.TemplateService;
import com.writemd.backend.service.UserService;
import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class UserController {

    // private final OAuth2AuthorizedClientService authorizedClientService;
    private final UserService userService;

    @GetMapping("/info")
    public UserDTO getUserInfo(@AuthenticationPrincipal OAuth2User oauthUser) {
        return userService.userInfo((String) oauthUser.getAttributes().get("login"));
    }


    @GetMapping("/current-user")
    public Map<String, Object> getCurrentUser(Principal principal) {
        if (principal == null) {
            return Map.of("authenticated", false);
        }
        return Map.of("authenticated", true, "username", principal.getName());

        // 엑세스 토큰
        // OAuth2AuthorizedClient authorizedClient =
        // authorizedClientService.loadAuthorizedClient("github", oauthUser.getName());
        // if (authorizedClient != null) {
        // response.put("accessToken", authorizedClient.getAccessToken().getTokenValue());
        // } else {
        // response.put("accessToken", "토큰x");
        // }
    }
}
