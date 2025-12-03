# Disney App Backend Architecture Tutorial

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Application Startup](#application-startup)
3. [Architecture Layers](#architecture-layers)
4. [Character Controller Deep Dive](#character-controller-deep-dive)
5. [Method Flow Example: Batch Fetch](#method-flow-example-batch-fetch)

---

## High-Level Overview

The Disney App backend is a **Spring Boot 3.x REST API** built with **Java 21**. It follows a classic **layered architecture** pattern:

```
┌─────────────────────────────────────────┐
│      HTTP Request (Client/Frontend)     │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  CONTROLLER LAYER (@RestController)     │  ← Handles HTTP, validates input
│  - CharacterController.java             │
│  - MovieController.java                 │
│  - RagController.java                   │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  SERVICE LAYER (@Service)               │  ← Business logic, orchestration
│  - CharacterService.java                │
│  - MovieService.java                    │
│  - RagService.java                      │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  REPOSITORY LAYER (@Repository)         │  ← Database access (JPA)
│  - CharacterRepository.java             │
│  - MovieRepository.java                 │
│  - ContentEmbeddingRepository.java      │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  DATABASE (PostgreSQL/Neon)             │  ← Persistent storage
│  - characters table                     │
│  - movies table                         │
│  - content_embeddings table             │
└─────────────────────────────────────────┘
```

**Supporting Components:**

- **DTOs** (`dto/`): Data Transfer Objects - simplified versions of entities for API responses
- **Models** (`model/`): JPA entities that map to database tables
- **Config** (`config/`): Spring Boot configuration (CORS, Swagger, security)
- **Exceptions** (`exception/`): Custom error handling

---

## Application Startup

### Entry Point: `DisneyappApplication.java`

```java
@SpringBootApplication
@EnableRetry
public class DisneyappApplication {
    public static void main(String[] args) {
        SpringApplication.run(DisneyappApplication.class, args);
    }
}
```

**What happens when you run the app:**

1. **`@SpringBootApplication`** triggers:

   - **Component Scanning**: Scans `com.harmadavtian.disneyapp.*` for `@Component`, `@Service`, `@Repository`, `@RestController`
   - **Auto-Configuration**: Sets up database connections, JPA, web server (Tomcat on port 8080)
   - **Dependency Injection**: Wires all beans together (controllers → services → repositories)

2. **`@EnableRetry`**: Enables retry logic for API calls (used in Gemini API integration)

3. **Database Initialization**:

   - Reads `application.properties` (or `application-local.properties` if profile is `local`)
   - Connects to PostgreSQL (Docker localhost or Neon production)
   - Hibernate validates schema matches JPA entities

4. **Tomcat Server Starts**:
   - Listens on `localhost:8080`
   - Maps all `@RestController` endpoints to HTTP routes
   - Swagger UI available at `/swagger-ui.html`

---

## Architecture Layers

### 1. Controller Layer (`controller/`)

**Responsibility**: Handle HTTP requests, validate input, return HTTP responses

**Key Annotations**:

- `@RestController`: Marks class as REST API controller
- `@RequestMapping("/api/characters")`: Base URL for all endpoints
- `@GetMapping`, `@PostMapping`: HTTP method mappings
- `@PathVariable`, `@RequestParam`: Extract URL parameters

**Example**: `CharacterController.java`

```java
@RestController
@RequestMapping("/api/characters")
public class CharacterController {
    private final CharacterService characterService;

    @GetMapping
    public ResponseEntity<List<Character>> getAllCharacters() {
        List<Character> characters = characterService.getAllCharacters();
        return ResponseEntity.ok(characters);
    }
}
```

**What Controllers DO**:

- ✅ Validate request parameters
- ✅ Call service layer methods
- ✅ Return HTTP status codes (200, 404, 500)
- ✅ Convert entities to DTOs (if needed)

**What Controllers DON'T DO**:

- ❌ Business logic (that's in services)
- ❌ Database queries (that's in repositories)
- ❌ Complex data transformations

---

### 2. Service Layer (`service/`)

**Responsibility**: Business logic, orchestration, data transformation

**Key Annotations**:

- `@Service`: Marks class as Spring-managed service bean
- `@Transactional`: Database transaction management (commit/rollback)

**Example**: `CharacterService.java`

```java
@Service
public class CharacterService {
    private final CharacterRepository characterRepository;

    public List<Character> getAllCharacters() {
        return characterRepository.findAll();
    }

    public List<MovieSummaryDto> getCharacterMovies(Long id) {
        Character character = characterRepository.findById(id).orElse(null);
        if (character == null) return List.of();

        return character.getMovies().stream()
                .map(this::convertToMovieSummary)
                .collect(Collectors.toList());
    }
}
```

**What Services DO**:

- ✅ Implement business rules
- ✅ Coordinate multiple repositories
- ✅ Transform entities to DTOs
- ✅ Handle complex workflows

**What Services DON'T DO**:

- ❌ Direct HTTP handling (that's in controllers)
- ❌ Write SQL (that's in repositories)

---

### 3. Repository Layer (`repository/`)

**Responsibility**: Database access via JPA (Java Persistence API)

**Key Concepts**:

- Extends `JpaRepository<Entity, ID>` - provides CRUD methods automatically
- `@Query`: Custom SQL or JPQL queries
- `@Repository`: Marks interface as Spring-managed repository

**Example**: `CharacterRepository.java`

```java
@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {

    // Automatic: findAll(), findById(), save(), delete()

    // Custom query:
    @Query("SELECT c.id FROM Character c ORDER BY c.id")
    List<Long> findAllIds();

    @Query(value = "SELECT * FROM characters ORDER BY RANDOM() LIMIT :limit",
           nativeQuery = true)
    List<Character> findRandom(@Param("limit") int limit);
}
```

**What Repositories DO**:

- ✅ Execute database queries
- ✅ Map SQL results to entities
- ✅ Provide data access abstraction

**What Repositories DON'T DO**:

- ❌ Business logic
- ❌ Data transformation (entities → DTOs)

---

### 4. Model Layer (`model/`)

**Responsibility**: JPA entities that map to database tables

**Key Annotations**:

- `@Entity`: Marks class as JPA entity
- `@Table(name = "characters")`: Maps to database table
- `@Id` + `@GeneratedValue`: Primary key
- `@Column`: Maps to database column
- `@ManyToMany`, `@OneToMany`: Relationships

**Example**: `Character.java`

```java
@Entity
@Table(name = "characters")
@Getter @Setter @NoArgsConstructor  // Lombok
public class Character {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToMany(mappedBy = "characters")
    @JsonIgnore  // Prevent circular JSON serialization
    private Set<Movie> movies = new HashSet<>();
}
```

---

### 5. DTO Layer (`dto/`)

**Responsibility**: Simplified data structures for API responses

**Why use DTOs?**

- ✅ Prevent circular references (Character → Movie → Character)
- ✅ Control exactly what data is exposed to frontend
- ✅ Add computed fields not in database
- ✅ Version API independently from database schema

**Example**: `MovieSummaryDto.java`

```java
public class MovieSummaryDto {
    private Long id;
    private String urlId;
    private String title;
    private String shortDescription;
    private Integer creationYear;
    private String movieRating;

    @JsonProperty("image_1")
    private String image1;

    // Constructor, getters, setters
}
```

**When to use DTOs**:

- ✅ Nested relationships (character movies, movie characters)
- ✅ Partial data (only IDs for quiz game)
- ✅ Combined data from multiple sources

**When NOT to use DTOs**:

- ❌ Simple single-entity responses (just return `Character` directly)
- ❌ Internal service-to-service calls

---

## Character Controller Deep Dive

### Overview

**File**: `CharacterController.java`  
**Base URL**: `/api/characters`  
**Purpose**: Expose Disney character data via REST API

### Endpoints Summary

| Method | Endpoint                                    | Purpose                             |
| ------ | ------------------------------------------- | ----------------------------------- |
| GET    | `/api/characters`                           | Get all characters                  |
| GET    | `/api/characters/{id}`                      | Get character by ID                 |
| GET    | `/api/characters/ids`                       | Get all character IDs only          |
| GET    | `/api/characters/ids-with-hints`            | Get IDs with hints (for quiz)       |
| GET    | `/api/characters/random-except`             | Get random characters (exclude IDs) |
| GET    | `/api/characters/random-except/{excludeId}` | Get random IDs (exclude one)        |
| GET    | `/api/characters/{id}/movies`               | Get movies for a character          |
| GET    | `/api/characters/batch?ids=1,3,5`           | Batch fetch by IDs                  |

### Method Breakdown

#### 1. `getAllCharacters()`

```java
@GetMapping
public ResponseEntity<List<Character>> getAllCharacters() {
    List<Character> characters = characterService.getAllCharacters();
    return ResponseEntity.ok(characters);
}
```

- **Route**: `GET /api/characters`
- **Returns**: All 180+ characters
- **Use Case**: Character grid on frontend
- **Flow**: Controller → Service → Repository → Database

---

#### 2. `getCharacterById(Long id)`

```java
@GetMapping("/{id}")
public ResponseEntity<Character> getCharacterById(@PathVariable Long id) {
    Character character = characterService.getCharacterById(id);
    if (character != null) {
        return ResponseEntity.ok(character);
    } else {
        return ResponseEntity.notFound().build();
    }
}
```

- **Route**: `GET /api/characters/1`
- **Returns**: Single character or 404
- **Use Case**: Character detail page

---

#### 3. `getAllCharacterIds()`

```java
@GetMapping("/ids")
public ResponseEntity<List<Long>> getAllCharacterIds() {
    List<Long> characterIds = characterService.getAllCharacterIds();
    return ResponseEntity.ok(characterIds);
}
```

- **Route**: `GET /api/characters/ids`
- **Returns**: `[1, 2, 3, ..., 180]`
- **Use Case**: Quiz initialization (don't need full character data)
- **Optimization**: Only fetches IDs, not all fields

---

#### 4. `getRandomCharactersExcept(Long excludeId, int count)`

```java
@GetMapping("/random-except/{excludeId}")
public ResponseEntity<List<Long>> getRandomCharactersExcept(
    @PathVariable Long excludeId,
    @RequestParam(defaultValue = "3") int count) {

    // Validation
    if (excludeId == null || excludeId <= 0) {
        return ResponseEntity.badRequest().build();
    }

    if (count <= 0 || count > 50) {
        return ResponseEntity.badRequest().build();
    }

    // Business logic
    List<Long> randomIds = characterService
        .getRandomCharacterIdsExcluding(excludeId, count);

    if (randomIds.size() < count) {
        return ResponseEntity.unprocessableEntity().build();
    }

    return ResponseEntity.ok(randomIds);
}
```

- **Route**: `GET /api/characters/random-except/5?count=3`
- **Returns**: 3 random character IDs (not including ID 5)
- **Use Case**: Quiz wrong answers
- **Validation**: Checks excludeId, count range
- **Error Handling**: 400 (bad input), 422 (not enough data)

---

#### 5. `getCharacterMovies(Long id)`

```java
@GetMapping("/{id}/movies")
public ResponseEntity<List<MovieSummaryDto>> getCharacterMovies(@PathVariable Long id) {
    List<MovieSummaryDto> movies = characterService.getCharacterMovies(id);
    return ResponseEntity.ok(movies);
}
```

- **Route**: `GET /api/characters/1/movies`
- **Returns**: List of `MovieSummaryDto` (not full `Movie` entities)
- **Use Case**: Character detail page - "Movies featuring Mickey Mouse"
- **Why DTO?**: Prevents circular reference (Character → Movie → Character)

---

#### 6. `getCharactersByIds(String ids)`

```java
@GetMapping("/batch")
public ResponseEntity<List<Character>> getCharactersByIds(@RequestParam String ids) {
    List<Long> idList = Arrays.stream(ids.split(","))
        .map(String::trim)
        .map(Long::parseLong)
        .toList();

    List<Character> characters = characterService.findByIds(idList);
    return ResponseEntity.ok(characters);
}
```

- **Route**: `GET /api/characters/batch?ids=1,3,5,8`
- **Returns**: List of characters matching those IDs
- **Use Case**: Load favorited characters
- **Optimization**: Single query instead of N separate requests

---

## Method Flow Example: Batch Fetch

Let's trace **`GET /api/characters/batch?ids=1,3,5`** through all layers:

### 1. **Client Request**

```http
GET http://localhost:8080/api/characters/batch?ids=1,3,5
```

---

### 2. **Controller** (`CharacterController.java`)

```java
@GetMapping("/batch")
public ResponseEntity<List<Character>> getCharactersByIds(
    @RequestParam String ids) {  // ← Spring extracts "1,3,5"

    // Parse comma-separated string into List<Long>
    List<Long> idList = Arrays.stream(ids.split(","))
        .map(String::trim)        // Remove whitespace
        .map(Long::parseLong)     // Convert to Long
        .toList();                // Collect to list

    // Call service layer
    List<Character> characters = characterService.findByIds(idList);

    // Return HTTP 200 OK with JSON body
    return ResponseEntity.ok(characters);
}
```

**What happened:**

- ✅ Extracted `ids` query parameter: `"1,3,5"`
- ✅ Parsed into `List<Long>`: `[1, 3, 5]`
- ✅ Called service method
- ✅ Wrapped result in HTTP 200 response

---

### 3. **Service** (`CharacterService.java`)

```java
public List<Character> findByIds(List<Long> ids) {
    // Null/empty check
    if (ids == null || ids.isEmpty()) {
        return List.of();  // Return empty list instead of null
    }

    // Delegate to repository
    return characterRepository.findAllById(ids);
}
```

**What happened:**

- ✅ Validated input (not null/empty)
- ✅ Called repository method
- ✅ No DTO conversion needed (returning full `Character` entities)

---

### 4. **Repository** (`CharacterRepository.java`)

```java
@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {
    // findAllById() is inherited from JpaRepository - no code needed!
}
```

**What happened:**

- ✅ JPA auto-generates SQL:
  ```sql
  SELECT * FROM characters WHERE id IN (1, 3, 5);
  ```
- ✅ Executes query against PostgreSQL
- ✅ Maps result rows to `Character` objects
- ✅ Returns `List<Character>`

---

### 5. **Database** (PostgreSQL)

```sql
SELECT * FROM characters WHERE id IN (1, 3, 5);
```

**Result**:

```
 id |   name   | short_description | ...
----+----------+-------------------+-----
  1 | Mickey   | A cheerful...     | ...
  3 | Minnie   | Mickey's...       | ...
  5 | Goofy    | A clumsy...       | ...
```

---

### 6. **Response Flow Back**

```
Database → Repository (maps rows to entities)
         → Service (validates result)
         → Controller (wraps in ResponseEntity)
         → Spring (serializes to JSON)
         → HTTP Response
```

**Final HTTP Response**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": 1,
    "urlId": "mickey_mouse",
    "name": "Mickey Mouse",
    "shortDescription": "A cheerful and optimistic mouse...",
    "longDescription": "...",
    "profileImage1": "https://...",
    "movies": []  // JsonIgnore prevents circular reference
  },
  {
    "id": 3,
    "urlId": "minnie_mouse",
    "name": "Minnie Mouse",
    ...
  },
  {
    "id": 5,
    "urlId": "goofy",
    "name": "Goofy",
    ...
  }
]
```

---

## Key Takeaways

### 1. **Separation of Concerns**

- **Controllers**: HTTP handling only
- **Services**: Business logic and orchestration
- **Repositories**: Database access only
- **DTOs**: API response shaping

### 2. **Spring Boot Magic**

- `@Autowired` (implicit via constructor injection) - wires dependencies
- `JpaRepository` - auto-generates SQL from method names
- `@RestController` - auto-converts objects to JSON
- `ResponseEntity` - fluent HTTP response building

### 3. **Data Flow Pattern**

```
Request → Controller → Service → Repository → Database
Database → Repository → Service → Controller → Response
```

### 4. **Error Handling**

```java
// Controller validation
if (id <= 0) return ResponseEntity.badRequest().build();

// Service null check
if (character == null) return ResponseEntity.notFound().build();

// Repository exception handling (automatic via @Transactional)
```

### 5. **DTO Usage**

- Use when returning nested entities (prevent circular refs)
- Use when partial data needed (IDs only)
- Convert in **service layer**, not controller

---

## Next Steps

**Explore Other Controllers**:

- `MovieController.java` - Similar pattern for movies
- `RagController.java` - Complex RAG (Retrieval-Augmented Generation) system
- `AdminController.java` - Embedding generation, admin operations

**Deep Dive Topics**:

- Custom `@Query` annotations in repositories
- `@Transactional` behavior and rollback
- Exception handling with `@ControllerAdvice`
- Swagger/OpenAPI documentation (`@Operation`, `@Parameter`)

**Testing**:

- Unit tests for services (mock repositories)
- Integration tests for controllers (MockMvc)
- Repository tests (in-memory H2 database)
