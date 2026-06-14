package com.readforest.readforest.controller.gamification;

import com.readforest.readforest.dto.QuestProgressRequestDto;
import com.readforest.readforest.security.CurrentUser;
import com.readforest.readforest.service.QuestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 퀘스트 컨트롤러.
 *
 * <p>백엔드가 권위를 갖는 일일/주간 퀘스트의 목록 조회와 진행도 보고를 담당한다.</p>
 */
@RestController
@RequestMapping("/api/quests")
@RequiredArgsConstructor
public class QuestController {

    private final QuestService questService;
    private final CurrentUser currentUser;

    /**
     * 내 퀘스트 목록을 조회한다(필요 시 일일/주간 리셋 적용).
     */
    @GetMapping
    public ResponseEntity<?> getMyQuests() {
        return ResponseEntity.ok(questService.getMyQuests(currentUser.id()));
    }

    /**
     * 독서 행동(페이지·기록·완독·스트릭)을 보고하여 진행도를 갱신한다.
     */
    @PostMapping("/progress")
    public ResponseEntity<Void> reportProgress(@Valid @RequestBody QuestProgressRequestDto request) {
        questService.reportProgress(currentUser.id(), request.getTargetType(), request.getAmount(), request.isAbsolute());
        return ResponseEntity.ok().build();
    }
}
