package com.readforest.readforest.repository;

import com.readforest.readforest.domain.ReadingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReadingRecordRepository extends JpaRepository<ReadingRecord, Long> {
    List<ReadingRecord> findByTreeIdOrderByCreatedAtDesc(Long treeId);
}
