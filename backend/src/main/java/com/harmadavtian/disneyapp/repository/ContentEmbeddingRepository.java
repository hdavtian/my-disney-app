package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.ContentEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ContentEmbedding entities.
 * 
 * Provides standard CRUD operations plus custom pgvector similarity search.
 * Uses native SQL for pgvector operations since JPA doesn't natively support
 * vector types.
 * 
 * Key methods:
 * - findTopKSimilar: Semantic search using pgvector cosine distance
 * - findByContentTypeAndContentId: Exact lookup for smart re-embedding
 * - deleteByContentTypeAndContentId: Clean up embeddings when content deleted
 * 
 * @author Harma Davtian
 */
@Repository
public interface ContentEmbeddingRepository
                extends JpaRepository<ContentEmbedding, Long>, ContentEmbeddingRepositoryCustom {

        /**
         * Find top K most similar embeddings using pgvector cosine distance.
         * 
         * pgvector operators:
         * - <=> : cosine distance (0 = identical, 2 = opposite)
         * - <-> : L2 distance (euclidean)
         * - <#> : inner product (dot product)
         * 
         * We use cosine distance for semantic similarity (industry standard for text
         * embeddings).
         * 
         * Performance:
         * - Uses IVFFlat index for approximate nearest neighbor (ANN) search
         * - O(sqrt(n)) complexity with proper index (vs O(n) for brute force)
         * - Fast enough for 1K-100K vectors
         * 
         * @param queryEmbedding Vector representation of user query (768 dimensions)
         * @param contentType    Content type filter (character, movie, park,
         *                       attraction, hint)
         * @param modelVersion   Model version filter (ensures same embedding space)
         * @param limit          Number of results to return (typically 3-10)
         * @return List of most similar embeddings, ordered by similarity (closest
         *         first)
         */
        @Query(value = """
                        SELECT * FROM content_embeddings
                        WHERE content_type = :contentType
                        AND model_version = :modelVersion
                        ORDER BY embedding <=> CAST(:queryEmbedding AS vector)
                        LIMIT :limit
                        """, nativeQuery = true)
        List<ContentEmbedding> findTopKSimilar(
                        @Param("queryEmbedding") String queryEmbedding,
                        @Param("contentType") String contentType,
                        @Param("modelVersion") String modelVersion,
                        @Param("limit") int limit);

        /**
         * Find embedding for specific content.
         * Used for smart re-embedding detection and updates.
         * 
         * @param contentType  Content type (character, movie, etc.)
         * @param contentId    Foreign key to content table
         * @param modelVersion Model version (for version upgrades)
         * @return Optional embedding if exists
         */
        Optional<ContentEmbedding> findByContentTypeAndContentIdAndModelVersion(
                        String contentType,
                        Long contentId,
                        String modelVersion);

        /**
         * Find all embeddings for specific content (all model versions).
         * Used for debugging and migration.
         * 
         * @param contentType Content type (character, movie, etc.)
         * @param contentId   Foreign key to content table
         * @return List of embeddings (may have multiple versions)
         */
        List<ContentEmbedding> findByContentTypeAndContentId(String contentType, Long contentId);

        /**
         * Delete all embeddings for specific content.
         * Called when content is deleted from main tables.
         * 
         * @param contentType Content type (character, movie, etc.)
         * @param contentId   Foreign key to content table
         */
        void deleteByContentTypeAndContentId(String contentType, Long contentId);

        /**
         * Count embeddings by content type.
         * Used for admin dashboard and metrics.
         * 
         * @param contentType Content type (character, movie, etc.)
         * @return Count of embeddings
         */
        long countByContentType(String contentType);

        /**
         * Find all embeddings for a specific content type and model version.
         * Used for batch processing and model upgrades.
         * 
         * @param contentType  Content type (character, movie, etc.)
         * @param modelVersion Model version
         * @return List of embeddings
         */
        List<ContentEmbedding> findByContentTypeAndModelVersion(String contentType, String modelVersion);

        /**
         * Delete all embeddings efficiently using native SQL.
         * Much faster than deleteAll() which deletes one by one.
         * 
         * @return Number of embeddings deleted
         */
        @Query(value = "DELETE FROM content_embeddings", nativeQuery = true)
        @org.springframework.data.jpa.repository.Modifying
        int deleteAllEmbeddings();
}
