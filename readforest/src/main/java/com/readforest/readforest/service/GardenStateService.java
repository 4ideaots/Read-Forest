package com.readforest.readforest.service;

import com.readforest.readforest.domain.GardenState;
import com.readforest.readforest.domain.User;
import com.readforest.readforest.dto.GardenStateResponseDto;
import com.readforest.readforest.exception.CustomException;
import com.readforest.readforest.exception.ErrorCode;
import com.readforest.readforest.repository.GardenStateRepository;
import com.readforest.readforest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 정원 상태 영속화 서비스.
 *
 * <p>사용자별 정원 전체 상태(JSON)를 upsert 방식으로 저장/조회한다.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GardenStateService {

    private final GardenStateRepository gardenStateRepository;
    private final UserRepository userRepository;

    public GardenStateResponseDto getState(Long userId) {
        return gardenStateRepository.findByUserId(userId)
                .map(GardenStateResponseDto::from)
                .orElseGet(GardenStateResponseDto::empty);
    }

    @Transactional
    public GardenStateResponseDto saveState(Long userId, String json) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        GardenState gardenState = gardenStateRepository.findByUserId(userId)
                .orElseGet(() -> GardenState.builder().user(user).build());
        gardenState.setState(json);

        return GardenStateResponseDto.from(gardenStateRepository.save(gardenState));
    }
}
