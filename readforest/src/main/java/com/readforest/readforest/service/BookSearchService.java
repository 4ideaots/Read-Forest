package com.readforest.readforest.service;

import com.readforest.readforest.client.KakaoBookApiClient;
import com.readforest.readforest.client.KakaoBookApiClient.KakaoBookResponse;
import com.readforest.readforest.dto.BookDto;
import com.readforest.readforest.dto.BookSearchResponseDto;
import com.readforest.readforest.exception.CustomException;
import com.readforest.readforest.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 도서 검색 서비스.
 *
 * <p>카카오 도서 검색 API를 호출하여 검색 결과를 앱 DTO로 변환해 반환한다.</p>
 */
@Service
@RequiredArgsConstructor
public class BookSearchService {

    private final KakaoBookApiClient kakaoBookApiClient;

    /**
     * 검색어로 도서 목록을 조회한다.
     *
     * @param query 검색 키워드
     * @param page  페이지 번호 (1부터 시작)
     * @param size  페이지당 결과 수
     * @return 도서 목록과 페이지네이션 메타 정보
     */
    public BookSearchResponseDto searchBooks(String query, int page, int size) {
        KakaoBookResponse response = kakaoBookApiClient.searchBooks(query, page, size);

        List<BookDto> books = response.getDocuments().stream()
                .map(BookDto::new)
                .toList();

        return new BookSearchResponseDto(
                books,
                response.getMeta().getTotalCount(),
                response.getMeta().isEnd()
        );
    }

    /**
     * ISBN으로 도서 단건 정보를 조회한다.
     *
     * <p>카카오 API 결과가 없으면 BOOK_NOT_FOUND 예외를 던진다.</p>
     *
     * @param isbn ISBN-10 또는 ISBN-13
     * @return 도서 단건 정보
     */
    public BookDto getBookByIsbn(String isbn) {
        KakaoBookResponse response = kakaoBookApiClient.searchByIsbn(isbn);

        return response.getDocuments().stream()
                .findFirst()
                .map(BookDto::new)
                .orElseThrow(() -> new CustomException(ErrorCode.BOOK_NOT_FOUND));
    }
}
