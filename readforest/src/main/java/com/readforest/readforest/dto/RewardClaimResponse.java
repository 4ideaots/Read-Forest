package com.readforest.readforest.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RewardClaimResponse {
    private Long questId;   // 어떤 퀘스트의 보상인지
    private String message; // "보상 수령에 성공했습니다!" 같은 메시지
}