package com.readforest.readforest.dto;

import com.readforest.readforest.entity.QuestEntity;
import com.readforest.readforest.entity.UserQuestEntity;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuestResponse {
    private Long questId;          // 퀘스트 ID
    private String title;          // 퀘스트 제목
    private String description;    // 상세 설명
    private QuestEntity.QuestType questType; // 퀘스트 타입 (DAILY, WEEKLY 등)
    private String targetType;     // 진행도 판정 기준 (pages_today 등)
    private int targetValue;       // 목표 수치
    private int progress;          // 현재 진행도
    private int rewardPoints;      // 보상 포인트
    private String rewardDecorationType; // 보상 소품 (없으면 null)
    private UserQuestEntity.QuestStatus status; // 현재 상태 (진행중, 완료 등)
}