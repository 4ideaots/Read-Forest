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
    private QuestEntity.QuestType questType; // 퀘스트 타입 (DAILY, WEEKLY 등)
    private int targetValue;       // 목표 수치
    private int progress;          // 현재 진행도
    private UserQuestEntity.QuestStatus status; // 현재 상태 (진행중, 완료 등)
}