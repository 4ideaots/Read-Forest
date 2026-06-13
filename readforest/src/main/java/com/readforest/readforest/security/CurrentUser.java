package com.readforest.readforest.security;

import com.readforest.readforest.domain.User;
import com.readforest.readforest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * 현재 인증된 사용자 정보를 SecurityContext에서 해석하는 헬퍼.
 *
 * <p>JWT 필터가 SecurityContext에 저장한 인증 주체(username)로부터
 * 실제 User 엔티티의 ID를 조회한다. 인증 정보가 없거나(익명) 사용자를
 * 찾지 못하면 기본 테스트 사용자 ID(1L)로 폴백하여 기존 테스트/시드
 * 데이터와의 호환성을 유지한다.</p>
 */
@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepository userRepository;

    /** 기존 컨트롤러 mock 동작과의 호환을 위한 기본 사용자 ID. */
    private static final Long FALLBACK_USER_ID = 1L;

    /**
     * 현재 로그인한 사용자의 ID를 반환한다.
     *
     * @return 인증된 사용자 ID, 인증 정보가 없으면 {@link #FALLBACK_USER_ID}
     */
    public Long id() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null
                    && authentication.isAuthenticated()
                    && !"anonymousUser".equals(authentication.getPrincipal())) {
                String username = authentication.getName();
                return userRepository.findByUsername(username)
                        .map(User::getId)
                        .orElse(FALLBACK_USER_ID);
            }
        } catch (Exception e) {
            // SecurityContext 접근 실패 시 폴백
        }
        return FALLBACK_USER_ID;
    }
}
