package com.readforest.readforest.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserQuestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId; // 유저 ID

    @Column(nullable = false)
    private Long questId; // 퀘스트 ID (FK 역할을 함)

    private int progress;  // 현재 진행도 (예: 몇 페이지 읽었는지)

    @Enumerated(EnumType.STRING)
    private QuestStatus status; // IN_PROGRESS, COMPLETED, REWARD_CLAIMED

    @CreationTimestamp
    private LocalDateTime assignedAt; // 퀘스트 부여 시간

    @UpdateTimestamp
    private LocalDateTime updatedAt; // 진행도 업데이트 시간

    private LocalDateTime completedAt; // 완료 시점



    public enum QuestStatus {
        IN_PROGRESS, COMPLETED, REWARD_CLAIMED
    }
}