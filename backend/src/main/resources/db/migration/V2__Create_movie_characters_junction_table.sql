-- ============================================================================
-- V2__Create_movie_characters_junction_table.sql
-- 
-- Creates the junction table to establish many-to-many relationships between
-- movies and characters. This enables:
-- - Viewing all characters that appear in a specific movie
-- - Viewing all movies that feature a specific character
-- - Storing relationship metadata (role, importance, display order)
-- ============================================================================

-- Create movie_characters junction table
CREATE TABLE IF NOT EXISTS movie_characters (
    id BIGSERIAL PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    character_id BIGINT NOT NULL,
    
    -- Relationship metadata
    character_role VARCHAR(50),           -- protagonist, antagonist, sidekick, supporting, cameo
    importance_level INTEGER,             -- 1=primary, 2=secondary, 3=supporting, 4=minor, 5=cameo
    sort_order INTEGER DEFAULT 0,         -- Controls display order (lower = appears first)
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints with cascade delete
    -- If a movie is deleted, all its character relationships are deleted
    -- If a character is deleted, all its movie relationships are deleted
    CONSTRAINT fk_movie_characters_movie
        FOREIGN KEY (movie_id) 
        REFERENCES movies(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_movie_characters_character
        FOREIGN KEY (character_id) 
        REFERENCES characters(id) 
        ON DELETE CASCADE,
    
    -- Prevent duplicate relationships (same character can't be added to same movie twice)
    CONSTRAINT unique_movie_character 
        UNIQUE (movie_id, character_id)
);

-- Create indexes for optimal query performance
-- Index on movie_id for queries like "Get all characters for this movie"
CREATE INDEX IF NOT EXISTS idx_movie_characters_movie_id 
    ON movie_characters(movie_id);

-- Index on character_id for queries like "Get all movies for this character"
CREATE INDEX IF NOT EXISTS idx_movie_characters_character_id 
    ON movie_characters(character_id);

-- Index on sort_order for efficient ordering of results
CREATE INDEX IF NOT EXISTS idx_movie_characters_sort_order 
    ON movie_characters(sort_order);

-- Composite index for optimized filtering and sorting
-- Useful for queries like "Get characters for movie X ordered by importance and sort_order"
CREATE INDEX IF NOT EXISTS idx_movie_characters_movie_importance_sort 
    ON movie_characters(movie_id, importance_level, sort_order);

-- Add check constraints to ensure data quality
-- Ensure importance_level is between 1 and 5 if provided
ALTER TABLE movie_characters
    ADD CONSTRAINT chk_importance_level 
    CHECK (importance_level IS NULL OR (importance_level >= 1 AND importance_level <= 5));

-- Ensure sort_order is non-negative if provided
ALTER TABLE movie_characters
    ADD CONSTRAINT chk_sort_order 
    CHECK (sort_order >= 0);

-- Add comment to table for documentation
COMMENT ON TABLE movie_characters IS 
    'Junction table establishing many-to-many relationships between movies and characters. Includes metadata about character role, importance, and display order.';

-- Add comments to key columns
COMMENT ON COLUMN movie_characters.character_role IS 
    'Role of character in movie: protagonist, antagonist, sidekick, supporting, cameo';

COMMENT ON COLUMN movie_characters.importance_level IS 
    'Character importance: 1=primary/lead, 2=secondary, 3=supporting, 4=minor, 5=cameo';

COMMENT ON COLUMN movie_characters.sort_order IS 
    'Display order on UI (lower numbers appear first). Typically ordered by importance then alphabetically.';
