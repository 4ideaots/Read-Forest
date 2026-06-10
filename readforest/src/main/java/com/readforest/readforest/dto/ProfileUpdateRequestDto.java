package com.readforest.readforest.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;

/**
 * 프로필 수정 요청 DTO.
 *
 * <p>null인 필드는 수정하지 않는다. (부분 업데이트)</p>
 */
@Getter
public class ProfileUpdateRequestDto {

    /** 변경할 닉네임 (2~10자), null이면 유지 */
    @Size(min = 2, max = 10)
    private String nickname;

    /** 변경할 칭호, null이면 유지 */
    @Size(max = 20)
    private String title;

    /** 변경할 한 줄 소개, null이면 유지 */
    @Size(max = 100)
    private String bio;
}
