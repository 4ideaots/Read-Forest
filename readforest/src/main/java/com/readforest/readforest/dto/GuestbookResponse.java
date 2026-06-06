package com.readforest.readforest.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GuestbookResponse {
    private Long id;
    private Long writerId;
    private String content;
    private LocalDateTime createdAt;
}