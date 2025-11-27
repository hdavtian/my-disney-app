package com.harmadavtian.disneyapp.service.llm;

/**
 * Exception thrown when LLM service rate limit is exceeded.
 * 
 * Indicates that the application has exceeded API quotas:
 * - Gemini free tier: 60 requests/minute
 * - Gemini paid tier: 1000 requests/minute
 * 
 * Handling strategy:
 * - Return cached response if available
 * - Return 429 Too Many Requests to user
 * - Log incident for monitoring
 * - Consider implementing request queuing
 * 
 * @author Harma Davtian
 */
public class LLMRateLimitException extends RuntimeException {

    public LLMRateLimitException(String message) {
        super(message);
    }

    public LLMRateLimitException(String message, Throwable cause) {
        super(message, cause);
    }
}
