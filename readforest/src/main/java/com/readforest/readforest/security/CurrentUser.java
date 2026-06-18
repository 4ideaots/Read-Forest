package com.readforest.readforest.security;

import com.readforest.readforest.domain.User;
import com.readforest.readforest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * 현재 인증된 사용자 정보를 SecurityContext에서 해석하는 헬퍼.
 *
 * <p>JWT 필터가 SecurityContext에 저장한 인증 주체(username)로부터
 * 실제 User 엔티티의 ID를 조회한다. 인증 정보가 없거나(익명) 사용자를
 * 찾지 못하면 401(Unauthorized)을 던진다. 절대 특정 사용자로 폴백하지 않는다 —
 * 폴백은 인증되지 않은 요청이 임의 사용자로 처리되는 보안 결함이 된다.</p>
 */
@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepository userRepository;

    /**
     * 현재 로그인한 사용자의 ID를 반환한다.
     *
     * @return 인증된 사용자 ID
     * @throws ResponseStatusException 인증 정보가 없거나 사용자를 찾을 수 없으면 401
     */
    public Long id() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증이 필요합니다.");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증된 사용자를 찾을 수 없습니다."));
    }
}
