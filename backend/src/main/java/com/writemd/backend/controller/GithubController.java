package com.writemd.backend.controller;

import com.writemd.backend.dto.GitContentDTO;
import com.writemd.backend.dto.GitRepoDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.service.GithubService;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/github")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class GithubController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final GithubService githubService;

    // 파일 생성/업데이트
    @PostMapping("/repo/{owner}/{repo}/file")
    public ResponseEntity<?> createOrUpdateFile(
        @PathVariable String owner,
        @PathVariable String repo,
        @RequestParam String path,
        @RequestParam String message,
        @RequestParam(required = false) String sha,
        @RequestParam(required = false) String newPath,
        @RequestBody String fileContent) {

        Map<String, Object> content = githubService.createOrUpdateFile(
            owner, repo, path, message, fileContent, sha, newPath).block();

        return ResponseEntity.ok(content);

    }

    // 레포지토리, 하위 폴더/파일 조회
    @GetMapping("/repo/{githubId}")
    public ResponseEntity<?> getGitInfo(
        @AuthenticationPrincipal UserDTO userDTO,
        @PathVariable String githubId) {

        if (userDTO == null) {
            log.warn("인증되지 않은 GitHub API 요청");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("error", "인증 필요"));
        }

        String principalName = userDTO.getGithubId();
        log.info("GitHub API 요청. githubId: {}, 인증된 사용자: {}", githubId, principalName);

        try {
            List<GitRepoDTO> repos = githubService.getGitInfo(githubId)
                .block();
            return ResponseEntity.ok(repos);
        } catch (Exception e) {
            log.error("GitHub API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }


    // 파일 내용 조회
    @GetMapping("/repo/{owner}/{repo}/contents/{path}")
    public ResponseEntity<GitContentDTO> getFileContent(
//        @AuthenticationPrincipal UserDTO userDTO,
        @PathVariable String owner,
        @PathVariable String repo,
        @PathVariable String path) {

        GitContentDTO content = githubService.getFileContent(owner, repo, path).block();

        return ResponseEntity.ok(content);

    }

    // 폴더 내용 조회
    @GetMapping("/repo/{owner}/{repo}/folder/{sha}")
    public ResponseEntity<List<GitContentDTO>> getFolderContents(
        @PathVariable String owner,
        @PathVariable String repo,
        @PathVariable String sha) {

        List<GitContentDTO> content = githubService.getFolderContents(owner, repo, sha).block();

        return ResponseEntity.ok(content);
    }

    // 폴더안 파일 조회
    @GetMapping("/repo/{owner}/{repo}/blobs/{sha}")
    public ResponseEntity<GitContentDTO> getBlobFile(
        @PathVariable String owner,
        @PathVariable String repo,
        @PathVariable String sha) {

        GitContentDTO content = githubService.getblobFile(owner, repo, sha).block();

        return ResponseEntity.ok(content);
    }

}
