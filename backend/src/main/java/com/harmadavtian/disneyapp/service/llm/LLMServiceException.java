package com.harmadavtian.disneyapp.service.llm;

/**
 * Exception thrown when LLM service fails.
 * 
 * Indicates that the LLM API call failed after retry attempts:
 * - Network timeout (5s connect, 30s read)
 * - HTTP 500/502/503 server errors
 * - Invalid API response format
 * - Authentication failure
 * 
 * Handling strategy:
 * - Return cached response if available
 * - Return 503 Service Unavailable to user
 * - Log full stack trace for debugging
 * - Alert monitoring if frequent
 * 
 * @author Harma Davtian
 */
public class LLMServiceException extends RuntimeException {

    public LLMServiceException(String message) {
        super(message);
    }

    public LLMServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
