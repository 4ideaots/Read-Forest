package com.readforest.readforest.entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
    name = "cheers",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"treeId", "userId"}) // 한 유저가 한 나무에 한 번만 응원 가능
    }
)
public class CheerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long treeId; // 응원받는 나무 ID

    @Column(nullable = false)
    private Long userId; // 응원한 유저 ID

    @CreationTimestamp
    private LocalDateTime createdAt; // 응원 시간
}