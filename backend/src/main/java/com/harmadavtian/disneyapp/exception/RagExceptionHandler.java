package com.harmadavtian.disneyapp.exception;

import com.harmadavtian.disneyapp.service.llm.LLMRateLimitException;
import com.harmadavtian.disneyapp.service.llm.LLMServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Global exception handler for RAG-related errors.
 * 
 * Handles LLM service exceptions and converts them to appropriate HTTP
 * responses.
 * 
 * @author Harma Davtian
 */
@RestControllerAdvice
public class RagExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(RagExceptionHandler.class);

    /**
     * Handle LLM rate limit exceptions.
     * Returns 429 Too Many Requests with retry-after suggestion.
     * 
     * @param e Rate limit exception
     * @return 429 response with error details
     */
    @ExceptionHandler(LLMRateLimitException.class)
    public ResponseEntity<Map<String, Object>> handleRateLimitException(LLMRateLimitException e) {
        logger.warn("LLM rate limit exceeded: {}", e.getMessage());

        Map<String, Object> errorResponse = Map.of(
                "error", "Rate limit exceeded",
                "message", "Too many requests to LLM service. Please try again later.",
                "retry_after_seconds", 60);

        return ResponseEntity
                .status(HttpStatus.TOO_MANY_REQUESTS)
                .body(errorResponse);
    }

    /**
     * Handle LLM service exceptions.
     * Returns 503 Service Unavailable with error details.
     * 
     * @param e Service exception
     * @return 503 response with error details
     */
    @ExceptionHandler(LLMServiceException.class)
    public ResponseEntity<Map<String, Object>> handleServiceException(LLMServiceException e) {
        logger.error("LLM service error: {}", e.getMessage(), e);

        Map<String, Object> errorResponse = Map.of(
                "error", "Service unavailable",
                "message", "LLM service is temporarily unavailable. Please try again later.");

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(errorResponse);
    }

    /**
     * Handle illegal argument exceptions (validation errors).
     * Returns 400 Bad Request with validation error details.
     * 
     * @param e Validation exception
     * @return 400 response with error details
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(IllegalArgumentException e) {
        logger.warn("Validation error: {}", e.getMessage());

        Map<String, Object> errorResponse = Map.of(
                "error", "Validation error",
                "message", e.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }
}
