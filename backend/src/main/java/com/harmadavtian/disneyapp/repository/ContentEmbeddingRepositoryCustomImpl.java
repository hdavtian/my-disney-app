package com.harmadavtian.disneyapp.repository;

import com.harmadavtian.disneyapp.model.ContentEmbedding;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

/**
 * Custom repository implementation for manual pgvector handling.
 * 
 * This is the mainstream production approach: use native SQL with JDBC
 * to handle PostgreSQL vector types that Hibernate doesn't support.
 */
@Repository
public class ContentEmbeddingRepositoryCustomImpl implements ContentEmbeddingRepositoryCustom {

    private final DataSource dataSource;

    public ContentEmbeddingRepositoryCustomImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<ContentEmbedding> findTopKSimilarWithVectors(
            float[] queryEmbedding,
            String contentType,
            String modelVersion,
            int limit) {

        List<ContentEmbedding> results = new ArrayList<>();

        // Convert float[] to PostgreSQL vector string format: [1.0,2.0,3.0]
        String vectorString = floatArrayToVectorString(queryEmbedding);

        // Native SQL with vector operations
        String sql = """
                SELECT embedding_id, content_type, content_id, text_content,
                       embedding::text as embedding_text, model_version, created_at, updated_at
                FROM content_embeddings
                WHERE content_type = :contentType
                AND model_version = :modelVersion
                ORDER BY embedding <=> CAST(:queryEmbedding AS vector)
                LIMIT :limit
                """;

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql
                        .replace(":contentType", "?")
                        .replace(":modelVersion", "?")
                        .replace(":queryEmbedding", "?")
                        .replace(":limit", "?"))) {

            stmt.setString(1, contentType);
            stmt.setString(2, modelVersion);
            stmt.setString(3, vectorString);
            stmt.setInt(4, limit);

            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                ContentEmbedding emb = new ContentEmbedding();
                emb.setEmbeddingId(rs.getLong("embedding_id"));
                emb.setContentType(rs.getString("content_type"));
                emb.setContentId(rs.getLong("content_id"));
                emb.setTextContent(rs.getString("text_content"));
                emb.setModelVersion(rs.getString("model_version"));
                emb.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                emb.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());

                // Convert vector text back to float[]
                String vectorText = rs.getString("embedding_text");
                emb.setEmbedding(vectorStringToFloatArray(vectorText));

                results.add(emb);
            }

            rs.close();

        } catch (Exception e) {
            throw new RuntimeException("Failed to query similar embeddings", e);
        }

        return results;
    }

    @Override
    @Transactional
    public ContentEmbedding saveWithVector(ContentEmbedding embedding) {
        String vectorString = floatArrayToVectorString(embedding.getEmbedding());

        String sql = """
                INSERT INTO content_embeddings
                (content_type, content_id, text_content, embedding, model_version)
                VALUES (?, ?, ?, CAST(? AS vector), ?)
                RETURNING embedding_id, created_at, updated_at
                """;

        try (Connection conn = dataSource.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, embedding.getContentType());
            stmt.setLong(2, embedding.getContentId());
            stmt.setString(3, embedding.getTextContent());
            stmt.setString(4, vectorString);
            stmt.setString(5, embedding.getModelVersion());

            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                embedding.setEmbeddingId(rs.getLong("embedding_id"));
                embedding.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                embedding.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
            }

            rs.close();

        } catch (Exception e) {
            throw new RuntimeException("Failed to save embedding with vector", e);
        }

        return embedding;
    }

    /**
     * Convert float[] to PostgreSQL vector string format.
     * Example: [1.0, 2.0, 3.0] -> "[1.0,2.0,3.0]"
     */
    private String floatArrayToVectorString(float[] array) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < array.length; i++) {
            if (i > 0)
                sb.append(",");
            sb.append(array[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Convert PostgreSQL vector string to float[].
     * Example: "[1.0,2.0,3.0]" -> [1.0, 2.0, 3.0]
     */
    private float[] vectorStringToFloatArray(String vectorString) {
        // Remove brackets
        String cleaned = vectorString.substring(1, vectorString.length() - 1);
        String[] parts = cleaned.split(",");

        float[] array = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            array[i] = Float.parseFloat(parts[i].trim());
        }

        return array;
    }
}
