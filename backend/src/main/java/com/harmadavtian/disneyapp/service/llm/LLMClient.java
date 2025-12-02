package com.harmadavtian.disneyapp.service.llm;

/**
 * Provider-agnostic interface for LLM (Large Language Model) operations.
 * 
 * This interface abstracts LLM providers (Gemini, OpenAI, etc.) to enable:
 * - Easy provider switching (Gemini → OpenAI)
 * - Testing with mock implementations
 * - Future support for multiple providers
 * 
 * All implementations must handle:
 * - Network failures (retry with exponential backoff)
 * - Rate limiting (throw specific exception)
 * - Input validation (throw IllegalArgumentException)
 * 
 * @author Harma Davtian
 */
public interface LLMClient {

    /**
     * Generate vector embedding for text.
     * 
     * Converts text into semantic vector representation for similarity search.
     * Each provider may use different dimensions:
     * - Gemini: 768 dimensions (text-embedding-004)
     * - OpenAI: 1536 dimensions (text-embedding-3-small)
     * 
     * @param text     Text to embed (max 10,000 tokens)
     * @param taskType Task type for embedding optimization:
     *                 RETRIEVAL_DOCUMENT for stored content (characters, movies,
     *                 parks)
     *                 RETRIEVAL_QUERY for user search queries
     * @return Vector embedding (normalized to unit length)
     * @throws IllegalArgumentException if text is null, empty, or exceeds token
     *                                  limit
     * @throws LLMRateLimitException    if rate limit exceeded
     * @throws LLMServiceException      if API call fails after retries
     */
    float[] generateEmbedding(String text, String taskType);

    /**
     * Generate text response from prompt.
     * 
     * Sends prompt to LLM and returns generated text response.
     * Used for RAG responses with context injection.
     * 
     * @param prompt Full prompt including context and query
     * @return Generated text response
     * @throws IllegalArgumentException if prompt is null or empty
     * @throws LLMRateLimitException    if rate limit exceeded
     * @throws LLMServiceException      if API call fails after retries
     */
    String generateResponse(String prompt);

    /**
     * Get embedding model name.
     * Used for tracking which model version generated embeddings.
     * 
     * @return Model name (e.g., "gemini-text-embedding-004")
     */
    String getEmbeddingModelName();

    /**
     * Get generation model name.
     * Used for logging and debugging.
     * 
     * @return Model name (e.g., "gemini-1.5-flash")
     */
    String getGenerationModelName();
}
