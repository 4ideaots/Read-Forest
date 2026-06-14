package com.readforest.readforest.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;       // 예: "연속 3일 10페이지 읽기"

    @Column(columnDefinition = "TEXT")
    private String description; // 상세 설명

    @Enumerated(EnumType.STRING)
    private QuestType questType; // DAILY, WEEKLY, CHALLENGE

    private int targetValue;     // 달성 목표 수치 (예: 10)

    /** 진행도 판정 기준 (pages_today / log_progress / streak / complete_book). */
    private String targetType;

    /** 보상 포인트(골드). */
    private int rewardPoints;

    /** 보상 소품 타입 (없으면 null). */
    private String rewardDecorationType;

    public enum QuestType {
        DAILY, WEEKLY, CHALLENGE
    }
}