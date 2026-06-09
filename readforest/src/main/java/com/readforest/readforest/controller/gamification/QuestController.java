package com.readforest.readforest.controller.gamification;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.readforest.readforest.service.QuestService;

import java.util.Collections;
import java.util.Map;

/**
 * 퀘스트 컨트롤러.
 *
 * <p>퀘스트 규칙 및 진행도 책임 — 현재 할당된 퀘스트와 달성률을 제공합니다.
 * (예: '연속 3일 10페이지 이상 읽기')</p>
 */
@RestController
@RequestMapping("/api/quests")
@RequiredArgsConstructor
public class QuestController {
    private final QuestService questService;

    /**
     * 내 퀘스트 목록을 조회한다.
     *
     * @return 현재 사용자에게 할당된 퀘스트 목록
     */
    @GetMapping
    public ResponseEntity<?> getMyQuests(@RequestHeader("X-User-Id") Long userId) {
    return ResponseEntity.ok(questService.getMyQuests(userId));

    }

    /**
     * 퀘스트 상세 및 진행도를 조회한다.
     *
     * @param questId 조회할 퀘스트의 ID
     * @return 해당 퀘스트의 상세 정보와 현재 진행도
     */
    @GetMapping("/{questId}")
    public ResponseEntity<?> getQuestDetail(
        @PathVariable Long questId,
        @RequestHeader("X-User-Id") Long userId) {
    return ResponseEntity.ok(questService.getMyQuests(userId));

    }
}
