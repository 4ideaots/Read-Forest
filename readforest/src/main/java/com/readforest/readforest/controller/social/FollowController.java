package com.readforest.readforest.controller.social;

import lombok.RequiredArgsConstructor;
import com.readforest.readforest.security.CurrentUser;
import com.readforest.readforest.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 팔로우 컨트롤러.
 *
 * <p>유저 간의 팔로우/언팔로우 관계 맺기를 담당한다.
 * 행위 주체는 항상 JWT 인증 사용자({@link CurrentUser})에서 가져온다.</p>
 */
@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowController {
    private final FollowService followService;
    private final CurrentUser currentUser;

    /**
     * 대상 유저를 팔로우한다.
     *
     * @param targetUserId 팔로우할 대상 유저 ID
     * @return 팔로우 처리 결과
     */
    @PostMapping("/{targetUserId}")
    public ResponseEntity<?> follow(@PathVariable Long targetUserId) {
        followService.follow(currentUser.id(), targetUserId);
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
        followService.unfollow(currentUser.id(), targetUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 나를 팔로우하는 유저(팔로워) 목록을 조회한다.
     *
     * @return 팔로워 목록
     */
    @GetMapping("/followers")
    public ResponseEntity<?> getFollowers() {
        return ResponseEntity.ok(followService.getFollowers(currentUser.id()));
    }

    /**
     * 내가 팔로우하는 유저(팔로잉) 목록을 조회한다.
     *
     * @return 팔로잉 목록
     */
    @GetMapping("/following")
    public ResponseEntity<?> getFollowing() {
        return ResponseEntity.ok(followService.getFollowing(currentUser.id()));
    }
}
