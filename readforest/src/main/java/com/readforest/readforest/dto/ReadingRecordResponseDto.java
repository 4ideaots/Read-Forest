package com.readforest.readforest.dto;

import com.readforest.readforest.domain.ReadingRecord;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

public class ReadingRecordResponseDto {

    @Getter
    @Builder
    public static class Detail {
        private Long id;
        private Long treeId;
        private Integer readPages;
        private Integer currentPage;
        private LocalDateTime createdAt;

        public static Detail from(ReadingRecord record) {
            return Detail.builder()
                    .id(record.getId())
                    .treeId(record.getTree().getId())
                    .readPages(record.getReadPages())
                    .currentPage(record.getCurrentPage())
                    .createdAt(record.getCreatedAt())
                    .build();
        }
    }
}
