package com.readforest.readforest.repository;

import com.readforest.readforest.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 사용자 레포지토리.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 아이디로 사용자를 조회한다. (일반 로그인 시 사용)
     *
     * @param username 로그인 아이디
     * @return 사용자 엔티티
     */
    Optional<User> findByUsername(String username);

    /**
     * 소셜 제공자와 제공자 고유 ID로 사용자를 조회한다. (소셜 로그인 시 사용)
     *
     * @param provider   소셜 제공자 (KAKAO, GITHUB)
     * @param providerId 소셜 제공자의 사용자 고유 ID
     * @return 사용자 엔티티
     */
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}
