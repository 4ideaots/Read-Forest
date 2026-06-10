package com.readforest.readforest.security.oauth2;

import java.util.Map;

/**
 * OAuth2 제공자별 사용자 정보 추상 클래스.
 *
 * <p>카카오, 깃허브 등 제공자마다 응답 구조가 달라
 * 각 구현체에서 필드 추출 방식을 다르게 정의한다.</p>
 */
public abstract class OAuth2UserInfo {

    protected final Map<String, Object> attributes;

    protected OAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    /** 제공자에서 발급한 사용자 고유 ID */
    public abstract String getProviderId();

    /** 닉네임 */
    public abstract String getNickname();

    /** 프로필 이미지 URL */
    public abstract String getProfileImageUrl();
}
