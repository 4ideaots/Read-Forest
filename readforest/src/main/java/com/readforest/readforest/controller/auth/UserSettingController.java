package com.readforest.readforest.controller.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 개인 설정 컨트롤러.
 *
 * <p>푸시 알림, 숲 비공개 여부 등 앱 내 환경 설정을 관리한다.</p>
 */
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class UserSettingController {

    /**
     * 사용자의 환경 설정(푸시 알림, 숲 비공개 여부 등)을 수정한다.
     *
     * @return 환경 설정 수정 결과
     */
    @PatchMapping("/preferences")
    public ResponseEntity<?> updatePreferences() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("message", "환경 설정 수정 성공"));
    }
}
