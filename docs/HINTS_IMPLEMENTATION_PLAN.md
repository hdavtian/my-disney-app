# 🎯 Character & Movie Hints Implementation Plan

## 📋 Overview

Implementing Character Hints and Movie Hints feature with full backend API support, database tables, and seeding strategy.

---

## 📊 Implementation Phases

### ✅ Phase 1: Analysis & Planning

- [x] Analyze `character_hints.json` structure
- [x] Analyze `movie_hints.json` structure
- [x] Review existing migration patterns
- [x] Review existing controller patterns
- [x] Review existing model/DTO patterns
- [x] Review existing service patterns
- [x] Review existing repository patterns
- [x] Review existing seeding patterns
- [x] Create implementation plan document

### ✅ Phase 2: Database Migration

- [x] Create Flyway migration `V3__Create_hints_tables.sql`
  - [x] Create `character_hints` table
    - [x] Foreign key to `characters.url_id`
    - [x] Hint content, difficulty, hint_type
    - [x] Timestamps
  - [x] Create `movie_hints` table
    - [x] Foreign key to `movies.url_id`
    - [x] Hint content, difficulty, hint_type
    - [x] Timestamps
  - [x] Add proper indexes
  - [x] Add constraints
- [x] Verify migration syntax

### ✅ Phase 3: Model Classes

- [x] Create `CharacterHint.java` entity
  - [x] Add JPA annotations
  - [x] Add Lombok annotations
  - [x] Add relationship to Character entity
  - [x] Add enums for difficulty and hint_type
- [x] Create `MovieHint.java` entity
  - [x] Add JPA annotations
  - [x] Add Lombok annotations
  - [x] Add relationship to Movie entity
  - [x] Add enums for difficulty and hint_type
- [x] Update `Character.java` with hints relationship
- [x] Update `Movie.java` with hints relationship

### ✅ Phase 4: DTOs

- [x] Create `CharacterHintDto.java`
  - [x] Map all hint fields
  - [x] Add Swagger annotations
- [x] Create `MovieHintDto.java`
  - [x] Map all hint fields
  - [x] Add Swagger annotations

### ✅ Phase 5: Repositories

- [x] Create `CharacterHintRepository.java`
  - [x] Extend JpaRepository
  - [x] Add custom query methods
    - [x] `findByCharacterUrlId(String urlId)`
    - [x] `findTopNByCharacterUrlId(String urlId, Pageable pageable)`
- [x] Create `MovieHintRepository.java`
  - [x] Extend JpaRepository
  - [x] Add custom query methods
    - [x] `findByMovieUrlId(String urlId)`
    - [x] `findTopNByMovieUrlId(String urlId, Pageable pageable)`

### ✅ Phase 6: Services

- [x] Create `CharacterHintService.java`
  - [x] Implement `getAllHintsByCharacterUrlId(String urlId)`
  - [x] Implement `getNHintsByCharacterUrlId(String urlId, int count)`
  - [x] Add seeding logic (initial seed if empty)
  - [x] Add reseeding logic (delete all + insert all)
- [x] Create `MovieHintService.java`
  - [x] Implement `getAllHintsByMovieUrlId(String urlId)`
  - [x] Implement `getNHintsByMovieUrlId(String urlId, int count)`
  - [x] Add seeding logic (initial seed if empty)
  - [x] Add reseeding logic (delete all + insert all)

### ✅ Phase 7: Data Seeder Updates

- [x] Update `DataSeeder.java`
  - [x] Add character hints seeding in `run()` method
  - [x] Add movie hints seeding in `run()` method
  - [x] Create `seedCharacterHints()` method
  - [x] Create `seedMovieHints()` method
  - [x] Create `reseedCharacterHints()` method
  - [x] Create `reseedMovieHints()` method

### ✅ Phase 8: Controllers

- [x] Create `CharacterHintController.java`
  - [x] `GET /api/character-hints/{urlId}` - Get all hints for character
  - [x] `GET /api/character-hints/{urlId}/limited?count=5` - Get N hints
  - [x] Add Swagger documentation
  - [x] Add proper HTTP status codes
  - [x] Add validation
- [x] Create `MovieHintController.java`
  - [x] `GET /api/movie-hints/{urlId}` - Get all hints for movie
  - [x] `GET /api/movie-hints/{urlId}/limited?count=5` - Get N hints
  - [x] Add Swagger documentation
  - [x] Add proper HTTP status codes
  - [x] Add validation

### ✅ Phase 9: Admin Endpoints

- [x] Update `AdminController.java`
  - [x] Add `POST /api/admin/reseed-character-hints`
  - [x] Add `POST /api/admin/reseed-movie-hints`
  - [x] Add `POST /api/admin/reseed-all-hints`
  - [x] Update `reseed-all` endpoint to include hints
  - [x] Add Swagger documentation

### ✅ Phase 10: Build & Compile

- [x] Run Maven clean
- [x] Run Maven compile
- [x] Fix any compilation errors
- [x] Verify all annotations are correct

### ✅ Phase 11: Local Testing

- [x] Test Flyway migration
  - [x] Verify tables created
  - [x] Verify foreign keys
  - [x] Verify indexes
- [x] Test initial seeding
  - [x] Verify character hints loaded (3,440 hints)
  - [x] Verify movie hints loaded (15,840 hints)
  - [x] Verify foreign key validation skips invalid entries
- [x] Test Character Hints API
  - [x] Test `GET /api/character-hints/aladdin`
  - [x] Test `GET /api/character-hints/aladdin/limited?count=3`
  - [x] Verify response structure
  - [x] Test with invalid urlId
- [x] Test Movie Hints API
  - [x] Test `GET /api/movie-hints/frozen`
  - [x] Test `GET /api/movie-hints/frozen/limited?count=5`
  - [x] Verify response structure
  - [x] Test with invalid urlId
- [x] Test Admin Endpoints
  - [x] Test `POST /api/admin/reseed-character-hints`
  - [x] Test `POST /api/admin/reseed-movie-hints`
  - [x] Test `POST /api/admin/reseed-all` (verify hints included)

### ✅ Phase 12: cURL Testing

- [x] Test Character Hints endpoints with cURL
  - [x] Document test commands
  - [x] Verify all response codes
- [x] Test Movie Hints endpoints with cURL
  - [x] Document test commands
  - [x] Verify all response codes
- [x] Test Admin endpoints with cURL
  - [x] Document test commands
  - [x] Verify reseeding works

### ✅ Phase 13: Swagger UI Testing

- [x] Open Swagger UI (`http://localhost:8080/swagger-ui.html`)
- [x] Verify Character Hints endpoints appear
- [x] Verify Movie Hints endpoints appear
- [x] Test all endpoints through Swagger UI
- [x] Verify example values are helpful
- [x] Verify response schemas are accurate

### ✅ Phase 14: Documentation

- [x] Update main README.md
  - [x] Add Character Hints API section
  - [x] Add Movie Hints API section
  - [x] Add example endpoints
  - [x] Add cURL examples
- [x] Create detailed API documentation
  - [x] Document all hint types
  - [x] Document difficulty levels
  - [x] Document use cases

### ✅ Phase 15: Final Review

- [x] Code review all changes
- [x] Verify all checkboxes complete
- [x] Run full application test
- [x] Verify no regressions
- [x] Create summary report

---

## 📐 JSON Structure Analysis

### Character Hints Structure

```json
{
  "character_url_id": "aladdin",
  "hints": [
    {
      "content": "He is a 'diamond in the rough'.",
      "difficulty": 1,
      "hint_type": "BIO"
    },
    {
      "content": "His best friend is a monkey named Abu.",
      "difficulty": 1,
      "hint_type": "RELATIONSHIP"
    }
  ]
}
```

**Hint Types**: BIO, RELATIONSHIP, PLOT, QUOTE, TRIVIA, APPEARANCE
**Difficulty Levels**: 1 (Easy), 2 (Medium), 3 (Hard), 4 (Expert), 5 (Master)

### Movie Hints Structure

```json
{
  "movie_url_id": "snow_white_and_the_seven_dwarfs",
  "hints": [
    {
      "content": "It was the first full-length cel-animated feature in motion picture history.",
      "difficulty": 1,
      "hint_type": "TRIVIA"
    }
  ]
}
```

**Hint Types**: Same as character hints
**Difficulty Levels**: Same as character hints

---

## 🗄️ Database Schema

### character_hints table

```sql
CREATE TABLE character_hints (
    id BIGSERIAL PRIMARY KEY,
    character_url_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    hint_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_character_hints_character
        FOREIGN KEY (character_url_id)
        REFERENCES characters(url_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_difficulty
        CHECK (difficulty >= 1 AND difficulty <= 5)
);
```

### movie_hints table

```sql
CREATE TABLE movie_hints (
    id BIGSERIAL PRIMARY KEY,
    movie_url_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    hint_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movie_hints_movie
        FOREIGN KEY (movie_url_id)
        REFERENCES movies(url_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_difficulty
        CHECK (difficulty >= 1 AND difficulty <= 5)
);
```

---

## 🔗 API Endpoints Summary

### Character Hints API

- `GET /api/character-hints/{urlId}` - Get all hints for a character
- `GET /api/character-hints/{urlId}/limited?count=N` - Get N hints for a character

### Movie Hints API

- `GET /api/movie-hints/{urlId}` - Get all hints for a movie
- `GET /api/movie-hints/{urlId}/limited?count=N` - Get N hints for a movie

### Admin API

- `POST /api/admin/reseed-character-hints` - Reseed character hints from JSON
- `POST /api/admin/reseed-movie-hints` - Reseed movie hints from JSON
- `POST /api/admin/reseed-all-hints` - Reseed both hints tables
- `POST /api/admin/reseed-all` - Updated to include hints

---

## 🧪 Testing Strategy

### Test Cases

1. **Character Hints**

   - Get all hints for "aladdin"
   - Get 3 hints for "alice"
   - Get hints for non-existent character (404)
   - Verify foreign key constraint

2. **Movie Hints**

   - Get all hints for "frozen"
   - Get 5 hints for "tangled"
   - Get hints for non-existent movie (404)
   - Verify foreign key constraint

3. **Admin Operations**
   - Reseed character hints
   - Reseed movie hints
   - Verify counts match JSON files

---

## 📝 Notes

- Foreign keys use `url_id` not numeric `id` for flexibility
- Seeding only occurs if tables are empty (initial run)
- Admin endpoints allow manual reseeding
- Both tables include timestamps for audit purposes
- Constraints ensure data quality (difficulty 1-5)
- Indexes on foreign keys for performance

---

## ✅ Success Criteria

- [x] All database tables created successfully
- [x] All endpoints return correct data
- [x] Swagger UI documentation is complete
- [x] All cURL tests pass
- [x] No compilation errors
- [x] No runtime errors
- [x] README.md updated
- [x] All phases checked off

---

**Last Updated**: 2025-11-22
**Status**: ✅ COMPLETE - All phases implemented and tested successfully!
