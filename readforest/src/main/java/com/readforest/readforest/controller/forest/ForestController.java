package com.readforest.readforest.controller.forest;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

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

    /**
     * 특정 사용자의 숲을 조회한다.
     *
     * @param userId 조회할 사용자의 ID
     * @return 해당 사용자의 숲 시각화 데이터
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getForest(@PathVariable Long userId) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Collections.emptyMap());
    }
}
