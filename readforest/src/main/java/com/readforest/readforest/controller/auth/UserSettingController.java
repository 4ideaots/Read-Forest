package com.readforest.readforest.controller.auth;

import com.readforest.readforest.dto.UserSettingResponseDto;
import com.readforest.readforest.dto.UserSettingUpdateRequestDto;
import com.readforest.readforest.service.UserSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 개인 설정 컨트롤러.
 *
 * <p>푸시 알림, 숲 비공개 여부 등 앱 내 환경 설정을 관리한다.</p>
 */
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class UserSettingController {

    private final UserSettingService userSettingService;

    /**
     * 사용자의 환경 설정(푸시 알림, 숲 비공개 여부 등)을 수정한다.
     *
     * @param userDetails JWT 필터에서 설정된 인증 정보
     * @param request     수정할 설정 정보 DTO
     * @return 수정된 설정 정보
     */
    @PatchMapping("/preferences")
    public ResponseEntity<UserSettingResponseDto> updatePreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserSettingUpdateRequestDto request) {
        return ResponseEntity.ok(userSettingService.updatePreferences(userDetails.getUsername(), request));
    }
}
