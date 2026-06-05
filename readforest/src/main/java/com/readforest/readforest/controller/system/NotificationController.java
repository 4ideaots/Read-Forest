package com.readforest.readforest.controller.system;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

/**
 * 알림 전송 컨트롤러.
 *
 * <p>앱 내 알림 목록 조회, 읽음 처리, 삭제 등
 * 알림 관련 기능을 담당하는 엔드포인트를 제공합니다.</p>
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    /**
     * 알림 목록을 조회합니다.
     *
     * <p>현재 사용자의 전체 알림 목록을 반환합니다.</p>
     *
     * @return 알림 목록을 포함한 응답
     */
    @GetMapping
    public ResponseEntity<?> getNotifications() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Collections.emptyList());
    }

    /**
     * 알림을 읽음 처리합니다.
     *
     * <p>지정된 알림 ID에 해당하는 알림을 읽음 상태로 변경합니다.</p>
     *
     * @param notificationId 읽음 처리할 알림의 ID
     * @return 읽음 처리 결과를 포함한 응답
     */
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("message", "알림이 읽음 처리되었습니다."));
    }

    /**
     * 알림을 삭제합니다.
     *
     * <p>지정된 알림 ID에 해당하는 알림을 삭제합니다.</p>
     *
     * @param notificationId 삭제할 알림의 ID
     * @return 삭제 결과를 포함한 응답
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("message", "알림이 삭제되었습니다."));
    }
}
