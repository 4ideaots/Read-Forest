package com.readforest.readforest.controller.book;

import com.readforest.readforest.dto.BookDto;
import com.readforest.readforest.dto.BookSearchResponseDto;
import com.readforest.readforest.service.BookSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 도서 검색 및 메타데이터 컨트롤러.
 *
 * <p>카카오 도서 검색 API와 연동하여 책 정보를 가져오는 읽기(Read) 전용 역할을 담당한다.</p>
 */
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookSearchController {

    private final BookSearchService bookSearchService;

    /**
     * 검색어로 도서 목록을 조회한다.
     *
     * @param query 검색 키워드
     * @param page  페이지 번호 (기본값: 1)
     * @param size  페이지당 결과 수 (기본값: 10)
     * @return 도서 목록과 전체 결과 수, 마지막 페이지 여부
     */
    @GetMapping("/search")
    public ResponseEntity<BookSearchResponseDto> searchBooks(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(bookSearchService.searchBooks(query, page, size));
    }

    /**
     * ISBN으로 도서 상세 정보를 조회한다.
     *
     * @param isbn 국제 표준 도서 번호 (ISBN-10 또는 ISBN-13)
     * @return 도서 상세 정보
     */
    @GetMapping("/{isbn}")
    public ResponseEntity<BookDto> getBookByIsbn(@PathVariable String isbn) {
        return ResponseEntity.ok(bookSearchService.getBookByIsbn(isbn));
    }
}
