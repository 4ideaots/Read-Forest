package com.readforest.readforest.repository;

import com.readforest.readforest.entity.CheerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CheerRepository extends JpaRepository<CheerEntity, Long> {

    // 이미 이 유저가 이 나무에 응원을 했는지 확인
    boolean existsByTreeIdAndUserId(Long treeId, Long userId);

    // 이 나무가 받은 총 응원 개수 조회
    long countByTreeId(Long treeId);

}