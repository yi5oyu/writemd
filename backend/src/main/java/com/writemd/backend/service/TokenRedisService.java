package com.writemd.backend.service;

import com.writemd.backend.dto.TokenDTO;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenRedisService {

    private static final Logger log = LoggerFactory.getLogger(TokenRedisService.class);

    private static final String REFRESH_TOKEN_PREFIX = "RT:";
    // 로그아웃 시 토큰 무효화
    private static final String BLACKLIST_PREFIX = "BL:";
    private final RedisTemplate<String, Object> redisTemplate;

    // Refresh Token 저장
    public void saveRefreshToken(String githubId, String refreshToken, String deviceId, long expirationMillis) {
        String key = REFRESH_TOKEN_PREFIX + githubId;

        TokenDTO tokenData = new TokenDTO(refreshToken, System.currentTimeMillis());

        // 토큰 데이터 저장
        redisTemplate.opsForHash().put(key, deviceId, tokenData);
        // 만료 시간 설정
        redisTemplate.expire(key, expirationMillis, TimeUnit.MILLISECONDS);

        log.info("리프레시 토큰 저장 - githubId: {}, deviceId: {}, 만료시간: {}", githubId, deviceId, expirationMillis);
    }

    // Refresh Token 조회
    public TokenDTO getRefreshToken(String githubId, String deviceId) {
        String key = REFRESH_TOKEN_PREFIX + githubId;
        return (TokenDTO) redisTemplate.opsForHash().get(key, deviceId);
    }

    // Refresh Token 검증
    public boolean validateRefreshToken(String githubId, String deviceId, String refreshToken) {
        TokenDTO storedData = getRefreshToken(githubId, deviceId);

        // 토큰 존재 여부 확인
        if (storedData == null) {
            return false;
        }

        // 토큰 문자열 추출
        String storedToken = storedData.getToken();

        // 일치 확인(클라이언트가 보낸 토큰 - 서버에 저장된 토큰)
        return refreshToken.equals(storedToken);
    }

    // Refresh Token 삭제
    public void deleteRefreshToken(String githubId) {
        String key = REFRESH_TOKEN_PREFIX + githubId;
        redisTemplate.delete(key);
    }

    // Refresh Token 교체(새로운 토큰)
    public void rotateRefreshToken(String githubId, String newRefreshToken, String deviceId, long expirationMillis) {
        saveRefreshToken(githubId, newRefreshToken, deviceId, expirationMillis);
    }

    // Access Token을 블랙리스트에 추가
    public void addToBlacklist(String accessToken, long remainingTimeMillis) {
        String key = BLACKLIST_PREFIX + accessToken;

        // 로그아웃 시 만료되지 않은 Access Token 무효화(remainingTimeMillis: redis에 존재할 시간 설정)
        redisTemplate.opsForValue().set(key, "logout", remainingTimeMillis, TimeUnit.MILLISECONDS);
    }

    // Access Token이 블랙리스트에 있는지 확인
    public boolean isBlacklisted(String accessToken) {
        String key = BLACKLIST_PREFIX + accessToken;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    // 로그아웃
    public void logoutSingleDevice(String githubId, String deviceId) {
        String key = REFRESH_TOKEN_PREFIX + githubId;
        redisTemplate.opsForHash().delete(key, deviceId);

        log.info("로그아웃 - githubId: {}, deviceId: {}", githubId, deviceId);

    }

    // 모든 장치 로그아웃
    public void logoutAllDevices(String githubId) {
        String key = REFRESH_TOKEN_PREFIX + githubId;
        redisTemplate.delete(key);

        log.info("모든 장치 로그아웃 - githubId: {}", githubId);
    }
}
