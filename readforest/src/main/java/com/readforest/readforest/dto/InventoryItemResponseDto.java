package com.readforest.readforest.dto;

import com.readforest.readforest.domain.InventoryItem;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class InventoryItemResponseDto {
    private Long id;
    private Long itemId;
    private String itemName;
    private String itemType;
    private String imageUrl;
    private String description;
    private LocalDateTime acquiredAt;

    public static InventoryItemResponseDto from(InventoryItem invItem) {
        return InventoryItemResponseDto.builder()
                .id(invItem.getId())
                .itemId(invItem.getItem().getId())
                .itemName(invItem.getItem().getName())
                .itemType(invItem.getItem().getType().name())
                .imageUrl(invItem.getItem().getImageUrl())
                .description(invItem.getItem().getDescription())
                .acquiredAt(invItem.getAcquiredAt())
                .build();
    }
}
