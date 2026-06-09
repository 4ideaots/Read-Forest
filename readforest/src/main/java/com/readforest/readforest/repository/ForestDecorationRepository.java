package com.readforest.readforest.repository;

import com.readforest.readforest.domain.ForestDecoration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForestDecorationRepository extends JpaRepository<ForestDecoration, Long> {
    List<ForestDecoration> findByForestId(Long forestId);
    void deleteByForestId(Long forestId);
}
