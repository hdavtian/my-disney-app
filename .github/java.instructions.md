## Copilot Java and Spring Boot Rules

- Use **Java 21** or latest stable LTS version.
- Follow standard naming conventions:
  - Classes → PascalCase
  - Methods and variables → camelCase
- Use Spring Boot annotations appropriately:
  - `@RestController`, `@Service`, `@Repository`, `@Configuration`
- Implement layered architecture: controller → service → repository → entity.
- Annotate entities with `@Entity`, `@Table`, and include `@Id` and `@GeneratedValue`.
- Repository interfaces should extend `JpaRepository`.
- Use Lombok annotations (`@Getter`, `@Setter`, `@Builder`) to reduce boilerplate.
- Include Javadoc comments for all public classes and methods.
- Apply transaction management where appropriate (`@Transactional`).
- Log key actions with a consistent logger (e.g., `LoggerFactory.getLogger`).
- Favor immutability and constructor injection.
- Follow package structure under `com.harmadavtian.disneyapp`.
  - Subpackages: `controller`, `service`, `repository`, `model`, `config`

### 🔑 API Response Naming Convention (CRITICAL)

**ALL API responses automatically use snake_case property names** via global Jackson configuration.

- **Database**: PostgreSQL columns are `snake_case` (e.g., `url_id`, `short_description`, `image_1`)
- **Java entities**: Use camelCase fields with `@Column(name = "snake_case")` for database mapping
- **API responses**: Automatically serialize to snake_case via `PropertyNamingStrategies.SNAKE_CASE` in `AppConfig`
- **Frontend types**: MUST match snake_case from API responses (see TypeScript/React instructions)

**Example**:

```java
@Entity
@Table(name = "movies")
public class Movie {
    @Column(name = "url_id")        // Database column
    private String urlId;            // Java field (camelCase)
                                     // API returns "url_id" automatically

    @Column(name = "short_description")
    private String shortDescription; // API returns "short_description"

    @Column(name = "image_1")
    private String image1;           // API returns "image_1"
}
```

**Global Configuration** (already in `AppConfig.java`):

```java
@Bean
public ObjectMapper objectMapper() {
    ObjectMapper mapper = new ObjectMapper();
    mapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
    return mapper;
}
```

**When creating new entities**:

1. Check database column names in SQL migration files (`backend/src/main/resources/db/migration/`)
2. Use camelCase for Java field names
3. Add `@Column(name = "snake_case_name")` to map to database column
4. **DO NOT add `@JsonProperty`** - automatic conversion handles it (exception: fields with underscores + numbers like `image_1` may need explicit annotation)
5. Test with cURL to verify API response format before frontend integration

**Common mistakes to avoid**:

- ❌ Adding `@JsonProperty` everywhere → unnecessary duplication (global config handles it)
- ❌ Using camelCase in database column names → breaks frontend expectations
- ❌ Forgetting `@Column(name = "...")` → JPA won't find the database column
- ❌ Inconsistent naming between database, `@Column`, and Java field → runtime errors
