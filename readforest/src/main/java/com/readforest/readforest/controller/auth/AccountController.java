package com.readforest.readforest.controller.auth;

import com.readforest.readforest.dto.SignupRequestDto;
import com.readforest.readforest.dto.SignupResponseDto;
import com.readforest.readforest.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 계정 생명주기 컨트롤러.
 *
 * <p>회원가입, 탈퇴 등 계정 자체의 상태를 관리한다.</p>
 */
@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    /**
     * 새로운 사용자 회원가입을 처리한다.
     *
     * @param request 회원가입 요청 DTO (username, password, nickname)
     * @return 생성된 사용자 정보, HTTP 201
     */
    @PostMapping("/signup")
    public ResponseEntity<SignupResponseDto> signup(@RequestBody @Valid SignupRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.signup(request));
    }

    /**
     * 현재 로그인된 사용자의 계정을 삭제(탈퇴)한다.
     *
     * <p>JWT에서 추출한 username으로 사용자를 특정하여 삭제한다.</p>
     *
     * @param userDetails JWT 필터에서 설정된 인증 정보
     * @return HTTP 204
     */
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal UserDetails userDetails) {
        accountService.deleteAccount(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
