package com.readforest.readforest.security.oauth2;

import java.util.Map;

/**
 * 깃허브 OAuth2 사용자 정보 구현체.
 *
 * <p>깃허브 응답은 평탄한 구조(flat)이므로 직접 키로 값을 꺼낸다.
 * name이 없으면 login(아이디)을 닉네임으로 사용한다.</p>
 */
public class GithubOAuth2UserInfo extends OAuth2UserInfo {

    public GithubOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getProviderId() {
        return String.valueOf(attributes.get("id"));
    }

    @Override
    public String getNickname() {
        String name = (String) attributes.get("name");
        // name이 없으면 github 아이디(login)를 닉네임으로 사용
        if (name == null || name.isBlank()) {
            name = (String) attributes.get("login");
        }
        return name;
    }

    @Override
    public String getProfileImageUrl() {
        return (String) attributes.get("avatar_url");
    }
}
