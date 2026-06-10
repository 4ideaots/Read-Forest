package com.readforest.readforest.service;

import com.readforest.readforest.domain.User;
import com.readforest.readforest.dto.ProfileResponseDto;
import com.readforest.readforest.dto.ProfileUpdateRequestDto;
import com.readforest.readforest.exception.CustomException;
import com.readforest.readforest.exception.ErrorCode;
import com.readforest.readforest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 프로필 서비스.
 *
 * <p>타인에게 보여지는 닉네임, 칭호, 한 줄 소개 조회 및 수정을 담당한다.</p>
 */
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    /**
     * 특정 사용자의 공개 프로필을 조회한다.
     *
     * @param userId 조회할 사용자 ID
     * @return 닉네임, 칭호, 한 줄 소개, 프로필 이미지 URL
     */
    @Transactional(readOnly = true)
    public ProfileResponseDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return new ProfileResponseDto(user);
    }

    /**
     * 현재 로그인된 사용자의 프로필을 수정한다.
     *
     * <p>요청 DTO에서 null이 아닌 필드만 업데이트한다. (부분 업데이트)</p>
     *
     * @param username 수정할 사용자의 아이디 (JWT에서 추출된 값)
     * @param request  수정할 프로필 정보 DTO
     * @return 수정된 프로필 정보
     */
    @Transactional
    public ProfileResponseDto updateProfile(String username, ProfileUpdateRequestDto request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getTitle() != null) {
            user.setTitle(request.getTitle());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        return new ProfileResponseDto(user);
    }
}
