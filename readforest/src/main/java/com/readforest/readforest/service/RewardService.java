package com.readforest.readforest.service;

import com.readforest.readforest.entity.UserQuestEntity;
import com.readforest.readforest.repository.UserQuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class RewardService {

    private final UserQuestRepository userQuestRepository;

    // 1. 보상 수령하기
    public void claimReward(Long userId, Long questId) {
        // 유저의 진행 기록을 가져옴
        UserQuestEntity userQuest = userQuestRepository.findByUserIdAndQuestId(userId, questId)
                .orElseThrow(() -> new RuntimeException("진행 중인 퀘스트 기록이 없습니다."));

        /// 검증: 이미 보상을 받았는가? (먼저 체크)
        if (userQuest.getStatus() == UserQuestEntity.QuestStatus.REWARD_CLAIMED) {
            throw new RuntimeException("이미 보상을 수령했습니다.");
        }

        // 검증: 완료 상태인가?
        if (userQuest.getStatus() != UserQuestEntity.QuestStatus.COMPLETED) {
            throw new RuntimeException("아직 퀘스트를 완료하지 않았습니다.");
        }


        // [실제 로직] 여기서 유저에게 아이템이나 포인트를 주는 코드가 들어감!
        // 예: userService.addPoint(userId, 100);

        // 상태를 '보상 수령 완료'로 변경
        userQuest.setStatus(UserQuestEntity.QuestStatus.REWARD_CLAIMED);
    }
}