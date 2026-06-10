package com.readforest.readforest.controller.auth;

import com.readforest.readforest.dto.ProfileResponseDto;
import com.readforest.readforest.dto.ProfileUpdateRequestDto;
import com.readforest.readforest.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 프로필 전시 컨트롤러.
 *
 * <p>타인에게 보여지는 닉네임, 칭호, 한 줄 소개만 관리한다.</p>
 */
@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * 특정 사용자의 공개 프로필을 조회한다.
     *
     * @param userId 조회할 사용자의 ID
     * @return 닉네임, 칭호, 한 줄 소개, 프로필 이미지 URL
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponseDto> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    /**
     * 현재 로그인된 사용자의 프로필을 수정한다.
     *
     * @param userDetails JWT 필터에서 설정된 인증 정보
     * @param request     수정할 프로필 정보 DTO
     * @return 수정된 프로필 정보
     */
    @PatchMapping("/me")
    public ResponseEntity<ProfileResponseDto> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid ProfileUpdateRequestDto request) {
        return ResponseEntity.ok(profileService.updateProfile(userDetails.getUsername(), request));
    }
}
