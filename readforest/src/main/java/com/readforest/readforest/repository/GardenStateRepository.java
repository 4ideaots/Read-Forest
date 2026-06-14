package com.readforest.readforest.repository;

import com.readforest.readforest.domain.GardenState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GardenStateRepository extends JpaRepository<GardenState, Long> {
    Optional<GardenState> findByUserId(Long userId);
}
