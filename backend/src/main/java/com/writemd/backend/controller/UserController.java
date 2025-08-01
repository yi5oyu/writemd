package com.writemd.backend.controller;

import com.writemd.backend.dto.APIDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.service.APIService;
import com.writemd.backend.service.UserService;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    // private final OAuth2AuthorizedClientService authorizedClientService;
    private final UserService userService;
    private final APIService apiService;

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

    // API 키 저장
    @PostMapping("/key/{userId}/{githubId}")
    public ResponseEntity<?> saveAPIKey(@PathVariable Long userId, @PathVariable String githubId,
        @RequestBody APIDTO apidto) {
        try {
            APIDTO savedApiDTO = apiService.saveAPIKey(userId, githubId, apidto.getAiModel(), apidto.getApiKey());

            return ResponseEntity.status(HttpStatus.CREATED).body(savedApiDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("API 키 저장 중 오류 발생");
        }
    }

    // API 키 조회
    @GetMapping("/key/{userId}")
    public List<APIDTO> getAPIKeys(@PathVariable Long userId) {
        return apiService.getAPIKeys(userId);
    }

    // API 키 삭제
    @DeleteMapping("/key/{apiId}")
    public ResponseEntity<Void> deleteApiKey(@PathVariable Long apiId) {
        try {
            apiService.deleteAPIKey(apiId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 유저 모든 데이터 삭제
    @DeleteMapping("/{userId}/data")
    public ResponseEntity<Void> deleteUserData(@PathVariable Long userId) {
        try {
            userService.deleteUserData(userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    // 유저 삭제
    @DeleteMapping("/{githubId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String githubId) {
        try {
            userService.deleteUser(githubId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
