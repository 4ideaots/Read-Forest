package com.readforest.readforest.security;

import com.readforest.readforest.domain.User;
import com.readforest.readforest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Spring Security 사용자 조회 서비스 구현체.
 *
 * <p>Spring Security의 인증 과정에서 username으로 사용자를 DB에서 조회하여
 * UserDetails 객체로 변환해 반환한다.</p>
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * username으로 사용자를 조회하여 UserDetails를 반환한다.
     *
     * @param username 사용자 아이디
     * @return Spring Security가 사용하는 UserDetails 객체
     * @throws UsernameNotFoundException 해당 username의 사용자가 없을 경우
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority(user.getRole()))
        );
    }
}
