package com.readforest.readforest.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 정원 상태 저장 요청 DTO.
 *
 * <p>프론트엔드가 직렬화한 정원 전체 상태 JSON 문자열을 담는다.</p>
 */
@Getter
@Setter
public class GardenStateRequestDto {
    private String state;
}
