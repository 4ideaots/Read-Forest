package com.readforest.readforest.controller.book;

import com.readforest.readforest.dto.BookCreateRequestDto;
import com.readforest.readforest.dto.BookResponseDto;
import com.readforest.readforest.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 도서 등록 컨트롤러.
 *
 * <p>검색(읽기) 전용인 {@code BookSearchController}와 분리하여,
 * 도서 메타데이터를 DB에 영속화하는 쓰기(Create) 책임을 담당한다.
 * 나무 심기 전에 도서 레코드를 먼저 생성하는 용도로 사용된다.</p>
 */
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    /**
     * 도서를 등록한다.
     *
     * @param request 도서 등록 요청 (제목, 저자, 장르, 총 페이지, 표지, ISBN)
     * @return 생성된(또는 기존) 도서 정보, HTTP 201
     */
    @PostMapping
    public ResponseEntity<BookResponseDto> createBook(@Valid @RequestBody BookCreateRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.createBook(request));
    }
}
