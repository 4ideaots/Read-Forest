package com.readforest.readforest.controller.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 인증/토큰 컨트롤러.
 *
 * <p>로그인과 JWT 토큰 발급/갱신만 담당한다.</p>
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    /**
     * 사용자 로그인을 처리한다.
     *
     * @return 로그인 결과 및 JWT 토큰
     */
    @PostMapping("/login")
    public ResponseEntity<?> login() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("message", "로그인 성공"));
    }

    /**
     * JWT 리프레시 토큰을 이용하여 새로운 액세스 토큰을 발급한다.
     *
     * @return 갱신된 액세스 토큰
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("message", "토큰 갱신 성공"));
    }
}
