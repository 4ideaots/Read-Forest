package com.readforest.readforest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 로그인 응답 DTO.
 *
 * <p>로그인 성공 시 발급되는 액세스 토큰과 리프레시 토큰을 반환한다.
 * 토큰 갱신(/api/auth/refresh) 응답에도 동일하게 사용된다.</p>
 */
@Getter
@AllArgsConstructor
public class LoginResponseDto {

    /** 짧은 유효기간의 인증 토큰 (API 호출 시 Authorization 헤더에 사용) */
    private String accessToken;

    /** 긴 유효기간의 갱신 토큰 (액세스 토큰 만료 시 재발급 요청에 사용) */
    private String refreshToken;
}
