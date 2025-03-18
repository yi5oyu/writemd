package com.writemd.backend.service;

import com.writemd.backend.dto.GitContentDTO;
import com.writemd.backend.dto.GitRepoDTO;
import com.writemd.backend.entity.Gitcontents;
import com.writemd.backend.entity.Gitrepos;
import com.writemd.backend.entity.Gits;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.GitRepository;
import com.writemd.backend.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.reactive.TransactionalOperator;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;


@Service
public class GithubService {

    @Autowired
    private OAuth2AuthorizedClientService authorizedClientService;

    @Autowired
    private WebClient webClient;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GitRepository gitRepository;

    // 레포지토리 조회
    public Mono<List<Map<String, Object>>> getRepositories(String owner, String principalName) {
        System.out.println("레포:" + principalName);
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient("github",
            principalName);
        if (client == null) {
            return Mono.error(new IllegalStateException("GitHub OAuth2 로그인 안됨"));
        }
        String accessToken = client.getAccessToken().getTokenValue();

        return webClient.get()
            .uri("https://api.github.com/users/{owner}/repos", owner)
            .headers(headers -> headers.setBearerAuth(accessToken))
            .exchangeToMono(response -> {
                // 응답 헤더에서 ETag 추출
                String etag = response.headers().asHttpHeaders().getETag();
                System.out.println("ETag: " + etag);
                return response.bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {
                    })
                    .collectList();
            });
    }

    // 레포지토리 목록 조회
    public Mono<List<Map<String, Object>>> getRepositoryContents(String owner, String repo) {
        return webClient.get()
            .uri("https://api.github.com/repos/{owner}/{repo}/contents", owner, repo)
            .retrieve()
            .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {
            })
            .collectList();
    }

    // 모든 목록 조회
    public Mono<Map<String, Object>> getRepositoryTree(String owner, String repo, String treeSha) {
        return webClient.get()
            .uri("https://api.github.com/repos/{owner}/{repo}/git/trees/{treeSha}?recursive=1",
                owner, repo, treeSha)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
            });

    }

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

    // 파일 내용 조회
    public Mono<Map<String, Object>> getFileContent(String principalName, String owner, String repo,
        String path) {
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient("github",
            principalName);
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
                        new RuntimeException("GitHub API Error: " + errorBody)))
            )
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
            });
    }

    private Mono<Gits> saveGits(Gits gits) {
        return Mono.fromCallable(() -> gitRepository.save(gits))
            .subscribeOn(Schedulers.boundedElastic());
    }

    // git 정보 저장
    @Transactional
    public void saveGitInfo(String githubId, String id) {
        Mono.fromCallable(() ->
                userRepository.findByGithubId(githubId)
                    .orElseThrow(() -> new RuntimeException("유저 찾을 수 없음")))
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(user -> {
                OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient("github", id);
                if (client == null) {
                    return Mono.error(new IllegalStateException("GitHub OAuth2 로그인 안됨"));
                }
                String accessToken = client.getAccessToken().getTokenValue();

                return webClient.get()
                    .uri("https://api.github.com/users/{githubId}/repos", githubId)
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .retrieve()
                    .toEntity(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .flatMap(response -> {
                        String newEtag = response.getHeaders().getETag();
                        List<Map<String, Object>> reposList = response.getBody();

                        return Mono.defer(() -> Mono.justOrEmpty(gitRepository.findByUsers(user)))
                            .subscribeOn(Schedulers.boundedElastic())
                            .flatMap(existingGit -> {
                                if (newEtag != null && newEtag.equals(existingGit.getEtag())) {
                                    return Mono.just(existingGit);
                                } else {
                                    existingGit.setEtag(newEtag);
                                    existingGit.getGitrepos().clear();
                                    return saveGitRepos(existingGit, reposList, githubId, accessToken);
                                }
                            })
                            // 새 생성
                            .switchIfEmpty(
                                Mono.defer(() -> {
                                    Gits gits = Gits.builder()
                                        .etag(newEtag)
                                        .users(user)
                                        .build();
                                    return saveGitRepos(gits, reposList, githubId, accessToken);
                                })
                            );
                    });
            })
            .subscribe(savedGits -> {
                // 성공 시 실행
                System.out.println("저장 성공: " + savedGits.getId());
            }, error -> {
                System.err.println("저장 중 에러 발생: " + error.getMessage());
            });
    }

    private Mono<Gits> saveGitRepos(Gits gits, List<Map<String, Object>> reposList, String githubId, String accessToken) {
        if (reposList == null || reposList.isEmpty()) {
            return saveGits(gits);
        }

        return Flux.fromIterable(reposList)
            .parallel()
            .runOn(Schedulers.parallel())
            .flatMap(repo -> {
                String repoName = (String) repo.get("name");
                return webClient.get()
                    .uri("https://api.github.com/repos/{githubId}/{repoName}/contents", githubId, repoName)
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .retrieve()
                    .toEntity(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .onErrorResume(WebClientResponseException.NotFound.class, ex ->
                        Mono.just(new ResponseEntity<>(Collections.emptyList(), HttpStatus.OK))
                    )
                    .map(contentsResponse -> {
                        Gitrepos gitRepo = Gitrepos.builder()
                            .repoName(repoName)
                            .gits(gits)
                            .build();
                        List<Map<String, Object>> contentsList = contentsResponse.getBody();
                        if (contentsList != null) {
                            for (Map<String, Object> content : contentsList) {
                                String path = (String) content.get("path");
                                String type = (String) content.get("type"); // file/dir
                                String sha = (String) content.get("sha");

                                Gitcontents gitContent = Gitcontents.builder()
                                    .path(path)
                                    .type(type)
                                    .sha(sha)
                                    .gitrepos(gitRepo)
                                    .build();
                                gitRepo.getGitcontents().add(gitContent);
                            }
                        }
                        return gitRepo;
                    });
            })
            .sequential()
            .collectList()
            .flatMap(gitReposList -> {
                gits.getGitrepos().addAll(gitReposList);
                return saveGits(gits);
            });
    }

    // 깃 레포지토리 조회
    public List<GitRepoDTO> getGitRepos(Long userId) {
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User 없음"));

        Gits gitEntity = gitRepository.findByUsers(user).orElse(null);

        return gitEntity.getGitrepos().stream()
            .map(repo -> GitRepoDTO.builder()
                .repoId(repo.getId())
                .repo(repo.getRepoName())
                .contents(repo.getGitcontents().stream()
                    .map(content -> GitContentDTO.builder()
                        .path(content.getPath())
                        .type(content.getType())
                        .sha(content.getSha())
                        .build())
                    .collect(Collectors.toList()))
                .build())
            .collect(Collectors.toList());
    }

}