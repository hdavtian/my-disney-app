# Favorites Page - Batch Fetch Architecture Fix

## Document Overview

**Date:** November 19, 2025  
**Issue:** Favorited attractions (and potentially other items) not displaying on Favorites page  
**Root Cause:** Architectural flaw in data fetching strategy  
**Solution:** Implement batch fetch endpoints for efficient favorites loading

---

## 1. Original Bug Report

### User-Reported Symptoms

- Favorited attractions sometimes appear on the Favorites page, sometimes don't
- Behavior feels random/haphazard
- The favorite heart icon stays filled (correctly indicating the item is favorited)
- The actual attraction card is missing from the Favorites page grid
- Count in navbar may not match items displayed on Favorites page
- Issue occurs specifically when:
  - Fresh browser session → navigate directly to Favorites page
  - Page refresh → go to Favorites without visiting Parks page first

### What Works vs. What Doesn't

✅ **Works:** Movies and characters always display correctly  
❌ **Broken:** Attractions display inconsistently  
✅ **Works:** Favorite state is correctly persisted in localStorage  
❌ **Broken:** Attraction cards fail to render when data is unavailable

---

## 2. Root Cause Analysis

### The Lazy Loading Problem

**Attractions Architecture (Broken):**

```typescript
// Attractions are only fetched when user visits a specific park
useEffect(() => {
  if (selectedPark) {
    dispatch(fetchAttractionsByPark(selectedPark.url_id));
  }
}, [selectedPark]);

// FavoritesPage tries to build cards from incomplete data
const allAttractions = useMemo(() => {
  return Object.values(allAttractionsByPark).flat(); // Often empty!
}, [allAttractionsByPark]);

const favoriteItems = favorites
  .map((fav) => {
    if (fav.type === "attraction") {
      const attraction = allAttractions.find((a) => a.id === fav.id);
      return attraction ? { type: "attraction", data: attraction } : null; // Returns null!
    }
    // ...
  })
  .filter(Boolean); // Filters out nulls - cards disappear!
```

**Why It Breaks:**

1. User favorites "Space Mountain" from Magic Kingdom
2. User refreshes page or returns in new session
3. User goes directly to Favorites page
4. `attractionsByPark` is empty (no parks visited yet)
5. `allAttractions` is empty array
6. Favorite lookup returns `null`
7. Card is filtered out - **attraction disappears from Favorites**

### Why Movies & Characters Don't Break

**Movies & Characters Architecture (Works):**

```typescript
// FavoritesPage proactively loads ALL data
useEffect(() => {
  if (allMovies.length === 0) {
    dispatch(fetchMovies()); // ✅ Fetches ALL movies
  }
  if (allCharacters.length === 0) {
    dispatch(fetchCharacters()); // ✅ Fetches ALL characters
  }
}, [allMovies.length, allCharacters.length]);
```

**Why It Works:**

- Data is **always available** before building favorite cards
- No lazy loading - eager fetch on page load
- Works across all browser sessions

---

## 3. Flawed Architecture

### Current Inefficient Pattern

The current "fix" for movies and characters has a major flaw:

**Problem:** Fetching ALL items to display a FEW favorites

**Example Scenario:**

- User has 3 favorite movies, 2 favorite characters, 1 favorite attraction
- Current approach fetches:
  - 200 movies (to display 3)
  - 150 characters (to display 2)
  - 100 attractions (to display 1)
- **Total: 450 items fetched to display 6**

**Performance Impact:**

- ❌ Wasteful bandwidth (especially on mobile)
- ❌ Slow page load (3-5 seconds vs. <500ms)
- ❌ Unnecessary server load
- ❌ Poor user experience
- ❌ Doesn't scale (what if dataset grows to 1000s?)

### Multiple Individual Requests (Also Bad)

**Alternative Bad Approach:**

```typescript
// Fetch each favorite individually
favorites.forEach((fav) => {
  if (fav.type === "character") {
    dispatch(fetchCharacterById(fav.id)); // Separate HTTP request per item!
  }
});
```

**For 10 favorites:**

- 10 separate HTTP requests
- 10x connection overhead (TCP handshake, headers, etc.)
- 10x latency (each waits for round trip)
- Total time: ~2-3 seconds
- Network waterfall effect
- Browser connection pool exhaustion

---

## 4. New Architecture: Batch Fetch Endpoints

### Design Principles

1. **Fetch only what's needed** - Don't load all items, only favorited ones
2. **Batch requests** - Single request per entity type, not per item
3. **Efficient database queries** - Use `WHERE id IN (...)` for optimal DB performance
4. **Maintain caching** - Cache batch results just like individual fetches

### API Design

**New Endpoints:**

```
GET /api/movies/batch?ids=1,5,12,23,45
GET /api/characters/batch?ids=3,8,15,27
GET /api/attractions/batch?ids=2,7,45,88,92
```

**Request Example:**

```bash
GET /api/characters/batch?ids=5,12,23
```

**Response Example:**

```json
[
  {
    "id": 5,
    "name": "Mickey Mouse",
    "debut": "Steamboat Willie",
    ...
  },
  {
    "id": 12,
    "name": "Donald Duck",
    "debut": "The Wise Little Hen",
    ...
  },
  {
    "id": 23,
    "name": "Goofy",
    "debut": "Mickey's Revue",
    ...
  }
]
```

### Performance Comparison

**Scenario:** User has 10 favorite characters

| Approach             | HTTP Requests | Data Transferred | Load Time | Database Queries    |
| -------------------- | ------------- | ---------------- | --------- | ------------------- |
| **Fetch All**        | 1             | ~150 items       | ~2-3s     | 1 full table scan   |
| **Individual Fetch** | 10            | 10 items         | ~2-3s     | 10 separate queries |
| **Batch Fetch** ✅   | 1             | 10 items         | ~300ms    | 1 optimized query   |

---

## 5. Implementation Plan

### Phase 1: Backend - Add Batch Endpoints

#### 5.1 Movies Batch Endpoint

**File:** `backend/src/main/java/com/harmadavtian/disneyapp/controller/MovieController.java`

```java
/**
 * Batch fetch movies by IDs
 * GET /api/movies/batch?ids=1,5,12
 */
@GetMapping("/batch")
public ResponseEntity<List<DisneyMovie>> getMoviesByIds(
    @RequestParam List<Long> ids
) {
    log.info("Fetching batch of {} movies by IDs", ids.size());
    List<DisneyMovie> movies = movieService.findByIds(ids);
    return ResponseEntity.ok(movies);
}
```

**Service Method:**

```java
// MovieService.java
public List<DisneyMovie> findByIds(List<Long> ids) {
    return movieRepository.findAllById(ids);
}
```

**Test with cURL:**

```bash
curl -X GET "http://localhost:8080/api/movies/batch?ids=1,2,3" -H "Accept: application/json"
```

**Expected Response:** Array of 3 movie objects

---

#### 5.2 Characters Batch Endpoint

**File:** `backend/src/main/java/com/harmadavtian/disneyapp/controller/CharacterController.java`

```java
/**
 * Batch fetch characters by IDs
 * GET /api/characters/batch?ids=1,5,12
 */
@GetMapping("/batch")
public ResponseEntity<List<DisneyCharacter>> getCharactersByIds(
    @RequestParam List<Long> ids
) {
    log.info("Fetching batch of {} characters by IDs", ids.size());
    List<DisneyCharacter> characters = characterService.findByIds(ids);
    return ResponseEntity.ok(characters);
}
```

**Service Method:**

```java
// CharacterService.java
public List<DisneyCharacter> findByIds(List<Long> ids) {
    return characterRepository.findAllById(ids);
}
```

**Test with cURL:**

```bash
curl -X GET "http://localhost:8080/api/characters/batch?ids=1,2,3" -H "Accept: application/json"
```

**Expected Response:** Array of 3 character objects

---

#### 5.3 Attractions Batch Endpoint

**File:** `backend/src/main/java/com/harmadavtian/disneyapp/controller/AttractionController.java`

```java
/**
 * Batch fetch attractions by IDs
 * GET /api/attractions/batch?ids=1,5,12
 */
@GetMapping("/batch")
public ResponseEntity<List<DisneyParkAttraction>> getAttractionsByIds(
    @RequestParam List<Long> ids
) {
    log.info("Fetching batch of {} attractions by IDs", ids.size());
    List<DisneyParkAttraction> attractions = attractionService.findByIds(ids);
    return ResponseEntity.ok(attractions);
}
```

**Service Method:**

```java
// AttractionService.java
public List<DisneyParkAttraction> findByIds(List<Long> ids) {
    return attractionRepository.findAllById(ids);
}
```

**Test with cURL:**

```bash
curl -X GET "http://localhost:8080/api/attractions/batch?ids=1,2,3" -H "Accept: application/json"
```

**Expected Response:** Array of 3 attraction objects

---

### Phase 2: Frontend - Add Batch API Methods

#### 2.1 Movies API

**File:** `frontend/src/api/moviesApi.ts`

Add new method:

```typescript
/**
 * Batch fetch movies by IDs
 */
getMoviesByIds: async (ids: number[]): Promise<Movie[]> => {
  if (ids.length === 0) return [];

  const response = await fetch(
    `${API_BASE_URL}/api/movies/batch?ids=${ids.join(",")}`
  );
  if (!response.ok) throw new Error("Failed to batch fetch movies");
  return response.json();
};
```

#### 2.2 Characters API

**File:** `frontend/src/api/charactersApi.ts` (create if doesn't exist)

```typescript
/**
 * Batch fetch characters by IDs
 */
getCharactersByIds: async (ids: number[]): Promise<Character[]> => {
  if (ids.length === 0) return [];

  const response = await fetch(
    `${API_BASE_URL}/api/characters/batch?ids=${ids.join(",")}`
  );
  if (!response.ok) throw new Error("Failed to batch fetch characters");
  return response.json();
};
```

#### 2.3 Attractions API

**File:** `frontend/src/api/attractionsApi.ts`

Add to existing export:

```typescript
/**
 * Batch fetch attractions by IDs
 */
getAttractionsByIds: async (ids: number[]): Promise<Attraction[]> => {
  if (ids.length === 0) return [];

  const response = await fetch(
    `${API_BASE_URL}/api/attractions/batch?ids=${ids.join(",")}`
  );
  if (!response.ok) throw new Error("Failed to batch fetch attractions");
  return response.json();
};
```

---

### Phase 3: Frontend - Add Redux Thunks

#### 3.1 Movies Slice

**File:** `frontend/src/store/slices/moviesSlice.ts`

```typescript
// Add new async thunk
export const fetchMoviesByIds = createAsyncThunk(
  "movies/fetchMoviesByIds",
  async (ids: number[], { rejectWithValue }) => {
    try {
      const data = await moviesApi.getMoviesByIds(ids);
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to batch fetch movies"
      );
    }
  }
);

// Add to extraReducers
builder.addCase(fetchMoviesByIds.fulfilled, (state, action) => {
  // Merge batch results into existing movies array (avoid duplicates)
  action.payload.forEach((movie) => {
    const index = state.movies.findIndex((m) => m.id === movie.id);
    if (index !== -1) {
      state.movies[index] = movie;
    } else {
      state.movies.push(movie);
    }
  });
});
```

#### 3.2 Characters Slice

**File:** `frontend/src/store/slices/charactersSlice.ts`

```typescript
// Add new async thunk
export const fetchCharactersByIds = createAsyncThunk(
  "characters/fetchCharactersByIds",
  async (ids: number[], { rejectWithValue }) => {
    try {
      const data = await charactersApi.getCharactersByIds(ids);
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to batch fetch characters"
      );
    }
  }
);

// Add to extraReducers
builder.addCase(fetchCharactersByIds.fulfilled, (state, action) => {
  // Merge batch results into existing characters array (avoid duplicates)
  action.payload.forEach((character) => {
    const index = state.characters.findIndex((c) => c.id === character.id);
    if (index !== -1) {
      state.characters[index] = character;
    } else {
      state.characters.push(character);
    }
  });
});
```

#### 3.3 Attractions Slice

**File:** `frontend/src/store/slices/attractionsSlice.ts`

```typescript
// Add new async thunk
export const fetchAttractionsByIds = createAsyncThunk(
  "attractions/fetchAttractionsByIds",
  async (ids: number[], { rejectWithValue }) => {
    try {
      const data = await attractionsApi.getAttractionsByIds(ids);
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to batch fetch attractions"
      );
    }
  }
);

// Add to extraReducers
builder.addCase(fetchAttractionsByIds.fulfilled, (state, action) => {
  // Store in allAttractions array for global access
  action.payload.forEach((attraction) => {
    const index = state.allAttractions.findIndex((a) => a.id === attraction.id);
    if (index !== -1) {
      state.allAttractions[index] = attraction;
    } else {
      state.allAttractions.push(attraction);
    }
  });
});
```

---

### Phase 4: Frontend - Update FavoritesPage

**File:** `frontend/src/pages/FavoritesPage/FavoritesPage.tsx`

**Remove old inefficient useEffect:**

```typescript
// DELETE THIS:
useEffect(() => {
  if (allMovies.length === 0) {
    dispatch(fetchMovies()); // ❌ Fetches ALL movies
  }
  if (allCharacters.length === 0) {
    dispatch(fetchCharacters()); // ❌ Fetches ALL characters
  }
}, [dispatch, allMovies.length, allCharacters.length]);
```

**Add new efficient batch fetching:**

```typescript
// Smart batch fetching - only fetch missing favorites
useEffect(() => {
  const movieFavorites = favorites.filter((f) => f.type === "movie");
  const characterFavorites = favorites.filter((f) => f.type === "character");
  const attractionFavorites = favorites.filter((f) => f.type === "attraction");

  // Find IDs that aren't already in the store
  const missingMovieIds = movieFavorites
    .filter((f) => !allMovies.find((m) => m.id === f.id))
    .map((f) => Number(f.id));

  const missingCharacterIds = characterFavorites
    .filter((f) => !allCharacters.find((c) => c.id === f.id))
    .map((f) => Number(f.id));

  const missingAttractionIds = attractionFavorites
    .filter((f) => !allAttractions.find((a) => a.id === f.id))
    .map((f) => Number(f.id));

  // Batch fetch only missing items
  if (missingMovieIds.length > 0) {
    console.log("Batch fetching missing movies:", missingMovieIds);
    dispatch(fetchMoviesByIds(missingMovieIds));
  }

  if (missingCharacterIds.length > 0) {
    console.log("Batch fetching missing characters:", missingCharacterIds);
    dispatch(fetchCharactersByIds(missingCharacterIds));
  }

  if (missingAttractionIds.length > 0) {
    console.log("Batch fetching missing attractions:", missingAttractionIds);
    dispatch(fetchAttractionsByIds(missingAttractionIds));
  }
}, [favorites, allMovies, allCharacters, allAttractions, dispatch]);
```

**Update allAttractions computation:**

```typescript
// Combine attractions from parks (lazily loaded) and allAttractions (batch loaded)
const allAttractions = useMemo(() => {
  const fromParks = Object.values(allAttractionsByPark).flat();
  const fromStore = allAttractionsFromStore; // From batch fetch
  const combined = [...fromParks, ...fromStore];

  // Deduplicate by ID
  const uniqueMap = new Map<number, Attraction>();
  combined.forEach((attraction) => {
    if (!uniqueMap.has(attraction.id)) {
      uniqueMap.set(attraction.id, attraction);
    }
  });

  return Array.from(uniqueMap.values());
}, [allAttractionsByPark, allAttractionsFromStore]);
```

---

## 6. Testing Strategy

### Backend Testing (cURL)

#### Test 1: Movies Batch Endpoint

```bash
# Single ID
curl -X GET "http://localhost:8080/api/movies/batch?ids=1" -H "Accept: application/json"

# Multiple IDs
curl -X GET "http://localhost:8080/api/movies/batch?ids=1,2,3,4,5" -H "Accept: application/json"

# Empty list (edge case)
curl -X GET "http://localhost:8080/api/movies/batch?ids=" -H "Accept: application/json"

# Non-existent IDs
curl -X GET "http://localhost:8080/api/movies/batch?ids=9999,10000" -H "Accept: application/json"
```

**Expected Results:**

- Single ID: Array with 1 movie
- Multiple IDs: Array with 5 movies
- Empty list: Empty array `[]`
- Non-existent IDs: Empty array `[]` or partial results

#### Test 2: Characters Batch Endpoint

```bash
# Single ID
curl -X GET "http://localhost:8080/api/characters/batch?ids=1" -H "Accept: application/json"

# Multiple IDs
curl -X GET "http://localhost:8080/api/characters/batch?ids=1,2,3,4,5" -H "Accept: application/json"
```

#### Test 3: Attractions Batch Endpoint

```bash
# Single ID
curl -X GET "http://localhost:8080/api/attractions/batch?ids=1" -H "Accept: application/json"

# Multiple IDs
curl -X GET "http://localhost:8080/api/attractions/batch?ids=1,2,3,4,5" -H "Accept: application/json"
```

### Frontend Testing (Browser)

#### Test 1: Fresh Session - Direct to Favorites

1. Clear browser cache and localStorage
2. Navigate directly to `/favorites`
3. **Expected:** No items shown (no favorites yet)

#### Test 2: Add Favorites and Test Display

1. Navigate to `/characters`, favorite 3 characters
2. Navigate to `/movies`, favorite 2 movies
3. Navigate to `/parks`, select a park, favorite 2 attractions
4. Navigate to `/favorites`
5. **Expected:** See all 7 favorited items displayed

#### Test 3: Refresh and Verify Persistence

1. From Favorites page, refresh browser (F5)
2. **Expected:** All 7 favorites still displayed (batch fetch runs automatically)

#### Test 4: New Session - Direct to Favorites

1. Close browser completely
2. Reopen browser, navigate directly to `/favorites`
3. **Expected:** All 7 favorites displayed immediately via batch fetch

#### Test 5: Network Tab Verification

1. Open DevTools → Network tab
2. Clear and navigate to `/favorites`
3. **Expected:** See only 3 batch requests:
   - `GET /api/movies/batch?ids=X,Y`
   - `GET /api/characters/batch?ids=A,B,C`
   - `GET /api/attractions/batch?ids=M,N`
4. **Should NOT see:** Requests for all movies/characters/attractions

### Console Log Verification

Look for these log messages:

```
Batch fetching missing movies: [1, 5, 12]
Batch fetching missing characters: [3, 8, 15]
Batch fetching missing attractions: [2, 7, 45]
```

---

## 7. Rollback Plan (If Issues Arise)

If batch endpoints cause issues, we can temporarily revert to the "fetch all" approach:

**Temporary Fix:**

```typescript
// In FavoritesPage.tsx
useEffect(() => {
  const attractionFavorites = favorites.filter((f) => f.type === "attraction");

  if (attractionFavorites.length > 0 && allAttractionsFromStore.length === 0) {
    dispatch(fetchAllAttractions()); // Temporary: fetch all
  }
}, [favorites, allAttractionsFromStore, dispatch]);
```

But the goal is to complete the batch endpoint implementation for optimal performance.

---

## 8. Success Criteria

- ✅ All three batch endpoints functional and tested with cURL
- ✅ Frontend batch API methods working
- ✅ Redux slices updated with batch fetch thunks
- ✅ FavoritesPage uses batch fetch instead of fetch-all
- ✅ Favorited attractions display correctly after browser refresh
- ✅ Favorited attractions display correctly in fresh browser session
- ✅ Network tab shows only batch requests, not individual or full-list fetches
- ✅ Page load time for Favorites < 500ms (vs previous 2-3s)
- ✅ No regression: movies and characters still work correctly

---

## 9. Phase 5: Update Documentation

### 9.1 Update Swagger/OpenAPI Documentation

**File:** Update Swagger annotations in controller files

#### Movies Batch Endpoint Documentation

```java
@Operation(
    summary = "Batch fetch movies by IDs",
    description = "Retrieves multiple movies in a single request by providing a comma-separated list of movie IDs",
    tags = {"Movies"}
)
@ApiResponses(value = {
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved movies",
        content = @Content(
            mediaType = "application/json",
            array = @ArraySchema(schema = @Schema(implementation = DisneyMovie.class))
        )
    ),
    @ApiResponse(responseCode = "400", description = "Invalid ID format"),
    @ApiResponse(responseCode = "500", description = "Internal server error")
})
@GetMapping("/batch")
public ResponseEntity<List<DisneyMovie>> getMoviesByIds(
    @Parameter(
        description = "Comma-separated list of movie IDs",
        example = "1,5,12,23,45",
        required = true
    )
    @RequestParam List<Long> ids
) {
    log.info("Fetching batch of {} movies by IDs", ids.size());
    List<DisneyMovie> movies = movieService.findByIds(ids);
    return ResponseEntity.ok(movies);
}
```

#### Characters Batch Endpoint Documentation

```java
@Operation(
    summary = "Batch fetch characters by IDs",
    description = "Retrieves multiple characters in a single request by providing a comma-separated list of character IDs",
    tags = {"Characters"}
)
@ApiResponses(value = {
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved characters",
        content = @Content(
            mediaType = "application/json",
            array = @ArraySchema(schema = @Schema(implementation = DisneyCharacter.class))
        )
    ),
    @ApiResponse(responseCode = "400", description = "Invalid ID format"),
    @ApiResponse(responseCode = "500", description = "Internal server error")
})
@GetMapping("/batch")
public ResponseEntity<List<DisneyCharacter>> getCharactersByIds(
    @Parameter(
        description = "Comma-separated list of character IDs",
        example = "1,3,8,15,27",
        required = true
    )
    @RequestParam List<Long> ids
) {
    log.info("Fetching batch of {} characters by IDs", ids.size());
    List<DisneyCharacter> characters = characterService.findByIds(ids);
    return ResponseEntity.ok(characters);
}
```

#### Attractions Batch Endpoint Documentation

```java
@Operation(
    summary = "Batch fetch attractions by IDs",
    description = "Retrieves multiple park attractions in a single request by providing a comma-separated list of attraction IDs",
    tags = {"Attractions"}
)
@ApiResponses(value = {
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved attractions",
        content = @Content(
            mediaType = "application/json",
            array = @ArraySchema(schema = @Schema(implementation = DisneyParkAttraction.class))
        )
    ),
    @ApiResponse(responseCode = "400", description = "Invalid ID format"),
    @ApiResponse(responseCode = "500", description = "Internal server error")
})
@GetMapping("/batch")
public ResponseEntity<List<DisneyParkAttraction>> getAttractionsByIds(
    @Parameter(
        description = "Comma-separated list of attraction IDs",
        example = "1,2,7,45,88",
        required = true
    )
    @RequestParam List<Long> ids
) {
    log.info("Fetching batch of {} attractions by IDs", ids.size());
    List<DisneyParkAttraction> attractions = attractionService.findByIds(ids);
    return ResponseEntity.ok(attractions);
}
```

**Test Swagger UI:**

1. Start backend: `./mvnw spring-boot:run`
2. Navigate to: `http://localhost:8080/swagger-ui.html`
3. Verify new batch endpoints appear under each tag (Movies, Characters, Attractions)
4. Use "Try it out" to test with example values

---

### 9.2 Update README.md

**File:** `README.md`

Add new section under API documentation:

````markdown
### Batch Fetch Endpoints

For efficient loading of multiple items (e.g., for favorites page), batch endpoints are available:

#### Movies Batch

```bash
GET /api/movies/batch?ids=1,5,12,23,45
```
````

Returns an array of movies matching the provided IDs.

#### Characters Batch

```bash
GET /api/characters/batch?ids=1,3,8,15,27
```

Returns an array of characters matching the provided IDs.

#### Attractions Batch

```bash
GET /api/attractions/batch?ids=1,2,7,45,88
```

Returns an array of attractions matching the provided IDs.

**Usage Notes:**

- IDs should be comma-separated with no spaces
- Empty ID list returns empty array
- Non-existent IDs are silently skipped (partial results returned)
- Optimal for loading favorited items without fetching entire collections
- Single request replaces multiple individual requests

**Example Response:**

```json
[
  {
    "id": 1,
    "name": "Mickey Mouse",
    ...
  },
  {
    "id": 5,
    "name": "Donald Duck",
    ...
  }
]
```

````

---

### 9.3 Update Backend README

**File:** `backend/README.md`

Add performance notes:

```markdown
## Performance Optimizations

### Batch Fetch Endpoints

The application includes optimized batch fetch endpoints to minimize HTTP requests
and database queries when loading multiple items.

**Use Case:** Favorites Page
- Instead of fetching all 200+ movies to display 3 favorites
- Or making 3 separate HTTP requests for 3 movies
- Single request: `GET /api/movies/batch?ids=1,5,12`

**Database Optimization:**
- Uses `findAllById()` which generates efficient `WHERE id IN (...)` queries
- Single database round-trip instead of N queries
- Indexes on ID columns ensure optimal performance

**Implementation:**
```java
// Service layer
public List<DisneyMovie> findByIds(List<Long> ids) {
    return movieRepository.findAllById(ids);
}

// Generated SQL (approximate)
SELECT * FROM disney_movie WHERE id IN (1, 5, 12);
````

```

---

## 10. Future Enhancements

- Add caching to batch fetch results (use `CacheService`)
- Implement batch delete/update endpoints if needed
- Consider GraphQL as alternative for flexible field selection
- Add telemetry to track batch fetch performance
- Add rate limiting to batch endpoints (prevent abuse)

---

## Notes
- ID type should be `number` on frontend, `Long` on backend
- Empty ID arrays should return empty arrays, not errors
- Non-existent IDs should be silently skipped (partial results OK)
- Maintain backward compatibility - don't remove individual fetch endpoints
- Swagger annotations required for all new endpoints
```
