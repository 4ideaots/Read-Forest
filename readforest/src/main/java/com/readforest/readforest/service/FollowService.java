package com.readforest.readforest.service;

import com.readforest.readforest.dto.FollowResponse;
import com.readforest.readforest.entity.FollowEntity;
import com.readforest.readforest.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
                                     // stream 사용해서 변환하는 익숙한 방식
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional (readOnly = true) // 데이터 변경이 있으므로 트랜잭션 추가
public class FollowService {

    private final FollowRepository followRepository;

    // 팔로우 하기
    @Transactional
    public void follow(Long followerId, Long followingId) {
        // 1. 자기 자신은 팔로우 못하게 방지
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("자기 자신을 팔로우할 수 없습니다.");
        }

        // 2. 이미 팔로우 중인지 확인
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            throw new RuntimeException("이미 팔로우 중인 유저입니다.");
        }

        // 3. 저장
        FollowEntity follow = FollowEntity.builder()
                .followerId(followerId)
                .followingId(followingId)
                .build();
        followRepository.save(follow);
    }

    // 언팔로우 하기
    @Transactional
    public void unfollow(Long followerId, Long followingId) {
        FollowEntity follow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId);
        
        if (follow == null) {
            throw new RuntimeException("팔로우 중인 유저가 아닙니다.");
        }

        followRepository.delete(follow);
    }

    // 나를 팔로우하는 사람들 목록 조회
    public List<FollowResponse> getFollowers(Long userId) {
        List<FollowEntity> followers = followRepository.findByFollowingId(userId);
        return followers.stream()
                .map(f -> new FollowResponse(f.getFollowerId(), "User_Nickname", f.getCreatedAt()))
                .collect(Collectors.toList());
    }

    // 내가 팔로우하는 사람들 목록 조회
    public List<FollowResponse> getFollowing(Long userId) {
        List<FollowEntity> following = followRepository.findByFollowerId(userId);
        return following.stream()
                .map(f -> new FollowResponse(f.getFollowingId(), "User_Nickname", f.getCreatedAt()))
                .collect(Collectors.toList());
    }
}