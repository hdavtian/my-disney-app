package com.harmadavtian.disneyapp.service;

import com.harmadavtian.disneyapp.dto.RagCitationDto;
import com.harmadavtian.disneyapp.dto.RagQueryRequestDto;
import com.harmadavtian.disneyapp.dto.RagQueryResponseDto;
import com.harmadavtian.disneyapp.model.ContentEmbedding;
import com.harmadavtian.disneyapp.repository.ContentEmbeddingRepository;
import com.harmadavtian.disneyapp.service.llm.LLMClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
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

    public RagService(LLMClient llmClient, ContentEmbeddingRepository embeddingRepository) {
        this.llmClient = llmClient;
        this.embeddingRepository = embeddingRepository;
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
    @Cacheable(value = "rag-queries", key = "#request.query + '_' + #request.contentType")
    public RagQueryResponseDto query(RagQueryRequestDto request) {
        if (request.getQuery() == null || request.getQuery().isBlank()) {
            throw new IllegalArgumentException("Query cannot be null or empty");
        }

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

        // Convert embedding to PostgreSQL vector literal format: '[0.1, 0.2, ...]'
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < queryEmbedding.length; i++) {
            if (i > 0)
                sb.append(",");
            sb.append(queryEmbedding[i]);
        }
        sb.append("]");
        String vectorLiteral = sb.toString();

        // If content type specified, filter by it
        if (contentType != null && !contentType.isBlank()) {
            return embeddingRepository.findTopKSimilar(
                    vectorLiteral,
                    contentType,
                    llmClient.getEmbeddingModelName(),
                    topK);
        } else {
            // Search across all content types
            return embeddingRepository.findTopKSimilar(
                    vectorLiteral,
                    "character", // TODO: Support multi-type search
                    llmClient.getEmbeddingModelName(),
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
        prompt.append("Answer the user's question using ONLY the context provided below. ");
        prompt.append("If the context doesn't contain enough information, say so. ");
        prompt.append("Be conversational and friendly.\n\n");

        // Context
        prompt.append("CONTEXT:\n");
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
                    // Calculate cosine distance (for scoring purposes)
                    double distance = cosineSimilarity(queryEmbedding, emb.getEmbedding());

                    // Normalize to 0.0-1.0 (higher is better)
                    // pgvector cosine distance: 0 = identical, 2 = opposite
                    // Convert to similarity: 1 - (distance / 2)
                    double similarity = 1.0 - (distance / 2.0);

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
     * Formula: similarity = dot(A, B) / (||A|| * ||B||)
     * Result: 1.0 = identical, 0.0 = orthogonal, -1.0 = opposite
     * 
     * Note: pgvector embeddings are already normalized, so we can use dot product.
     * 
     * @param a First vector
     * @param b Second vector
     * @return Cosine similarity (0.0-2.0 for distance)
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

        return 1.0 - (dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)));
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
