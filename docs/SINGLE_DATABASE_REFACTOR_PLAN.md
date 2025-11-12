# Single Database Refactor Plan

**Date**: November 10, 2025  
**Goal**: Transition from multi-database architecture to single database with table prefixes  
**Project**: hd-demos-api (Unified API Hub)

---

## Problem Statement

Current multi-database approach (separate `disneyapp` and `sierra_games` databases) is incompatible with Spring Boot 3.x defaults when all entities share the same package (`com.harmadavtian.shared.model`). Spring Boot's EntityManagerFactory cannot easily isolate which entities belong to which datasource.

**Architecture Decision**: Switch to single database (`hd_demos`) with table prefixes for logical separation.

---

## Architecture Change Summary

### Before (Multi-Database)

```
PostgreSQL Databases:
├── disneyapp
│   ├── characters
│   ├── movies
│   └── hero_movie_carousel
└── sierra_games
    ├── games
    └── screenshots

Spring Configuration:
├── DisneyDataSourceConfig (@Primary)
├── SierraDataSourceConfig
└── Multiple EntityManagerFactories (problematic)
```

### After (Single Database)

```
PostgreSQL Database:
└── hd_demos
    ├── disney_characters
    ├── disney_movies
    ├── disney_hero_carousel
    ├── sierra_games
    └── sierra_screenshots

Spring Configuration:
├── Single DataSourceConfig (standard Spring Boot)
└── Single EntityManagerFactory (default)
```

---

## Files to Modify

### 1. Entity Classes (shared-models module)

**Location**: `C:\sites\hd-demos-api\shared-models\src\main\java\com\harmadavtian\shared\model\`

#### Disney Entities

- **Character.java**

  - Add: `@Table(name = "disney_characters")`
  - Current: No @Table annotation or using default table name

- **Movie.java**
  - Add: `@Table(name = "disney_movies")`
- **HeroMovieCarousel.java**
  - Add: `@Table(name = "disney_hero_carousel")`

#### Sierra Entities

- **Game.java**
  - Add: `@Table(name = "sierra_games")`
- **Screenshot.java**
  - Add: `@Table(name = "sierra_screenshots")`

**Example Change**:

```java
// Before
@Entity
public class Character {
    // ...
}

// After
@Entity
@Table(name = "disney_characters")
public class Character {
    // ...
}
```

---

### 2. Migration SQL Files (backend-migrations module)

**Location**: `C:\sites\hd-demos-api\backend-migrations\src\main\resources\db\migration\`

#### Disney Migrations (project1-disney/)

- **V1\_\_Create_characters_table.sql**

  ```sql
  -- Change FROM:
  CREATE TABLE characters (...)

  -- Change TO:
  CREATE TABLE disney_characters (...)
  ```

- **V2\_\_Create_movies_table.sql**

  ```sql
  CREATE TABLE disney_movies (...)
  ```

- **V3\_\_Create_hero_movie_carousel_table.sql**

  ```sql
  CREATE TABLE disney_hero_carousel (...)
  ```

- **V4\_\_Populate_characters.sql**

  ```sql
  INSERT INTO disney_characters ...
  ```

- **V5\_\_Populate_movies.sql**

  ```sql
  INSERT INTO disney_movies ...
  ```

- **V6\_\_Populate_hero_carousel.sql**
  ```sql
  INSERT INTO disney_hero_carousel ...
  ```

#### Sierra Migrations (project2-sierra/)

- **V1\_\_Create_games_table.sql**

  ```sql
  -- Change FROM:
  CREATE TABLE games (...)

  -- Change TO:
  CREATE TABLE sierra_games (...)
  ```

- **V2\_\_Create_screenshots_table.sql**

  ```sql
  -- Change FROM:
  CREATE TABLE screenshots (
      game_id UUID REFERENCES games(id)
  )

  -- Change TO:
  CREATE TABLE sierra_screenshots (
      game_id UUID REFERENCES sierra_games(id)
  )
  ```

---

### 3. Backend Configuration (backend module)

**Location**: `C:\sites\hd-demos-api\backend\src\main\java\com\harmadavtian\disneyapp\config\`

#### Files to DELETE

- ❌ **DisneyDataSourceConfig.java** (delete entirely)
- ❌ **SierraDataSourceConfig.java** (delete entirely)

#### Standard Spring Boot Configuration

Spring Boot will use default auto-configuration with single datasource.

**application.properties** (or application.yml):

```properties
# Single datasource configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/hd_demos
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:your_password}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.show-sql=false

# Disable Flyway in main API
spring.flyway.enabled=false
```

#### Repository Package Configuration

Since all repositories will use the same datasource, remove `entityManagerFactoryRef` and `transactionManagerRef` from `@EnableJpaRepositories` if present.

---

### 4. Migration Service Configuration (backend-migrations module)

**Location**: `C:\sites\hd-demos-api\backend-migrations\src\main\java\com\harmadavtian\migrations\`

#### MultiDatabaseFlywayConfig.java

**Option A: Delete and use default Flyway configuration**

- Let Spring Boot auto-configure Flyway with single datasource
- Simplest approach

**Option B: Keep custom config but simplify**

```java
@Configuration
public class FlywayConfig {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Bean
    public Flyway flyway() {
        Flyway flyway = Flyway.configure()
            .dataSource(url, username, password)
            .locations(
                "classpath:db/migration/project1-disney",
                "classpath:db/migration/project2-sierra"
            )
            .baselineOnMigrate(true)
            .load();

        flyway.migrate();
        return flyway;
    }
}
```

**application.properties** (backend-migrations):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hd_demos
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:your_password}

spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration/project1-disney,classpath:db/migration/project2-sierra
spring.flyway.baseline-on-migrate=true
```

---

### 5. Database Setup

#### Drop Old Databases (Local)

```sql
-- In pgAdmin or psql
DROP DATABASE IF EXISTS disneyapp;
DROP DATABASE IF EXISTS sierra_games;
```

#### Create New Database

```sql
CREATE DATABASE hd_demos
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;
```

#### Production (Neon)

- Delete existing databases: `disneyapp`, `sierra_games`
- Create new database: `hd_demos`
- Update connection string in Azure secrets

---

## Step-by-Step Transition Process

### Phase 1: Update Entity Definitions ✅

1. Open `C:\sites\hd-demos-api` in IntelliJ IDEA
2. Navigate to `shared-models/src/main/java/com/harmadavtian/shared/model/`
3. Add `@Table` annotations to all entities:
   - Character.java → `@Table(name = "disney_characters")`
   - Movie.java → `@Table(name = "disney_movies")`
   - HeroMovieCarousel.java → `@Table(name = "disney_hero_carousel")`
   - Game.java → `@Table(name = "sierra_games")`
   - Screenshot.java → `@Table(name = "sierra_screenshots")`
4. Build shared-models module: `mvn clean install`

---

### Phase 2: Update Migration SQL Files ✅

1. Navigate to `backend-migrations/src/main/resources/db/migration/`
2. Update Disney migrations (`project1-disney/`):
   - V1: Change `CREATE TABLE characters` → `CREATE TABLE disney_characters`
   - V2: Change `CREATE TABLE movies` → `CREATE TABLE disney_movies`
   - V3: Change `CREATE TABLE hero_movie_carousel` → `CREATE TABLE disney_hero_carousel`
   - V4-V6: Update all INSERT statements with new table names
3. Update Sierra migrations (`project2-sierra/`):
   - V1: Change `CREATE TABLE games` → `CREATE TABLE sierra_games`
   - V2: Change `CREATE TABLE screenshots` → `CREATE TABLE sierra_screenshots`
   - V2: Update foreign key: `REFERENCES sierra_games(id)`

---

### Phase 3: Simplify Backend Configuration ✅

1. **Delete datasource config files**:

   ```bash
   rm backend/src/main/java/com/harmadavtian/disneyapp/config/DisneyDataSourceConfig.java
   rm backend/src/main/java/com/harmadavtian/disneyapp/config/SierraDataSourceConfig.java
   ```

2. **Update application.properties** (`backend/src/main/resources/`):

   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/hd_demos
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   spring.datasource.driver-class-name=org.postgresql.Driver

   spring.jpa.hibernate.ddl-auto=validate
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

   spring.flyway.enabled=false
   ```

3. **Verify repository package scanning** (if you have custom JPA config):
   - Remove `entityManagerFactoryRef` and `transactionManagerRef` from `@EnableJpaRepositories`
   - Let Spring Boot use default single EntityManagerFactory

---

### Phase 4: Simplify Migration Configuration ✅

1. **Update migration application.properties** (`backend-migrations/src/main/resources/`):

   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/hd_demos
   spring.datasource.username=postgres
   spring.datasource.password=your_password

   spring.flyway.enabled=true
   spring.flyway.locations=classpath:db/migration/project1-disney,classpath:db/migration/project2-sierra
   spring.flyway.baseline-on-migrate=true
   ```

2. **Simplify or delete MultiDatabaseFlywayConfig.java**:
   - Option A: Delete it and rely on Spring Boot auto-config
   - Option B: Simplify to single datasource configuration (see above)

---

### Phase 5: Database Setup ✅

1. **Local PostgreSQL**:

   ```sql
   DROP DATABASE IF EXISTS disneyapp;
   DROP DATABASE IF EXISTS sierra_games;
   CREATE DATABASE hd_demos;
   ```

2. **Update environment variables** (if using .env files):

   ```
   # Before
   DISNEY_DB_URL=jdbc:postgresql://localhost:5432/disneyapp
   SIERRA_DB_URL=jdbc:postgresql://localhost:5432/sierra_games

   # After
   DATABASE_URL=jdbc:postgresql://localhost:5432/hd_demos
   ```

---

### Phase 6: Run Migrations ✅

1. In IntelliJ IDEA, open `backend-migrations` module
2. Run `MigrationServiceApplication.main()`
3. Verify output:
   ```
   Flyway: Migrating schema to version 1 - Create characters table
   Flyway: Migrating schema to version 2 - Create movies table
   ...
   Flyway: Successfully applied 8 migrations
   ```
4. Check database in pgAdmin:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```
   Expected tables:
   - disney_characters
   - disney_hero_carousel
   - disney_movies
   - sierra_games
   - sierra_screenshots
   - flyway_schema_history

---

### Phase 7: Test Backend API ✅

1. In IntelliJ IDEA, run `DisneyAppApplication.main()`
2. Verify startup logs (no entity/table errors)
3. Test Disney endpoints:
   ```bash
   curl http://localhost:8080/api/disney/characters
   curl http://localhost:8080/api/disney/movies
   ```
4. Test Sierra endpoints:
   ```bash
   curl http://localhost:8080/api/sierra/games
   ```
5. Verify all endpoints return data successfully

---

### Phase 8: Test Frontend Applications ✅

1. **Start Asset Server** (if needed):

   ```bash
   cd C:\sites\my-disney-app-assets
   npm run dev  # Port 5001
   ```

2. **Test Disney Frontend**:

   ```bash
   cd C:\sites\hd-demo-disney-movie-character-app
   npm run dev  # Port 3000
   ```

   - Browse to http://localhost:3000
   - Verify characters page loads
   - Verify movies page loads
   - Verify favorites work

3. **Test Sierra Frontend**:
   ```bash
   cd C:\sites\hd-demo-sierra-favorite-games-app
   npm run dev  # Port 3001
   ```
   - Browse to http://localhost:3001
   - Verify games list loads
   - Verify game detail pages work
   - Verify admin features work

---

## Validation Checklist

- [ ] All entity classes have `@Table(name = "project_tablename")` annotations
- [ ] All migration SQL files use prefixed table names
- [ ] All foreign key references use prefixed table names
- [ ] DisneyDataSourceConfig.java deleted
- [ ] SierraDataSourceConfig.java deleted
- [ ] application.properties updated with single datasource
- [ ] MultiDatabaseFlywayConfig simplified or deleted
- [ ] Old databases (disneyapp, sierra_games) dropped
- [ ] New database (hd_demos) created
- [ ] Migrations run successfully
- [ ] Backend API starts without errors
- [ ] All Disney endpoints return data
- [ ] All Sierra endpoints return data
- [ ] Disney frontend works correctly
- [ ] Sierra frontend works correctly

---

## Benefits of Single Database Approach

✅ **Simplicity**: Standard Spring Boot configuration, no custom datasource configs  
✅ **Compatibility**: Works perfectly with Spring Boot 3.x defaults  
✅ **Single Connection**: One connection string, easier deployment  
✅ **Cross-Project Queries**: Can query across projects if needed (future features)  
✅ **Easier Backups**: Single database to backup/restore  
✅ **Faster Development**: No fighting with EntityManagerFactory isolation  
✅ **Scalability**: Still organized by table prefixes, can separate later if truly needed

---

## Rollback Plan

If issues arise, rollback steps:

1. Revert entity @Table annotations
2. Revert migration SQL files
3. Restore DisneyDataSourceConfig and SierraDataSourceConfig
4. Restore multi-database configuration in application.properties
5. Recreate disneyapp and sierra_games databases
6. Run migrations against separate databases

---

## Production Deployment Notes

When deploying to Azure:

1. **Update Neon Database**:

   - Create `hd_demos` database in Neon
   - Update connection string in Azure Key Vault

2. **Update Azure Container Apps Environment Variables**:

   ```
   DATABASE_URL=postgresql://neon.tech/hd_demos?user=xxx&password=xxx
   DB_USERNAME=your_user
   DB_PASSWORD=your_password
   ```

3. **Remove old environment variables**:

   - ❌ DISNEY_DB_URL
   - ❌ SIERRA_DB_URL

4. **Update GitHub Actions secrets** (if needed):
   - DATABASE_URL (replaces DISNEY_DB_URL and SIERRA_DB_URL)

---

## Questions & Answers

**Q: Won't we lose database isolation between projects?**  
A: Yes, but in practice, projects share the same API codebase and deployment. True isolation isn't needed for this use case.

**Q: What if we need true separation later?**  
A: Can move to PostgreSQL schemas (`disney.characters`, `sierra.games`) without changing code.

**Q: How do we handle table naming conflicts?**  
A: Prefixes prevent conflicts. If Project A needs `users` table, use `projecta_users`.

**Q: Performance impact?**  
A: None. Same queries, same indexes, same performance. PostgreSQL handles large multi-tenant databases easily.

---

## Next Steps

After completing this refactor:

1. ✅ Document the single-database pattern in OPTION_2_ARCHITECTURE.md (DONE)
2. ✅ Update README files in hd-demos-api
3. Test with 3rd project (Portfolio) to validate pattern
4. Deploy to Azure and verify production
5. Update deployment documentation

---

**Status**: Ready for implementation  
**Estimated Time**: 1-2 hours for complete refactor and testing  
**Risk Level**: Low (all changes are reversible, local testing first)
