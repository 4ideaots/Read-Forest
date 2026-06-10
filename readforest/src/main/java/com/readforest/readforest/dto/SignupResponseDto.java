package com.readforest.readforest.dto;

import com.readforest.readforest.domain.User;
import lombok.Getter;

/**
 * 회원가입 응답 DTO.
 *
 * <p>가입 완료된 사용자의 기본 정보를 반환한다.
 * 비밀번호 등 민감 정보는 포함하지 않는다.</p>
 */
@Getter
public class SignupResponseDto {

    /** 생성된 사용자 ID */
    private final Long id;

    /** 사용자 아이디 */
    private final String username;

    /** 앱 내 표시 닉네임 */
    private final String nickname;

    /**
     * User 엔티티로부터 응답 DTO를 생성한다.
     *
     * @param user 저장 완료된 User 엔티티
     */
    public SignupResponseDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.nickname = user.getNickname();
    }
}
