package com.harmadavtian.disneyapp.service;

import com.harmadavtian.disneyapp.dto.RagCitationDto;
import com.harmadavtian.disneyapp.dto.RagQueryRequestDto;
import com.harmadavtian.disneyapp.dto.RagQueryResponseDto;
import com.harmadavtian.disneyapp.model.ContentEmbedding;
import com.harmadavtian.disneyapp.repository.ContentEmbeddingRepository;
import com.harmadavtian.disneyapp.service.llm.LLMClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for RAG (Retrieval-Augmented Generation) queries.
 * 
 * Implements standard RAG workflow:
 * 1. Generate embedding for user query
 * 2. Retrieve top K similar embeddings from database
 * 3. Build prompt with retrieved context
 * 4. Generate response using LLM
 * 5. Return response with source citations
 * 
 * Features:
 * - Content type filtering (character, movie, park, attraction)
 * - Similarity score normalization (0.0-1.0)
 * - Query result caching (reduces API calls)
 * - Structured citations with excerpts
 * 
 * @author Harma Davtian
 */
@Service
public class RagService {

    private static final Logger logger = LoggerFactory.getLogger(RagService.class);

    private final LLMClient llmClient;
    private final ContentEmbeddingRepository embeddingRepository;
    private final CacheManager cacheManager;

    public RagService(LLMClient llmClient, ContentEmbeddingRepository embeddingRepository, CacheManager cacheManager) {
        this.llmClient = llmClient;
        this.embeddingRepository = embeddingRepository;
        this.cacheManager = cacheManager;
    }

    /**
     * Execute RAG query.
     * 
     * Cached by query + contentType to reduce API calls.
     * Cache key format: {query}_{contentType}
     * 
     * @param request Query request with query text and optional content type filter
     * @return Response with generated answer and source citations
     * @throws IllegalArgumentException if query is null or empty
     */
    public RagQueryResponseDto query(RagQueryRequestDto request) {
        if (request.getQuery() == null || request.getQuery().isBlank()) {
            throw new IllegalArgumentException("Query cannot be null or empty");
        }

        // Check if result is in cache using CacheManager
        String cacheKey = request.getQuery() + "_" + request.getContentType();
        Cache cache = cacheManager.getCache("rag-queries");

        if (cache != null) {
            Cache.ValueWrapper cachedValue = cache.get(cacheKey);
            if (cachedValue != null && cachedValue.get() != null) {
                logger.info("RAG query cache HIT: '{}'", request.getQuery());
                RagQueryResponseDto cachedResult = (RagQueryResponseDto) cachedValue.get();
                // Return cached result with cached flag set to true
                return new RagQueryResponseDto(
                        cachedResult.getAnswer(),
                        cachedResult.getSources(),
                        cachedResult.getQuery(),
                        true);
            }
        }

        logger.info("RAG query cache MISS: '{}'", request.getQuery());
        // Execute query and manually cache result
        RagQueryResponseDto response = executeQuery(request);

        // Manually put in cache
        if (cache != null) {
            cache.put(cacheKey, response);
        }

        return response;
    }

    /**
     * Execute RAG query (without caching logic).
     * 
     * @param request Query request
     * @return Response with cached flag set to false
     */
    private RagQueryResponseDto executeQuery(RagQueryRequestDto request) {
        logger.info("Processing RAG query: '{}' (type: {})", request.getQuery(), request.getContentType());

        // Step 1: Generate embedding for query
        float[] queryEmbedding = llmClient.generateEmbedding(request.getQuery());
        logger.debug("Generated query embedding: {} dimensions", queryEmbedding.length);

        // Step 2: Retrieve similar embeddings
        List<ContentEmbedding> similarEmbeddings = retrieveSimilarEmbeddings(
                queryEmbedding,
                request.getContentType(),
                request.getTopK() != null ? request.getTopK() : 5);
        logger.debug("Retrieved {} similar embeddings", similarEmbeddings.size());

        if (similarEmbeddings.isEmpty()) {
            logger.warn("No similar content found for query: '{}'", request.getQuery());
            return new RagQueryResponseDto(
                    "I couldn't find any relevant Disney content to answer your question. Please try rephrasing or ask about Disney characters, movies, or parks.",
                    new ArrayList<>(),
                    request.getQuery(),
                    false);
        }

        // Step 3: Build prompt with context
        String prompt = buildPrompt(request.getQuery(), similarEmbeddings);
        logger.debug("Built prompt: {} chars", prompt.length());

        // Step 4: Generate response
        String answer = llmClient.generateResponse(prompt);
        logger.debug("Generated answer: {} chars", answer.length());

        // Step 5: Build citations
        List<RagCitationDto> citations = buildCitations(similarEmbeddings, queryEmbedding);

        logger.info("RAG query complete: {} sources, {} chars answer", citations.size(), answer.length());

        return new RagQueryResponseDto(answer, citations, request.getQuery(), false);
    }

    /**
     * Retrieve top K similar embeddings from database.
     * 
     * Uses pgvector cosine distance for semantic similarity.
     * Filters by content type if specified.
     * 
     * @param queryEmbedding Query vector (768 dimensions)
     * @param contentType    Optional content type filter
     * @param topK           Number of results to retrieve (1-20)
     * @return List of similar embeddings, ordered by similarity
     */
    private List<ContentEmbedding> retrieveSimilarEmbeddings(
            float[] queryEmbedding,
            String contentType,
            int topK) {
        // Validate topK
        topK = Math.max(1, Math.min(topK, 20));

        String modelVersion = llmClient.getEmbeddingModelName();

        // If content type specified, filter by it
        if (contentType != null && !contentType.isBlank()) {
            return embeddingRepository.findTopKSimilarWithVectors(
                    queryEmbedding,
                    contentType,
                    modelVersion,
                    topK);
        } else {
            // Search across all content types (characters, movies, parks)
            return embeddingRepository.findTopKSimilarAllTypes(
                    queryEmbedding,
                    modelVersion,
                    topK);
        }
    }

    /**
     * Build prompt for LLM with retrieved context.
     * 
     * Prompt structure:
     * 1. System instructions (be helpful, cite sources)
     * 2. Context from similar embeddings
     * 3. User query
     * 
     * @param query      User query
     * @param embeddings Retrieved similar embeddings
     * @return Full prompt for LLM
     */
    private String buildPrompt(String query, List<ContentEmbedding> embeddings) {
        StringBuilder prompt = new StringBuilder();

        // System instructions
        prompt.append("You are a helpful Disney expert assistant. ");
        prompt.append("ONLY answer questions related to Disney. ");
        prompt.append(
                "If the user asks about non-Disney topics, politely decline and explain that you specialize in Disney content only. ");
        prompt.append("Suggest they use a general-purpose AI or search engine for non-Disney questions. ");
        prompt.append("\n\n");
        prompt.append("For Disney-related questions:\n");
        prompt.append("- Use the context provided below when it's relevant to the question.\n");
        prompt.append(
                "- If the context is about different Disney content than what the user asked, use your general Disney knowledge to help them.\n");
        prompt.append(
                "- For example, if they ask about 'Disneyland Tokyo' or 'Tokyo park', they likely mean Tokyo Disneyland or Tokyo DisneySea.\n");
        prompt.append("- Be conversational, friendly, and helpful.\n\n");

        // Context
        prompt.append("CONTEXT (may or may not be directly relevant):\n");
        for (int i = 0; i < embeddings.size(); i++) {
            ContentEmbedding emb = embeddings.get(i);
            prompt.append(String.format("[Source %d - %s]\n", i + 1, emb.getContentType()));
            prompt.append(emb.getTextContent());
            prompt.append("\n\n");
        }

        // User query
        prompt.append("QUESTION: ").append(query).append("\n\n");
        prompt.append("ANSWER:");

        return prompt.toString();
    }

    /**
     * Build citation list from retrieved embeddings.
     * 
     * Calculates similarity scores and creates citation DTOs.
     * Similarity score normalization: 1 - (distance / 2)
     * 
     * @param embeddings     Retrieved embeddings
     * @param queryEmbedding Query vector
     * @return List of citations with similarity scores
     */
    private List<RagCitationDto> buildCitations(
            List<ContentEmbedding> embeddings,
            float[] queryEmbedding) {
        return embeddings.stream()
                .map(emb -> {
                    // Calculate cosine similarity
                    double similarity = cosineSimilarity(queryEmbedding, emb.getEmbedding());

                    // Create excerpt (first 200 chars)
                    String excerpt = emb.getTextContent().length() > 200
                            ? emb.getTextContent().substring(0, 200) + "..."
                            : emb.getTextContent();

                    return new RagCitationDto(
                            emb.getContentType(),
                            emb.getContentId(),
                            extractContentName(emb.getTextContent()),
                            similarity,
                            excerpt);
                })
                .collect(Collectors.toList());
    }

    /**
     * Calculate cosine similarity between two vectors.
     * 
     * Formula: similarity = 1 - (dot(A, B) / (||A|| * ||B||))
     * Result: 0.0-1.0 where 1.0 = most similar
     * 
     * @param a First vector
     * @param b Second vector
     * @return Cosine similarity (0.0-1.0)
     */
    private double cosineSimilarity(float[] a, float[] b) {
        if (a.length != b.length) {
            throw new IllegalArgumentException("Vectors must have same dimensions");
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        // Return similarity score (higher is better)
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Extract content name from text content.
     * 
     * Tries to extract first line or first sentence as name.
     * Fallback: "Unknown"
     * 
     * @param textContent Full text content
     * @return Content name
     */
    private String extractContentName(String textContent) {
        if (textContent == null || textContent.isBlank()) {
            return "Unknown";
        }

        // Try to get first line
        String firstLine = textContent.split("\n")[0];
        if (firstLine.length() > 100) {
            // Too long, try first sentence
            String[] sentences = firstLine.split("\\.");
            if (sentences.length > 0 && sentences[0].length() <= 100) {
                return sentences[0].trim();
            }
            // Still too long, truncate
            return firstLine.substring(0, 97) + "...";
        }

        return firstLine.trim();
    }
}
