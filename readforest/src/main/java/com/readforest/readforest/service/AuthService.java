package com.readforest.readforest.service;

import com.readforest.readforest.domain.User;
import com.readforest.readforest.dto.LoginRequestDto;
import com.readforest.readforest.dto.LoginResponseDto;
import com.readforest.readforest.dto.TokenRefreshRequestDto;
import com.readforest.readforest.exception.CustomException;
import com.readforest.readforest.exception.ErrorCode;
import com.readforest.readforest.repository.UserRepository;
import com.readforest.readforest.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 인증 서비스.
 *
 * <p>로그인 처리 및 JWT 토큰 발급/갱신을 담당한다.</p>
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    /**
     * 로그인 처리 후 JWT 토큰 쌍을 발급한다.
     *
     * <p>존재하지 않는 username이거나 비밀번호가 틀리면 동일한 에러를 반환한다.
     * (사용자 존재 여부를 노출하지 않기 위함)</p>
     *
     * @param request 로그인 요청 DTO (username, password)
     * @return 액세스 토큰과 리프레시 토큰
     */
    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        String accessToken = jwtProvider.generateAccessToken(user.getUsername(), user.getRole());
        String refreshToken = jwtProvider.generateRefreshToken(user.getUsername());

        return new LoginResponseDto(accessToken, refreshToken);
    }

    /**
     * 리프레시 토큰을 검증하고 새로운 토큰 쌍을 발급한다.
     *
     * @param request 토큰 갱신 요청 DTO (refreshToken)
     * @return 새로운 액세스 토큰과 리프레시 토큰
     */
    public LoginResponseDto refresh(TokenRefreshRequestDto request) {
        if (!jwtProvider.validateToken(request.getRefreshToken())) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        String username = jwtProvider.extractUsername(request.getRefreshToken());
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        String newAccessToken = jwtProvider.generateAccessToken(user.getUsername(), user.getRole());
        String newRefreshToken = jwtProvider.generateRefreshToken(user.getUsername());

        return new LoginResponseDto(newAccessToken, newRefreshToken);
    }
}
