package com.writemd.backend.config.security;

import com.writemd.backend.dto.UserDTO;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.UserRepository;
import com.writemd.backend.service.TokenRedisService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenRedisService tokenRedisService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

        final String token = resolveToken(request);

        // 토큰 존재, 인증된 정보가 없는 경우
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // JWT 서명 검증
                jwtTokenProvider.validateToken(token);

                // Redis 블랙리스트 확인(예외를 발생시킴)
                if (tokenRedisService.isBlacklisted(token)) {
                    throw new SecurityException("토큰 취소(블랙리스트 확인)");
                }

                // 사용자 정보 추출/인증 설정
                String githubId = jwtTokenProvider.getGithubId(token);
                Users user = userRepository.findByGithubId(githubId)
                    .orElseThrow(() -> new UsernameNotFoundException("유저 없음: " + githubId));

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        UserDTO.builder()
                            .userId(user.getId())
                            .githubId(user.getGithubId())
                            .name(user.getName())
                            .htmlUrl(user.getHtmlUrl())
                            .avatarUrl(user.getAvatarUrl())
                            .build(),
                        null,
                        Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"))
                    );

                // 인증 정보 저장
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.info("JWT 인증 성공 - githubId: {}, URI: {}", githubId, request.getRequestURI());

            } catch (Exception e) {
                log.error("JWT 검증 실패", e);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\": \" 인증 실패 or 만료 \"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    // Authorization 헤더에서 토큰 추출
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
