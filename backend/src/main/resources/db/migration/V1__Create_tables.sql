-- NOTE: PostgreSQL cannot create a database from inside a Flyway SQL migration because
-- the connection must already target an existing database. Ensure the 'disneyapp' database
-- exists beforehand (e.g., created manually or via provisioning). These migrations are made
-- idempotent for tables to support repeated runs.

-- Create characters table (idempotent)
CREATE TABLE IF NOT EXISTS characters (
    id BIGSERIAL PRIMARY KEY,
    url_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_description TEXT,
    long_description TEXT,
    character_creation_year INTEGER,
    first_appearance VARCHAR(255),
    franchise VARCHAR(255),
    category VARCHAR(255),
    character_type VARCHAR(255),
    species VARCHAR(255),
    relationships TEXT,
    voice_actors TEXT,
    profile_image_1 VARCHAR(500),
    background_image_1 VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create movies table (idempotent)
CREATE TABLE IF NOT EXISTS movies (
    id BIGSERIAL PRIMARY KEY,
    published BOOLEAN,
    long_description TEXT,
    source_url VARCHAR(500),
    hidden_tags VARCHAR(255),
    movie_rating VARCHAR(10),
    has_link BOOLEAN,
    short_description TEXT,
    url_id VARCHAR(255) UNIQUE,
    title VARCHAR(255) NOT NULL,
    creation_year INTEGER,
    image_1 VARCHAR(255),
    image_2 VARCHAR(255)
);

-- Create hero_movie_carousel table to drive homepage (and other) carousels
CREATE TABLE IF NOT EXISTS hero_movie_carousel (
    id BIGSERIAL PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_hero_movie_movie FOREIGN KEY (movie_id)
        REFERENCES movies (id) ON DELETE CASCADE
);

-- ============================================================================
-- Movie-Character Relationships Junction Table
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
    CONSTRAINT fk_movie_characters_movie
        FOREIGN KEY (movie_id) 
        REFERENCES movies(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_movie_characters_character
        FOREIGN KEY (character_id) 
        REFERENCES characters(id) 
        ON DELETE CASCADE,
    
    -- Prevent duplicate relationships
    CONSTRAINT unique_movie_character 
        UNIQUE (movie_id, character_id)
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_movie_characters_movie_id 
    ON movie_characters(movie_id);

CREATE INDEX IF NOT EXISTS idx_movie_characters_character_id 
    ON movie_characters(character_id);

CREATE INDEX IF NOT EXISTS idx_movie_characters_sort_order 
    ON movie_characters(sort_order);

CREATE INDEX IF NOT EXISTS idx_movie_characters_movie_importance_sort 
    ON movie_characters(movie_id, importance_level, sort_order);

-- Add check constraints to ensure data quality
ALTER TABLE movie_characters
    ADD CONSTRAINT chk_importance_level 
    CHECK (importance_level IS NULL OR (importance_level >= 1 AND importance_level <= 5));

ALTER TABLE movie_characters
    ADD CONSTRAINT chk_sort_order 
    CHECK (sort_order >= 0);