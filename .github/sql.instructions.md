# Copilot SQL and Database Rules

- For local development, use **PostgreSQL** as the database, currently installed via Docker on port 5432:5432, u: postgres, p: amelia
- Use **Flyway** for migrations and schema versioning.
- Migration files:
  - Create tables and constraints only (no seed data).
  - Naming: `V1__create_characters_table.sql`, `V2__create_movies_table.sql`
- Data seeding: load JSON via backend code.
- Use **snake_case** for table and column names.
- Add SQL comments for clarity when queries are nontrivial.
- Maintain referential integrity with proper foreign keys.
- Optimize indexes for primary lookup columns (e.g., `id`, `character_name`).
- Avoid using database-specific syntax unless absolutely necessary.
