package com.readforest.readforest.security.oauth2;

import com.readforest.readforest.domain.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * OAuth2 인증 완료 후 SecurityContext에 저장되는 사용자 객체.
 *
 * <p>Spring Security 기본 OAuth2User는 내부 username을 담지 못하므로,
 * 성공 핸들러에서 JWT 발급 시 username과 role을 꺼낼 수 있도록 커스터마이징한다.</p>
 */
public class CustomOAuth2User implements OAuth2User {

    private final String username;
    private final String role;
    private final Map<String, Object> attributes;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomOAuth2User(User user, Map<String, Object> attributes) {
        this.username = user.getUsername();
        this.role = user.getRole();
        this.attributes = attributes;
        this.authorities = List.of(new SimpleGrantedAuthority(user.getRole()));
    }

    /** JWT 발급에 사용되는 내부 username */
    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getName() {
        return username;
    }
}
