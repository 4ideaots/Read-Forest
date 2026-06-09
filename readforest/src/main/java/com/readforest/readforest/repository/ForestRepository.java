package com.readforest.readforest.repository;

import com.readforest.readforest.domain.Forest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForestRepository extends JpaRepository<Forest, Long> {
    Optional<Forest> findByUserId(Long userId);
}
