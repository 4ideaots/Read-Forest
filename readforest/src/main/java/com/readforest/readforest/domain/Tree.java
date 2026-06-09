package com.readforest.readforest.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "trees",
    indexes = {
        @Index(name = "idx_tree_last_updated_at", columnList = "last_updated_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tree {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private Integer currentPage;

    @Column(nullable = false)
    private Double growthRate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Vitality vitality;

    @Column(nullable = false)
    private Boolean isCompleted;

    @Column(name = "last_updated_at", nullable = false)
    private LocalDateTime lastUpdatedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum Vitality {
        HEALTHY,
        WITHERED,
        DEAD
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.lastUpdatedAt = LocalDateTime.now();
        if (this.currentPage == null) this.currentPage = 0;
        if (this.growthRate == null) this.growthRate = 0.0;
        if (this.vitality == null) this.vitality = Vitality.HEALTHY;
        if (this.isCompleted == null) this.isCompleted = false;
    }
}
