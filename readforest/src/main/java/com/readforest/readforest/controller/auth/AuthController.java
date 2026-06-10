package com.readforest.readforest.controller.auth;

import com.readforest.readforest.dto.LoginRequestDto;
import com.readforest.readforest.dto.LoginResponseDto;
import com.readforest.readforest.dto.TokenRefreshRequestDto;
import com.readforest.readforest.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 인증/토큰 컨트롤러.
 *
 * <p>로그인과 JWT 토큰 발급/갱신만 담당한다.</p>
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 사용자 로그인을 처리한다.
     *
     * @param request 로그인 요청 DTO (username, password)
     * @return 액세스 토큰과 리프레시 토큰
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody @Valid LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * 리프레시 토큰으로 새로운 토큰 쌍을 발급한다.
     *
     * @param request 토큰 갱신 요청 DTO (refreshToken)
     * @return 새로운 액세스 토큰과 리프레시 토큰
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refreshToken(@RequestBody @Valid TokenRefreshRequestDto request) {
        return ResponseEntity.ok(authService.refresh(request));
    }
}
