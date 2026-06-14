package com.readforest.readforest.service;

import com.readforest.readforest.domain.GardenState;
import com.readforest.readforest.dto.VillageForestDto;
import com.readforest.readforest.exception.CustomException;
import com.readforest.readforest.exception.ErrorCode;
import com.readforest.readforest.repository.GardenStateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 마을 서비스.
 *
 * <p>가입 사용자들의 저장된 정원(garden-state)을 모아 마을 목록을 구성하고,
 * 다른 정원에 응원(물주기)을 누적한다.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VillageService {

    private final GardenStateRepository gardenStateRepository;

    /**
     * 현재 사용자를 제외한, 정원을 보유한 모든 사용자의 마을 목록을 반환한다.
     */
    public List<VillageForestDto> list(Long currentUserId) {
        return gardenStateRepository.findAll().stream()
                .filter(gs -> gs.getState() != null && gs.getUser() != null
                        && !gs.getUser().getId().equals(currentUserId))
                .map(VillageForestDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 다른 사용자의 정원에 응원(물주기)을 1 누적하고 누적값을 반환한다.
     * 자기 자신에게는 응원할 수 없다.
     */
    @Transactional
    public long cheer(Long currentUserId, Long ownerUserId) {
        if (currentUserId.equals(ownerUserId)) {
            return gardenStateRepository.findByUserId(ownerUserId)
                    .map(g -> g.getCheerCount() == null ? 0L : g.getCheerCount())
                    .orElse(0L);
        }
        GardenState owner = gardenStateRepository.findByUserId(ownerUserId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        long next = (owner.getCheerCount() == null ? 0L : owner.getCheerCount()) + 1;
        owner.setCheerCount(next);
        gardenStateRepository.save(owner);
        return next;
    }
}
