package com.example.demo.repository;

import com.example.demo.entity.FollowEntity;
import orgscript org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<FollowEntity, Long> {
    
    // 내가 팔로우한 목록 찾기
    List<FollowEntity> findByFollowerId(Long followerId);

    // 나를 팔로우하는 사람 목록 찾기
    List<FollowEntity> findByFollowingId(Long followingId);

    // 이미 팔로우 했는지 확인용
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    // 언팔로우 할 때 해당 데이터 찾기 위해 필요
    FollowEntity findByFollowerIdAndFollowingId(Long followerId, Long followingId);
}