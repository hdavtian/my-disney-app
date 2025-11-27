package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.ContentEmbedding;

import java.util.List;

/**
 * Custom repository interface for ContentEmbedding operations.
 * 
 * Provides manual handling of pgvector types which Hibernate doesn't support
 * natively.
 */
public interface ContentEmbeddingRepositoryCustom {

    /**
     * Find top K most similar embeddings using pgvector similarity search.
     * 
     * @param queryEmbedding Query vector as float array
     * @param contentType    Content type filter (character, movie, park)
     * @param modelVersion   Model version filter
     * @param limit          Number of results
     * @return List of similar embeddings with populated float[] arrays
     */
    List<ContentEmbedding> findTopKSimilarWithVectors(
            float[] queryEmbedding,
            String contentType,
            String modelVersion,
            int limit);

    /**
     * Save ContentEmbedding with vector conversion.
     * 
     * @param embedding ContentEmbedding to save (with float[] populated)
     * @return Saved entity
     */
    ContentEmbedding saveWithVector(ContentEmbedding embedding);
}
