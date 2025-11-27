package com.harmadavtian.disneyapp.service.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Map;

/**
 * Google Gemini implementation of LLMClient.
 * 
 * Uses Gemini 1.5 Flash for text generation and text-embedding-004 for
 * embeddings.
 * Implements industry-standard patterns:
 * - RestTemplate with timeouts (5s connect, 30s read)
 * - Exponential backoff retry (3 attempts, 1s → 2s → 4s delays)
 * - Rate limit detection (429 status code)
 * - Structured error handling
 * 
 * API Endpoints:
 * - Embeddings: POST
 * https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent
 * - Generation: POST
 * https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
 * 
 * Cost (as of 2024):
 * - Embeddings: Free up to 1500 req/day, then $0.00001/1000 chars
 * - Generation: Free up to 15 req/min, then $0.075/1M input tokens, $0.30/1M
 * output tokens
 * 
 * @author Harma Davtian
 */
@Service
public class GeminiClient implements LLMClient {

    private static final Logger logger = LoggerFactory.getLogger(GeminiClient.class);

    private static final String EMBEDDING_MODEL = "text-embedding-004";
    private static final String GENERATION_MODEL = "gemini-1.5-flash";
    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final ObjectMapper objectMapper;

    public GeminiClient(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${gemini.api.key}") String apiKey,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
    }

    /**
     * Generate embedding using Gemini text-embedding-004.
     * 
     * API Request:
     * POST
     * https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={API_KEY}
     * Body: { "model": "models/text-embedding-004", "content": { "parts": [{
     * "text": "..." }] } }
     * 
     * API Response:
     * { "embedding": { "values": [0.123, -0.456, ...] } }
     * 
     * @param text Text to embed (max 10,000 tokens ≈ 40,000 chars)
     * @return 768-dimensional vector (float32 array)
     * @throws IllegalArgumentException if text is null, empty, or too long
     * @throws LLMRateLimitException    if 429 Too Many Requests
     * @throws LLMServiceException      if API fails after retries
     */
    @Override
    @Retryable(retryFor = {
            HttpServerErrorException.class }, maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2))
    public float[] generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Text cannot be null or empty");
        }
        if (text.length() > 40000) {
            throw new IllegalArgumentException("Text exceeds 40,000 character limit");
        }

        try {
            String url = String.format("%s/%s:embedContent?key=%s", BASE_URL, EMBEDDING_MODEL, apiKey);

            // Build request body
            Map<String, Object> requestBody = Map.of(
                    "model", "models/" + EMBEDDING_MODEL,
                    "content", Map.of(
                            "parts", new Object[] { Map.of("text", text) }));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            logger.debug("Generating embedding for text: {} chars", text.length());

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    String.class);

            // Parse response
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode valuesNode = root.path("embedding").path("values");

            if (!valuesNode.isArray()) {
                throw new LLMServiceException("Invalid embedding response format");
            }

            float[] embedding = new float[valuesNode.size()];
            for (int i = 0; i < valuesNode.size(); i++) {
                embedding[i] = (float) valuesNode.get(i).asDouble();
            }

            logger.debug("Generated embedding: {} dimensions", embedding.length);
            return embedding;

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                logger.warn("Gemini rate limit exceeded");
                throw new LLMRateLimitException("Rate limit exceeded", e);
            }
            logger.error("Gemini API client error: {}", e.getMessage());
            throw new LLMServiceException("Failed to generate embedding", e);
        } catch (HttpServerErrorException e) {
            logger.error("Gemini API server error: {}", e.getMessage());
            throw new LLMServiceException("Gemini server error", e);
        } catch (Exception e) {
            logger.error("Unexpected error generating embedding", e);
            throw new LLMServiceException("Failed to generate embedding", e);
        }
    }

    /**
     * Generate text response using Gemini 1.5 Flash.
     * 
     * API Request:
     * POST
     * https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}
     * Body: { "contents": [{ "parts": [{ "text": "..." }] }] }
     * 
     * API Response:
     * { "candidates": [{ "content": { "parts": [{ "text": "..." }] } }] }
     * 
     * @param prompt Full prompt including context and query
     * @return Generated text response
     * @throws IllegalArgumentException if prompt is null or empty
     * @throws LLMRateLimitException    if 429 Too Many Requests
     * @throws LLMServiceException      if API fails after retries
     */
    @Override
    @Retryable(retryFor = {
            HttpServerErrorException.class }, maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2))
    public String generateResponse(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("Prompt cannot be null or empty");
        }

        try {
            String url = String.format("%s/%s:generateContent?key=%s", BASE_URL, GENERATION_MODEL, apiKey);

            // Build request body
            Map<String, Object> requestBody = Map.of(
                    "contents", new Object[] {
                            Map.of("parts", new Object[] { Map.of("text", prompt) })
                    });

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            logger.debug("Generating response for prompt: {} chars", prompt.length());

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    String.class);

            // Parse response
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text");

            if (textNode.isMissingNode()) {
                throw new LLMServiceException("Invalid generation response format");
            }

            String generatedText = textNode.asText();
            logger.debug("Generated response: {} chars", generatedText.length());
            return generatedText;

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                logger.warn("Gemini rate limit exceeded");
                throw new LLMRateLimitException("Rate limit exceeded", e);
            }
            logger.error("Gemini API client error: {}", e.getMessage());
            throw new LLMServiceException("Failed to generate response", e);
        } catch (HttpServerErrorException e) {
            logger.error("Gemini API server error: {}", e.getMessage());
            throw new LLMServiceException("Gemini server error", e);
        } catch (Exception e) {
            logger.error("Unexpected error generating response", e);
            throw new LLMServiceException("Failed to generate response", e);
        }
    }

    @Override
    public String getEmbeddingModelName() {
        return EMBEDDING_MODEL;
    }

    @Override
    public String getGenerationModelName() {
        return GENERATION_MODEL;
    }
}
