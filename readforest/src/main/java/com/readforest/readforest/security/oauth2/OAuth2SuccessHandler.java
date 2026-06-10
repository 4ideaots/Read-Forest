package com.readforest.readforest.security.oauth2;

import com.readforest.readforest.security.JwtProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * OAuth2 로그인 성공 핸들러.
 *
 * <p>소셜 로그인 성공 후 JWT를 발급하고,
 * 토큰을 쿼리 파라미터로 붙여 프론트엔드 콜백 URI로 리다이렉트한다.</p>
 */
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;

    @Value("${oauth2.redirect-uri}")
    private String redirectUri;

    /**
     * 인증 성공 시 JWT를 발급하고 프론트엔드로 리다이렉트한다.
     *
     * @param authentication CustomOAuth2User가 담긴 인증 객체
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();

        String accessToken = jwtProvider.generateAccessToken(oAuth2User.getUsername(), oAuth2User.getRole());
        String refreshToken = jwtProvider.generateRefreshToken(oAuth2User.getUsername());

        // 프론트엔드가 토큰을 받아 로컬스토리지 등에 저장하도록 쿼리 파라미터로 전달
        String targetUrl = redirectUri
                + "?accessToken=" + accessToken
                + "&refreshToken=" + refreshToken;

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
