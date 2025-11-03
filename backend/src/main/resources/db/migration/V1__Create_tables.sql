-- NOTE: PostgreSQL cannot create a database from inside a Flyway SQL migration because
-- the connection must already target an existing database. Ensure the 'disneyapp' database
-- exists beforehand (e.g., created manually or via provisioning). These migrations are made
-- idempotent for tables to support repeated runs.

-- Create characters table (idempotent)
CREATE TABLE IF NOT EXISTS characters (
    id BIGSERIAL PRIMARY KEY,
    url_id VARCHAR(255),
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
    url_id VARCHAR(255),
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