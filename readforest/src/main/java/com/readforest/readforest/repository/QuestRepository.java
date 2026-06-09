package com.readforest.readforest.repository;

import com.readforest.readforest.entity.QuestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestRepository extends JpaRepository<QuestEntity, Long> {

}