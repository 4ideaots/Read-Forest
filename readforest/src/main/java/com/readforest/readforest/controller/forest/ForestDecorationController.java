package com.readforest.readforest.controller.forest;

import com.readforest.readforest.dto.DecorationRequestDto;
import com.readforest.readforest.dto.DecorationResponseDto;
import com.readforest.readforest.security.CurrentUser;
import com.readforest.readforest.service.ForestDecorationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    private final CurrentUser currentUser;

    /**
     * 숲 꾸미기 아이템을 배치하거나 해제한다.
     *
     * @param request 숲에 배치할 아이템들의 정보 목록 DTO
     * @return 업데이트된 꾸미기 배치 결과
     */
    @PutMapping
    public ResponseEntity<DecorationResponseDto> updateDecorations(
            @Valid @RequestBody DecorationRequestDto request) {
        DecorationResponseDto response = forestDecorationService.updateDecorations(currentUser.id(), request);
        return ResponseEntity.ok(response);
    }
}
