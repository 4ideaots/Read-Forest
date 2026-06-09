package com.readforest.readforest.service;

import com.readforest.readforest.dto.InventoryItemResponseDto;
import com.readforest.readforest.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;

    public List<InventoryItemResponseDto> getUserInventory(Long userId) {
        return inventoryItemRepository.findByUserId(userId).stream()
                .map(InventoryItemResponseDto::from)
                .collect(Collectors.toList());
    }
}
