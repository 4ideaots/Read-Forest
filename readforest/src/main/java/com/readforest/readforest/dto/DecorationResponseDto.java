package com.readforest.readforest.dto;

import com.readforest.readforest.domain.ForestDecoration;
import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class DecorationResponseDto {

    private List<Detail> decorations;

    @Getter
    @Builder
    public static class Detail {
        private Long id;
        private Long itemId;
        private String itemName;
        private String itemType;
        private String imageUrl;
        private Double positionX;
        private Double positionY;
        private Boolean isPlaced;

        public static Detail from(ForestDecoration decoration) {
            return Detail.builder()
                    .id(decoration.getId())
                    .itemId(decoration.getItem().getId())
                    .itemName(decoration.getItem().getName())
                    .itemType(decoration.getItem().getType().name())
                    .imageUrl(decoration.getItem().getImageUrl())
                    .positionX(decoration.getPositionX())
                    .positionY(decoration.getPositionY())
                    .isPlaced(decoration.getIsPlaced())
                    .build();
        }
    }
}
