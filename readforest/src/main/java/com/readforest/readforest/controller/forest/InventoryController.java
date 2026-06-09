package com.readforest.readforest.controller.forest;

import com.readforest.readforest.dto.InventoryItemResponseDto;
import com.readforest.readforest.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    private final InventoryService inventoryService;

    /**
     * 현재 로그인한 사용자의 보유 아이템 목록을 조회한다.
     *
     * @return 보유 아이템 목록
     */
    @GetMapping("/items")
    public ResponseEntity<List<InventoryItemResponseDto>> getMyItems() {
        Long userId = getCurrentUserId();
        List<InventoryItemResponseDto> response = inventoryService.getUserInventory(userId);
        return ResponseEntity.ok(response);
    }

    private Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() 
                    && !"anonymousUser".equals(authentication.getPrincipal())) {
                // Future JWT / Authentication integration
            }
        } catch (Exception e) {
            // ignore
        }
        return 1L; // Fallback to test user ID 1L
    }
}
