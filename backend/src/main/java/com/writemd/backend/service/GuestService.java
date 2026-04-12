package com.writemd.backend.service;

import com.writemd.backend.config.security.JwtTokenProvider;
import com.writemd.backend.entity.Users;
import com.writemd.backend.repository.UserRepository;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class GuestService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenRedisService tokenRedisService;

    @Value("${jwt.guest-refresh-token-validity}")
    private long guestRefreshTokenValidity;

    public Map<String, String> loginGuest() {
        // guest:<UUID> 생성
        String shortUuid = UUID.randomUUID().toString().substring(0, 8);
        String guestGithubId = "guest:" + shortUuid;
        String guestName = "게스트_" + shortUuid;
        String deviceId = UUID.randomUUID().toString();

        // Users 저장
        Users guestUser = Users.builder()
            .githubId(guestGithubId)
            .name(guestName)
            .htmlUrl(null)
            .avatarUrl(null)
            .build();

        userRepository.save(guestUser);
        log.info("새로운 게스트 계정 생성 완료: {}", guestGithubId);

        // accessToken, refreshToken 발급
        String accessToken = jwtTokenProvider.createAccessToken(guestUser.getGithubId(), guestName);
        String refreshToken = jwtTokenProvider.createRefreshToken(guestUser.getGithubId());

        // Redis에 refreshToken 저장
        tokenRedisService.saveRefreshToken(guestUser.getGithubId(), refreshToken, deviceId, guestRefreshTokenValidity);

        Map<String, String> result = new HashMap<>();
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);
        result.put("deviceId", deviceId);

        return result;
    }
}
