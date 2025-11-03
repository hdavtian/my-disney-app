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
