package com.readforest.readforest.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT 토큰 생성 및 검증 컴포넌트.
 *
 * <p>액세스 토큰과 리프레시 토큰을 생성하고,
 * 토큰의 유효성 검사 및 클레임 추출을 담당한다.</p>
 */
@Component
public class JwtProvider {

    private final SecretKey secretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${jwt.refresh-token-expiration}") long refreshTokenExpiration) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    /**
     * 액세스 토큰을 생성한다.
     *
     * @param username 사용자 아이디
     * @param role     사용자 권한 (예: ROLE_USER)
     * @return 서명된 JWT 액세스 토큰
     */
    public String generateAccessToken(String username, String role) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(secretKey)
                .compact();
    }

    /**
     * 리프레시 토큰을 생성한다.
     *
     * @param username 사용자 아이디
     * @return 서명된 JWT 리프레시 토큰
     */
    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(secretKey)
                .compact();
    }

    /**
     * 토큰에서 사용자 아이디(subject)를 추출한다.
     *
     * @param token JWT 토큰 문자열
     * @return 토큰에 담긴 username
     */
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * 토큰의 유효성을 검사한다.
     *
     * <p>서명이 올바르고 만료되지 않은 경우 true를 반환한다.</p>
     *
     * @param token JWT 토큰 문자열
     * @return 유효하면 true, 아니면 false
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * 토큰을 파싱하여 클레임을 반환한다.
     *
     * @param token JWT 토큰 문자열
     * @return 토큰의 Claims 객체
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
