package com.readforest.readforest.service;

import com.readforest.readforest.domain.Book;
import com.readforest.readforest.dto.BookCreateRequestDto;
import com.readforest.readforest.dto.BookResponseDto;
import com.readforest.readforest.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.util.StringUtils;

/**
 * 도서 영속화 서비스.
 *
 * <p>검색/직접입력으로 얻은 도서 정보를 DB에 저장한다. ISBN이 있으면 이미
 * 등록된 동일 도서를 재사용하여 중복 저장을 방지한다.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookService {

    private final BookRepository bookRepository;

    /**
     * 도서를 등록한다. 동일 ISBN의 도서가 이미 있으면 그것을 반환한다.
     *
     * @param request 도서 등록 요청
     * @return 저장(또는 기존) 도서 정보
     */
    @Transactional
    public BookResponseDto createBook(BookCreateRequestDto request) {
        if (StringUtils.hasText(request.getIsbn())) {
            Book existing = bookRepository.findByIsbn(request.getIsbn()).orElse(null);
            if (existing != null) {
                return BookResponseDto.from(existing);
            }
        }

        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .genre(request.getGenre())
                .totalPage(request.getTotalPage())
                .coverImageUrl(request.getCoverImageUrl())
                .isbn(StringUtils.hasText(request.getIsbn()) ? request.getIsbn() : null)
                .build();

        return BookResponseDto.from(bookRepository.save(book));
    }
}
