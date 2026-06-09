package com.readforest.readforest.service;

import com.readforest.readforest.domain.ReadingRecord;
import com.readforest.readforest.domain.Tree;
import com.readforest.readforest.dto.ReadingRecordResponseDto;
import com.readforest.readforest.exception.CustomException;
import com.readforest.readforest.exception.ErrorCode;
import com.readforest.readforest.repository.ReadingRecordRepository;
import com.readforest.readforest.repository.TreeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReadingRecordService {

    private final ReadingRecordRepository readingRecordRepository;
    private final TreeRepository treeRepository;

    @Transactional
    public ReadingRecordResponseDto.Detail addRecord(Long treeId, Integer newCurrentPage) {
        Tree tree = treeRepository.findById(treeId)
                .orElseThrow(() -> new CustomException(ErrorCode.TREE_NOT_FOUND));

        int totalPage = tree.getBook().getTotalPage();

        // 어뷰징 방지 및 예외 검증: 현재 페이지가 총 페이지 수보다 클 수 없으며, 기존 페이지보다 작을 수 없음.
        if (newCurrentPage > totalPage || newCurrentPage < tree.getCurrentPage()) {
            throw new CustomException(ErrorCode.INVALID_PAGE_NUMBER);
        }

        int readPages = newCurrentPage - tree.getCurrentPage();

        // 1. 독서 행위 기록 추가
        ReadingRecord record = ReadingRecord.builder()
                .tree(tree)
                .readPages(readPages)
                .currentPage(newCurrentPage)
                .build();
        ReadingRecord savedRecord = readingRecordRepository.save(record);

        // 2. 나무 성장 업데이트
        tree.setCurrentPage(newCurrentPage);
        double growthRate = ((double) newCurrentPage / totalPage) * 100.0;
        tree.setGrowthRate(growthRate);
        tree.setLastUpdatedAt(LocalDateTime.now());

        if (newCurrentPage == totalPage) {
            tree.setIsCompleted(true);
        }

        // 3. 소생 메커니즘: 방치되어 시들거나(WITHERED) 죽은(DEAD) 나무가 다시 살아남
        if (tree.getVitality() == Tree.Vitality.WITHERED || tree.getVitality() == Tree.Vitality.DEAD) {
            tree.setVitality(Tree.Vitality.HEALTHY);
        }

        treeRepository.save(tree);

        return ReadingRecordResponseDto.Detail.from(savedRecord);
    }

    public List<ReadingRecordResponseDto.Detail> getRecordsByTree(Long treeId) {
        if (!treeRepository.existsById(treeId)) {
            throw new CustomException(ErrorCode.TREE_NOT_FOUND);
        }
        return readingRecordRepository.findByTreeIdOrderByCreatedAtDesc(treeId).stream()
                .map(ReadingRecordResponseDto.Detail::from)
                .collect(Collectors.toList());
    }
}
