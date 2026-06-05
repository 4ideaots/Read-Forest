package com.readforest.readforest.controller.forest;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

/**
 * 숲 꾸미기 컨트롤러.
 *
 * <p>인벤토리의 아이템을 숲에 배치하거나 해제하는
 * 꾸미기 행위만 담당하는 책임을 갖는다.</p>
 */
@RestController
@RequestMapping("/api/forests/me/decorations")
@RequiredArgsConstructor
public class ForestDecorationController {

    /**
     * 숲 꾸미기 아이템을 배치하거나 해제한다.
     *
     * @return 업데이트된 꾸미기 배치 결과
     */
    @PutMapping
    public ResponseEntity<?> updateDecorations() {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Collections.emptyMap());
    }
}
