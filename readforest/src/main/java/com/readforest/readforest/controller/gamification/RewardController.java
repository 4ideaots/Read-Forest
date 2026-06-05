package com.readforest.readforest.controller.gamification;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

/**
 * 보상 컨트롤러.
 *
 * <p>보상 수령 책임 — 퀘스트 달성 후 보상(포인트, 아이템)을 청구하고
 * 지급하는 트랜잭션을 처리합니다.</p>
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RewardController {

    /**
     * 퀘스트 달성 보상을 수령한다.
     *
     * @param questId 보상을 수령할 퀘스트의 ID
     * @return 보상 수령 결과
     */
    @PostMapping("/quests/{questId}/rewards/claim")
    public ResponseEntity<?> claimReward(@PathVariable Long questId) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("questId", questId, "claimed", true));
    }

    /**
     * 보상 수령 내역을 조회한다.
     *
     * @return 사용자의 전체 보상 수령 내역 목록
     */
    @GetMapping("/rewards/history")
    public ResponseEntity<?> getRewardHistory() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Collections.emptyList());
    }
}
