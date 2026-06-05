package com.readforest.readforest.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    private boolean isRead;

    private LocalDateTime createdAt;

    public NotificationEntity(String message) {
        this.message = message;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }
}
