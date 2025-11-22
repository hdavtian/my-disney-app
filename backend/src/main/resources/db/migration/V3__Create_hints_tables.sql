-- ============================================================================
-- V3: Character and Movie Hints Tables
-- 
-- Creates tables to store hints for Disney characters and movies.
-- Used for quiz games and interactive features.
-- ============================================================================

-- ============================================================================
-- Character Hints Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS character_hints (
    id BIGSERIAL PRIMARY KEY,
    character_url_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    hint_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint to characters table (using url_id)
    CONSTRAINT fk_character_hints_character
        FOREIGN KEY (character_url_id) 
        REFERENCES characters(url_id) 
        ON DELETE CASCADE,
    
    -- Ensure difficulty is between 1 and 5
    CONSTRAINT chk_character_hints_difficulty 
        CHECK (difficulty >= 1 AND difficulty <= 5),
    
    -- Ensure hint_type is valid
    CONSTRAINT chk_character_hints_type
        CHECK (hint_type IN ('BIO', 'RELATIONSHIP', 'PLOT', 'QUOTE', 'TRIVIA', 'APPEARANCE'))
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_character_hints_character_url_id 
    ON character_hints(character_url_id);

CREATE INDEX IF NOT EXISTS idx_character_hints_difficulty 
    ON character_hints(difficulty);

CREATE INDEX IF NOT EXISTS idx_character_hints_type 
    ON character_hints(hint_type);

CREATE INDEX IF NOT EXISTS idx_character_hints_character_difficulty 
    ON character_hints(character_url_id, difficulty);

-- ============================================================================
-- Movie Hints Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS movie_hints (
    id BIGSERIAL PRIMARY KEY,
    movie_url_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    hint_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint to movies table (using url_id)
    CONSTRAINT fk_movie_hints_movie
        FOREIGN KEY (movie_url_id) 
        REFERENCES movies(url_id) 
        ON DELETE CASCADE,
    
    -- Ensure difficulty is between 1 and 5
    CONSTRAINT chk_movie_hints_difficulty 
        CHECK (difficulty >= 1 AND difficulty <= 5),
    
    -- Ensure hint_type is valid
    CONSTRAINT chk_movie_hints_type
        CHECK (hint_type IN ('BIO', 'RELATIONSHIP', 'PLOT', 'QUOTE', 'TRIVIA', 'APPEARANCE'))
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_movie_hints_movie_url_id 
    ON movie_hints(movie_url_id);

CREATE INDEX IF NOT EXISTS idx_movie_hints_difficulty 
    ON movie_hints(difficulty);

CREATE INDEX IF NOT EXISTS idx_movie_hints_type 
    ON movie_hints(hint_type);

CREATE INDEX IF NOT EXISTS idx_movie_hints_movie_difficulty 
    ON movie_hints(movie_url_id, difficulty);
