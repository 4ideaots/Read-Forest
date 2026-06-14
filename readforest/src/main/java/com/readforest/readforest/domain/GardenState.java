package com.readforest.readforest.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 사용자별 정원 상태 스냅샷.
 *
 * <p>프론트엔드(2D 픽셀 정원)의 전체 상태 — 도서, 나무(좌표·수종·바이옴),
 * 소품 배치, 사용자 스탯(레벨·골드·스트릭), 퀘스트 등 — 를 JSON 문서 하나로
 * 직렬화하여 보존한다. 관계형 도메인(Tree, Book 등)이 담지 못하는 클라이언트
 * 고유 데이터까지 빠짐없이 DB에 저장하기 위한 용도이며, 사용자당 1개를 갖는다.</p>
 */
@Entity
@Table(name = "garden_states")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GardenState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /** 정원 전체 상태를 담은 JSON 문서 (대용량 대비 LONGTEXT). */
    @Column(columnDefinition = "LONGTEXT")
    private String state;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /** 다른 정원사들이 이 정원에 보낸 응원(물주기) 누적 수. */
    @Column(nullable = false)
    private Long cheerCount;

    @PrePersist
    @PreUpdate
    void touch() {
        this.updatedAt = LocalDateTime.now();
        if (this.cheerCount == null) {
            this.cheerCount = 0L;
        }
    }
}
