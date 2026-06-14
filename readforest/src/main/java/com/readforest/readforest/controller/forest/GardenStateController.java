package com.readforest.readforest.controller.forest;

import com.readforest.readforest.dto.GardenStateRequestDto;
import com.readforest.readforest.dto.GardenStateResponseDto;
import com.readforest.readforest.security.CurrentUser;
import com.readforest.readforest.service.GardenStateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 정원 상태 영속화 컨트롤러.
 *
 * <p>프론트엔드 정원의 전체 상태(도서·나무·소품·스탯·퀘스트 등)를 하나의 JSON
 * 문서로 저장/복원한다. 관계형 도메인이 담지 못하는 클라이언트 고유 데이터까지
 * 빠짐없이 DB에 보존하여, 로그인 시 어느 기기에서든 자신의 정원을 그대로
 * 복원할 수 있게 한다.</p>
 */
@RestController
@RequestMapping("/api/garden-state")
@RequiredArgsConstructor
public class GardenStateController {

    private final GardenStateService gardenStateService;
    private final CurrentUser currentUser;

    /**
     * 현재 사용자의 저장된 정원 상태를 조회한다.
     *
     * @return 정원 상태 JSON과 갱신 시각 (저장된 적 없으면 state=null)
     */
    @GetMapping
    public ResponseEntity<GardenStateResponseDto> getMyState() {
        return ResponseEntity.ok(gardenStateService.getState(currentUser.id()));
    }

    /**
     * 현재 사용자의 정원 상태를 저장(upsert)한다.
     *
     * @param request 직렬화된 정원 상태 JSON
     * @return 저장 결과
     */
    @PutMapping
    public ResponseEntity<GardenStateResponseDto> saveMyState(@RequestBody GardenStateRequestDto request) {
        return ResponseEntity.ok(gardenStateService.saveState(currentUser.id(), request.getState()));
    }
}
