package com.readforest.readforest.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * 도서 등록 요청 DTO.
 *
 * <p>검색 결과 선택 또는 직접 입력으로 얻은 도서 메타데이터를 받아
 * Book 엔티티로 영속화하기 위한 요청 본문이다. 나무 심기 전에 도서가
 * DB에 존재해야 하므로 프론트엔드가 먼저 이 엔드포인트를 호출한다.</p>
 */
@Getter
@Setter
public class BookCreateRequestDto {

    @NotBlank(message = "도서 제목은 필수 항목입니다.")
    private String title;

    @NotBlank(message = "저자는 필수 항목입니다.")
    private String author;

    private String genre;

    @NotNull(message = "총 페이지 수는 필수 항목입니다.")
    @Min(value = 1, message = "총 페이지 수는 1 이상이어야 합니다.")
    private Integer totalPage;

    private String coverImageUrl;

    private String isbn;
}
