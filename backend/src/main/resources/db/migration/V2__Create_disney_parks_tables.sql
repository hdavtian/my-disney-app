-- ============================================================================
-- Flyway Migration V2: Disney Parks & Attractions Tables
-- 
-- Purpose: Add support for Disney theme parks worldwide and their attractions
-- 
-- Tables Created:
--   1. disney_parks - Information about 12 Disney theme parks globally
--   2. disney_parks_attractions - Major attractions, shows, parades at each park
-- 
-- Relationships:
--   - disney_parks_attractions.park_url_id -> disney_parks.url_id (CASCADE DELETE)
-- 
-- Safety: All DDL operations are idempotent (IF NOT EXISTS)
-- ============================================================================

-- ======================
-- Disney Parks Table
-- ======================
CREATE TABLE IF NOT EXISTS disney_parks (
    id BIGSERIAL PRIMARY KEY,
    url_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    resort VARCHAR(255),
    city VARCHAR(255),
    state_region VARCHAR(255),
    country VARCHAR(100) NOT NULL,
    opening_date DATE,
    park_type VARCHAR(50),
    is_castle_park BOOLEAN DEFAULT FALSE,
    area_acres INTEGER,
    theme TEXT,
    short_description TEXT,
    long_description TEXT,
    official_website VARCHAR(500),
    image_1 VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parks Indexes
CREATE INDEX IF NOT EXISTS idx_disney_parks_url_id 
    ON disney_parks(url_id);
    
CREATE INDEX IF NOT EXISTS idx_disney_parks_country 
    ON disney_parks(country);
    
CREATE INDEX IF NOT EXISTS idx_disney_parks_resort 
    ON disney_parks(resort);

-- ======================
-- Disney Parks Attractions Table
-- ======================
CREATE TABLE IF NOT EXISTS disney_parks_attractions (
    id BIGSERIAL PRIMARY KEY,
    url_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    park_url_id VARCHAR(255) NOT NULL,
    land_area VARCHAR(255),
    attraction_type VARCHAR(100),
    opening_date DATE,
    thrill_level VARCHAR(50),
    theme TEXT,
    short_description TEXT,
    is_operational BOOLEAN DEFAULT TRUE,
    duration_minutes INTEGER,
    height_requirement_inches INTEGER,
    image_1 VARCHAR(500),
    image_2 VARCHAR(500),
    image_3 VARCHAR(500),
    image_4 VARCHAR(500),
    image_5 VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraint
    CONSTRAINT fk_attraction_park
        FOREIGN KEY (park_url_id) 
        REFERENCES disney_parks(url_id) 
        ON DELETE CASCADE
);

-- Attractions Indexes
CREATE INDEX IF NOT EXISTS idx_attractions_url_id 
    ON disney_parks_attractions(url_id);
    
CREATE INDEX IF NOT EXISTS idx_attractions_park_url_id 
    ON disney_parks_attractions(park_url_id);
    
CREATE INDEX IF NOT EXISTS idx_attractions_type 
    ON disney_parks_attractions(attraction_type);
    
CREATE INDEX IF NOT EXISTS idx_attractions_operational 
    ON disney_parks_attractions(is_operational);
    
CREATE INDEX IF NOT EXISTS idx_attractions_thrill 
    ON disney_parks_attractions(thrill_level);

-- Composite index for common query pattern: all attractions per park
CREATE INDEX IF NOT EXISTS idx_attractions_park_operational 
    ON disney_parks_attractions(park_url_id, is_operational);

-- ======================
-- Data Quality Constraints
-- ======================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_height_requirement'
    ) THEN
        ALTER TABLE disney_parks_attractions
            ADD CONSTRAINT chk_height_requirement 
            CHECK (height_requirement_inches IS NULL OR height_requirement_inches >= 0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_duration'
    ) THEN
        ALTER TABLE disney_parks_attractions
            ADD CONSTRAINT chk_duration 
            CHECK (duration_minutes IS NULL OR duration_minutes > 0);
    END IF;
END $$;

-- ======================
-- Migration Complete
-- ======================
-- This migration is idempotent and safe to run multiple times
-- Tables will only be created if they don't already exist
