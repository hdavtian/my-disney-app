# Database Re-seeding Implementation Plan

## 📋 Current State Analysis

### Database Directories Found:

1. **`/database/`** (root level)

   - `disney_characters.json`
   - `disney_movies_comprehensive.json`

2. **`/backend/src/main/resources/database/`** (classpath)
   - `disney_characters.json`
   - `disney_movies_comprehensive.json`
   - `disney-characters-without-descriptions.txt` (legacy/unused)

### Tables to Seed:

1. **`characters`** - Character data
2. **`movies`** - Movie data
3. **`hero_movie_carousel`** - Homepage carousel entries (generated from movies, not a JSON file)

### Current Seeding Mechanism:

- `DataSeeder.java` uses `ClassPathResource("database/...")` which reads from `/backend/src/main/resources/database/`
- This means **`/backend/src/main/resources/database/`** is the active directory
- The root `/database/` directory appears to be a duplicate/outdated copy

---

## 🎯 Implementation Plan

### **Phase 1: Cleanup & Consolidation** ✅

**Goal:** Remove duplicate/unused database files and establish single source of truth

**Tasks:**

1. ✅ Verify which directory is actually being used by the application
   - Confirmed: `/backend/src/main/resources/database/` (classpath resources)
2. Compare JSON files between both directories to check for differences
3. Decision: Keep classpath version, remove root-level `/database/` or vice versa
4. Remove unused `disney-characters-without-descriptions.txt`
5. Update any documentation referencing the old location

**Acceptance Criteria:**

- Only ONE database directory exists with JSON files
- No duplicate or conflicting data files
- Application still starts and seeds correctly

---

### **Phase 2: Identify Source JSON Files** ✅

**Goal:** Document the three data sources for our three tables

**Findings:**

| Table                 | Source JSON File                   | Location                                | Notes                                     |
| --------------------- | ---------------------------------- | --------------------------------------- | ----------------------------------------- |
| `characters`          | `disney_characters.json`           | `/backend/src/main/resources/database/` | Direct mapping                            |
| `movies`              | `disney_movies_comprehensive.json` | `/backend/src/main/resources/database/` | Direct mapping                            |
| `hero_movie_carousel` | _(generated)_                      | N/A                                     | Dynamically created from 11 random movies |

**Note:** The `hero_movie_carousel` table doesn't have a JSON source file - it's generated programmatically by selecting 11 random movies.

---

### **Phase 3: Implement Reseed Endpoints**

**Goal:** Create three REST endpoints for re-seeding each table with truncate-and-reload approach

#### **3.1: Update DataSeeder Service**

Create public methods in `DataSeeder.java`:

```java
@Transactional
public Map<String, Integer> reseedCharacters() {
    // 1. Delete all characters
    characterRepository.deleteAll();

    // 2. Read from JSON
    List<Character> characters = loadCharactersFromJson();

    // 3. Save all
    characterRepository.saveAll(characters);

    return Map.of("inserted", characters.size());
}

@Transactional
public Map<String, Integer> reseedMovies() {
    // 1. Delete all movies (cascade will delete hero_movie_carousel)
    movieRepository.deleteAll();

    // 2. Read from JSON
    List<Movie> movies = loadMoviesFromJson();

    // 3. Save all
    movieRepository.saveAll(movies);

    return Map.of("inserted", movies.size());
}

@Transactional
public Map<String, Integer> reseedHeroCarousel() {
    // 1. Delete all carousel entries
    heroMovieCarouselRepository.deleteAll();

    // 2. Regenerate from existing movies
    seedHeroMovieCarousel();

    return Map.of("inserted", heroMovieCarouselRepository.count());
}
```

#### **3.2: Create Admin Controller Endpoints**

Update `AdminController.java`:

```java
@PostMapping("/reseed-characters")
public ResponseEntity<?> reseedCharacters() {
    Map<String, Integer> result = dataSeeder.reseedCharacters();
    return ResponseEntity.ok(Map.of(
        "success", true,
        "message", "Characters reseeded successfully",
        "count", result.get("inserted")
    ));
}

@PostMapping("/reseed-movies")
public ResponseEntity<?> reseedMovies() {
    Map<String, Integer> result = dataSeeder.reseedMovies();
    return ResponseEntity.ok(Map.of(
        "success", true,
        "message", "Movies reseeded successfully",
        "count", result.get("inserted")
    ));
}

@PostMapping("/reseed-hero-carousel")
public ResponseEntity<?> reseedHeroCarousel() {
    Map<String, Integer> result = dataSeeder.reseedHeroCarousel();
    return ResponseEntity.ok(Map.of(
        "success", true,
        "message", "Hero carousel reseeded successfully",
        "count", result.get("inserted")
    ));
}

@PostMapping("/reseed-all")
public ResponseEntity<?> reseedAll() {
    // Reseed in correct order (movies first, then carousel)
    Map<String, Integer> characters = dataSeeder.reseedCharacters();
    Map<String, Integer> movies = dataSeeder.reseedMovies();
    Map<String, Integer> carousel = dataSeeder.reseedHeroCarousel();

    return ResponseEntity.ok(Map.of(
        "success", true,
        "message", "All data reseeded successfully",
        "characters", characters.get("inserted"),
        "movies", movies.get("inserted"),
        "carousel", carousel.get("inserted")
    ));
}
```

**Acceptance Criteria:**

- Three individual endpoints: `/api/admin/reseed-characters`, `/api/admin/reseed-movies`, `/api/admin/reseed-hero-carousel`
- One combined endpoint: `/api/admin/reseed-all`
- All endpoints return JSON with success status and counts
- Operations are transactional (all-or-nothing)
- Proper error handling and logging

---

### **Phase 4: Testing & Documentation**

**Goal:** Verify functionality works in both local and production environments

#### **4.1: Local Testing**

```bash
# Test individual endpoints
curl -X POST http://localhost:8080/api/admin/reseed-characters
curl -X POST http://localhost:8080/api/admin/reseed-movies
curl -X POST http://localhost:8080/api/admin/reseed-hero-carousel

# Test all-in-one
curl -X POST http://localhost:8080/api/admin/reseed-all
```

#### **4.2: Production Testing**

```bash
# Same endpoints, production URL
curl -X POST https://your-production-url.com/api/admin/reseed-characters
curl -X POST https://your-production-url.com/api/admin/reseed-all
```

#### **4.3: Verification Steps**

1. Check database record counts match JSON file counts
2. Verify data integrity (spot-check random records)
3. Confirm frontend displays updated data
4. Test hero carousel has 11 entries

#### **4.4: Documentation**

- Update README with re-seed endpoint usage
- Add Swagger/OpenAPI documentation for admin endpoints
- Document the workflow: Update JSON → Hit endpoint → Verify

---

## 🚀 Execution Order

1. **Phase 1** - Cleanup duplicates (15 min)
2. **Phase 2** - Verify JSON sources (5 min)
3. **Phase 3** - Implement endpoints (30 min)
4. **Phase 4** - Test and document (20 min)

**Total Estimated Time:** ~70 minutes

---

## ⚠️ Important Notes

1. **Foreign Key Dependencies:** Movies must be reseeded before hero carousel (FK dependency)
2. **Transaction Safety:** All operations wrapped in `@Transactional` to prevent partial updates
3. **No Security:** As discussed, no auth required (personal demo project)
4. **Data Loss:** These endpoints DELETE all existing data - ensure JSON files are up to date first
5. **Zero Downtime:** Brief moment during delete/insert, but transactional so users won't see empty state

---

## 📁 Files to Modify

- ✅ `backend/src/main/java/com/harmadavtian/disneyapp/service/DataSeeder.java`
- ✅ `backend/src/main/java/com/harmadavtian/disneyapp/controller/AdminController.java`
- 🔲 Remove: `/database/` directory (if keeping classpath version)
- 🔲 Remove: `disney-characters-without-descriptions.txt`
- 🔲 Update: `README.md` with endpoint documentation

---

## ✅ Success Criteria

- Single source of truth for JSON data files
- Three working endpoints for individual table re-seeding
- One working endpoint for all-in-one re-seeding
- Works in both local and production environments
- Proper error handling and informative responses
- Documentation updated with usage examples
