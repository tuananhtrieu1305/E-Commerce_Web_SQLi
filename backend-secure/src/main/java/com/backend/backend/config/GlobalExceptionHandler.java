package com.backend.backend.config;

import com.backend.backend.model.response.ApiResponse;
import com.backend.backend.utils.exception.DuplicateRecordException;
import com.backend.backend.utils.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * ✅ SECURE: Hardened Global Exception Handler
 * - KHÔNG leak stack trace hoặc database metadata ra response
 * - Log chi tiết ở server side (cho developer debug)
 * - Trả generic message cho client
 * - Xử lý @Valid validation errors
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Not Found Error (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        logger.warn("Resource not found: {}", ex.getMessage());
        ApiResponse<?> response = ApiResponse.error(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    // Duplicate Error (400)
    @ExceptionHandler(DuplicateRecordException.class)
    public ResponseEntity<ApiResponse<?>> handleDuplicateRecordException(
            DuplicateRecordException ex, WebRequest request) {
        logger.warn("Duplicate record: {}", ex.getMessage());
        ApiResponse<?> response = ApiResponse.error(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // ✅ SECURE: Validation Error Handler (cho @Valid DTO)
    // Trả về danh sách field lỗi cụ thể để FE hiển thị
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage())
        );
        logger.warn("Validation failed: {}", fieldErrors);
        ApiResponse<Map<String, String>> response = new ApiResponse<>(
                HttpStatus.BAD_REQUEST.value(), "Validation failed", fieldErrors
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // ✅ SECURE: IllegalStateException (stock không đủ, etc.)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<?>> handleIllegalStateException(
            IllegalStateException ex, WebRequest request) {
        logger.warn("Illegal state: {}", ex.getMessage());
        ApiResponse<?> response = ApiResponse.error(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // ✅ SECURE: Catch-all — KHÔNG leak database metadata hoặc stack trace
    // Chỉ log chi tiết server side, trả generic message cho client
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGlobalException(Exception ex, WebRequest request) {
        // Log FULL error cho developer debug (chỉ xuất hiện ở server log)
        logger.error("Unhandled exception occurred: ", ex);

        // ✅ KHÔNG trả ex.getMessage() → tránh leak SQL error, table name, column info
        ApiResponse<?> response = ApiResponse.error(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected error occurred. Please try again later."
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
