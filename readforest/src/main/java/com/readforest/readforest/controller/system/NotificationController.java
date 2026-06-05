package com.readforest.readforest.controller.system;

import com.readforest.readforest.entity.NotificationEntity;
import com.readforest.readforest.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    private final NotificationRepository notificationRepository;

    /**
     * 알림 목록을 조회합니다.
     *
     * <p>현재 사용자의 전체 알림 목록을 최근 생성 순으로 반환합니다.</p>
     *
     * @return 알림 목록을 포함한 응답
     */
    @GetMapping
    public ResponseEntity<?> getNotifications() {
        return ResponseEntity.ok(notificationRepository.findAllByOrderByCreatedAtDesc());
    }

    /**
     * 알림을 직접 생성합니다. (테스트용 및 알림 발송용 API)
     *
     * @param body 알림 메시지를 포함한 맵
     * @return 생성된 알림 정보
     */
    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "메시지 내용이 비어있습니다."));
        }
        NotificationEntity notification = new NotificationEntity(message);
        return ResponseEntity.ok(notificationRepository.save(notification));
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
        return notificationRepository.findById(notificationId)
            .map(notification -> {
                notification.setRead(true);
                notificationRepository.save(notification);
                return ResponseEntity.ok(Map.of(
                    "message", "알림이 읽음 처리되었습니다.",
                    "notificationId", notificationId
                ));
            })
            .orElse(ResponseEntity.notFound().build());
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
        return notificationRepository.findById(notificationId)
            .map(notification -> {
                notificationRepository.delete(notification);
                return ResponseEntity.ok(Map.of(
                    "message", "알림이 삭제되었습니다.",
                    "notificationId", notificationId
                ));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
