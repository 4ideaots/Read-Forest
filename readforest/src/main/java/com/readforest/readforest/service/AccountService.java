package com.readforest.readforest.service;

import com.readforest.readforest.domain.User;
import com.readforest.readforest.dto.SignupRequestDto;
import com.readforest.readforest.dto.SignupResponseDto;
import com.readforest.readforest.exception.CustomException;
import com.readforest.readforest.exception.ErrorCode;
import com.readforest.readforest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 계정 생명주기 서비스.
 *
 * <p>회원가입과 계정 탈퇴 등 계정 자체의 상태 변화를 처리한다.</p>
 */
@Service
@RequiredArgsConstructor
public class AccountService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 새로운 사용자를 등록한다.
     *
     * <p>중복 아이디 검사 후, 비밀번호를 BCrypt로 암호화하여 저장한다.</p>
     *
     * @param request 회원가입 요청 DTO (username, password, nickname)
     * @return 생성된 사용자 정보 (id, username, nickname)
     */
    @Transactional
    public SignupResponseDto signup(SignupRequestDto request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new CustomException(ErrorCode.DUPLICATE_USERNAME);
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .build();

        return new SignupResponseDto(userRepository.save(user));
    }

    /**
     * 사용자 계정을 삭제한다.
     *
     * @param username 삭제할 사용자의 아이디 (JWT에서 추출된 값)
     */
    @Transactional
    public void deleteAccount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
    }
}
