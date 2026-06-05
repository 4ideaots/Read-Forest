package com.readforest.readforest.controller.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 계정 생명주기 컨트롤러.
 *
 * <p>회원가입, 탈퇴 등 계정 자체의 상태를 관리한다.</p>
 */
@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    /**
     * 새로운 사용자 회원가입을 처리한다.
     *
     * @return 회원가입 결과
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("message", "회원가입 성공"));
    }

    /**
     * 현재 로그인된 사용자의 계정을 삭제(탈퇴)한다.
     *
     * @return 계정 삭제 결과
     */
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("message", "계정 삭제 성공"));
    }
}
