package com.writemd.backend.config.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);
    @Value("${jwt.secret}")
    private String secretKey;
    @Value("${jwt.access-token-validity}")
    private long accessTokenValidity;
    @Value("${jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    // HMAC-SHA256 알고리즘용 서명 키 생성(secretKey를 바이트 배열로 변환해 SecretKey 객체 생성)
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    // 토큰 생성
    public String createAccessToken(String githubId, String name) {
        // 토큰 유효 기간 설정(현재 시간, 만료 시간)
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidity);

        return Jwts.builder()
            // Header는 라이브러리가 만들어줌(추가 가능)
            // Payload 설정(subject(subject 클레임): 토큰 주인 식별, claim(Private  클레임): key/value로 저장해 토큰 검증때 사용)
            .subject(githubId)
            .claim("name", name)
            // 표준 클레임(Registered Claims) 설정(issuedAt: 토큰 발행일, expiration: 만료일)
            .issuedAt(now)
            .expiration(validity)

            // Signature 설정
            .signWith(getSigningKey())

            // JWT 생성/직렬화
            .compact();
    }


    // 리프레시 토큰
    public String createRefreshToken(String githubId) {
        // 토큰 유효 기간 설정
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidity);

        return Jwts.builder()
            // Payload 설정
            // 토큰 주인
            .subject(githubId)
            // 토큰 발행 시간
            .issuedAt(now)
            // 토큰 만료 시간
            .expiration(validity)

            // Signature 설정
            .signWith(getSigningKey())

            // JWT 생성/직렬화
            .compact();
    }

    // 토큰 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                // 검증에 사용할 키 설정
                .verifyWith(getSigningKey())
                .build()
                // 빌드 후 파싱/검증(서명, 만료 시간, JWT 형식 등을 모두 자동 검증)
                .parseSignedClaims(token);
            return true;

        } catch (SecurityException | MalformedJwtException e) {
            // SecurityException: 서명이 유효하지 않음(위변조 등)
            // MalformedJwtException: JWT 토큰 구조 잘못
            log.warn("잘못된 JWT 서명.", e);
        } catch (ExpiredJwtException e) {
            log.warn("만료된 JWT 토큰.", e);
        } catch (UnsupportedJwtException e) {
            log.warn("지원되지 않는 형식의 JWT 토큰.", e);
        } catch (IllegalArgumentException e) {
            log.warn("JWT 클레임 문자열이 비어있거나 null.", e);
        }
        return false;
    }

    // 토큰에서 사용자 GitHub ID 추출(토큰 사용자 찾기)
    public String getGithubId(String token) {
        return Jwts.parser()
            // 서명 검증에 사용할 키 설정
            .verifyWith(getSigningKey())
            .build()
            // 토큰 파싱/검증
            .parseSignedClaims(token)
            // 검증된 토큰에서 Payload 가져옴
            .getPayload()
            // Payload에서 subject 클레임 값(GitHub ID) 반환
            .getSubject();
    }

    // 토큰 남은 유효 시간(ms)
    public long getRemainingTime(String token) {
        Date expiration = Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            // 검증된 토큰에서 Payload 가져옴
            .getPayload()
            // Payload 만료 시간 가져옴
            .getExpiration();

        long now = System.currentTimeMillis();
        long expirationTime = expiration.getTime();
        // 남은 시간
        return expirationTime - now;
    }
}


