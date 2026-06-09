package com.readforest.readforest.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

public class ReadingRecordRequestDto {

    @Getter
    @Setter
    public static class Create {
        @NotNull(message = "현재 읽은 페이지 수는 필수 항목입니다.")
        @Min(value = 0, message = "현재 읽은 페이지 수는 0 이상이어야 합니다.")
        private Integer currentPage;
    }
}
