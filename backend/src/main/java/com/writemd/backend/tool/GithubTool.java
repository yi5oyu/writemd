package com.writemd.backend.tool;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.writemd.backend.repository.UserRepository;
import com.writemd.backend.service.GithubService;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.stereotype.Component;
import org.kohsuke.github.*;
import org.springframework.util.StringUtils;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class GithubTool {

    private static final Logger log = LoggerFactory.getLogger(GithubTool.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final UserRepository userRepository;
    public record Request(
        String owner,
        String repo,
        String path
    ) {}

    @Tool(description = "지정된 GitHub 리포지토리의 특정 경로에 있는 파일 및 디렉토리 목록을 읽어옵니다. owner(소유자)와 repo(리포지토리 이름)는 필수입니다. path(경로)는 선택사항이며 기본값은 루트('/')입니다. 결과는 파일/디렉토리 이름과 타입(file/dir) 목록을 포함하는 JSON 문자열입니다.")
    public String readGithubRepository(Request request) {
        log.info("readGithubRepository 호출됨 (OAuth2 인증 사용): owner={}, repo={}, path={}", request.owner(), request.repo(), request.path());

        if (!StringUtils.hasText(request.owner()) || !StringUtils.hasText(request.repo())) {
            return handleError("오류: GitHub 리포지토리 소유자(owner)와 이름(repo)은 필수입니다.");
        }
        Optional<String> principalName = userRepository.findPrincipalNameByGithubId(request.owner());
        if (principalName.isEmpty()) {
            // 값이 없는 경우 (사용자를 찾지 못함) -> 오류 처리
            log.warn("Repository에서 owner '{}'에 해당하는 principalName을 찾을 수 없습니다.", request.owner());
            // 적절한 오류를 반환합니다. Mono를 사용하는 것을 보니 Reactive 환경일 수 있으므로 Mono.error 사용
            return ("사용자 정보(principalName)를 찾을 수 없습니다: " + request.owner());
        }

        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient("github", principalName.get());
        if (client == null) {
            return ("GitHub OAuth2 로그인 안됨");
        }
        String accessToken = client.getAccessToken().getTokenValue();

        if (!StringUtils.hasText("accessToken")) {
            log.error("사용자 '{}'의 GitHub Access Token 값이 비어있습니다.");
            return handleError("오류: GitHub Access Token을 가져올 수 없습니다.");
        }
        log.debug("사용자 '{}'의 GitHub Access Token 획득 성공");

        String repoOwner = request.owner();
        String repoName = request.repo();
        String targetPath = StringUtils.hasText(request.path()) ? request.path() : "/"; // 기본 경로 '/'

        try{
            GitHub github = new GitHubBuilder().withOAuthToken(accessToken).build();

            GHRepository repository = github.getRepository(repoOwner + "/" + repoName);
            log.info("리포지토리 '{}'에 접근 성공 (사용자: {})", repository.getFullName(), principalName);

            List<GHContent> directoryContent = repository.getDirectoryContent(targetPath);
            log.info("'{}' 경로에서 {}개의 항목 찾음 (사용자: {})", targetPath, directoryContent.size(), principalName);

            List<Map<String, String>> contentList = new ArrayList<>();
            for (GHContent content : directoryContent) {
                Map<String, String> item = new HashMap<>();
                item.put("name", content.getName());
                item.put("type", content.isDirectory() ? "dir" : "file");
                contentList.add(item);
            }
            return objectMapper.writeValueAsString(contentList);
        } catch (FileNotFoundException e) {
            log.error("GitHub 리포지토리 또는 경로를 찾을 수 없음: {}/{} 경로: {} (사용자: {})", repoOwner, repoName, targetPath, principalName, e);
            return handleError("오류: 리포지토리 '" + repoOwner + "/" + repoName + "' 또는 경로 '" + targetPath + "'를 찾을 수 없습니다. 이름, 경로, 접근 권한을 확인하세요.");
        } catch (IOException e) {
            // IOException은 네트워크 오류, 인증 실패(토큰 만료 등), Rate Limit 초과 등 다양한 원인으로 발생 가능
            log.error("GitHub 리포지토리 접근 중 오류 발생: {}/{} (사용자: {})", repoOwner, repoName, principalName, e);
//            if (e instanceof GHAuthorizationException) { // 좀 더 구체적인 예외 처리
//                return handleError("오류: GitHub 접근 권한이 없습니다. 토큰이 유효한지 또는 리포지토리에 대한 권한이 있는지 확인하세요.");
//            } else if (e instanceof GHRateLimitException) {
//                GHRateLimitException rateLimitException = (GHRateLimitException) e;
//                return handleError("오류: GitHub API 호출 제한을 초과했습니다. 초기화 시간: " + rateLimitException.getResetDate());
//            }
            return handleError("오류: GitHub 리포지토리 접근 중 오류가 발생했습니다: " + e.getMessage());
        }
//        catch (JsonProcessingException e) {
//            log.error("결과를 JSON으로 변환 중 오류 발생 (사용자: {})", principalName, e);
//            return handleError("오류: 결과를 처리하는 중 내부 오류가 발생했습니다.");
//        }
    }

    // 공통 오류 처리 메소드
    private String handleError(String errorMessage) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", errorMessage);
        try {
            return objectMapper.writeValueAsString(errorResponse);
        } catch (JsonProcessingException e) {
            return "{ \"error\": \"오류 메시지를 JSON으로 변환하는 데 실패했습니다.\" }";
        }
    }
}


