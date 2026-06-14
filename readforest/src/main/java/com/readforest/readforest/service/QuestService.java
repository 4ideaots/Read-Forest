package com.readforest.readforest.service;

import com.readforest.readforest.dto.QuestResponse;
import com.readforest.readforest.entity.QuestEntity;
import com.readforest.readforest.entity.QuestEntity.QuestType;
import com.readforest.readforest.entity.UserQuestEntity;
import com.readforest.readforest.entity.UserQuestEntity.QuestStatus;
import com.readforest.readforest.repository.QuestRepository;
import com.readforest.readforest.repository.UserQuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.List;

/**
 * 퀘스트 서비스 (백엔드 권위).
 *
 * <p>일일/주간 퀘스트를 시드하고, 사용자별 진행도를 주기(일/주) 단위로 리셋하며,
 * 독서 행동 보고에 따라 진행도를 갱신한다. 프론트엔드는 이 결과를 그대로 렌더링한다.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestService {

    private final QuestRepository questRepository;
    private final UserQuestRepository userQuestRepository;

    private record Template(String title, String description, QuestType type,
                            String targetType, int targetValue, int rewardPoints, String rewardDecor) {}

    private static final List<Template> SEED = List.of(
            new Template("오늘의 책장 넘기기", "오늘 하루 10페이지 이상 읽으세요.", QuestType.DAILY, "pages_today", 10, 50, null),
            new Template("정원 돌보기", "독서 기록을 1회 갱신해 숲에 활력을 주세요.", QuestType.DAILY, "log_progress", 1, 30, "lantern"),
            new Template("완독의 하루", "오늘 책 한 권을 완독하세요.", QuestType.DAILY, "complete_book", 1, 120, "fence"),
            new Template("주간 챌린지: 책벌레", "이번 주에 책 2권을 완독하세요.", QuestType.WEEKLY, "complete_book", 2, 200, "well")
    );

    /** 퀘스트 템플릿을 시드한다(제목 기준 idempotent). */
    @Transactional
    public void seedQuests() {
        for (Template t : SEED) {
            if (questRepository.findByTitle(t.title()).isEmpty()) {
                questRepository.save(QuestEntity.builder()
                        .title(t.title())
                        .description(t.description())
                        .questType(t.type())
                        .targetType(t.targetType())
                        .targetValue(t.targetValue())
                        .rewardPoints(t.rewardPoints())
                        .rewardDecorationType(t.rewardDecor())
                        .build());
            }
        }
    }

    private String periodKey(QuestType type) {
        LocalDate now = LocalDate.now();
        if (type == QuestType.WEEKLY) {
            return now.getYear() + "-W" + now.get(WeekFields.ISO.weekOfWeekBasedYear());
        }
        return now.toString(); // yyyy-MM-dd
    }

    /** 내 퀘스트 목록 (필요 시 배정/주기 리셋 수행). */
    @Transactional
    public List<QuestResponse> getMyQuests(Long userId) {
        seedQuests();
        List<QuestResponse> result = new ArrayList<>();
        for (QuestEntity q : questRepository.findAll()) {
            UserQuestEntity uq = assignOrReset(userId, q);
            result.add(toResponse(q, uq));
        }
        return result;
    }

    /** 독서 행동 보고에 따라 해당 타입의 활성 퀘스트 진행도를 갱신한다. */
    @Transactional
    public void reportProgress(Long userId, String targetType, int amount, boolean absolute) {
        for (QuestEntity q : questRepository.findAll()) {
            if (q.getTargetType() == null || !q.getTargetType().equals(targetType)) continue;
            UserQuestEntity uq = assignOrReset(userId, q);
            if (uq.getStatus() != QuestStatus.IN_PROGRESS) continue;
            int next = absolute ? amount : uq.getProgress() + amount;
            if (next < 0) next = 0;
            uq.setProgress(next);
            if (next >= q.getTargetValue()) {
                uq.setStatus(QuestStatus.COMPLETED);
                uq.setCompletedAt(LocalDateTime.now());
            }
            userQuestRepository.save(uq);
        }
    }

    /** 사용자-퀘스트 행을 보장하고, 주기가 바뀌었으면 진행도를 리셋한다. */
    private UserQuestEntity assignOrReset(Long userId, QuestEntity quest) {
        String pk = periodKey(quest.getQuestType());
        UserQuestEntity uq = userQuestRepository.findByUserIdAndQuestId(userId, quest.getId())
                .orElseGet(() -> UserQuestEntity.builder()
                        .userId(userId)
                        .questId(quest.getId())
                        .progress(0)
                        .periodKey(pk)
                        .status(QuestStatus.IN_PROGRESS)
                        .build());
        if (!pk.equals(uq.getPeriodKey())) {
            uq.setPeriodKey(pk);
            uq.setProgress(0);
            uq.setStatus(QuestStatus.IN_PROGRESS);
            uq.setCompletedAt(null);
        }
        return userQuestRepository.save(uq);
    }

    private QuestResponse toResponse(QuestEntity q, UserQuestEntity uq) {
        return QuestResponse.builder()
                .questId(q.getId())
                .title(q.getTitle())
                .description(q.getDescription())
                .questType(q.getQuestType())
                .targetType(q.getTargetType())
                .targetValue(q.getTargetValue())
                .progress(uq.getProgress())
                .rewardPoints(q.getRewardPoints())
                .rewardDecorationType(q.getRewardDecorationType())
                .status(uq.getStatus())
                .build();
    }
}
