package com.readforest.readforest.controller.forest;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

/**
 * 인벤토리 컨트롤러.
 *
 * <p>사용자가 획득한 보상(동물, 조명, 세계수 등)의
 * 보유 자산 목록을 관리하는 책임을 갖는다.</p>
 */
@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    /**
     * 현재 로그인한 사용자의 보유 아이템 목록을 조회한다.
     *
     * @return 보유 아이템 목록
     */
    @GetMapping("/items")
    public ResponseEntity<?> getMyItems() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Collections.emptyList());
    }
}
