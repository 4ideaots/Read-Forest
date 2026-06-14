package com.readforest.readforest.controller.auth;

import com.readforest.readforest.domain.User;
import com.readforest.readforest.dto.MeResponseDto;
import com.readforest.readforest.exception.CustomException;
import com.readforest.readforest.exception.ErrorCode;
import com.readforest.readforest.repository.UserRepository;
import com.readforest.readforest.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 사용자 식별 컨트롤러.
 *
 * <p>인증된 사용자가 자신의 기본 정보(ID, 아이디, 닉네임)를 조회한다.
 * 로그인 직후 프론트엔드가 본인 닉네임을 표시하거나, 사용자 단위 API
 * 호출에 필요한 식별자를 확보하는 용도로 사용된다.</p>
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    /**
     * 현재 로그인한 사용자의 기본 정보를 반환한다.
     *
     * @return 사용자 ID/아이디/닉네임
     */
    @GetMapping("/me")
    public ResponseEntity<MeResponseDto> getMe() {
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return ResponseEntity.ok(MeResponseDto.from(user));
    }
}
