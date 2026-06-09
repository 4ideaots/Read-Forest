package com.readforest.readforest.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CheerResponse {
    private Long treeId;        // 나무 ID
    private long totalCheers;   // 총 응원 횟수
    private boolean cheeredByMe; // 내가 응원을 보냈는지 여부
}