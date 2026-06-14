package com.readforest.readforest.dto;

import com.readforest.readforest.domain.GardenState;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 정원 상태 응답 DTO.
 *
 * <p>저장된 정원 상태 JSON과 최종 갱신 시각을 반환한다. 아직 저장된 상태가
 * 없으면 {@code state}는 null이다.</p>
 */
@Getter
@Builder
public class GardenStateResponseDto {

    private String state;
    private LocalDateTime updatedAt;

    public static GardenStateResponseDto from(GardenState gardenState) {
        return GardenStateResponseDto.builder()
                .state(gardenState.getState())
                .updatedAt(gardenState.getUpdatedAt())
                .build();
    }

    public static GardenStateResponseDto empty() {
        return GardenStateResponseDto.builder().state(null).updatedAt(null).build();
    }
}
