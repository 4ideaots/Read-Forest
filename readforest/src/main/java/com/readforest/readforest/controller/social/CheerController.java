package com.readforest.readforest.controller.social;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 응원 컨트롤러.
 *
 * <p>특정 나무에 물주기/응원하기 등의 단발성 상호작용을 담당한다.</p>
 */
@RestController
@RequestMapping("/api/trees")
@RequiredArgsConstructor
public class CheerController {

    /**
     * 특정 나무에 응원하기(물주기)를 수행한다.
     *
     * @param treeId 응원할 나무 ID
     * @return 응원 처리 결과
     */
    @PostMapping("/{treeId}/cheer")
    public ResponseEntity<?> cheerTree(@PathVariable Long treeId) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok().build();
    }
}
