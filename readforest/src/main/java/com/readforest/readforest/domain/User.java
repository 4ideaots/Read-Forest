package com.readforest.readforest.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 사용자 엔티티.
 *
 * <p>일반 로그인(LOCAL)과 소셜 로그인(KAKAO, GITHUB) 사용자를 모두 관리한다.
 * provider 필드로 로그인 유형을 구분하며,
 * 소셜 로그인 사용자는 providerId로 고유 식별한다.</p>
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 로그인 아이디 (소셜 로그인은 "{provider}_{providerId}" 형태로 자동 생성) */
    @Column(nullable = false, unique = true)
    private String username;

    /** BCrypt 암호화된 비밀번호 (소셜 로그인 사용자는 랜덤 UUID 암호화값 저장) */
    @Column(nullable = false)
    private String password;

    /** 앱 내 표시 닉네임 */
    @Column(nullable = false)
    private String nickname;

    /** 프로필 이미지 URL (S3 URL 또는 소셜 제공자 이미지 URL) */
    private String profileImageUrl;

    /** 프로필에 표시되는 칭호 */
    private String title;

    /** 프로필 한 줄 소개 */
    private String bio;

    /** 푸시 알림 수신 여부 (기본값: true) */
    private Boolean pushNotificationEnabled;

    /** 숲 비공개 여부 (기본값: false) */
    private Boolean forestPrivate;

    /** 로그인 제공자 (LOCAL, KAKAO, GITHUB) — 기본값: LOCAL */
    private String provider;

    /** 소셜 제공자의 사용자 고유 ID (일반 로그인은 null) */
    private String providerId;

    /** 권한 (기본값: ROLE_USER) */
    private String role;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * 최초 저장 시 기본값을 설정한다.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.role == null) {
            this.role = "ROLE_USER";
        }
        if (this.provider == null) {
            this.provider = "LOCAL";
        }
        if (this.pushNotificationEnabled == null) {
            this.pushNotificationEnabled = true;
        }
        if (this.forestPrivate == null) {
            this.forestPrivate = false;
        }
    }
}
