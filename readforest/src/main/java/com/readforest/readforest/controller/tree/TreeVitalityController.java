package com.readforest.readforest.controller.tree;

import com.readforest.readforest.dto.TreeVitalityResponseDto;
import com.readforest.readforest.service.TreeVitalityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 나무 생명력 상태 컨트롤러.
 *
 * <p>나무의 시들음 상태나 소생과 관련된 상태 변화 정보만 제공한다.
 * 주로 백그라운드 스케줄러({@code @Scheduled})가 상태를 변경하며,
 * 프론트엔드는 이 컨트롤러를 통해 현재 생명력 상태를 조회한다.</p>
 */
@RestController
@RequestMapping("/api/trees/{treeId}/vitality")
@RequiredArgsConstructor
public class TreeVitalityController {

    private final TreeVitalityService treeVitalityService;

    /**
     * 나무 생명력 상태 조회.
     *
     * <p>지정한 나무의 현재 생명력(시들음/정상/소생 등) 상태를 반환한다.</p>
     *
     * @param treeId 생명력 상태를 조회할 나무의 고유 식별자
     * @return 나무 생명력 상태 정보를 담은 응답
     */
    @GetMapping
    public ResponseEntity<TreeVitalityResponseDto> getVitality(@PathVariable Long treeId) {
        TreeVitalityResponseDto response = treeVitalityService.getTreeVitality(treeId);
        return ResponseEntity.ok(response);
    }
}
