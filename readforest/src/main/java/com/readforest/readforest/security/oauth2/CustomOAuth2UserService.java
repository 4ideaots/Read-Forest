package com.readforest.readforest.security.oauth2;

import com.readforest.readforest.domain.User;
import com.readforest.readforest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * OAuth2 로그인 사용자 정보 처리 서비스.
 *
 * <p>OAuth2 인증 완료 후 제공자에서 받은 사용자 정보를 우리 DB와 동기화한다.
 * 최초 로그인이면 회원가입, 이후 로그인이면 프로필 정보를 갱신한다.</p>
 */
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId().toUpperCase();

        OAuth2UserInfo userInfo = switch (registrationId) {
            case "KAKAO" -> new KakaoOAuth2UserInfo(oAuth2User.getAttributes());
            case "GITHUB" -> new GithubOAuth2UserInfo(oAuth2User.getAttributes());
            default -> throw new OAuth2AuthenticationException("지원하지 않는 소셜 로그인: " + registrationId);
        };

        User user = saveOrUpdate(registrationId, userInfo);

        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }

    /**
     * 소셜 사용자를 DB에 저장하거나 기존 정보를 갱신한다.
     *
     * <p>소셜 로그인 사용자는 비밀번호가 없으므로 랜덤 UUID를 암호화하여 저장한다.
     * (일반 로그인으로는 사용 불가 — provider 필드로 구분)</p>
     */
    private User saveOrUpdate(String provider, OAuth2UserInfo userInfo) {
        return userRepository.findByProviderAndProviderId(provider, userInfo.getProviderId())
                .map(existing -> {
                    // 재로그인 시 최신 닉네임/프로필 이미지 반영
                    if (userInfo.getNickname() != null) {
                        existing.setNickname(userInfo.getNickname());
                    }
                    existing.setProfileImageUrl(userInfo.getProfileImageUrl());
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .username(provider.toLowerCase() + "_" + userInfo.getProviderId())
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .nickname(userInfo.getNickname() != null ? userInfo.getNickname() : "사용자")
                            .profileImageUrl(userInfo.getProfileImageUrl())
                            .provider(provider)
                            .providerId(userInfo.getProviderId())
                            .build();
                    return userRepository.save(newUser);
                });
    }
}
