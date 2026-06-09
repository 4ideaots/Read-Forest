package com.readforest.readforest.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    BOOK_NOT_FOUND(HttpStatus.NOT_FOUND, "도서를 찾을 수 없습니다."),
    TREE_NOT_FOUND(HttpStatus.NOT_FOUND, "나무를 찾을 수 없습니다."),
    ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "아이템을 찾을 수 없습니다."),
    INVALID_PAGE_NUMBER(HttpStatus.BAD_REQUEST, "현재 페이지가 총 페이지 수를 초과할 수 없으며, 기존 페이지보다 작을 수 없습니다."),
    INSUFFICIENT_ITEM(HttpStatus.BAD_REQUEST, "소유하지 않은 아이템은 배치할 수 없습니다.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}
