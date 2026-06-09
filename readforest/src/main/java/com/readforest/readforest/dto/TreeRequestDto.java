package com.readforest.readforest.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

public class TreeRequestDto {

    @Getter
    @Setter
    public static class Plant {
        @NotNull(message = "도서 ID는 필수 항목입니다.")
        private Long bookId;
    }
}
