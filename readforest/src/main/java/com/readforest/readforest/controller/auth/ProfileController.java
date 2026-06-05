package com.readforest.readforest.controller.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 프로필 전시 컨트롤러.
 *
 * <p>타인에게 보여지는 닉네임, 칭호, 한 줄 소개만 관리한다.</p>
 */
@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    /**
     * 특정 사용자의 공개 프로필을 조회한다.
     *
     * @param userId 조회할 사용자의 ID
     * @return 사용자 프로필 정보
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Long userId) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("message", "프로필 조회 성공", "userId", userId));
    }

    /**
     * 현재 로그인된 사용자의 프로필을 수정한다.
     *
     * @return 프로필 수정 결과
     */
    @PatchMapping("/me")
    public ResponseEntity<?> updateMyProfile() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("message", "프로필 수정 성공"));
    }
}
