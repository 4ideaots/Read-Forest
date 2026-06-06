package com.readforest.readforest.service;

import com.readforest.readforest.dto.CheerResponse;
import com.readforest.readforest.entity.CheerEntity;
import com.readforest.readforest.repository.CheerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CheerService {

    private final CheerRepository cheerRepository;

    // 응원 하기
    @Transactional
    public void cheer(Long treeId, Long userId) {
        // 1. 이미 응원했는지 확인
        if (cheerRepository.existsByTreeIdAndUserId(treeId, userId)) {
            throw new RuntimeException("이미 이 나무에 응원을 보냈습니다!");
        }

        // 2. 저장
        CheerEntity cheer = CheerEntity.builder()
                .treeId(treeId)
                .userId(userId)
                .build();
        
        cheerRepository.save(cheer);
    }

    // 응원 현황 조회 (총 개수 + 내가 했는지 여부)
    public CheerResponse getCheerStatus(Long treeId, Long userId) {
        long totalCount = cheerRepository.countByTreeId(treeId);
        boolean isCheeredByMe = cheerRepository.existsByTreeIdAndUserId(treeId, userId);

        return CheerResponse.builder()
                .treeId(treeId)
                .totalCheers(totalCount)
                .cheeredByMe(isCheeredByMe)
                .build();
    }
}