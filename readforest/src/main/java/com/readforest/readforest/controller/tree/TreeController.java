package com.readforest.readforest.controller.tree;

import com.readforest.readforest.dto.TreeRequestDto;
import com.readforest.readforest.dto.TreeResponseDto;
import com.readforest.readforest.service.TreeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    private final TreeService treeService;

    /**
     * 묘목 심기 (나무 생성).
     *
     * <p>새로운 나무 객체를 생성하고 초기 상태로 등록한다.</p>
     *
     * @param request 묘목 생성을 위한 책 정보 DTO
     * @return 생성된 나무 정보를 담은 응답
     */
    @PostMapping
    public ResponseEntity<TreeResponseDto.Detail> plantTree(@Valid @RequestBody TreeRequestDto.Plant request) {
        Long userId = getCurrentUserId();
        TreeResponseDto.Detail response = treeService.plantTree(userId, request.getBookId());
        return ResponseEntity.ok(response);
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
    public ResponseEntity<TreeResponseDto.Detail> getTree(@PathVariable Long treeId) {
        TreeResponseDto.Detail response = treeService.getTreeDetail(treeId);
        return ResponseEntity.ok(response);
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
        treeService.removeTree(treeId);
        return ResponseEntity.ok(Map.of("message", "나무가 삭제되었습니다.", "treeId", treeId));
    }

    private Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() 
                    && !"anonymousUser".equals(authentication.getPrincipal())) {
                // Future authentication parsing
            }
        } catch (Exception e) {
            // ignore
        }
        return 1L; // Mock / default test user ID
    }
}
