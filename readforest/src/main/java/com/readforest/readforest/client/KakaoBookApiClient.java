package com.readforest.readforest.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

/**
 * 카카오 도서 검색 API 클라이언트.
 *
 * <p>카카오 REST API를 호출하여 도서 검색 결과를 가져온다.
 * API 문서: https://developers.kakao.com/docs/latest/ko/daum-search/dev-guide#search-book</p>
 */
@Component
@RequiredArgsConstructor
public class KakaoBookApiClient {

    private static final String BASE_URL = "https://dapi.kakao.com/v3/search/book";

    private final WebClient webClient;

    @Value("${kakao.api.key}")
    private String apiKey;

    /**
     * 검색어로 도서 목록을 조회한다.
     *
     * @param query 검색 키워드
     * @param page  페이지 번호 (1부터 시작)
     * @param size  페이지당 결과 수 (최대 50)
     * @return 카카오 API 응답 (meta + documents)
     */
    public KakaoBookResponse searchBooks(String query, int page, int size) {
        return webClient.get()
                .uri(BASE_URL, uriBuilder -> uriBuilder
                        .queryParam("query", query)
                        .queryParam("page", page)
                        .queryParam("size", size)
                        .build())
                .header("Authorization", "KakaoAK " + apiKey)
                .retrieve()
                .bodyToMono(KakaoBookResponse.class)
                .block();
    }

    /**
     * ISBN으로 도서 단건을 조회한다.
     *
     * @param isbn ISBN-10 또는 ISBN-13
     * @return 카카오 API 응답 (meta + documents)
     */
    public KakaoBookResponse searchByIsbn(String isbn) {
        return webClient.get()
                .uri(BASE_URL, uriBuilder -> uriBuilder
                        .queryParam("target", "isbn")
                        .queryParam("query", isbn)
                        .build())
                .header("Authorization", "KakaoAK " + apiKey)
                .retrieve()
                .bodyToMono(KakaoBookResponse.class)
                .block();
    }

    // ── 카카오 API 응답 매핑용 내부 클래스 ──────────────────────────────────

    /** 카카오 도서 검색 최상위 응답 */
    @Getter
    public static class KakaoBookResponse {
        private KakaoMeta meta;
        private List<KakaoDocument> documents;
    }

    /** 페이지네이션 메타 정보 */
    @Getter
    public static class KakaoMeta {
        @JsonProperty("total_count")
        private int totalCount;

        @JsonProperty("pageable_count")
        private int pageableCount;

        @JsonProperty("is_end")
        private boolean isEnd;
    }

    /** 도서 단건 정보 */
    @Getter
    public static class KakaoDocument {
        private String title;
        private String contents;
        private String isbn;
        private String thumbnail;
        private String publisher;
        private List<String> authors;
        private List<String> translators;
        private int price;

        @JsonProperty("sale_price")
        private int salePrice;

        private String status;
        private String url;
        private String datetime;
    }
}
