package com.readforest.readforest.service;

import com.readforest.readforest.dto.QuestResponse;
import com.readforest.readforest.entity.QuestEntity;
import com.readforest.readforest.entity.UserQuestEntity;
import com.readforest.readforest.repository.QuestRepository;
import com.readforest.readforest.repository.UserQuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestService {

    private final UserQuestRepository userQuestRepository;
    private final QuestRepository questRepository;

    // 1. 내 퀘스트 목록 조회하기
    public List<QuestResponse> getMyQuests(Long userId) {
        List<UserQuestEntity> userQuests = userQuestRepository.findByUserId(userId);

        return userQuests.stream()
                .map(uq -> {
                    // 유저의 진행도 데이터와 실제 퀘스트 상세 정보를 합쳐서 DTO로 만듦
                    QuestEntity q = questRepository.findById(uq.getQuestId())
                            .orElseThrow(() -> new RuntimeException("퀘스트 정보가 없습니다."));
                    
                    return QuestResponse.builder()
                            .questId(q.getId())
                            .title(q.getTitle())
                            .questType(q.getQuestType())
                            .targetValue(q.getTargetValue())
                            .progress(uq.getProgress())
                            .status(uq.getStatus())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // 2. 퀘스트 진행도 업데이트 
    @Transactional
    public void updateProgress(Long userId, Long questId, int amount) {
        // 유저의 진행 기록을 먼저 찾음
        UserQuestEntity userQuest = userQuestRepository.findByUserIdAndQuestId(userId, questId)
                .orElseThrow(() -> new RuntimeException("진행 중인 퀘스트를 찾을 수 없습니다."));

        if (userQuest.getStatus() != UserQuestEntity.QuestStatus.IN_PROGRESS) {
            throw new RuntimeException("이미 완료되었거나 보상을 받은 퀘스트입니다.");
        }

        // 진행도 더하기
        int newProgress = userQuest.getProgress() + amount;
        userQuest.setProgress(newProgress);

        // 목표 수치에 도달했는지 확인
        QuestEntity quest = questRepository.findById(questId)
                .orElseThrow(() -> new RuntimeException("퀘스트 정보가 없습니다."));

        if (newProgress >= quest.getTargetValue()) {
            userQuest.setStatus(UserQuestEntity.QuestStatus.COMPLETED); // 상태를 '완료'로 변경
            userQuest.setCompletedAt(LocalDateTime.now()); // 완료 시간 기록
        }
    }
}