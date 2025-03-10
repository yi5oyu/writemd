package com.writemd.backend.controller;

import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.service.GithubService;
import com.writemd.backend.service.UserService;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    // private final OAuth2AuthorizedClientService authorizedClientService;
    private final UserService userService;

    private final GithubService githubService;

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

    // 깃허브 레포지토리 조회
    @GetMapping("/github/repos")
    public Mono<List<Map<String, Object>>> getRepositories(@AuthenticationPrincipal OAuth2User principal) {
        return githubService.getRepositories(principal.getName());
    }

    // 깃허브 레포지토리 하위 목록 조회
    @GetMapping("/repos/{owner}/{repo}/contents")
    public Mono<List<Map<String, Object>>> getContents(
        @PathVariable String owner,
        @PathVariable String repo) {

        return githubService.getRepositoryContents(owner, repo);
    }

    @GetMapping("/repos/{owner}/{repo}/contents")
    public Mono<Map<String, Object>> getContentsTree(
        @PathVariable String owner,
        @PathVariable String repo,
        @PathVariable String treeSha) {

        return githubService.getRepositoryTree(owner, repo, treeSha);
    }
}
