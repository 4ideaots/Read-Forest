package com.readforest.readforest.service;

import com.readforest.readforest.domain.User;
import com.readforest.readforest.dto.UserSettingResponseDto;
import com.readforest.readforest.dto.UserSettingUpdateRequestDto;
import com.readforest.readforest.exception.CustomException;
import com.readforest.readforest.exception.ErrorCode;
import com.readforest.readforest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 개인 설정 서비스.
 *
 * <p>푸시 알림, 숲 비공개 여부 등 앱 내 환경 설정 변경을 담당한다.</p>
 */
@Service
@RequiredArgsConstructor
public class UserSettingService {

    private final UserRepository userRepository;

    /**
     * 사용자의 환경 설정을 수정한다.
     *
     * <p>요청 DTO에서 null이 아닌 필드만 업데이트한다. (부분 업데이트)</p>
     *
     * @param username 수정할 사용자의 아이디 (JWT에서 추출된 값)
     * @param request  수정할 설정 정보 DTO
     * @return 수정된 설정 정보
     */
    @Transactional
    public UserSettingResponseDto updatePreferences(String username, UserSettingUpdateRequestDto request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (request.getPushNotificationEnabled() != null) {
            user.setPushNotificationEnabled(request.getPushNotificationEnabled());
        }
        if (request.getForestPrivate() != null) {
            user.setForestPrivate(request.getForestPrivate());
        }

        return new UserSettingResponseDto(user);
    }
}
