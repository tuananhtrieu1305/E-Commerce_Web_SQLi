package com.backend.backend.config;

import com.backend.backend.model.response.ApiResponse;
import com.backend.backend.utils.exception.DuplicateRecordException;
import com.backend.backend.utils.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Not Found Error (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        ApiResponse<?> response = ApiResponse.error(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    // ❌ VULNERABLE: ex.getMessage() trả nguyên SQL error cho client
    // → Lộ tên bảng, tên cột, cấu trúc query → Hỗ trợ Error-based SQLi
    // Fix: Thay bằng generic message "Internal Server Error" (xem backend-secure)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGlobalException(Exception ex, WebRequest request) {
        ApiResponse<?> response = ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error: " + ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Duplicate Error
    @ExceptionHandler(DuplicateRecordException.class)
    public ResponseEntity<ApiResponse<?>> handleDuplicateRecordException(DuplicateRecordException ex, WebRequest request) {
        ApiResponse<?> response = ApiResponse.error(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
