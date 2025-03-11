package com.writemd.backend.service;

import com.writemd.backend.dto.GithubDTO;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;


@Service
public class GithubService {

    @Autowired
    private OAuth2AuthorizedClientService authorizedClientService;

    @Autowired
    private WebClient webClient;

    // 레포지토리 조회
    public Mono<List<Map<String, Object>>> getRepositories(String principalName) {
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient("github", principalName);
        if (client == null) {
            return Mono.error(new IllegalStateException("GitHub OAuth2 로그인 안됨"));
        }
        String accessToken = client.getAccessToken().getTokenValue();
        System.out.println(accessToken);

        return webClient.get()
            .uri("https://api.github.com/user/repos")
            .headers(headers -> headers.setBearerAuth(accessToken))
            .retrieve()
            .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {})
            .collectList();
    }

    // 레포지토리 목록 조회
    public Mono<List<Map<String, Object>>> getRepositoryContents(String owner, String repo) {
        return webClient.get()
            .uri("https://api.github.com/repos/{owner}/{repo}/contents", owner, repo)
            .retrieve()
            .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {})
            .collectList();
    }

    // 레포지토리 하위 목록 조회
    public Mono<Map<String, Object>> getRepositoryTree(String owner, String repo, String treeSha) {
        return webClient.get()
            .uri("https://api.github.com/repos/{owner}/{repo}/git/trees/{treeSha}?recursive=1", owner, repo, treeSha)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});

    }

    // 파일 생성/업데이트
    public Mono<Map<String, Object>> createOrUpdateFile(String principalName, String owner, String repo, String path, String message, String fileContent, String sha) {
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient("github", principalName);
        if (client == null) {
            return Mono.error(new IllegalStateException("GitHub OAuth2 로그인 안됨"));
        }
        String accessToken = client.getAccessToken().getTokenValue();
        String encodedContent = Base64.getEncoder().encodeToString(fileContent.getBytes(StandardCharsets.UTF_8));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("message", message);
        requestBody.put("content", encodedContent);

        if (sha != null && !sha.isEmpty()) {
            requestBody.put("sha", sha);
        }

        return webClient.put()
            .uri("https://api.github.com/repos/{owner}/{repo}/contents/{path}", owner, repo, path)
            .headers(headers -> headers.setBearerAuth(accessToken))
            .bodyValue(requestBody)
            .retrieve()
            .onStatus(status -> status.isError(), clientResponse ->
                clientResponse.bodyToMono(String.class)
                    .flatMap(errorBody -> {
                        return Mono.error(new RuntimeException("GitHub API Error: " + errorBody));
                    })
            )
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

}
