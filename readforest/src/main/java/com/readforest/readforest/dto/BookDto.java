package com.readforest.readforest.dto;

import com.readforest.readforest.client.KakaoBookApiClient.KakaoDocument;
import lombok.Getter;

import java.util.List;

/**
 * 도서 단건 정보 DTO.
 *
 * <p>카카오 API 응답의 document 하나를 앱에서 사용할 형태로 변환한 객체다.</p>
 */
@Getter
public class BookDto {

    /** ISBN (ISBN-10과 ISBN-13이 공백으로 구분된 문자열일 수 있음) */
    private final String isbn;

    /** 도서 제목 */
    private final String title;

    /** 저자 (여러 명인 경우 쉼표로 구분) */
    private final String author;

    /** 출판사 */
    private final String publisher;

    /** 책 소개 */
    private final String contents;

    /** 표지 이미지 URL */
    private final String coverImageUrl;

    /**
     * 카카오 API의 document 객체로부터 BookDto를 생성한다.
     *
     * @param doc 카카오 API 도서 단건 응답
     */
    public BookDto(KakaoDocument doc) {
        this.isbn = doc.getIsbn();
        this.title = doc.getTitle();
        this.author = String.join(", ", doc.getAuthors());
        this.publisher = doc.getPublisher();
        this.contents = doc.getContents();
        this.coverImageUrl = doc.getThumbnail();
    }

    /**
     * 저자 목록을 받아 직접 생성하는 생성자. (테스트 등 용도)
     */
    public BookDto(String isbn, String title, List<String> authors, String publisher,
                   String contents, String coverImageUrl) {
        this.isbn = isbn;
        this.title = title;
        this.author = String.join(", ", authors);
        this.publisher = publisher;
        this.contents = contents;
        this.coverImageUrl = coverImageUrl;
    }
}
