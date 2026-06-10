package com.readforest.readforest.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

/**
 * 로그인 요청 DTO.
 *
 * <p>사용자 아이디와 비밀번호를 전달받는다.</p>
 */
@Getter
public class LoginRequestDto {

    /** 사용자 아이디 */
    @NotBlank
    private String username;

    /** 사용자 비밀번호 */
    @NotBlank
    private String password;
}
