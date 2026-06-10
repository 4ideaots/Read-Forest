package com.readforest.readforest.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

/**
 * 토큰 갱신 요청 DTO.
 *
 * <p>액세스 토큰 만료 시 리프레시 토큰을 전달하여 새로운 토큰 쌍을 발급받는다.</p>
 */
@Getter
public class TokenRefreshRequestDto {

    /** 재발급에 사용할 리프레시 토큰 */
    @NotBlank
    private String refreshToken;
}
