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
public class GuestbookEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long forestOwnerId; // 방명록을 받는 숲 주인 ID

    @Column(nullable = false)
    private Long writerId;      // 글을 작성한 사람 ID

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;     // 방명록 내용 

    @CreationTimestamp
    private LocalDateTime createdAt; // 작성 시간
}