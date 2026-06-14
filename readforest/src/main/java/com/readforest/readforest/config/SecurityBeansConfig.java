package com.readforest.readforest.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 보안 공용 빈 설정.
 *
 * <p>{@link PasswordEncoder}와 {@link AuthenticationManager}를 {@code SecurityConfig}에서
 * 분리하여 정의한다. 이렇게 분리하지 않으면 {@code SecurityConfig}가 주입받는
 * {@code CustomOAuth2UserService}가 다시 {@code SecurityConfig}의 {@code PasswordEncoder}
 * 빈에 의존하여 순환참조가 발생한다(Spring Boot는 기본적으로 순환참조를 금지).</p>
 */
@Configuration
public class SecurityBeansConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
