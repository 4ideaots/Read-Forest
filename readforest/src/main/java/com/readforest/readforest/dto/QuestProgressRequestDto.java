package com.readforest.readforest.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * 퀘스트 진행 보고 요청 DTO.
 *
 * <p>프론트엔드가 독서 행동(페이지 읽기·기록·완독·스트릭)을 보고하면, 백엔드가
 * 해당 {@code targetType}의 활성 퀘스트 진행도를 갱신한다.</p>
 */
@Getter
@Setter
public class QuestProgressRequestDto {

    /** 진행 종류: pages_today / log_progress / streak / complete_book */
    @NotNull
    private String targetType;

    /** 증가량 (absolute=true면 절대값으로 설정) */
    @NotNull
    private Integer amount;

    /** true면 progress를 amount로 '설정'(스트릭 등), false면 '누적'. */
    private boolean absolute;
}
