# Disney Guessing Game: Data Design Document

## Overview
This document outlines the data design for the new Disney Guessing Game feature. The game requires a repository of hints for both Disney movies and characters. These hints must be curated to avoid revealing the answer directly (e.g., not mentioning the character's name in their own hint).

## Current State
- **Existing Tables**: `movies`, `characters`, `movie_characters` (junction).
- **Data Source**: JSON files (`disney_movies.json`, `disney_characters.json`) seeded into Postgres.
- **Observation**: Existing descriptions in `movies` and `characters` tables often contain the names of the entities, making them unsuitable for direct use as game hints without heavy sanitization.

## Proposed Approach
We agree with the recommendation to **create new tables** rather than altering existing ones. This approach offers several benefits:
1.  **Separation of Concerns**: Keeps game-specific data (hints) separate from core content (descriptions, metadata).
2.  **One-to-Many Relationship**: Allows multiple hints per movie or character.
3.  **Flexibility**: Enables adding metadata to hints (e.g., difficulty level, type) without cluttering the main tables.
4.  **Referential Integrity**: We can enforce strict foreign keys.

## Schema Design

We propose creating two new tables: `movie_hints` and `character_hints`.

### 1. Table: `movie_hints`

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Unique identifier for the hint. |
| `movie_id` | `BIGINT` | `NOT NULL`, `FK -> movies(id)` | The movie this hint belongs to. |
| `content` | `TEXT` | `NOT NULL` | The actual hint text (sanitized, no spoilers). |
| `difficulty` | `INTEGER` | `DEFAULT 1` | 1 (Easy) to 5 (Hard). Useful for game logic. |
| `hint_type` | `VARCHAR(50)` | | E.g., 'PLOT', 'QUOTE', 'TRIVIA', 'YEAR'. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | |

### 2. Table: `character_hints`

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Unique identifier for the hint. |
| `character_id` | `BIGINT` | `NOT NULL`, `FK -> characters(id)` | The character this hint belongs to. |
| `content` | `TEXT` | `NOT NULL` | The actual hint text. |
| `difficulty` | `INTEGER` | `DEFAULT 1` | 1 (Easy) to 5 (Hard). |
| `hint_type` | `VARCHAR(50)` | | E.g., 'BIO', 'QUOTE', 'APPEARANCE', 'RELATIONSHIP'. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | |

## Data Seeding Strategy

To populate these tables, we should introduce new JSON seed files following the pattern of the existing data loader.

- **New Files**:
    - `backend/src/main/resources/database/movie_hints.json`
    - `backend/src/main/resources/database/character_hints.json`

**Example JSON Structure (`movie_hints.json`):**
```json
[
  {
    "movie_url_id": "lion_king",
    "hints": [
      {
        "content": "This film features a villain who is the protagonist's uncle.",
        "difficulty": 1,
        "hint_type": "PLOT"
      },
      {
        "content": "Released in 1994, it became the highest-grossing traditionally animated film of all time.",
        "difficulty": 2,
        "hint_type": "TRIVIA"
      }
    ]
  }
]
```
*Note: We use `movie_url_id` in the JSON to look up the correct `movie_id` during seeding, as numeric IDs might vary or be auto-generated.*

## Alternative Considered: Single `hints` Table
A single table with `entity_type` ('MOVIE', 'CHARACTER') and `entity_id` was considered.
- **Pros**: Fewer tables.
- **Cons**: Cannot enforce foreign key constraints easily (Poly-morphic associations are weak in SQL).
- **Decision**: Separate tables are preferred for data integrity.

## Next Steps
1.  Approve this design.
2.  Create a new Flyway migration file (e.g., `V3__Create_hint_tables.sql`).
3.  Create the new JSON seed files with initial data.
4.  Update the data seeding logic (Java code) to parse and insert these hints.
