-- V4: Add RAG (Retrieval-Augmented Generation) Support
-- Enables pgvector extension and creates embeddings table for semantic search

-- Enable pgvector extension (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table (industry-standard schema)
-- Stores vector embeddings for all content types (characters, movies, parks, attractions, hints)
CREATE TABLE content_embeddings (
    embedding_id BIGSERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_id BIGINT NOT NULL,
    text_content TEXT NOT NULL,  -- Store original text for reranking/debugging
    embedding vector(768) NOT NULL,  -- Gemini embedding dimensions
    model_version VARCHAR(100) NOT NULL DEFAULT 'gemini-text-embedding-004',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_content_embedding UNIQUE (content_type, content_id, model_version)
);

-- Create pgvector index for similarity search
-- IVFFlat: Good for 1K-1M vectors, fast approximate search
-- lists=100: Rule of thumb = sqrt(total_rows), adjust based on actual data size
CREATE INDEX idx_embeddings_vector ON content_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create B-tree index for exact lookups (smart detection, updates)
CREATE INDEX idx_embeddings_lookup ON content_embeddings (content_type, content_id, model_version);

-- Create index for filtering by content type (when users filter results)
CREATE INDEX idx_embeddings_content_type ON content_embeddings (content_type);

-- Update trigger to set updated_at timestamp (PostgreSQL standard pattern)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_embeddings_updated_at 
    BEFORE UPDATE ON content_embeddings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
