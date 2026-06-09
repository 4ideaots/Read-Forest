package com.readforest.readforest.controller.forest;

import com.readforest.readforest.dto.DecorationRequestDto;
import com.readforest.readforest.dto.DecorationResponseDto;
import com.readforest.readforest.service.ForestDecorationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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

    private final ForestDecorationService forestDecorationService;

    /**
     * 숲 꾸미기 아이템을 배치하거나 해제한다.
     *
     * @param request 숲에 배치할 아이템들의 정보 목록 DTO
     * @return 업데이트된 꾸미기 배치 결과
     */
    @PutMapping
    public ResponseEntity<DecorationResponseDto> updateDecorations(
            @Valid @RequestBody DecorationRequestDto request) {
        Long userId = getCurrentUserId();
        DecorationResponseDto response = forestDecorationService.updateDecorations(userId, request);
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
