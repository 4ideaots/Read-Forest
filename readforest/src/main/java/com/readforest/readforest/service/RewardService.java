package com.readforest.readforest.service;

import com.readforest.readforest.dto.RewardClaimResponse;
import com.readforest.readforest.entity.QuestEntity;
import com.readforest.readforest.entity.UserQuestEntity;
import com.readforest.readforest.entity.UserQuestEntity.QuestStatus;
import com.readforest.readforest.repository.QuestRepository;
import com.readforest.readforest.repository.UserQuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class RewardService {

    private final UserQuestRepository userQuestRepository;
    private final QuestRepository questRepository;

    /**
     * 완료된 퀘스트의 보상을 수령 처리하고, 지급할 보상(포인트·소품)을 반환한다.
     *
     * <p>실제 포인트/소품 적립은 프론트엔드(정원 상태)에서 반영하므로, 여기서는
     * 상태를 REWARD_CLAIMED로 바꾸고 보상 명세를 돌려준다.</p>
     */
    public RewardClaimResponse claimReward(Long userId, Long questId) {
        UserQuestEntity userQuest = userQuestRepository.findByUserIdAndQuestId(userId, questId)
                .orElseThrow(() -> new RuntimeException("진행 중인 퀘스트 기록이 없습니다."));

        if (userQuest.getStatus() == QuestStatus.REWARD_CLAIMED) {
            throw new RuntimeException("이미 보상을 수령했습니다.");
        }
        if (userQuest.getStatus() != QuestStatus.COMPLETED) {
            throw new RuntimeException("아직 퀘스트를 완료하지 않았습니다.");
        }

        userQuest.setStatus(QuestStatus.REWARD_CLAIMED);

        QuestEntity quest = questRepository.findById(questId)
                .orElseThrow(() -> new RuntimeException("퀘스트 정보가 없습니다."));

        return RewardClaimResponse.builder()
                .questId(questId)
                .message("보상 수령에 성공했습니다!")
                .rewardPoints(quest.getRewardPoints())
                .rewardDecorationType(quest.getRewardDecorationType())
                .build();
    }
}
