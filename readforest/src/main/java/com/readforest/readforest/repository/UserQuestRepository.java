package com.readforest.readforest.repository;

import com.readforest.readforest.entity.UserQuestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserQuestRepository extends JpaRepository<UserQuestEntity, Long> {

    // 1. 특정 유저가 진행 중인 모든 퀘스트 목록 가져오기
    List<UserQuestEntity> findByUserId(Long userId);

    // 2. 특정 유저가 "특정 퀘스트"를 진행하고 있는지 확인 (중복 생성 방지)
    Optional<UserQuestEntity> findByUserIdAndQuestId(Long userId, Long questId);
}