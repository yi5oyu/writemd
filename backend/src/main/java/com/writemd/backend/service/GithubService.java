package com.writemd.backend.service;

import com.writemd.backend.dto.GithubDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class GithubService {

    @Autowired
    private OAuth2AuthorizedClientService authorizedClientService;

    @Autowired
    private WebClient webClient;

    public Mono<String> getRepositorys(String principalName) {
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient("github", principalName);
        if (client == null) {
            return Mono.error(new IllegalStateException("GitHub client 찾을 수 없음"));
        }
        String accessToken = client.getAccessToken().getTokenValue();

        return webClient.get()
            .uri("https://api.github.com/user/repos")
            .headers(headers -> headers.setBearerAuth(accessToken))
            .retrieve()
            .bodyToFlux(GithubDTO.class)
            .map(GithubDTO::getName)
            .collectList()
            .map(list -> String.join(", ", list));
    }
}
