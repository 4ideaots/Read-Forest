package com.readforest.readforest.dto;

import lombok.Getter;

/**
 * 개인 설정 수정 요청 DTO.
 *
 * <p>null인 필드는 수정하지 않는다. (부분 업데이트)</p>
 */
@Getter
public class UserSettingUpdateRequestDto {

    /** 푸시 알림 수신 여부, null이면 유지 */
    private Boolean pushNotificationEnabled;

    /** 숲 비공개 여부, null이면 유지 */
    private Boolean forestPrivate;
}
