package com.readforest.readforest.dto;

import com.readforest.readforest.domain.User;
import lombok.Getter;

/**
 * 사용자 프로필 응답 DTO.
 *
 * <p>타인에게 공개되는 프로필 정보만 담는다.
 * 비밀번호, 설정 등 민감하거나 비공개 정보는 포함하지 않는다.</p>
 */
@Getter
public class ProfileResponseDto {

    /** 사용자 ID */
    private final Long userId;

    /** 닉네임 */
    private final String nickname;

    /** 칭호 */
    private final String title;

    /** 한 줄 소개 */
    private final String bio;

    /** 프로필 이미지 URL */
    private final String profileImageUrl;

    /**
     * User 엔티티로부터 프로필 응답 DTO를 생성한다.
     *
     * @param user 조회된 User 엔티티
     */
    public ProfileResponseDto(User user) {
        this.userId = user.getId();
        this.nickname = user.getNickname();
        this.title = user.getTitle();
        this.bio = user.getBio();
        this.profileImageUrl = user.getProfileImageUrl();
    }
}
