package com.readforest.readforest.controller.tree;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 독서 기록 컨트롤러.
 *
 * <p>사용자가 '몇 페이지를 읽었는가'에 대한 기록 추가 및 이력 관리만 담당한다.
 * 기록 추가 시 Service 단의 이벤트 발행을 통해 나무 게이지가 올라가도록 설계되어 있다.</p>
 */
@RestController
@RequestMapping("/api/trees/{treeId}/records")
@RequiredArgsConstructor
public class ReadingRecordController {

    /**
     * 읽은 페이지 수 기록 추가.
     *
     * <p>해당 나무에 대한 독서 기록(읽은 페이지 수)을 추가한다.
     * 기록이 추가되면 Service 단에서 이벤트를 발행하여 나무 게이지가 갱신된다.</p>
     *
     * @param treeId 독서 기록을 추가할 나무의 고유 식별자
     * @return 추가된 독서 기록 정보를 담은 응답
     */
    @PostMapping
    public ResponseEntity<?> addReadingRecord(@PathVariable Long treeId) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("message", "독서 기록이 추가되었습니다.", "treeId", treeId));
    }

    /**
     * 독서 히스토리 조회.
     *
     * <p>해당 나무에 대한 모든 독서 기록 이력을 반환한다.</p>
     *
     * @param treeId 독서 기록을 조회할 나무의 고유 식별자
     * @return 독서 기록 목록을 담은 응답
     */
    @GetMapping
    public ResponseEntity<?> getReadingRecords(@PathVariable Long treeId) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Map.of("treeId", treeId, "records", List.of()));
    }
}
