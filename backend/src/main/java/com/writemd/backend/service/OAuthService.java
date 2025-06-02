package com.writemd.backend.service;

import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.UserRepository;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OAuthService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String githubId = oauth2User.getAttribute("id").toString();
        userRepository.findByGithubId(githubId)
            .orElseGet(() -> userRepository.save(
                Users.builder()
                    .githubId(githubId)
                    .name(oauth2User.getAttribute("name"))
                    .htmlUrl(oauth2User.getAttribute("html_url"))
                    .avatarUrl(oauth2User.getAttribute("avatar_url"))
                    .build()));

        return new DefaultOAuth2User(
            Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
            oauth2User.getAttributes(), "id");
    }

}
