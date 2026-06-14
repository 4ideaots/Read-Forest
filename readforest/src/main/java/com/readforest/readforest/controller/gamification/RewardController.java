package com.readforest.readforest.controller.gamification;

import com.readforest.readforest.dto.RewardClaimResponse;
import com.readforest.readforest.security.CurrentUser;
import com.readforest.readforest.service.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

/**
 * 보상 컨트롤러.
 *
 * <p>퀘스트 달성 후 보상(포인트·소품)을 청구하고, 지급할 보상 명세를 반환한다.
 * 실제 적립은 프론트엔드(정원 상태)에서 반영한다.</p>
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;
    private final CurrentUser currentUser;

    /**
     * 퀘스트 달성 보상을 수령한다.
     *
     * @param questId 보상을 수령할 퀘스트의 ID
     * @return 보상 명세(포인트·소품)
     */
    @PostMapping("/quests/{questId}/rewards/claim")
    public ResponseEntity<RewardClaimResponse> claimReward(@PathVariable Long questId) {
        return ResponseEntity.ok(rewardService.claimReward(currentUser.id(), questId));
    }

    /**
     * 보상 수령 내역을 조회한다.
     */
    @GetMapping("/rewards/history")
    public ResponseEntity<?> getRewardHistory() {
        return ResponseEntity.ok(Collections.emptyList());
    }
}
