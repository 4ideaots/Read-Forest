package com.readforest.readforest.dto;

import com.readforest.readforest.domain.User;
import lombok.Getter;

/**
 * 개인 설정 응답 DTO.
 *
 * <p>수정 완료 후 현재 설정 상태를 반환한다.</p>
 */
@Getter
public class UserSettingResponseDto {

    /** 푸시 알림 수신 여부 */
    private final Boolean pushNotificationEnabled;

    /** 숲 비공개 여부 */
    private final Boolean forestPrivate;

    /**
     * User 엔티티로부터 설정 응답 DTO를 생성한다.
     *
     * @param user 설정이 업데이트된 User 엔티티
     */
    public UserSettingResponseDto(User user) {
        this.pushNotificationEnabled = user.getPushNotificationEnabled();
        this.forestPrivate = user.getForestPrivate();
    }
}
