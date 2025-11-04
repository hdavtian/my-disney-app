# Disney App Backend

Spring Boot REST API for the Disney character and movie catalog application.

## Tech Stack

- **Java 17** with Spring Boot 3.3.0
- **PostgreSQL** database (local Docker or Neon cloud)
- **Flyway** for database migrations
- **Maven** for build management
- **Docker** for containerized deployment

## Local Development (Recommended for Daily Work)

### Prerequisites

- Java 17 JDK
- Maven (or use IDE's built-in Maven)
- Docker Desktop (for local PostgreSQL)
- IntelliJ IDEA Ultimate (recommended)

### Setup

1. **Start local PostgreSQL**:

   ```bash
   docker run --name disney-postgres -e POSTGRES_DB=disneyapp -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=amelia -p 5432:5432 -d postgres:16
   ```

2. **Run in IntelliJ IDEA**:

   - Open the `backend` directory as a project
   - Run `DisneyAppApplication.java` with the `local` profile
   - The application will start on `http://localhost:8080`
   - Flyway migrations run automatically on startup

3. **Or run via Maven**:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```

### Configuration

The application uses Spring Profiles for environment-specific configuration:

- **`local` profile** (default): Connects to local Docker PostgreSQL
  - Database: `jdbc:postgresql://localhost:5432/disneyapp`
  - User: `postgres` / Password: `amelia`
- **`prod` profile**: Connects to Neon PostgreSQL (production)
  - Uses environment variables: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`

## Docker Setup (Optional - Production Parity Testing)

Use this when you want to test in a containerized environment that matches production.

### Option 1: Docker Compose (Full Stack)

```bash
# Start backend + PostgreSQL in containers
docker-compose up

# Stop and remove containers
docker-compose down

# View logs
docker-compose logs -f backend
```

This starts:

- Spring Boot backend on `http://localhost:8080`
- PostgreSQL database on `localhost:5432`

### Option 2: Docker Build Only

```bash
# Build the image
docker build -t movie-app-api:local .

# Run with local PostgreSQL
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=local \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/disneyapp \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=amelia \
  movie-app-api:local

# Or run with Neon PostgreSQL (production)
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DATABASE_URL=jdbc:postgresql://your-neon-host:5432/disneyapp \
  -e DATABASE_USERNAME=neondb_owner \
  -e DATABASE_PASSWORD=your-password \
  movie-app-api:local
```

## Testing Neon Connection (Production Database)

Use the PowerShell script to test connection to Neon:

```powershell
.\test-neon-connection.ps1
```

This script sets environment variables and runs Spring Boot with the `prod` profile.

## API Endpoints

Once running, the API is available at:

- **Movies**: `http://localhost:8080/api/movies`
- **Characters**: `http://localhost:8080/api/characters`
- **Health Check**: `http://localhost:8080/actuator/health`

## Development Workflow

### Daily Development (Fast Iteration)

1. Edit code in IntelliJ IDEA
2. Run `DisneyAppApplication.java` with `local` profile
3. Use hot reload for immediate feedback
4. Debug with breakpoints
5. Test against local PostgreSQL

### Pre-Commit Validation (Production Parity)

1. Run `docker-compose up` to test in containers
2. Verify the exact production environment
3. Check for environment-specific issues
4. Stop with `docker-compose down`

### CI/CD (Automated)

- GitHub Actions builds Docker image on push
- Runs tests in containerized environment
- Deploys to Azure Container Apps

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/harmadavtian/disneyapp/
│   │   │   ├── controller/     # REST API controllers
│   │   │   ├── service/        # Business logic
│   │   │   ├── repository/     # Data access
│   │   │   ├── model/          # Entity classes
│   │   │   └── config/         # Configuration
│   │   └── resources/
│   │       ├── application.properties           # Shared config
│   │       ├── application-local.properties     # Local dev config
│   │       ├── application-prod.properties      # Production config
│   │       └── db/migration/                    # Flyway SQL scripts
│   └── test/                   # Unit and integration tests
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yml          # Optional local containerized setup
├── .dockerignore              # Docker build exclusions
├── pom.xml                    # Maven dependencies
└── test-neon-connection.ps1   # Neon connection test script
```

## Troubleshooting

### "Connection refused" when running locally

- Ensure Docker PostgreSQL is running: `docker ps`
- Check connection string in `application-local.properties`

### "Authentication failed" with Neon

- Verify environment variables in `test-neon-connection.ps1`
- Check Neon connection string includes `?sslmode=require`

### Docker build fails

- Ensure Docker Desktop is running
- Check you're in the `backend` directory
- Clear Docker cache: `docker system prune -a`

### Flyway migration fails

- Check database is accessible
- Verify migration scripts in `src/main/resources/db/migration/`
- Check Flyway logs in console output

## Deployment

The backend is deployed to **Azure Container Apps** via GitHub Actions:

1. Code pushed to `main` branch
2. GitHub Actions builds Docker image
3. Image pushed to GitHub Container Registry (GHCR)
4. Azure Container Apps pulls and deploys image
5. Environment variables set in ACA for Neon connection

Production URL: `https://api.movie-app.disney.harma.dev` (after deployment)
