# Lombok Refactoring Plan

## Overview

Refactor entire backend codebase to use Lombok annotations, eliminating boilerplate code (getters, setters, constructors, logging) across all layers.

## Current State Analysis

### Models (7 files)

All entity and DTO classes use **manual getters/setters**:

- `Movie.java` - 173 lines (50% boilerplate)
- `Character.java` - 214 lines (50% boilerplate)
- `DisneyParkAttraction.java` - 286 lines (50% boilerplate)
- `DisneyPark.java` - 258 lines (50% boilerplate)
- `CarouselItemDto.java` - 90 lines (80% boilerplate)
- `HeroMovieCarousel.java` - (needs analysis)
- `ExcludeCharacterRequest.java` - (needs analysis)

### Controllers (3+ files)

- Already have `@Slf4j` added for batch endpoints
- Need `@RequiredArgsConstructor` for dependency injection
- Need to remove manual field injection

### Services (3+ files)

- Need `@Slf4j` for logging
- Need `@RequiredArgsConstructor` for repository injection
- Currently use `@Autowired` field injection

---

## Lombok Annotations Strategy

### For JPA Entities (@Entity)

```java
@Entity
@Table(name = "movies")
@Data                          // Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor             // Required by JPA
@AllArgsConstructor            // Useful for testing
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    // ... fields only, no manual methods
}
```

**⚠️ Important**: Use `@Data` carefully with JPA entities containing `@ManyToMany` or `@OneToMany`:

- May cause circular references in `toString()`
- May cause performance issues in `equals()` and `hashCode()`
- Alternative: `@Getter @Setter` instead of `@Data`

### For DTOs

```java
@Data                          // Perfect for DTOs (no JPA concerns)
@Builder                       // Enables fluent builder pattern
@NoArgsConstructor
@AllArgsConstructor
public class CarouselItemDto {
    private Long carouselId;
    private String title;
    // ... fields only
}
```

### For Controllers

```java
@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor       // Constructor injection for final fields
@Slf4j                         // Provides 'log' logger instance
public class MovieController {
    private final MovieService movieService;

    // No constructor needed - Lombok generates it
    // No logger declaration needed - @Slf4j provides 'log'
}
```

### For Services

```java
@Service
@RequiredArgsConstructor       // Constructor injection for repositories
@Slf4j                         // Logging support
public class MovieService {
    private final MovieRepository movieRepository;

    // No constructor needed
    // No logger needed
}
```

---

## Implementation Phases

### Phase 1: Models Migration ✅ PRIORITY

**Why first?** Models are used everywhere. Migrating them first ensures clean foundation.

**Steps:**

1. Read remaining model files: `HeroMovieCarousel.java`, `ExcludeCharacterRequest.java`
2. For each JPA entity:
   - Add `@Getter @Setter` (safer than `@Data` for entities with relationships)
   - Add `@NoArgsConstructor` (JPA requirement)
   - Add `@AllArgsConstructor` (testing convenience)
   - Remove all manual getter/setter methods
   - Keep existing constructors if they have custom logic
3. For each DTO:
   - Add `@Data` (DTOs are simple POJOs)
   - Add `@Builder` (if useful for construction)
   - Add `@NoArgsConstructor @AllArgsConstructor`
   - Remove all manual methods

**Estimated reduction:** 800+ lines of boilerplate removed

---

### Phase 2: Services Migration

**Why second?** Services depend on models, no dependents to break yet.

**Steps:**

1. Find all `@Service` classes
2. For each service:
   - Add `@Slf4j`
   - Add `@RequiredArgsConstructor`
   - Change `@Autowired` fields to `private final`
   - Remove manual constructors
   - Remove manual logger declarations
   - Replace logger variable name with `log` (Lombok convention)

**Example transformation:**

```java
// BEFORE
@Service
public class MovieService {
    @Autowired
    private MovieRepository movieRepository;

    private static final Logger logger = LoggerFactory.getLogger(MovieService.class);
}

// AFTER
@Service
@RequiredArgsConstructor
@Slf4j
public class MovieService {
    private final MovieRepository movieRepository;
    // log.info() automatically available
}
```

---

### Phase 3: Controllers Migration

**Why third?** Controllers depend on services, already partially migrated.

**Steps:**

1. Find all `@RestController` classes
2. For each controller:
   - Add `@RequiredArgsConstructor` (already have `@Slf4j`)
   - Change `@Autowired` services to `private final`
   - Remove manual constructors
   - Verify `log.info()` calls work correctly

**Already completed for batch endpoints:**

- `MovieController` - has `@Slf4j`, needs `@RequiredArgsConstructor`
- `CharacterController` - has `@Slf4j`, needs `@RequiredArgsConstructor`
- `DisneyParkAttractionController` - has `@Slf4j`, needs `@RequiredArgsConstructor`

---

### Phase 4: Testing & Validation

1. **Maven clean + compile:**

   ```bash
   mvn clean compile
   ```

   - Lombok will generate code during compilation
   - Verify no compile errors

2. **Start application:**

   ```bash
   mvn spring-boot:run
   ```

   - Check for runtime errors
   - Verify dependency injection works

3. **Test batch endpoints:**

   ```bash
   curl "http://localhost:8080/api/movies/batch?ids=1,5,12"
   curl "http://localhost:8080/api/characters/batch?ids=1,3,8"
   curl "http://localhost:8080/api/attractions/batch?ids=1,2,7"
   ```

4. **Check logs:**
   - Verify `@Slf4j` logging works
   - Check for circular reference issues in toString()

---

## Lombok Dependency Status

### Already Added ✅

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

### Maven Plugin Configuration (Check if needed)

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <excludes>
                    <exclude>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                    </exclude>
                </excludes>
            </configuration>
        </plugin>
    </plugins>
</build>
```

---

## Expected Benefits

### Code Reduction

- **Models:** ~800 lines removed (50% reduction in model code)
- **Services:** ~150 lines removed (constructors, loggers)
- **Controllers:** ~100 lines removed (constructors, loggers)
- **Total:** ~1,050 lines of boilerplate eliminated

### Maintainability

- ✅ No manual getter/setter updates when adding fields
- ✅ No manual constructor updates when adding dependencies
- ✅ Consistent logging across all classes
- ✅ Builder pattern available for complex object construction

### Code Quality

- ✅ Compile-time code generation (no runtime reflection)
- ✅ IDE-friendly (IntelliJ has excellent Lombok support)
- ✅ Industry-standard practice in Spring Boot projects

---

## Potential Issues & Solutions

### Issue 1: Circular References in toString()

**Symptom:** Stack overflow when logging entities with `@ManyToMany` relationships

**Solution:** Use `@ToString(exclude = {"characters", "movies"})` on entities

### Issue 2: JSON Serialization with Jackson

**Symptom:** Unwanted fields in JSON responses

**Solution:** Lombok respects `@JsonIgnore` and `@JsonProperty` annotations

### Issue 3: JPA Proxy Issues

**Symptom:** Lazy-loaded collections cause issues with equals/hashCode

**Solution:** Use `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` and mark only `@Id` field

---

## Progress Tracking

### Completed

- ✅ Added Lombok dependency to pom.xml
- ✅ Added `@Slf4j` to 3 controllers (Movie, Character, DisneyParkAttraction)
- ✅ Analyzed model structure (7 files, all use manual getters/setters)

### In Progress

- 🔄 Phase 1: Models migration (reading remaining files)

### Pending

- ⏳ Phase 2: Services migration
- ⏳ Phase 3: Controllers migration
- ⏳ Phase 4: Testing & validation

---

## Next Steps

1. **Read remaining model files:**

   - `HeroMovieCarousel.java`
   - `ExcludeCharacterRequest.java`

2. **Begin Phase 1 migration:**

   - Start with `Movie.java` (main entity, most referenced)
   - Apply `@Getter @Setter @NoArgsConstructor @AllArgsConstructor`
   - Remove all getter/setter methods
   - Test with Maven compile

3. **Proceed systematically:**

   - Migrate one file at a time
   - Maven compile after each change
   - Verify no errors before proceeding

4. **Complete Phase 1 before moving to services**
