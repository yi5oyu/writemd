package com.writemd.backend.config;

import com.writemd.backend.config.security.CustomAuthenticationSuccessHandler;
import com.writemd.backend.service.GithubService;
import com.writemd.backend.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserService userService;

    @Autowired
    private CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("http://localhost:5173");
        configuration.addAllowedOriginPattern("http://127.0.0.1:6274");
        configuration.addAllowedOriginPattern("http://127.0.0.1:6277");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests((requests) -> requests
                        .requestMatchers("/mcp/**","/error", "/oauth2/**", "/login/oauth2/**", "/actuator/**",
                                "/logout", "/v1/**", "/sse")
                        .permitAll().requestMatchers("/profile/**", "/api/**", "/h2-console/**").authenticated()
                        .anyRequest().authenticated())
                .oauth2Login(oauth2 -> oauth2.loginPage("/oauth2/authorization/github")
                        .userInfoEndpoint(
                                userInfo -> userInfo.userService(customOAuth2UserService()))
                        .successHandler(customAuthenticationSuccessHandler))
                .logout(logout -> logout.logoutUrl("/logout")
                        .logoutSuccessUrl("http://localhost:5173")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setHeader("Access-Control-Allow-Origin",
                                    "http://localhost:5173");
                            response.setHeader("Access-Control-Allow-Credentials", "true");
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_OK);
                            response.getWriter().write("{\"message\": \"로그아웃 성공\"}");
                            response.getWriter().flush();
                        }).invalidateHttpSession(true).deleteCookies("JSESSIONID")
                        .clearAuthentication(true))
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));

        return http.build();
    }

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> customOAuth2UserService() {
        return userRequest -> {
            OAuth2User oAuth2User = new DefaultOAuth2UserService().loadUser(userRequest);


            String githubId = oAuth2User.getAttribute("login");
            String name = oAuth2User.getAttribute("name");
            String htmlUrl = oAuth2User.getAttribute("html_url");
            String avatarUrl = oAuth2User.getAttribute("avatar_url");
            String principalName = "" + oAuth2User.getAttribute("id");
            userService.saveUser(githubId, name, htmlUrl, avatarUrl, principalName);

            return new DefaultOAuth2User(
                    Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                    oAuth2User.getAttributes(), "id");
        };
    }
}
