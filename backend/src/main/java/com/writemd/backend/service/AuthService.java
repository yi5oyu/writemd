package com.writemd.backend.service;

import com.writemd.backend.config.security.JwtTokenProvider;
import com.writemd.backend.dto.TokenResponseDTO;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenRedisService tokenRedisService;

    @Value("${jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    @Transactional
    public TokenResponseDTO issueToken(String githubId, String name, String deviceId) {

        // JWT 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(githubId, name);
        String refreshToken = jwtTokenProvider.createRefreshToken(githubId);

        // Refresh Token을 Redis에 저장
        tokenRedisService.saveRefreshToken(
            githubId,
            refreshToken,
            deviceId,
            refreshTokenValidity
        );

        log.info("토큰 발행 성공 - githubId: {}", githubId);

        return new TokenResponseDTO(accessToken, refreshToken);
    }

    @Transactional
    public TokenResponseDTO refreshToken(String refreshToken, String deviceId) {
        // 토큰 유효성 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("리프레시 토큰 만료");
        }

        String githubId = jwtTokenProvider.getGithubId(refreshToken);

        if (!tokenRedisService.validateRefreshToken(githubId, deviceId, refreshToken)) {
            throw new IllegalArgumentException("리프레시 토큰 일치하지 않음");
        }

        Users user = userRepository.findByGithubId(githubId)
            .orElseThrow(() -> new UsernameNotFoundException("유저 없음"));

        // 새 토큰 발급
        String newAccessToken = jwtTokenProvider.createAccessToken(user.getGithubId(), user.getName());
        String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getGithubId());

        // Redis에 새 토큰 저장(교체)
        tokenRedisService.rotateRefreshToken(
            githubId,
            newRefreshToken,
            deviceId,
            refreshTokenValidity
        );

        log.info("리프레시 토큰 성공 - githubId: {}, deviceId: {}", githubId, deviceId);

        return new TokenResponseDTO(newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String accessToken, String deviceId) {
        String githubId = jwtTokenProvider.getGithubId(accessToken);

        // 블랙리스트 추가
        long remainingTime = jwtTokenProvider.getRemainingTime(accessToken);
        if (remainingTime > 0) {
            tokenRedisService.addToBlacklist(accessToken, remainingTime);
        }

        // 로그아웃(리프레시 토큰 삭제)
        tokenRedisService.logoutSingleDevice(githubId, deviceId);

        log.info("로그아웃 - githubId: {}, deviceId: {}", githubId, deviceId);
    }

    @Transactional
    public void logoutAllDevices(String accessToken) {
        String githubId = jwtTokenProvider.getGithubId(accessToken);

        // 블랙리스트 추가
        long remainingTime = jwtTokenProvider.getRemainingTime(accessToken);
        if (remainingTime > 0) {
            tokenRedisService.addToBlacklist(accessToken, remainingTime);
        }

        // 모든 장치 로그아웃
        tokenRedisService.logoutAllDevices(githubId);

        log.info("모든 장치 로그아웃 - githubId: {}", githubId);
    }
}
