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
public class FollowEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long followerId; // 나 (팔로우 하는 사람)

    @Column(nullable = false)
    private Long followingId; // 상대방 (팔로우 받는 사람)

    @CreationTimestamp
    private LocalDateTime createdAt; // 생성 시간 자동 저장
}