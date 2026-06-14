package com.readforest.readforest.controller.social;

import com.readforest.readforest.dto.VillageForestDto;
import com.readforest.readforest.security.CurrentUser;
import com.readforest.readforest.service.VillageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 마을 컨트롤러.
 *
 * <p>가입 사용자들의 정원을 모은 마을 목록을 제공하고, 다른 정원에 응원(물주기)을
 * 보낸다. 저장된 정원 상태(garden-state)를 기반으로 실제 다중 사용자 소셜 기능을
 * 구성한다.</p>
 */
@RestController
@RequestMapping("/api/village")
@RequiredArgsConstructor
public class VillageController {

    private final VillageService villageService;
    private final CurrentUser currentUser;

    /**
     * 마을의 다른 정원사 목록(정원 상태 포함)을 조회한다.
     */
    @GetMapping
    public ResponseEntity<List<VillageForestDto>> getVillage() {
        return ResponseEntity.ok(villageService.list(currentUser.id()));
    }

    /**
     * 특정 사용자의 정원에 응원(물주기)을 보낸다.
     *
     * @param ownerUserId 응원할 정원 주인 ID
     * @return 누적 응원 수
     */
    @PostMapping("/{ownerUserId}/cheer")
    public ResponseEntity<?> cheer(@PathVariable Long ownerUserId) {
        long count = villageService.cheer(currentUser.id(), ownerUserId);
        return ResponseEntity.ok(Map.of("ownerUserId", ownerUserId, "cheerCount", count));
    }
}
