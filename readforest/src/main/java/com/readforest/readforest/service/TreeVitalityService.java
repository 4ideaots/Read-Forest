package com.readforest.readforest.service;

import com.readforest.readforest.domain.Tree;
import com.readforest.readforest.dto.TreeVitalityResponseDto;
import com.readforest.readforest.exception.CustomException;
import com.readforest.readforest.exception.ErrorCode;
import com.readforest.readforest.repository.TreeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TreeVitalityService {

    private final TreeRepository treeRepository;

    public TreeVitalityResponseDto getTreeVitality(Long treeId) {
        Tree tree = treeRepository.findById(treeId)
                .orElseThrow(() -> new CustomException(ErrorCode.TREE_NOT_FOUND));
        return TreeVitalityResponseDto.from(tree);
    }

    /**
     * 매일 자정에 유휴 나무의 생명력 상태를 업데이트합니다.
     * 3일 이상 독서 갱신이 없으면 WITHERED로 변색,
     * 7일 이상 독서 갱신이 없으면 DEAD로 변색 (밑동만 남음).
     *
     * DB 전체 스캔을 방지하기 위해 Tree 엔티티의 last_updated_at 컬럼 인덱스(idx_tree_last_updated_at)를
     * 활용해 해당 조건의 나무만 조회하여 더티 체킹으로 업데이트합니다.
     */
    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정
    @Transactional
    public void updateWitheredTrees() {
        log.info("Starting scheduled check for inactive trees...");

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);

        // 1. 7일 이상 방치되고 현재 WITHERED 상태인 나무 -> DEAD로 변경
        List<Tree> toDead = treeRepository.findByVitalityAndLastUpdatedAtBefore(Tree.Vitality.WITHERED, sevenDaysAgo);
        for (Tree tree : toDead) {
            tree.setVitality(Tree.Vitality.DEAD);
            log.info("Tree ID {} has died due to 7+ days of inactivity.", tree.getId());
        }

        // 2. 3일 이상 방치되고 현재 HEALTHY 상태인 나무 -> WITHERED로 변경
        List<Tree> toWithered = treeRepository.findByVitalityAndLastUpdatedAtBefore(Tree.Vitality.HEALTHY, threeDaysAgo);
        for (Tree tree : toWithered) {
            tree.setVitality(Tree.Vitality.WITHERED);
            log.info("Tree ID {} has withered due to 3+ days of inactivity.", tree.getId());
        }

        log.info("Finished scheduled check for inactive trees.");
    }
}
