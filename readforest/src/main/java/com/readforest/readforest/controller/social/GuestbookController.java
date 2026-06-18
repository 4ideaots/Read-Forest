package com.readforest.readforest.controller.social;

import lombok.RequiredArgsConstructor;
import com.readforest.readforest.dto.GuestbookRequest;
import com.readforest.readforest.security.CurrentUser;
import com.readforest.readforest.service.GuestbookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 방명록 컨트롤러.
 *
 * <p>
 * 숲에 남기는 텍스트 메시지(방명록)의 작성, 조회, 삭제를 담당한다.
 * </p>
 */
@RestController
@RequiredArgsConstructor
public class GuestbookController {
    private final GuestbookService guestbookService;
    private final CurrentUser currentUser;

    /**
     * 특정 유저의 숲에 방명록을 작성한다.
     *
     * @param userId 방명록을 남길 대상 유저(숲 주인) ID
     * @return 작성된 방명록 정보
     */
    @PostMapping("/api/forests/{userId}/guestbook")
    public ResponseEntity<?> writeGuestbook(
            @PathVariable Long userId,
            @RequestBody GuestbookRequest request) {
        guestbookService.writeGuestbook(userId, currentUser.id(), request);
        return ResponseEntity.ok().build();
    }

    /**
     * 특정 유저의 숲에 작성된 방명록 목록을 조회한다.
     *
     * @param userId 방명록을 조회할 대상 유저(숲 주인) ID
     * @return 방명록 목록
     */
    @GetMapping("/api/forests/{userId}/guestbook")
    public ResponseEntity<?> getGuestbook(@PathVariable Long userId) {
        return ResponseEntity.ok(guestbookService.getGuestbookList(userId));
    }

    /**
     * 방명록을 삭제한다.
     *
     * @param guestbookId 삭제할 방명록 ID
     * @return 삭제 처리 결과
     */
    @DeleteMapping("/api/guestbook/{guestbookId}")
    public ResponseEntity<?> deleteGuestbook(@PathVariable Long guestbookId) {
        guestbookService.deleteGuestbook(guestbookId, currentUser.id());
        return ResponseEntity.noContent().build();
    }

}
