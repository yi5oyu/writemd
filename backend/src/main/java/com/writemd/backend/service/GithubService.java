package com.writemd.backend.service;

import com.writemd.backend.dto.GitContentDTO;
import com.writemd.backend.dto.GitRepoDTO;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;


@Service
@RequiredArgsConstructor
public class GithubService {

    private final OAuth2AuthorizedClientService authorizedClientService;

    private final  WebClient webClient;

    private final  UserRepository userRepository;

    // 파일 생성/업데이트
    public Mono<Map<String, Object>> createOrUpdateFile(String principalName, String owner,
        String repo, String path, String message, String fileContent, String sha) {
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient("github",
            principalName);
        if (client == null) {
            return Mono.error(new IllegalStateException("GitHub OAuth2 로그인 안됨"));
        }
        String accessToken = client.getAccessToken().getTokenValue();
        String encodedContent = Base64.getEncoder()
            .encodeToString(fileContent.getBytes(StandardCharsets.UTF_8));

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
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
            });
    }

    // 레포지토리, 하위 폴더/파일 조회
    public Mono<List<GitRepoDTO>> getGitInfo(Long userId, String principalName) {
        Users users = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User 없음"));

        return Mono.fromCallable(() ->
                userRepository.findByGithubId(users.getGithubId())
                    .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음")))
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(user -> {
                OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                    "github", principalName);
                if (client == null) {
                    return Mono.error(new IllegalStateException("GitHub OAuth2 로그인 안됨"));
                }
                String accessToken = client.getAccessToken().getTokenValue();

                return webClient.get()
                    .uri("https://api.github.com/users/{githubId}/repos", users.getGithubId())
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .retrieve()
                    .toEntity(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                    })
                    .flatMap(response -> {
                        List<Map<String, Object>> reposList = response.getBody();
                        if (reposList == null) {
                            return Mono.just(Collections.emptyList());
                        }
                        List<Mono<GitRepoDTO>> repoMonos = reposList.stream()
                            .map(repo -> {
                                String repoName = (String) repo.get("name");
                                Long repoId = ((Number) repo.get("id")).longValue();

                                return webClient.get()
                                    .uri("https://api.github.com/repos/{owner}/{repo}/contents",
                                        users.getGithubId(), repoName)
                                    .headers(headers -> headers.setBearerAuth(accessToken))
                                    .retrieve()
                                    .bodyToMono(
                                        new ParameterizedTypeReference<List<Map<String, Object>>>() {
                                        })
                                    .map(contents -> mapToGitRepoDTO(repoId, repoName, contents))
                                    .onErrorResume(e -> {
                                        System.err.println("콘텐츠 가져오기 실패: " + e.getMessage());

                                        return Mono.just(GitRepoDTO.builder()
                                            .repoId(repoId)
                                            .repo(repoName)
                                            .contents(Collections.emptyList())
                                            .build());
                                    });
                            })
                            .collect(Collectors.toList());

                        return Flux.fromIterable(repoMonos)
                            .flatMap(mono -> mono)
                            .collectList();
                    });
            });
    }

    // DTO 변환
    private GitRepoDTO mapToGitRepoDTO(Long repoId, String repoName, List<Map<String, Object>> contents) {
        List<GitContentDTO> contentDTOs = contents.stream()
            .map(content -> GitContentDTO.builder()
                .path((String) content.get("path"))
                .type((String) content.get("type"))
                .sha((String) content.get("sha"))
                .build())
            .collect(Collectors.toList());

        return GitRepoDTO.builder()
            .repoId(repoId)
            .repo(repoName)
            .contents(contentDTOs)
            .build();
    }

    // 파일 내용 조회
    public Mono<GitContentDTO> getFileContent(String principalName, String owner, String repo, String path) {
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient("github", principalName);
        if (client == null) {
            return Mono.error(new IllegalStateException("GitHub OAuth2 로그인 안됨"));
        }
        String accessToken = client.getAccessToken().getTokenValue();

        return webClient.get()
            .uri("https://api.github.com/repos/{owner}/{repo}/contents/{path}", owner, repo, path)
            .headers(headers -> headers.setBearerAuth(accessToken))
            .retrieve()
            .onStatus(status -> status.isError(), clientResponse ->
                clientResponse.bodyToMono(String.class)
                    .flatMap(errorBody -> Mono.error(
                        new RuntimeException("GitHub API 에러: " + errorBody)))
            )
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .map(response -> GitContentDTO.builder()
                .path(path)
                .type((String) response.get("type"))
                .sha((String) response.get("sha"))
                .content((String) response.get("content"))
                .build());
    }

    // 폴더 내용 조회
    public Mono<List<GitContentDTO>> getFolderContents(String principalName, String owner, String repo, String sha) {
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient("github", principalName);
        if (client == null) {
            throw new IllegalStateException("GitHub OAuth2 login required.");
        }

        String accessToken = client.getAccessToken().getTokenValue();

        return webClient.get()
            .uri("https://api.github.com/repos/{owner}/{repo}/git/trees/{sha}", owner, repo, sha)
            .headers(headers -> headers.setBearerAuth(accessToken))
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .map(response -> {
                List<Map<String, Object>> treeItems = (List<Map<String, Object>>) response.get("tree");
                return treeItems.stream()
                    .map(item -> GitContentDTO.builder()
                        .path((String) item.get("path"))
                        .type(convertType((String) item.get("type")))
                        .sha((String) item.get("sha"))
                        .build())
                    .collect(Collectors.toList());
            });
    }

    // 타입 변환
    private String convertType(String type) {
        switch (type) {
            case "blob":
                return "file";
            case "tree":
                return "dir";
            default:
                return type;
        }
    }

}