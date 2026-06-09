package com.readforest.readforest.service;

import com.readforest.readforest.domain.*;
import com.readforest.readforest.dto.DecorationRequestDto;
import com.readforest.readforest.dto.DecorationResponseDto;
import com.readforest.readforest.exception.CustomException;
import com.readforest.readforest.exception.ErrorCode;
import com.readforest.readforest.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ForestDecorationService {

    private final ForestRepository forestRepository;
    private final ForestDecorationRepository forestDecorationRepository;
    private final ItemRepository itemRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final UserRepository userRepository;

    @Transactional
    public DecorationResponseDto updateDecorations(Long userId, DecorationRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // Get or Create Forest
        Forest forest = forestRepository.findByUserId(userId)
                .orElseGet(() -> forestRepository.save(
                        Forest.builder()
                                .user(user)
                                .name(user.getNickname() + "의 숲")
                                .build()
                ));

        // 기존 배치 삭제 (덮어쓰기 구현)
        forestDecorationRepository.deleteByForestId(forest.getId());

        List<ForestDecoration> newDecorations = new ArrayList<>();

        for (DecorationRequestDto.Placement placement : request.getDecorations()) {
            Item item = itemRepository.findById(placement.getItemId())
                    .orElseThrow(() -> new CustomException(ErrorCode.ITEM_NOT_FOUND));

            // 인벤토리 소유 여부 확인 (어뷰징 방지)
            boolean ownsItem = inventoryItemRepository.existsByUserIdAndItemId(userId, item.getId());
            if (!ownsItem) {
                throw new CustomException(ErrorCode.INSUFFICIENT_ITEM);
            }

            ForestDecoration decoration = ForestDecoration.builder()
                    .forest(forest)
                    .item(item)
                    .positionX(placement.getPositionX())
                    .positionY(placement.getPositionY())
                    .isPlaced(placement.getIsPlaced())
                    .build();

            newDecorations.add(forestDecorationRepository.save(decoration));
        }

        List<DecorationResponseDto.Detail> details = newDecorations.stream()
                .map(DecorationResponseDto.Detail::from)
                .collect(Collectors.toList());

        return DecorationResponseDto.builder()
                .decorations(details)
                .build();
    }
}
