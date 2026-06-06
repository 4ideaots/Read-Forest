package com.readforest.readforest.service;

import com.readforest.readforest.dto.GuestbookRequest;
import com.readforest.readforest.dto.GuestbookResponse;
import com.readforest.readforest.entity.GuestbookEntity;
import com.readforest.readforest.repository.GuestbookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GuestbookService {

    private final GuestbookRepository guestbookRepository;

    // 방명록 작성
    @Transactional
    public void writeGuestbook(Long forestOwnerId, Long writerId, GuestbookRequest request) {
        GuestbookEntity guestbook = GuestbookEntity.builder()
                .forestOwnerId(forestOwnerId)
                .writerId(writerId)
                .content(request.getContent())
                .build();
        
        guestbookRepository.save(guestbook);
    }

    // 특정 숲의 방명록 목록 조회
    public List<GuestbookResponse> getGuestbookList(Long forestOwnerId) {
        return guestbookRepository.findByForestOwnerIdOrderByCreatedAtDesc(forestOwnerId)
                .stream()
                .map(g -> GuestbookResponse.builder()
                        .id(g.getId())
                        .writerId(g.getWriterId())
                        .content(g.getContent())
                        .createdAt(g.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // 방명록 삭제 (본인만 가능)
    @Transactional
    public void deleteGuestbook(Long guestbookId, Long requestUserId) {
        // 위에서 만든 커스텀 메서드로 작성자인지 확인하며 가져옴
        GuestbookEntity guestbook = guestbookRepository.findById(guestbookId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 방명록입니다."));

        //본인이 아니면 삭제 불가
        if (!guestbook.getWriterId().equals(requestUserId)) {
            throw new RuntimeException("본인이 작성한 글만 삭제할 수 있습니다.");
        }

        guestbookRepository.delete(guestbook);
    }
}