package com.readforest.readforest.controller.social;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

/**
 * 팔로우 컨트롤러.
 *
 * <p>유저 간의 팔로우/언팔로우 관계 맺기를 담당한다.</p>
 */
@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowController {

    /**
     * 대상 유저를 팔로우한다.
     *
     * @param targetUserId 팔로우할 대상 유저 ID
     * @return 팔로우 처리 결과
     */
    @PostMapping("/{targetUserId}")
    public ResponseEntity<?> follow(@PathVariable Long targetUserId) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok().build();
    }

    /**
     * 대상 유저를 언팔로우한다.
     *
     * @param targetUserId 언팔로우할 대상 유저 ID
     * @return 언팔로우 처리 결과
     */
    @DeleteMapping("/{targetUserId}")
    public ResponseEntity<?> unfollow(@PathVariable Long targetUserId) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.noContent().build();
    }

    /**
     * 나를 팔로우하는 유저(팔로워) 목록을 조회한다.
     *
     * @return 팔로워 목록
     */
    @GetMapping("/followers")
    public ResponseEntity<?> getFollowers() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Collections.emptyList());
    }

    /**
     * 내가 팔로우하는 유저(팔로잉) 목록을 조회한다.
     *
     * @return 팔로잉 목록
     */
    @GetMapping("/following")
    public ResponseEntity<?> getFollowing() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Collections.emptyList());
    }
}
