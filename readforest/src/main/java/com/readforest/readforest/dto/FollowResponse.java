package com.example.demo.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FollowResponse {
    private Long userId;      // 유저 ID
    private String nickname;  // 닉네임 
    private LocalDateTime followedAt; // 팔로우 한 시간
}