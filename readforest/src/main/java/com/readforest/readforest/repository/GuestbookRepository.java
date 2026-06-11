package com.readforest.readforest.repository;

import com.readforest.readforest.entity.GuestbookEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuestbookRepository extends JpaRepository<GuestbookEntity, Long> {

    // 특정 숲 주인의 방명록을 최신순으로 조회
    List<GuestbookEntity> findByForestOwnerIdOrderByCreatedAtDesc(Long forestOwnerId);

    // 삭제할 때 본인 확인을 위해 필요
    GuestbookEntity findByIdAndWriterId(Long id, Long writerId);
}