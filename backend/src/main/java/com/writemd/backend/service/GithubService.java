package com.writemd.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.writemd.backend.dto.GitBranchDTO;
import com.writemd.backend.dto.GitContentDTO;
import com.writemd.backend.dto.GitRepoDTO;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.graphql.client.HttpGraphQlClient;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class GithubService {

    private final OAuth2AuthorizedClientService authorizedClientService;
    private final WebClient webClient;
    private final WebClient.Builder webClientBuilder;
    private final UserService userService;

    //    private final Executor getAsyncExecutor;

    // 파일 생성/업데이트
    public Mono<Map<String, Object>> createOrUpdateFile(String owner, String repo, String path, String message,
        String fileContent, String sha, String newPath) {

        boolean isRename = (newPath != null && !newPath.isEmpty() && !newPath.equals(path))
            && sha != null && !sha.trim().isEmpty();

        String accessToken = userService.getGithubAccessToken(owner);

        if (isRename) {
            Map<String, String> deleteBody = new HashMap<>();
            deleteBody.put("message", "- 기존 파일 삭제: " + path);
            deleteBody.put("sha", sha);

            return webClient.method(HttpMethod.DELETE)
                .uri("https://api.github.com/repos/{owner}/{repo}/contents/{path}", owner, repo, path)
                .headers(headers -> headers.setBearerAuth(accessToken))
                .body(BodyInserters.fromValue(deleteBody))
                .retrieve()
                .onStatus(status -> status.isError(), clientResponse ->
                    clientResponse.bodyToMono(String.class)
                        .flatMap(errorBody -> Mono.error(new RuntimeException("GitHub API 에러: " + errorBody)))
                )
                .bodyToMono(Void.class)
                .then(Mono.defer(() -> {
                    String encodedContent = Base64.getEncoder()
                        .encodeToString(fileContent.getBytes(StandardCharsets.UTF_8));

                    Map<String, Object> createBody = new HashMap<>();
                    createBody.put("message", message + "\n- 새파일 생성: " + newPath);
                    createBody.put("content", encodedContent);
                    return webClient.put()
                        .uri("https://api.github.com/repos/{owner}/{repo}/contents/{filePath}", owner, repo,
                            newPath) // 'newPath' 사용
                        .headers(headers -> headers.setBearerAuth(accessToken))
                        .bodyValue(createBody)
                        .retrieve()
                        .onStatus(status -> status.isError(), clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(new RuntimeException(
                                    "GitHub API 에러: " + errorBody)))
                        )
                        .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                        }); // 최종 생성 결과 반환
                }));
        } else {
            String encodedContent = Base64.getEncoder()
                .encodeToString(fileContent.getBytes(StandardCharsets.UTF_8));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("message", message);
            requestBody.put("content", encodedContent);

            // sha 값이 있으면 업데이트, 없으면 생성
            if (sha != null && !sha.trim().isEmpty()) {
                requestBody.put("sha", sha);
            }

            return webClient.put()
                // 생성/업데이트는 path 최종 목표
                .uri("https://api.github.com/repos/{owner}/{repo}/contents/{filePath}", owner, repo, path)
                .headers(headers -> headers.setBearerAuth(accessToken))
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.isError(), clientResponse ->
                    clientResponse.bodyToMono(String.class)
                        .flatMap(errorBody -> Mono.error(
                            new RuntimeException("GitHub API 에러: " + errorBody)))
                )
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                });
        }
    }

    // 레포지토리, 하위 폴더/파일 조회
    public Mono<List<GitRepoDTO>> getGitInfo(String githubId) {
        String accessToken = userService.getGithubAccessToken(githubId);

        // GraphQL 클라이언트
        HttpGraphQlClient graphQlClient = HttpGraphQlClient.builder(webClientBuilder)
            .url("https://api.github.com/graphql")
            .header("Authorization", "Bearer " + accessToken)
            .build();

        return graphQlClient.documentName("githubUserInfo")
            .variable("username", githubId)
            .execute()
            .map(response -> {
                if (!response.isValid()) {
                    log.error("GraphQL 쿼리 실행 에러: {}", response.getErrors());
                    return Collections.<GitRepoDTO>emptyList();
                }

                // nodes JsonNode 트리만 조회
                JsonNode reposNode = response.field("user.repositories.nodes").toEntity(JsonNode.class);

                return parseReposNode(reposNode);
            })
            .onErrorResume(e -> {
                log.error("GraphQL 통신 실패 User: {}, Error: {}", githubId, e.getMessage());
                return Mono.just(Collections.emptyList());
            });
    }

    // GraphQL JSON 응답 DTO로 변환
    private List<GitRepoDTO> parseReposNode(JsonNode reposNode) {
        List<GitRepoDTO> resultList = new ArrayList<>();

        if (reposNode == null || !reposNode.isArray()) {
            return resultList;
        }

        for (JsonNode repoNode : reposNode) {
            Long repoId = repoNode.path("databaseId").asLong(0);
            String repoName = repoNode.path("name").asText();

            List<GitBranchDTO> branchDTOs = new ArrayList<>();
            JsonNode branchRef = repoNode.path("defaultBranchRef");

            // main/master
            if (!branchRef.isMissingNode() && !branchRef.isNull()) {
                String branchName = branchRef.path("name").asText();
                JsonNode entries = branchRef.path("target").path("tree").path("entries");

                List<GitContentDTO> contents = new ArrayList<>();
                if (entries.isArray()) {
                    for (JsonNode entry : entries) {
                        contents.add(GitContentDTO.builder()
                            .path(entry.path("name").asText())
                            .type(entry.path("type").asText())
                            .sha(entry.path("oid").asText())   // REST API: sha = GraphQL: oid
                            .build());
                    }
                }

                branchDTOs.add(GitBranchDTO.builder()
                    .branch(branchName)
                    .contents(contents)
                    .build());
            }

            resultList.add(GitRepoDTO.builder()
                .repoId(repoId)
                .repo(repoName)
                .branches(branchDTOs)
                .build());
        }

        return resultList;
    }

    // DTO 변환
//    private GitRepoDTO mapToGitRepoDTO(Long repoId, String repoName, List<Map<String, Object>> contents) {
//        List<GitContentDTO> contentDTOs = contents.stream()
//            .map(content -> GitContentDTO.builder()
//                .path((String) content.get("path"))
//                .type((String) content.get("type"))
//                .sha((String) content.get("sha"))
//                .build())
//            .collect(Collectors.toList());
//
//        return GitRepoDTO.builder()
//            .repoId(repoId)
//            .repo(repoName)
//            .contents(contentDTOs)
//            .build();
//    }

    public String getCurrentUserGithubAccessToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String principalName = authentication.getName();
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient("github", principalName);

        String accessToken = client.getAccessToken().getTokenValue();

        return accessToken;
    }

    // 파일 내용 조회
    public Mono<GitContentDTO> getFileContent(String owner, String repo, String path) {
        String accessToken = userService.getGithubAccessToken(owner);

        return webClient.get()
            .uri("https://api.github.com/repos/{owner}/{repo}/contents/{path}", owner, repo, path)
            .headers(headers -> headers.setBearerAuth(accessToken))
            .retrieve()
            .onStatus(status -> status.isError(), clientResponse ->
                clientResponse.bodyToMono(String.class)
                    .flatMap(errorBody -> Mono.error(
                        new RuntimeException("GitHub API 에러: " + errorBody)))
            )
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
            })
            .map(response -> GitContentDTO.builder()
                .path(path)
                .type((String) response.get("type"))
                .sha((String) response.get("sha"))
                .content((String) response.get("content"))
                .build());
    }

    // 폴더 내용 조회
    public Mono<List<GitContentDTO>> getFolderContents(String owner, String repo, String sha) {
        String accessToken = userService.getGithubAccessToken(owner);

        return webClient.get()
            .uri("https://api.github.com/repos/{owner}/{repo}/git/trees/{sha}", owner, repo, sha)
            .headers(headers -> headers.setBearerAuth(accessToken))
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
            })
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

    // 폴더안 파일 조회
    public Mono<GitContentDTO> getblobFile(String owner, String repo, String sha) {
        String accessToken = userService.getGithubAccessToken(owner);

        return webClient.get()
            .uri("https://api.github.com/repos/{owner}/{repo}/git/blobs/{sha}", owner, repo, sha)
            .headers(headers -> headers.setBearerAuth(accessToken))
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
            })
            .map(response -> GitContentDTO.builder()
                .path("")
                .type("file")
                .sha(sha)
                .content((String) response.get("content"))
                .build());

    }
}