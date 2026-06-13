package com.readforest.readforest.dto;

import com.readforest.readforest.domain.Book;
import lombok.Builder;
import lombok.Getter;

/**
 * 도서 응답 DTO.
 *
 * <p>영속화된 Book 엔티티를 ID와 함께 반환한다. 프론트엔드는 여기서 받은
 * id로 나무 심기({@code POST /api/trees})를 요청한다.</p>
 */
@Getter
@Builder
public class BookResponseDto {

    private Long id;
    private String title;
    private String author;
    private String genre;
    private Integer totalPage;
    private String coverImageUrl;
    private String isbn;

    public static BookResponseDto from(Book book) {
        return BookResponseDto.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .genre(book.getGenre())
                .totalPage(book.getTotalPage())
                .coverImageUrl(book.getCoverImageUrl())
                .isbn(book.getIsbn())
                .build();
    }
}
