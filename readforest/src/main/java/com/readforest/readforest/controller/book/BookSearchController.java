package com.readforest.readforest.controller.book;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

/**
 * 도서 검색 및 메타데이터 컨트롤러.
 *
 * <p>외부 API(카카오/알라딘)와 연동하여 책 정보를 가져오는 읽기(Read) 전용 역할을 담당한다.</p>
 */
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookSearchController {

    /**
     * 도서를 검색한다.
     *
     * <p>검색어를 기반으로 외부 API를 통해 도서 목록을 조회한다.</p>
     *
     * @param query 검색 키워드
     * @param page  페이지 번호 (기본값: 1)
     * @param size  페이지당 결과 수 (기본값: 10)
     * @return 검색된 도서 목록
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchBooks(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Collections.emptyList());
    }

    /**
     * ISBN으로 도서 상세 정보를 조회한다.
     *
     * <p>ISBN을 기반으로 외부 API에서 해당 도서의 메타데이터를 가져온다.</p>
     *
     * @param isbn 국제 표준 도서 번호 (ISBN)
     * @return 도서 상세 정보
     */
    @GetMapping("/{isbn}")
    public ResponseEntity<?> getBookByIsbn(@PathVariable String isbn) {
        // TODO: 서비스 로직 연결
        return ResponseEntity.ok(Collections.emptyMap());
    }
}
