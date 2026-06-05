package com.readforest.readforest.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 설정 클래스.
 *
 * <p>개발 단계에서 기본 제공되는 로그인 화면을 비활성화하고,
 * REST API(JWT) 환경에 맞춰 CSRF 비활성화 및 Stateless 세션 정책을 설정합니다.</p>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // REST API이므로 CSRF 및 CORS 비활성화
            .csrf(AbstractHttpConfigurer::disable)
            .cors(AbstractHttpConfigurer::disable)
            
            // 기본 로그인 폼 및 HTTP Basic 인증 비활성화 (로그인 화면 제거)
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            
            // 세션을 사용하지 않음 (JWT 기반 Stateless 환경 설정)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // 요청 권한 설정
            .authorizeHttpRequests(auth -> auth
                // 개발 단계에서는 모든 API 요청을 허용 (추후 JWT 필터 구현 시 접근 제한 설정 예정)
                .anyRequest().permitAll()
            );

        return http.build();
    }
}
