package com.readforest.readforest.dto;

import com.readforest.readforest.domain.Tree;
import lombok.Builder;
import lombok.Getter;
import java.time.Duration;
import java.time.LocalDateTime;

@Getter
@Builder
public class TreeVitalityResponseDto {
    private Long treeId;
    private String vitality;
    private LocalDateTime lastUpdatedAt;
    private Long daysSinceLastUpdate;

    public static TreeVitalityResponseDto from(Tree tree) {
        long days = Duration.between(tree.getLastUpdatedAt(), LocalDateTime.now()).toDays();
        return TreeVitalityResponseDto.builder()
                .treeId(tree.getId())
                .vitality(tree.getVitality().name())
                .lastUpdatedAt(tree.getLastUpdatedAt())
                .daysSinceLastUpdate(Math.max(0, days))
                .build();
    }
}
