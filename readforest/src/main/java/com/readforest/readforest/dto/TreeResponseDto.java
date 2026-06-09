package com.readforest.readforest.dto;

import com.readforest.readforest.domain.Tree;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

public class TreeResponseDto {

    @Getter
    @Builder
    public static class Detail {
        private Long id;
        private Long bookId;
        private String bookTitle;
        private String bookAuthor;
        private String bookGenre;
        private Integer bookTotalPage;
        private Integer currentPage;
        private Double growthRate;
        private String vitality;
        private Boolean isCompleted;
        private LocalDateTime lastUpdatedAt;
        private LocalDateTime createdAt;

        public static Detail from(Tree tree) {
            return Detail.builder()
                    .id(tree.getId())
                    .bookId(tree.getBook().getId())
                    .bookTitle(tree.getBook().getTitle())
                    .bookAuthor(tree.getBook().getAuthor())
                    .bookGenre(tree.getBook().getGenre())
                    .bookTotalPage(tree.getBook().getTotalPage())
                    .currentPage(tree.getCurrentPage())
                    .growthRate(tree.getGrowthRate())
                    .vitality(tree.getVitality().name())
                    .isCompleted(tree.getIsCompleted())
                    .lastUpdatedAt(tree.getLastUpdatedAt())
                    .createdAt(tree.getCreatedAt())
                    .build();
        }
    }
}
