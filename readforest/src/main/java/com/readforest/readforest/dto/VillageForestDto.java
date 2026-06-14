package com.readforest.readforest.dto;

import com.readforest.readforest.domain.GardenState;
import lombok.Builder;
import lombok.Getter;

/**
 * 마을(다른 사용자) 정원 요약 DTO.
 *
 * <p>각 가입 사용자의 공개 식별 정보와 정원 상태(JSON)를 함께 반환한다.
 * 프론트엔드는 {@code state}를 파싱하여 나무 배치·레벨·그루 수를 복원해
 * 캔버스에 다른 사람의 숲을 그려 준다.</p>
 */
@Getter
@Builder
public class VillageForestDto {

    private Long userId;
    private String nickname;
    private String title;
    private Long cheerCount;
    private String state;

    public static VillageForestDto from(GardenState gardenState) {
        return VillageForestDto.builder()
                .userId(gardenState.getUser().getId())
                .nickname(gardenState.getUser().getNickname())
                .title(gardenState.getUser().getTitle())
                .cheerCount(gardenState.getCheerCount())
                .state(gardenState.getState())
                .build();
    }
}
