package com.readforest.readforest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/**
 * 도서 검색 결과 응답 DTO.
 *
 * <p>검색된 도서 목록과 페이지네이션 메타 정보를 함께 반환한다.</p>
 */
@Getter
@AllArgsConstructor
public class BookSearchResponseDto {

    /** 검색된 도서 목록 */
    private final List<BookDto> books;

    /** 전체 검색 결과 수 */
    private final int totalCount;

    /** 마지막 페이지 여부 */
    private final boolean isEnd;
}
