package com.readforest.readforest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

/**
 * 회원가입 요청 DTO.
 *
 * <p>아이디, 비밀번호, 닉네임을 전달받는다.
 * 각 필드는 @Size 제약으로 길이를 검증한다.</p>
 */
@Getter
public class SignupRequestDto {

    /** 로그인에 사용할 아이디 (4~20자) */
    @NotBlank
    @Size(min = 4, max = 20)
    private String username;

    /** 비밀번호 (8~30자, 서비스 계층에서 BCrypt 암호화 후 저장) */
    @NotBlank
    @Size(min = 8, max = 30)
    private String password;

    /** 앱 내에서 표시될 닉네임 (2~10자) */
    @NotBlank
    @Size(min = 2, max = 10)
    private String nickname;
}
