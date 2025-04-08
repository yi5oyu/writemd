package com.writemd.backend.controller;

import com.writemd.backend.dto.GitContentDTO;
import com.writemd.backend.dto.GitRepoDTO;
import com.writemd.backend.service.GithubService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/github")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class GithubController {

    private final GithubService githubService;

    // 파일 생성/업데이트
    @PostMapping("/repo/{owner}/{repo}/file")
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

    // 레포지토리, 하위 폴더/파일 조회
    @GetMapping("/repo/{userId}")
    public Mono<ResponseEntity<List<GitRepoDTO>>> getGitInfo(
        @AuthenticationPrincipal(expression = "name") String principalName,
        @PathVariable Long userId){
        return githubService.getGitInfo(userId, principalName)
            .map(repos -> ResponseEntity.ok(repos))
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // 파일 내용 조회
    @GetMapping("/repo/{owner}/{repo}/contents/{path}")
    public Mono<GitContentDTO> getFileContent(
        @AuthenticationPrincipal(expression = "name") String principalName,
        @PathVariable String owner,
        @PathVariable String repo,
        @PathVariable String path) {
        return githubService.getFileContent(principalName, owner, repo, path);
    }

    // 폴더 내용 조회
    @GetMapping("/repo/{owner}/{repo}/folder/{sha}")
    public Mono<List<GitContentDTO>> getFolderContents(
        @AuthenticationPrincipal(expression = "name") String principalName,
        @PathVariable String owner,
        @PathVariable String repo,
        @PathVariable String sha) {

        return githubService.getFolderContents(principalName, owner, repo, sha);
    }

    // 폴더안 파일 조회
    @GetMapping("/repo/{owner}/{repo}/blobs/{sha}")
    public Mono<GitContentDTO> getBlobFile(
        @AuthenticationPrincipal(expression = "name") String principalName,
        @PathVariable String owner,
        @PathVariable String repo,
        @PathVariable String sha) {

        return githubService.getblobFile(principalName, owner, repo, sha);
    }

}
