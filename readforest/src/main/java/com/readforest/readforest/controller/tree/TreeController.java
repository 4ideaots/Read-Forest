package com.readforest.readforest.controller.tree;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 나무 객체 생명주기 컨트롤러.
 *
 * <p>묘목을 심고(생성), 포기하는(삭제) 등 나무 객체 자체의 관리만 담당한다.
 * 독서 기록이나 생명력 상태 등의 부가 책임은 별도 컨트롤러에서 처리한다.</p>
 */
@RestController
@RequestMapping("/api/trees")
@RequiredArgsConstructor
public class TreeController {

    /**
     * 묘목 심기 (나무 생성).
     *
     * <p>새로운 나무 객체를 생성하고 초기 상태로 등록한다.</p>
     *
     * @return 생성된 나무 정보를 담은 응답
     */
    @PostMapping
    public ResponseEntity<?> plantTree() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("message", "묘목이 심어졌습니다."));
    }

    /**
     * 나무 기본 정보 조회.
     *
     * <p>지정한 나무의 기본 정보를 반환한다.</p>
     *
     * @param treeId 조회할 나무의 고유 식별자
     * @return 나무 기본 정보를 담은 응답
     */
    @GetMapping("/{treeId}")
    public ResponseEntity<?> getTree(@PathVariable Long treeId) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("treeId", treeId));
    }

    /**
     * 나무 삭제.
     *
     * <p>지정한 나무 객체를 삭제(포기)한다.</p>
     *
     * @param treeId 삭제할 나무의 고유 식별자
     * @return 삭제 결과를 담은 응답
     */
    @DeleteMapping("/{treeId}")
    public ResponseEntity<?> removeTree(@PathVariable Long treeId) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("message", "나무가 삭제되었습니다.", "treeId", treeId));
    }
}
