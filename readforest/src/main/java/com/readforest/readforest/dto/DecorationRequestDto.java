package com.readforest.readforest.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class DecorationRequestDto {

    @NotNull(message = "배치 목록은 필수 항목입니다.")
    private List<Placement> decorations;

    @Getter
    @Setter
    public static class Placement {
        @NotNull(message = "아이템 ID는 필수 항목입니다.")
        private Long itemId;

        @NotNull(message = "X 좌표는 필수 항목입니다.")
        private Double positionX;

        @NotNull(message = "Y 좌표는 필수 항목입니다.")
        private Double positionY;

        @NotNull(message = "배치 여부는 필수 항목입니다.")
        private Boolean isPlaced;
    }
}
