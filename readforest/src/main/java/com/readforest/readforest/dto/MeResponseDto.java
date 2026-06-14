package com.readforest.readforest.dto;

import com.readforest.readforest.domain.User;
import lombok.Builder;
import lombok.Getter;

/**
 * 현재 로그인한 사용자의 기본 식별 정보 응답 DTO.
 *
 * <p>프론트엔드가 로그인 직후 자신의 닉네임·ID를 표시하거나, 사용자 단위
 * API 호출(예: 헤더 기반 식별)에 활용하기 위한 최소 정보를 담는다.</p>
 */
@Getter
@Builder
public class MeResponseDto {

    private Long id;
    private String username;
    private String nickname;

    public static MeResponseDto from(User user) {
        return MeResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .build();
    }
}
