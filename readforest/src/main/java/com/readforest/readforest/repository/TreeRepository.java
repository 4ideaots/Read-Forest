package com.readforest.readforest.repository;

import com.readforest.readforest.domain.Tree;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TreeRepository extends JpaRepository<Tree, Long> {
    List<Tree> findByUserId(Long userId);
    List<Tree> findByVitalityAndLastUpdatedAtBefore(Tree.Vitality vitality, LocalDateTime dateTime);
}
