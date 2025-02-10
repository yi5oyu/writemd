package com.writemd.backend.controller;

import com.writemd.backend.dto.ChatDTO;
import com.writemd.backend.dto.NoteDTO;
import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.service.UserService;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class LoginController {

    // @Autowired
    // private OAuth2AuthorizedClientService authorizedClientService;

    @Autowired
    private UserService userService;

    @GetMapping("/user-info")
    public UserDTO getUserInfo(@AuthenticationPrincipal OAuth2User oauthUser) {
        return userService.userInfo((String) oauthUser.getAttributes().get("login"));
    }

    @GetMapping("/note-info/{noteId}")
    public NoteDTO getNote(@PathVariable Long noteId) {
        return userService.noteContent(noteId);
    }

    @GetMapping("/chat-list/{sessionId}")
    public List<ChatDTO> getChats(@PathVariable Long sessionId) {
        return userService.chatList(sessionId);
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
}
