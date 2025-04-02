package com.writemd.backend.controller;

import com.writemd.backend.dto.ChatDTO;
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

    // 레포지토리 조회
    @GetMapping("/github/repos/{owner}")
    public Mono<List<Map<String, Object>>> getRepositories(@PathVariable String owner,@AuthenticationPrincipal OAuth2User principal) {
        return githubService.getRepositories(owner,principal.getName());
    }

    // 레포지토리 하위 목록 조회
    @GetMapping("/repos/{owner}/{repo}/contents")
    public Mono<List<Map<String, Object>>> getContents(
        @PathVariable String owner,
        @PathVariable String repo) {

        return githubService.getRepositoryContents(owner, repo);
    }

    // 모든 목록 조회
    @GetMapping("/repos/{owner}/{repo}/contents/tree/{sha}")
    public Mono<Map<String, Object>> getContentsTree(
        @PathVariable String owner,
        @PathVariable String repo,
        @PathVariable String sha) {

        return githubService.getRepositoryTree(owner, repo, sha);
    }

    // 파일 생성/업데이트
    @PostMapping("/repos/{owner}/{repo}/files")
    public Mono<ResponseEntity<Map<String, Object>>> createOrUpdateFile(
        @AuthenticationPrincipal(expression = "name") String principalName,
        @PathVariable String owner,
        @PathVariable String repo,
        @RequestParam String path,
        @RequestParam String message,
        @RequestParam(required = false) String sha,
        @RequestBody String fileContent) {

        return githubService.createOrUpdateFile(principalName, owner, repo, path, message, fileContent, sha)
            .map(response -> ResponseEntity.ok(response))
            .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Collections.singletonMap("error", e.getMessage())
            )));
    }

    // 파일 내용 조회
    @GetMapping("/repos/{owner}/{repo}/contents/{path}")
    public Mono<ResponseEntity<Map<String, Object>>> getFileContent(
        @AuthenticationPrincipal(expression = "name") String principalName,
        @PathVariable String owner,
        @PathVariable String repo,
        @PathVariable String path) {
        return githubService.getFileContent(principalName, owner, repo, path)
            .map(content -> ResponseEntity.ok(content))
            .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()))));
    }

    // 깃 레포지토리 조회
    @GetMapping("/git/repo/{userId}")
    public Mono<ResponseEntity<List<GitRepoDTO>>>  getGitInfo(
        @AuthenticationPrincipal(expression = "name") String principalName,
        @PathVariable Long userId){
        return githubService.getGitInfo(userId, principalName)
            .map(repos -> ResponseEntity.ok(repos))
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }


}
