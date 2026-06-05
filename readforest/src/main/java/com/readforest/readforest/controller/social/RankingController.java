package com.readforest.readforest.controller.social;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

/**
 * 통계 및 순위 컨트롤러.
 *
 * <p>테마별 랭킹 산정 및 보드를 제공한다.
 * 소모적 줄세우기가 아닌 '이번 주 가장 다양한 나무를 심은 숲',
 * '가장 오래 유지된 숲' 등의 테마별 보드를 운영한다.</p>
 */
@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

    /**
     * 테마별 랭킹을 조회한다.
     *
     * @param theme 조회할 랭킹 테마 (예: "diverse_forest", "longest_forest")
     * @return 테마에 해당하는 랭킹 목록
     */
    @GetMapping
    public ResponseEntity<?> getRankings(@RequestParam String theme) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Collections.emptyList());
    }
}
