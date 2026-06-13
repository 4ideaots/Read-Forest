package com.readforest.readforest.controller.forest;

import com.readforest.readforest.dto.TreeResponseDto;
import com.readforest.readforest.service.TreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 숲 시각화 컨트롤러.
 *
 * <p>내 숲이나 타인의 숲에 어떤 나무들이 심어져 있는지
 * 공간적/시각적 배치 데이터만 반환하는 책임을 갖는다.</p>
 */
@RestController
@RequestMapping("/api/forests")
@RequiredArgsConstructor
public class ForestController {

    private final TreeService treeService;

    /**
     * 특정 사용자의 숲을 조회한다.
     *
     * <p>해당 사용자가 심은 나무 목록과 개수를 반환한다.</p>
     *
     * @param userId 조회할 사용자의 ID
     * @return 해당 사용자의 숲 시각화 데이터 (나무 목록 + 그루 수)
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getForest(@PathVariable Long userId) {
        List<TreeResponseDto.Detail> trees = treeService.getUserTrees(userId);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "treeCount", trees.size(),
                "trees", trees
        ));
    }
}
