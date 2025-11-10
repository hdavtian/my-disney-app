# Option 2: Separate Migration Service Architecture

**Date Created**: November 8, 2025  
**Project**: Multi-Demo Portfolio Platform  
**Goal**: Build scalable infrastructure for 5-10+ demo projects with shared backend/database/storage

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Moving Parts Explained](#moving-parts-explained)
3. [How It Works: Request Flow](#how-it-works-request-flow)
4. [How It Works: Deployment Flow](#how-it-works-deployment-flow)
5. [Implementation Progress](#implementation-progress)
6. [Benefits vs Option 1](#benefits-vs-option-1)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (Separate)                    │
├─────────────────────────────────────────────────────────────────┤
│  disney.harma.dev        sierra.harma.dev      portfolio.harma  │
│  (React App)             (React App)           (React App)      │
│       ↓                       ↓                     ↓           │
└───────┼───────────────────────┼─────────────────────┼───────────┘
        │                       │                     │
        └───────────────────────┼─────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND LAYER (Shared)                      │
├─────────────────────────────────────────────────────────────────┤
│                  api.harma.dev (Single API)                     │
│                                                                 │
│  ┌─────────────────┐              ┌─────────────────────────┐  │
│  │  Migration      │              │  Main API               │  │
│  │  Service        │              │  (Spring Boot)          │  │
│  │  (Spring Boot)  │              │                         │  │
│  ├─────────────────┤              ├─────────────────────────┤  │
│  │ • Flyway        │ ──runs──>    │ • Controllers           │  │
│  │ • SQL files     │   once       │   /api/disney/*         │  │
│  │ • PostgreSQL    │              │   /api/sierra/*         │  │
│  │   connections   │              │   /api/portfolio/*      │  │
│  │ • Exits after   │              │ • JPA Repositories      │  │
│  │   completion    │              │ • Business Logic        │  │
│  └─────────────────┘              │ • NO Flyway             │  │
│                                   │ • Always Running        │  │
│                                   └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (Shared)                      │
├─────────────────────────────────────────────────────────────────┤
│              Neon PostgreSQL (Single Cluster)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  disney_db   │  │  sierra_db   │  │ portfolio_db │          │
│  │              │  │              │  │              │          │
│  │ • characters │  │ • games      │  │ • projects   │          │
│  │ • movies     │  │ • publishers │  │ • skills     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                   STORAGE LAYER (Shared)                        │
├─────────────────────────────────────────────────────────────────┤
│           Azure Blob Storage (Single Container)                 │
│  /disney/characters/elsa.jpg                                    │
│  /disney/movies/frozen.jpg                                      │
│  /sierra/games/kingsquest.jpg                                   │
│  /portfolio/screenshots/project1.jpg                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Moving Parts Explained

### 1. Migration Service (backend-migrations/)

**What it is:**

- A minimal Spring Boot application that ONLY handles database migrations
- Contains Flyway + PostgreSQL driver (no web server, no REST API)
- Contains all SQL migration files for all projects

**File Structure:**

```
backend-migrations/
├── pom.xml                              # Maven config (Flyway + PostgreSQL only)
├── Dockerfile                           # Container image for migrations
└── src/main/
    ├── java/com/harmadavtian/migrations/
    │   └── MigrationServiceApplication.java   # Main class (runs & exits)
    └── resources/
        ├── application.yml              # Multi-datasource configuration
        └── db/migration/
            ├── project1-disney/
            │   ├── V1__initial_schema.sql
            │   ├── V2__add_characters_table.sql
            │   └── V3__add_movies_table.sql
            ├── project2-sierra/
            │   ├── V1__initial_schema.sql
            │   └── V2__add_games_table.sql
            └── project3-portfolio/
                └── V1__initial_schema.sql
```

**What it does:**

1. Starts up
2. Connects to ALL project databases (disney_db, sierra_db, portfolio_db)
3. Runs pending Flyway migrations for each database
4. Logs success/failure
5. **Exits immediately** (does not stay running)

**When it runs:**

- When you push new SQL migration files
- Manually triggered before deploying main API
- During initial setup of new project databases

**Dependencies:**

```xml
<dependencies>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId> <!-- No web! -->
    </dependency>
</dependencies>
```

**Startup behavior:**

```java
@SpringBootApplication
public class MigrationServiceApplication implements CommandLineRunner {
    public static void main(String[] args) {
        SpringApplication.exit(SpringApplication.run(MigrationServiceApplication.class, args));
    }

    @Override
    public void run(String... args) {
        // Flyway runs automatically via Spring Boot auto-configuration
        log.info("Migrations completed successfully");
    }
}
```

---

### 2. Main API (backend/)

**What it is:**

- Your full-featured Spring Boot REST API
- Handles all business logic for ALL projects
- Does NOT run database migrations (Flyway disabled)

**File Structure:**

```
backend/
├── pom.xml                              # Maven config (Web + JPA, NO Flyway)
├── Dockerfile                           # Container image for API
└── src/main/
    ├── java/com/harmadavtian/disneyapp/
    │   ├── DisneyAppApplication.java    # Main class
    │   ├── controller/
    │   │   ├── disney/                  # Disney project controllers
    │   │   │   ├── CharacterController.java  # @RequestMapping("/api/disney")
    │   │   │   └── MovieController.java
    │   │   ├── sierra/                  # Sierra Games controllers
    │   │   │   └── GameController.java       # @RequestMapping("/api/sierra")
    │   │   └── portfolio/               # Portfolio controllers
    │   │       └── ProjectController.java    # @RequestMapping("/api/portfolio")
    │   ├── service/
    │   │   ├── disney/
    │   │   ├── sierra/
    │   │   └── portfolio/
    │   └── repository/
    │       ├── disney/
    │       ├── sierra/
    │       └── portfolio/
    └── resources/
        └── application.yml              # spring.flyway.enabled=false
```

**What it does:**

1. Starts up (fast - no migrations to run)
2. Connects to pre-migrated databases
3. Serves HTTP requests for ALL projects:
   - `GET /api/disney/characters`
   - `GET /api/disney/movies`
   - `GET /api/sierra/games`
   - `GET /api/portfolio/projects`
4. Runs indefinitely (24/7)

**When it runs:**

- Always (deployed as always-on service)
- Restarts when you push code changes
- Scales horizontally under load (can run 2-3 instances)

**Key Configuration:**

```yaml
spring:
  flyway:
    enabled: false # ← CRITICAL: Main API does NOT run migrations

  datasource:
    disney:
      url: jdbc:postgresql://neon.tech/disney_db
    sierra:
      url: jdbc:postgresql://neon.tech/sierra_db
    portfolio:
      url: jdbc:postgresql://neon.tech/portfolio_db
```

---

### 3. Migration Container App (Azure)

**What it is:**

- Azure Container Apps deployment configured as a **Job** (not a service)
- Runs the migration-service Docker image
- Executes on-demand, not always running

**Configuration:**

```yaml
name: disneyapp-migrations
type: Job # ← Not a regular service
image: ghcr.io/hdavtian/disneyapp-migrations:latest
resources:
  cpu: 0.25
  memory: 0.5Gi
execution:
  replicaCompletionCount: 1
  parallelism: 1
environment:
  - name: ACTIVE_PROJECTS
    value: "project1,project2,project3"
  - name: DISNEY_DB_URL
    secretRef: disney-db-url
  - name: SIERRA_DB_URL
    secretRef: sierra-db-url
```

**What it does:**

1. Azure triggers the job (manual or via CI/CD)
2. Container starts
3. Runs migrations
4. Container exits with status code (0 = success, 1 = failure)
5. Container is destroyed

**Cost:**

- Only charged for ~30-60 seconds of runtime when migrations execute
- Estimated: $0.50-$1/month (negligible)

**When it runs:**

- When you push changes to `backend-migrations/` directory
- Manual trigger via Azure Portal or CLI
- Before main API deployment (via CI/CD dependency)

---

### 4. API Container App (Azure)

**What it is:**

- Azure Container Apps deployment configured as always-on **Service**
- Runs the main API Docker image
- Handles all HTTP traffic for all projects

**Configuration:**

```yaml
name: disneyapp-api
type: Service # ← Always running
image: ghcr.io/hdavtian/disneyapp-api:latest
resources:
  cpu: 0.5
  memory: 1Gi
scale:
  minReplicas: 1 # Always at least 1 running
  maxReplicas: 3 # Auto-scale under load
ingress:
  external: true
  targetPort: 8080
  allowInsecure: false
environment:
  - name: DISNEY_DB_URL
    secretRef: disney-db-url
  - name: SIERRA_DB_URL
    secretRef: sierra-db-url
```

**What it does:**

1. Starts when migration-service completes successfully
2. Accepts HTTP requests on port 8080
3. Routes to appropriate controllers based on URL:
   - `api.harma.dev/api/disney/*` → DisneyController
   - `api.harma.dev/api/sierra/*` → SierraController
4. Stays running 24/7
5. Auto-scales if traffic increases

**Cost:**

- Flat rate: $14.40/month (0.5 vCPU, 1GB RAM, always-on)

**Dependency:**

```yaml
# API container ONLY starts if migration job succeeded
depends_on:
  - disneyapp-migrations
```

---

### 5. Migration CI/CD Pipeline

**What it is:**

- GitHub Actions workflow file: `.github/workflows/deploy-migrations.yml`
- Builds and deploys migration-service automatically

**File: `.github/workflows/deploy-migrations.yml`**

```yaml
name: Deploy Migration Service

on:
  push:
    branches: [main]
    paths:
      - "backend-migrations/**"
      - ".github/workflows/deploy-migrations.yml"
  workflow_dispatch: # Manual trigger

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: "21"

      - name: Build with Maven
        run: |
          cd backend-migrations
          mvn clean package -DskipTests

      - name: Build Docker image
        run: |
          docker build -t ghcr.io/hdavtian/disneyapp-migrations:latest \
            ./backend-migrations

      - name: Push to GitHub Container Registry
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/hdavtian/disneyapp-migrations:latest

      - name: Deploy to Azure Container Apps (Job)
        uses: azure/container-apps-deploy-action@v1
        with:
          acrName: disneyapp
          containerAppName: disneyapp-migrations
          resourceGroup: disneyapp-rg
          imageToDeploy: ghcr.io/hdavtian/disneyapp-migrations:latest
```

**What it does:**

1. Triggers when you change files in `backend-migrations/`
2. Compiles Java code
3. Builds Docker image
4. Pushes to container registry
5. Deploys to Azure (runs migration job)
6. Checks exit code (0 = success, proceed to API deployment)

**Triggers:**

- Push to `backend-migrations/**` files
- Manual workflow dispatch
- Called as dependency from API pipeline

---

### 6. API CI/CD Pipeline

**What it is:**

- GitHub Actions workflow file: `.github/workflows/deploy-backend.yml`
- Builds and deploys main API automatically

**File: `.github/workflows/deploy-backend.yml`**

```yaml
name: Deploy Backend API

on:
  push:
    branches: [main]
    paths:
      - "backend/**"
      - ".github/workflows/deploy-backend.yml"

jobs:
  # Step 1: Run migrations first
  run-migrations:
    uses: ./.github/workflows/deploy-migrations.yml
    secrets: inherit

  # Step 2: Deploy API (only if migrations succeeded)
  deploy-api:
    needs: run-migrations
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build with Maven
        run: |
          cd backend
          mvn clean package -DskipTests

      - name: Build Docker image
        run: |
          docker build -t ghcr.io/hdavtian/disneyapp-api:latest ./backend

      - name: Push to GitHub Container Registry
        run: |
          docker push ghcr.io/hdavtian/disneyapp-api:latest

      - name: Deploy to Azure Container Apps
        uses: azure/container-apps-deploy-action@v1
        with:
          containerAppName: disneyapp-api
          imageToDeploy: ghcr.io/hdavtian/disneyapp-api:latest

      - name: Health Check
        run: |
          curl -f https://api.harma.dev/api/disney/health
          curl -f https://api.harma.dev/api/sierra/health
```

**What it does:**

1. Triggers when you change files in `backend/`
2. Calls migration pipeline first
3. Waits for migrations to complete
4. Builds main API Docker image
5. Deploys to Azure (starts/restarts API container)
6. Runs health checks on all project endpoints

---

### 7. Neon PostgreSQL Databases

**What it is:**

- Single Neon PostgreSQL cluster (free tier)
- Multiple databases (one per project)

**Structure:**

```
Neon Cluster: ep-cool-cloud-12345678.us-east-2.aws.neon.tech
├── disney_db
│   ├── public schema
│   │   ├── characters table
│   │   ├── movies table
│   │   └── flyway_schema_history
│   └── Managed by: migration-service
├── sierra_db
│   ├── public schema
│   │   ├── games table
│   │   └── flyway_schema_history
│   └── Managed by: migration-service
└── portfolio_db
    ├── public schema
    │   ├── projects table
    │   └── flyway_schema_history
    └── Managed by: migration-service
```

**Connection strings:**

```
DISNEY_DB_URL=postgresql://neon.tech/disney_db?user=harma&password=xxx
SIERRA_DB_URL=postgresql://neon.tech/sierra_db?user=harma&password=xxx
PORTFOLIO_DB_URL=postgresql://neon.tech/portfolio_db?user=harma&password=xxx
```

**Who accesses it:**

- **Migration Service**: Writes schema changes (Flyway migrations)
- **Main API**: Reads/writes data (JPA repositories)
- **You (pgAdmin)**: Manual inspection and backups

---

### 8. Azure Blob Storage

**What it is:**

- Single Azure Storage Account
- Single container (e.g., `demo-assets`)
- Folder structure to organize by project

**Structure:**

```
Azure Storage Account: harmademoassets
└── Container: demo-assets
    ├── disney/
    │   ├── characters/
    │   │   ├── elsa.jpg
    │   │   ├── anna.jpg
    │   │   └── olaf.jpg
    │   └── movies/
    │       ├── frozen.jpg
    │       └── moana.jpg
    ├── sierra/
    │   └── games/
    │       ├── kingsquest1.jpg
    │       └── kingsquest2.jpg
    └── portfolio/
        └── screenshots/
            └── project1.jpg
```

**Access:**

```typescript
// frontend/src/config/assets.ts
export const ASSETS_CONFIG = {
  baseUrl: "https://harmademoassets.blob.core.windows.net/demo-assets",
  projects: {
    disney: {
      characters: "/disney/characters",
      movies: "/disney/movies",
    },
    sierra: {
      games: "/sierra/games",
    },
  },
};
```

**Cost:**

- ~$0.0184/GB/month
- Estimated: $1-2/month for all projects

---

## How It Works: Request Flow

### User Visits Disney App

```
1. User visits: https://disney.harma.dev
   ↓
2. Azure Static Web App serves React app
   ↓
3. React app calls: GET https://api.harma.dev/api/disney/characters
   ↓
4. Azure Container App (API) receives request
   ↓
5. Spring Boot routes to DisneyCharacterController
   ↓
6. Controller calls CharacterService
   ↓
7. Service uses JPA Repository to query disney_db
   ↓
8. PostgreSQL returns character data
   ↓
9. API returns JSON response
   ↓
10. React renders CharacterCard components
    ↓
11. CharacterCard loads image: https://harmademoassets.blob.core.windows.net/demo-assets/disney/characters/elsa.jpg
```

### User Visits Sierra Games App

```
1. User visits: https://sierra.harma.dev
   ↓
2. Azure Static Web App serves React app (different app)
   ↓
3. React app calls: GET https://api.harma.dev/api/sierra/games
   ↓
4. SAME Azure Container App (API) receives request
   ↓
5. Spring Boot routes to SierraGameController
   ↓
6. Service queries sierra_db (different database)
   ↓
7. Returns game data
```

**Key Point**: Same API server, different URL paths and databases.

---

## How It Works: Deployment Flow

### Scenario 1: Adding New Disney Movie Feature

```
1. You edit: backend/src/.../controller/disney/MovieController.java
   ↓
2. Git commit + push to main branch
   ↓
3. GitHub Actions: deploy-backend.yml triggers
   ↓
4. Step 1: Check if migrations needed (none in this case)
   ↓
5. Step 2: Build backend.jar with Maven
   ↓
6. Step 3: Build Docker image (ghcr.io/.../disneyapp-api:latest)
   ↓
7. Step 4: Push to GitHub Container Registry
   ↓
8. Step 5: Deploy to Azure Container Apps (API)
   ↓
9. Step 6: Azure restarts API container (~2 seconds)
   ↓
10. Step 7: Health check: GET /api/disney/health (success)
    ↓
11. Deployment complete! New feature live.
```

**Time**: ~3-5 minutes from push to live

---

### Scenario 2: Adding New Database Table

```
1. You create: backend-migrations/src/main/resources/db/migration/project1-disney/V4__add_ratings_table.sql
   ↓
2. Git commit + push to main branch
   ↓
3. GitHub Actions: deploy-migrations.yml triggers
   ↓
4. Step 1: Build migration-service.jar
   ↓
5. Step 2: Build Docker image (ghcr.io/.../disneyapp-migrations:latest)
   ↓
6. Step 3: Deploy to Azure Container Apps (Job)
   ↓
7. Step 4: Azure runs migration job
   ↓
8. Migration container starts
   ↓
9. Connects to disney_db
   ↓
10. Flyway detects V4__add_ratings_table.sql (new)
    ↓
11. Executes: CREATE TABLE ratings (...)
    ↓
12. Updates flyway_schema_history table
    ↓
13. Migration exits with code 0 (success)
    ↓
14. GitHub Actions: deploy-backend.yml triggers (if backend/ also changed)
    ↓
15. API deploys and restarts (~2 seconds)
    ↓
16. API now sees new ratings table
```

**Time**: ~4-6 minutes from push to live

---

### Scenario 3: Adding Brand New Project (Sierra Games)

```
1. Create new database: sierra_db in Neon
   ↓
2. Add migration files:
   - backend-migrations/src/main/resources/db/migration/project2-sierra/V1__initial_schema.sql
   ↓
3. Update migration-service application.yml:
   - Add sierra_db datasource configuration
   ↓
4. Create controllers:
   - backend/src/.../controller/sierra/GameController.java
   ↓
5. Create services and repositories
   ↓
6. Add URL mapping: @RequestMapping("/api/sierra")
   ↓
7. Git commit + push
   ↓
8. GitHub Actions runs:
   - Migration pipeline → Creates sierra_db schema
   - API pipeline → Deploys with new /api/sierra/* endpoints
   ↓
9. Update ACTIVE_PROJECTS environment variable in Azure: "project1,project2"
   ↓
10. Test: GET https://api.harma.dev/api/sierra/games
    ↓
11. Done! New project live alongside Disney app.
```

**Time**: ~1-2 hours of development, 5 minutes deployment

---

## Implementation Progress

### ✅ Completed Tasks

- [x] Architecture design finalized (Option 2)
- [x] Progress tracking document created

### 🔄 In Progress Tasks

None yet - awaiting approval to start

### 📋 Remaining Tasks

| #   | Task                                      | Estimated Time | Status         |
| --- | ----------------------------------------- | -------------- | -------------- |
| 1   | Create Migration Service Structure        | 45 min         | ⬜ Not Started |
| 2   | Move Migrations to Project Folders        | 30 min         | ⬜ Not Started |
| 3   | Configure Multi-DataSource for Migrations | 60 min         | ⬜ Not Started |
| 4   | Disable Flyway in Main API                | 15 min         | ⬜ Not Started |
| 5   | Add URL Namespacing to Controllers        | 45 min         | ⬜ Not Started |
| 6   | Create Migration Service Dockerfile       | 20 min         | ⬜ Not Started |
| 7   | Create Migration CI/CD Pipeline           | 60 min         | ⬜ Not Started |
| 8   | Update Main API CI/CD Pipeline            | 30 min         | ⬜ Not Started |
| 9   | Configure Azure Container Apps Jobs       | 45 min         | ⬜ Not Started |
| 10  | Test Multi-Project Setup Locally          | 60 min         | ⬜ Not Started |

**Total Estimated Time**: ~6-7 hours (roughly 1 work day)

---

## Benefits vs Option 1

| Feature                       | Option 1 (Monolithic)                            | Option 2 (Separated)                     | Winner      |
| ----------------------------- | ------------------------------------------------ | ---------------------------------------- | ----------- |
| **Startup Time**              | 5-10 sec (2 projects)<br>15-20 sec (10 projects) | 2 sec (always)                           | ✅ Option 2 |
| **Adding New Project**        | Edit main API, redeploy everything               | Add migration files, redeploy separately | ✅ Option 2 |
| **Deployment Risk**           | High (migration + API changes together)          | Low (migrations tested first)            | ✅ Option 2 |
| **Rollback Speed**            | Slow (need to rollback migrations)               | Fast (just rollback API, keep DB)        | ✅ Option 2 |
| **Horizontal Scaling**        | Limited (migrations block startup)               | Easy (API scales without migrations)     | ✅ Option 2 |
| **Initial Setup Time**        | 2 hours                                          | 6-7 hours                                | ✅ Option 1 |
| **Complexity**                | Low (single project)                             | Medium (2 projects, dependencies)        | ✅ Option 1 |
| **Cost**                      | $14.40/mo                                        | $15-16/mo                                | ✅ Option 1 |
| **Professional Pattern**      | No (hobby project style)                         | Yes (enterprise best practice)           | ✅ Option 2 |
| **Long-Term Maintainability** | Poor (monolith grows)                            | Excellent (clean separation)             | ✅ Option 2 |

**Verdict**: Option 2 wins 7 out of 10 categories. The 3 wins for Option 1 (setup time, simplicity, cost) are negligible given the scale (5-10+ projects).

---

## Next Steps

1. **Review this document** - Ensure you understand all moving parts
2. **Approve implementation plan** - Confirm we're proceeding with Option 2
3. **Start Task #1** - Create migration-service structure
4. **Work through tasks 2-10** - Complete implementation in 1 day
5. **Test locally** - Verify both migration-service and API work
6. **Deploy to Azure** - Configure Container Apps and test in production
7. **Add Project #2 (Sierra Games)** - Validate the multi-project architecture

---

## AI Assistant / GitHub Copilot Instructions

### ⚠️ CRITICAL: Development Environment Rules

**These are EXPLICIT instructions for AI assistants (GitHub Copilot, Cursor, etc.) working in this workspace:**

---

#### 🚫 NEVER Run Maven/Java Commands in VS Code

**Rule #1: All Java/Maven/Spring Boot commands MUST be run in IntelliJ IDEA.**

```
❌ DO NOT DO THIS IN VS CODE:
- mvn clean install
- mvn spring-boot:run
- mvn test
- java -jar *.jar
- ./mvnw clean package
- Any Maven or Java related commands

✅ INSTEAD:
- Inform user: "Please run Maven commands in IntelliJ IDEA"
- Provide the command for user to run manually in IntelliJ
- NEVER attempt to execute Maven commands in VS Code terminal
```

**Reasoning:**

- IntelliJ IDEA is configured with proper JDK, Maven settings, and project structure
- VS Code does not have Java development environment configured
- Maven builds require specific Java version and environment variables
- Running Maven in VS Code will cause build failures and confusion

**Applies to these repositories:**

- `hd-demos-api` (backend + backend-migrations + shared-models)
- Any Java/Spring Boot projects in the workspace

---

#### 🔍 ALWAYS Check Port 3000 Before Running Frontend Dev Servers

**Rule #2: Check if port 3000 is already running before starting new dev servers.**

```powershell
# STEP 1: Check if port 3000 is in use
netstat -ano | findstr :3000

# STEP 2: If port 3000 is in use:
# ✅ For development/testing: Do nothing, use existing server
# ❌ Don't start another dev server on different port

# STEP 3: If you need to start a new dev server:
# Option A: Stop the existing process first
Stop-Process -Id <PID> -Force

# Option B: Just build without running dev server
npm run build
```

**Decision Tree:**

```
Is port 3000 running?
│
├─ YES
│  ├─ User wants to develop/test? → Use existing server (do nothing)
│  ├─ User wants to build only? → npm run build (no dev server)
│  └─ User wants to restart? → Stop port 3000, then npm run dev
│
└─ NO
   └─ User wants dev server? → npm run dev
```

**Example Prompts:**

```
User: "Run the frontend"
AI: "Port 3000 is already running. The frontend dev server is active at http://localhost:3000. No need to start another instance."

User: "Build the frontend"
AI: "Running production build (npm run build). This won't start a dev server."

User: "Restart the frontend"
AI: "Stopping existing process on port 3000, then starting fresh dev server..."
```

---

#### 📋 Frontend Development Workflow

**Rule #3: Follow this exact workflow for React/Vite projects.**

```powershell
# ALWAYS run these steps in order:

# 1. Check current port status
netstat -ano | findstr :3000

# 2. Navigate to frontend directory
cd frontend  # or cd hd-demo-disney-movie-character-app

# 3. Install dependencies (if needed)
npm install

# 4. Build or run based on user intent
npm run build    # Production build (no dev server)
npm run dev      # Development server (only if port 3000 is free)
```

**Multiple Frontend Projects:**

```
Project                              | Default Port | Vite Config
-------------------------------------|--------------|-------------
hd-demo-disney-movie-character-app   | 3000         | vite.config.ts
hd-demo-sierra-favorite-games-app    | 3001         | vite.config.ts
hd-demo-resume-app                   | 3002         | vite.config.ts

If running multiple frontends simultaneously:
- Disney: npm run dev (port 3000)
- Sierra: npm run dev -- --port 3001
- Resume: npm run dev -- --port 3002
```

---

#### 🎯 Summary: AI Assistant Checklist

Before executing ANY command, verify:

- [ ] **Is this a Maven/Java command?**
  - If YES: ❌ Do NOT run. Tell user to use IntelliJ IDEA.
- [ ] **Is this a frontend dev server command (`npm run dev`)?**
  - If YES: ✅ Check if port 3000 is running first.
  - If port 3000 running: Ask user if they want to stop and restart.
- [ ] **Is this a build-only command (`npm run build`)?**
  - If YES: ✅ Safe to run, no port conflicts.
- [ ] **Is user asking to "run" or "start" something?**
  - If frontend: Check ports first.
  - If backend: Redirect to IntelliJ IDEA.

---

#### 🛠️ Allowed VS Code Commands

**✅ Safe to run in VS Code:**

```powershell
# Node/NPM (Frontend only)
npm install
npm run build
npm run dev (after port check)
npm run lint
npm run test

# Git operations
git status
git add .
git commit -m "message"
git push

# Azure CLI
az group list
az staticwebapp list
az containerapp list
az storage blob upload-batch

# File operations
cp, mv, mkdir, rm
ls, dir, cat

# PowerShell utilities
Get-Process
Stop-Process
netstat
curl, Invoke-WebRequest
```

**❌ NEVER run in VS Code:**

```bash
# Java/Maven
mvn *
./mvnw *
java -jar *
gradle *

# Backend server starts
java -jar backend.jar
spring-boot:run
```

---

## Questions & Answers

### Q: Can I still use Option 1 if I change my mind?

**A:** Yes! Just don't merge the Option 2 changes. The current setup (Option 1) continues working as-is.

### Q: What happens if migration-service fails?

**A:** The API deployment is blocked. You fix the SQL error, push again, and migrations re-run.

### Q: Can I run migrations manually?

**A:** Yes! You can trigger the migration job in Azure Portal or run `mvn spring-boot:run` locally in the migration-service directory.

### Q: Do I need to update frontend code?

**A:** Yes, update API URLs from `/api/characters` to `/api/disney/characters`. This is Task #5.

### Q: What if I add 20+ projects?

**A:** Option 2 still works! You might want to add caching or a Redis layer, but the core architecture scales.

---

---

## Transition Roadmap

### 📋 Quick Reference: Using This Document with AI Assistants

**This document contains COMPLETE, COPY-PASTE-READY instructions for AI assistants:**

| Phase                | IDE               | AI Tool            | What to Copy/Paste                                           |
| -------------------- | ----------------- | ------------------ | ------------------------------------------------------------ |
| **Pre-Migration**    | VS Code           | GitHub Copilot     | Read entire document for planning                            |
| **Phase 1**          | VS Code           | Terminal Only      | Run Azure/GitHub CLI commands directly                       |
| **Phase 2**          | **IntelliJ IDEA** | **GitHub Copilot** | Copy **"🤖 COPY THIS TO INTELLIJ COPILOT CHAT"** section     |
| **Phase 3**          | VS Code           | Terminal Only      | Run file copy and Azure CLI commands                         |
| **Phase 4 (Disney)** | VS Code           | GitHub Copilot     | Copy **"🤖 COPY THIS TO VS CODE (Disney Frontend)"** section |
| **Phase 4 (Sierra)** | VS Code           | GitHub Copilot     | Copy **"🤖 COPY THIS TO VS CODE (Sierra Frontend)"** section |
| **Phase 5-7**        | VS Code           | Terminal + Copilot | Copy test commands or ask Copilot for help                   |

**✅ COPY/PASTE SECTIONS ARE COMPLETE - NO EXAMPLES, NO GUESSING!**

Each copy/paste section includes:

- ✅ Full context (what, where, why)
- ✅ Reference code locations (absolute paths)
- ✅ Target folder structure
- ✅ Complete task list with specific actions
- ✅ Test commands to run
- ✅ Expected results
- ✅ Commit instructions

**How to Use:**

1. Navigate to the phase you're working on
2. Find the **"🤖 COPY THIS TO..."** section
3. Copy the ENTIRE section (between the `---` separators)
4. Paste into Copilot Chat in the appropriate IDE
5. Let AI execute all tasks
6. Verify tests pass
7. Commit and push

---

### 🎯 Workspace Setup & Execution Guide

**WHERE TO RUN THESE INSTRUCTIONS:**

This migration involves working across **multiple workspaces and IDEs**. Here's the execution strategy:

---

#### **Pre-Migration (Planning Phase) - Current Location ✅**

**Where:** `C:\sites\my-disney-app` (current workspace)  
**IDE:** VS Code with GitHub Copilot  
**What:** Reading this document, planning, understanding architecture

✅ **You are here right now** - perfect place to review and prepare.

---

#### **Phase 1: Setup New Infrastructure**

**Where:** `C:\sites\my-disney-app` (can stay here)  
**IDE:** VS Code with PowerShell terminal  
**What:** Running Azure CLI commands, creating GitHub repos

**Commands:**

```powershell
# Run from VS Code PowerShell terminal
az group create --name rg-hd-demos --location westus2
gh repo create hdavtian/hd-demos-api --public
# etc.
```

**Note:** All Azure CLI and GitHub CLI commands can run from VS Code terminal.

---

#### **Phase 2: Migrate Backend (Java/Spring Boot)**

**Where:** `C:\sites\hd-demos-api` (new folder - same name as GitHub repo)  
**IDE:** **IntelliJ IDEA Ultimate** (NOT VS Code)  
**What:** Creating backend repository structure, Maven builds, Java development

**Git Strategy:**

1. Create local folder structure first
2. Build and test locally
3. Initialize git and push to GitHub repo created in Phase 1

**Setup:**

```powershell
# From VS Code terminal (current workspace: C:\sites\my-disney-app)
cd C:\sites\

# Clone existing repos as temporary references
git clone https://github.com/hdavtian/my-disney-app.git temp-disney
git clone https://github.com/hdavtian/sierra-games.git temp-sierra

# Create NEW folder (matches GitHub repo name from Phase 1)
mkdir hd-demos-api
cd hd-demos-api

# Initialize git and connect to empty GitHub repo
git init
git remote add origin https://github.com/hdavtian/hd-demos-api.git

# Don't commit yet - we'll build structure first
```

**Then:**

1. Open `C:\sites\hd-demos-api` in IntelliJ IDEA
2. Build folder structure (Step 2.1 in Phase 2 migration steps)
3. Configure Maven, JDK in IntelliJ
4. Test locally (mvn clean install)
5. **Initial commit AFTER everything works locally**
6. Keep VS Code open for reference (this document)

**⚠️ CRITICAL:** Do NOT open `hd-demos-api` in VS Code for Java work. IntelliJ only.

---

### 🤖 COPY THIS TO INTELLIJ COPILOT CHAT (Phase 2)

**When you open `C:\sites\hd-demos-api` in IntelliJ IDEA, copy/paste this entire section to Copilot Chat:**

---

I'm migrating a Spring Boot backend to a multi-module Maven structure for a multi-demo platform.

**Current Working Directory:** `C:\sites\hd-demos-api` (empty folder with git initialized)

**Reference Code Locations:**

- Disney backend: `C:\sites\temp-disney\backend` (Spring Boot monorepo)
- Sierra backend: `C:\sites\temp-sierra\backend` (Spring Boot monorepo)

**Goal:** Create a unified Spring Boot API that serves multiple projects via URL namespacing:

- `/api/disney/*` → Disney endpoints
- `/api/sierra/*` → Sierra endpoints
- `/swagger-ui.html` → API documentation

**Target Multi-Module Maven Structure:**

```
hd-demos-api/
├── pom.xml (parent POM with modules)
├── shared-models/
│   ├── pom.xml
│   └── src/main/java/com/harmadavtian/shared/model/
│       ├── Character.java
│       └── Movie.java
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/harmadavtian/disneyapp/
│       ├── controller/
│       │   ├── disney/
│       │   │   ├── CharacterController.java (@RequestMapping("/api/disney/characters"))
│       │   │   └── MovieController.java (@RequestMapping("/api/disney/movies"))
│       │   └── sierra/
│       │       └── GamesController.java (@RequestMapping("/api/sierra/games"))
│       ├── service/
│       ├── repository/
│       └── config/
│           └── OpenApiConfig.java (Swagger setup)
└── backend-migrations/
    ├── pom.xml
    └── src/main/resources/
        ├── db/migration/
        │   ├── project1-disney/
        │   │   └── V1__Create_disney_tables.sql
        │   └── project2-sierra/
        │       └── V1__Create_sierra_tables.sql
        └── database/
            ├── disney/
            │   ├── characters.json
            │   └── movies.json
            └── sierra/
                └── games.json
```

**Tasks to Execute:**

1. **Create Parent POM** (`hd-demos-api/pom.xml`)

   - Group ID: `com.harmadavtian`
   - Artifact ID: `hd-demos-parent`
   - Packaging: `pom`
   - Modules: `shared-models`, `backend`, `backend-migrations`

2. **Create shared-models Module**

   - Copy `Character.java` and `Movie.java` from `temp-disney/backend/src/main/java/.../model/`
   - Update package to `com.harmadavtian.shared.model`
   - Add JPA annotations (@Entity, @Table, etc.)

3. **Create backend Module**

   - Copy all controllers from `temp-disney/backend/src/main/java/.../controller/`
   - Update `@RequestMapping` to include `/api/disney` prefix
   - Copy sierra controllers to `controller/sierra/` package
   - Update sierra controllers to use `/api/sierra` prefix
   - Add dependency on `shared-models` module
   - Copy all services and repositories
   - Add Springdoc OpenAPI dependency (`springdoc-openapi-starter-webmvc-ui:2.3.0`)
   - Create `OpenApiConfig.java` with servers, info, and @Tag grouping

4. **Create backend-migrations Module**

   - Copy Flyway migrations from `temp-disney/backend/src/main/resources/db/migration/` to `project1-disney/`
   - Copy Flyway migrations from `temp-sierra/backend/src/main/resources/db/migration/` to `project2-sierra/`
   - Copy JSON data files from both projects to respective `database/` folders
   - Configure DataSeeder to load from project-specific paths
   - This module runs migrations and seeds data (one-time job)

5. **Configure Flyway**

   - Update `application.properties` to use project-based migration paths
   - Flyway locations: `classpath:db/migration/project1-disney,classpath:db/migration/project2-sierra`

6. **Test Locally**
   - Run `mvn clean install` in parent directory (should build all 3 modules)
   - Run backend-migrations: `cd backend-migrations && mvn spring-boot:run` (seeds databases)
   - Run backend API: `cd backend && mvn spring-boot:run` (starts on port 8080)
   - Test endpoints:
     - `http://localhost:8080/api/disney/characters`
     - `http://localhost:8080/api/sierra/games`
     - `http://localhost:8080/swagger-ui.html`

**Important Configuration:**

- Java Version: 21
- Spring Boot Version: 3.x (latest stable)
- Database: PostgreSQL (Neon) - connection strings in application.properties
- Use existing dependencies from temp-disney/backend/pom.xml as reference
- Maintain same Spring Boot configuration structure

**Once all tests pass locally, I will commit and push to GitHub.**

**Reference Document:** Full details in `C:\sites\my-disney-app\docs\OPTION_2_ARCHITECTURE.md` Phase 2 (lines 1698-1856)

---

**END OF INTELLIJ INSTRUCTIONS**

---

**Workflow Summary:**

- Copy and refactor code from temp repos
- Update package names and imports
- Add Swagger/OpenAPI configuration
- Help with Maven commands

**Pro Tip:** Keep this document (OPTION_2_ARCHITECTURE.md) open in VS Code on a second monitor or split screen for easy reference.

**Workflow Summary:**

```
Phase 1: gh repo create hd-demos-api → Empty GitHub repo created ✅
Phase 2: mkdir hd-demos-api → Local folder created
         git init → Initialize local git
         git remote add → Connect to GitHub
         [Open in IntelliJ, share Phase 2 steps with Copilot]
         [Build structure, copy files, test locally]
         git add . → Stage all files
         git commit -m "Initial commit: backend + migrations + shared-models"
         git push -u origin main → Push to GitHub ✅
```

---

#### **Phase 3: Migrate Assets**

**Where:** `C:\sites\hd-demos-assets` (new folder - matches GitHub repo)  
**IDE:** VS Code PowerShell terminal (for Azure CLI)  
**What:** Copying files, uploading to Azure Blob Storage

**Git Strategy:** Assets-only repo (no code to test), commit after organizing files.

**Commands:**

```powershell
# Can run from VS Code terminal in my-disney-app or anywhere
cd C:\sites\

# Create folder (matches GitHub repo name from Phase 1)
mkdir hd-demos-assets
cd hd-demos-assets

# Initialize git and connect
git init
git remote add origin https://github.com/hdavtian/hd-demos-assets.git

# Copy files (Step 3.1, 3.2), then commit
# git add .
# git commit -m "Initial commit: Disney + Sierra assets"
# git push -u origin main
```

---

#### **Phase 4: Migrate Frontends (React/Vite)**

**Where:** `C:\sites\` (create 3 new folders - match GitHub repo names)  
**IDE:** VS Code with GitHub Copilot  
**What:** Creating frontend repos, npm commands, React development

**Git Strategy:** Same as backend - build, test, then commit.

**Setup:**

```powershell
cd C:\sites\

# Create folders (match GitHub repo names from Phase 1)
mkdir hd-demo-disney-movie-character-app
mkdir hd-demo-sierra-favorite-games-app
mkdir hd-demo-resume-app

# For EACH frontend:
cd hd-demo-disney-movie-character-app
git init
git remote add origin https://github.com/hdavtian/hd-demo-disney-movie-character-app.git

# Copy files, npm install, npm run build (test)
# Then: git add . && git commit -m "Initial commit" && git push -u origin main
```

**Then:**

1. Open **each frontend in separate VS Code windows**
2. Or use VS Code multi-root workspace
3. Run `npm install`, `npm run build` to test
4. Commit and push when working
5. **Remember:** Check port 3000 before starting dev servers!

---

### 🤖 COPY THIS TO VS CODE COPILOT CHAT (Phase 4 - Disney Frontend)

**When you open `C:\sites\hd-demo-disney-movie-character-app` in VS Code, copy/paste this to Copilot Chat:**

---

I'm migrating the Disney Movie Character React frontend from a monorepo to a standalone repository.

**Current Working Directory:** `C:\sites\hd-demo-disney-movie-character-app` (empty folder with git initialized)

**Reference Code Location:** `C:\sites\temp-disney\frontend` (React + Vite monorepo frontend)

**Goal:** Create a standalone React + Vite frontend that connects to the new unified API and Azure Blob Storage.

**Tasks to Execute:**

1. **Copy Frontend Code**

   - Copy ALL files from `C:\sites\temp-disney\frontend` to current directory
   - Include: `src/`, `public/`, `index.html`, `package.json`, `vite.config.ts`, `tsconfig.json`, etc.
   - Preserve folder structure exactly

2. **Update Environment Variables**

   - Create `.env.production` file with:
     ```
     VITE_API_BASE_URL=https://ca-hd-demos-api.<hash>.westus2.azurecontainerapps.io/api/disney
     VITE_ASSETS_BASE_URL=https://hddemoassets.blob.core.windows.net/assets/disney
     ```
   - Note: `<hash>` will be replaced after Azure deployment

3. **Update API Endpoints in Code**

   - Find all API calls in `src/` that use `/api/characters` or `/api/movies`
   - Update to `/api/disney/characters` and `/api/disney/movies`
   - Check files: `src/store/slices/*.ts`, `src/utils/*.ts`, `src/config/api.ts`

4. **Verify Configuration Files**

   - Check `vite.config.ts` has correct port (default 5173 or 3000)
   - Check `package.json` scripts:
     - `"dev": "vite"` → starts dev server
     - `"build": "tsc && vite build"` → production build
     - `"preview": "vite preview"` → preview build

5. **Test Build Process**

   - Run: `npm install` (install dependencies)
   - Run: `npm run build` (must succeed without errors)
   - Check `dist/` folder is created
   - **IMPORTANT:** Check port 3000 first with `netstat -ano | findstr :3000` before running dev server
   - If needed: `npm run dev` (start dev server for testing)

6. **Update staticwebapp.config.json**
   - Located in `public/staticwebapp.config.json`
   - Verify routes configuration
   - Verify API proxy settings (if any)

**Expected Result:**

- Clean build with no errors
- `dist/` folder contains optimized production files
- All imports resolved correctly
- TypeScript compilation successful

**Once build succeeds, I will:**

```powershell
git add .
git commit -m "Initial commit: Disney Movie Character frontend"
git push -u origin main
```

**Reference Document:** Full details in `C:\sites\my-disney-app\docs\OPTION_2_ARCHITECTURE.md` Phase 4 Step 4.1

---

**END OF DISNEY FRONTEND INSTRUCTIONS**

---

### 🤖 COPY THIS TO VS CODE COPILOT CHAT (Phase 4 - Sierra Frontend)

**When you open `C:\sites\hd-demo-sierra-favorite-games-app` in VS Code, copy/paste this to Copilot Chat:**

---

I'm migrating the Sierra Favorite Games React frontend from a monorepo to a standalone repository.

**Current Working Directory:** `C:\sites\hd-demo-sierra-favorite-games-app` (empty folder with git initialized)

**Reference Code Location:** `C:\sites\temp-sierra\frontend` (React + Vite monorepo frontend)

**Goal:** Create a standalone React + Vite frontend that connects to the new unified API and Azure Blob Storage.

**Tasks to Execute:**

1. **Copy Frontend Code**

   - Copy ALL files from `C:\sites\temp-sierra\frontend` to current directory
   - Include: `src/`, `public/`, `index.html`, `package.json`, `vite.config.ts`, `tsconfig.json`, etc.
   - Preserve folder structure exactly

2. **Update Environment Variables**

   - Create `.env.production` file with:
     ```
     VITE_API_BASE_URL=https://ca-hd-demos-api.<hash>.westus2.azurecontainerapps.io/api/sierra
     VITE_ASSETS_BASE_URL=https://hddemoassets.blob.core.windows.net/assets/sierra
     ```
   - Note: `<hash>` will be replaced after Azure deployment

3. **Update API Endpoints in Code**

   - Find all API calls in `src/` that reference game endpoints
   - Update to `/api/sierra/games` (or similar sierra endpoints)
   - Check files: `src/store/slices/*.ts`, `src/utils/*.ts`, `src/config/api.ts`

4. **Verify Configuration Files**

   - Check `vite.config.ts` has correct port (5174 or different from Disney)
   - Check `package.json` scripts are correct
   - Update port in vite.config.ts to avoid conflict with Disney frontend

5. **Test Build Process**

   - Run: `npm install` (install dependencies)
   - Run: `npm run build` (must succeed without errors)
   - Check `dist/` folder is created
   - **IMPORTANT:** Check port before running dev server
   - If needed: `npm run dev` (start dev server for testing)

6. **Update staticwebapp.config.json**
   - Located in `public/staticwebapp.config.json`
   - Verify routes configuration

**Expected Result:**

- Clean build with no errors
- `dist/` folder contains optimized production files
- All imports resolved correctly
- TypeScript compilation successful

**Once build succeeds, I will:**

```powershell
git add .
git commit -m "Initial commit: Sierra Favorite Games frontend"
git push -u origin main
```

**Reference Document:** Full details in `C:\sites\my-disney-app\docs\OPTION_2_ARCHITECTURE.md` Phase 4 Step 4.2

---

**END OF SIERRA FRONTEND INSTRUCTIONS**

---

**VS Code Workspace Structure:**

```
VS Code Window 1: C:\sites\my-disney-app (this document)
VS Code Window 2: C:\sites\hd-demo-disney-movie-character-app
VS Code Window 3: C:\sites\hd-demo-sierra-favorite-games-app
IntelliJ Window:  C:\sites\hd-demos-api
```

---

#### **Phases 5-7: Testing, DNS, Cleanup**

**Where:** Any workspace (preferably `my-disney-app` for reference)  
**IDE:** VS Code PowerShell terminal  
**What:** Running test commands, Azure CLI, GitHub CLI

---

#### **🤖 Can GitHub Copilot Run Outside VS Code?**

**Short Answer:** GitHub Copilot is primarily VS Code-based, but here are alternatives:

**✅ Works in:**

- VS Code (full Copilot Chat + inline suggestions)
- IntelliJ IDEA (has GitHub Copilot plugin)
- JetBrains IDEs (via plugin)
- GitHub.com (Copilot Chat on website)
- CLI (GitHub Copilot CLI for terminal commands)

**For This Migration:**

- **Phase 1, 3, 4, 5-7:** Use Copilot in VS Code ✅
- **Phase 2 (Backend):** Use IntelliJ with Copilot plugin installed ✅
  - Install: `Settings → Plugins → Search "GitHub Copilot" → Install`
  - Activate: Same GitHub account as VS Code

**Terminal-Only Phases (No Copilot Needed):**

- Azure CLI commands (just copy/paste)
- GitHub CLI commands (just copy/paste)
- File copying operations

---

#### **📁 Recommended Final Folder Structure**

```
C:\sites\
├── my-disney-app\                    ← Keep for reference (old monorepo)
├── my-disney-app-assets\             ← Keep for reference (old assets)
├── sierra-games\                     ← Keep for reference (old monorepo)
├── temp-disney\                      ← Clone for migration (delete after)
├── temp-sierra\                      ← Clone for migration (delete after)
├── hd-demos-api\                     ← NEW (open in IntelliJ)
│   ├── backend\
│   ├── backend-migrations\
│   └── shared-models\
├── hd-demos-assets\                  ← NEW (assets only, no IDE)
│   ├── disney\
│   └── sierra\
├── hd-demo-disney-movie-character-app\ ← NEW (open in VS Code)
├── hd-demo-sierra-favorite-games-app\  ← NEW (open in VS Code)
└── hd-demo-resume-app\                 ← NEW (open in VS Code)
```

**Total:** 10 folders in `C:\sites\` (3 old + 2 temp + 5 new)

---

#### **🎬 Step-by-Step Execution Flow**

1. **Right Now:** Stay in `C:\sites\my-disney-app`, read this document
2. **Phase 1:** Run Azure/GitHub CLI from VS Code terminal (current workspace)
3. **Phase 2:** Switch to IntelliJ, open `C:\sites\hd-demos-api`
4. **Phase 3:** Back to VS Code terminal (any workspace), run Azure CLI
5. **Phase 4:** Open 3 frontend folders in VS Code (separate windows or multi-root)
6. **Phases 5-7:** VS Code terminal for testing/cleanup commands

**Pro Tip:** Keep this document open in one VS Code window, work in other windows.

---

#### **📦 Git Workflow Summary**

**Phase 1 (GitHub Repo Creation):**

```powershell
# Create empty GitHub repositories
gh repo create hdavtian/hd-demos-api --public
gh repo create hdavtian/hd-demos-assets --public
gh repo create hdavtian/hd-demo-disney-movie-character-app --public
gh repo create hdavtian/hd-demo-sierra-favorite-games-app --public
gh repo create hdavtian/hd-demo-resume-app --public
```

**Result:** 5 empty repos on GitHub ✅

**Phases 2-4 (Local Development → Initial Commit):**

For **EACH** of the 5 repos:

1. **Create local folder** (name matches GitHub repo exactly)

   ```powershell
   cd C:\sites\
   mkdir hd-demos-api  # Example
   cd hd-demos-api
   ```

2. **Initialize git and connect to GitHub**

   ```powershell
   git init
   git remote add origin https://github.com/hdavtian/hd-demos-api.git
   ```

3. **Build project structure locally**

   - Copy files from temp repos
   - Create folder structure
   - Configure dependencies (Maven/npm)
   - **Test locally first!**
     - Backend: `mvn clean install` in IntelliJ
     - Frontend: `npm install && npm run build` in VS Code

4. **Initial commit ONLY AFTER local testing passes**
   ```powershell
   git add .
   git commit -m "Initial commit: [description]"
   git push -u origin main
   ```

**Why This Order?**

- ✅ Ensures code builds before pushing to GitHub
- ✅ Avoids broken initial commits
- ✅ CI/CD won't fail on first push
- ✅ Clean git history from day one

**Commit Messages:**

```
hd-demos-api:                      "Initial commit: backend + migrations + shared-models"
hd-demos-assets:                   "Initial commit: Disney + Sierra assets"
hd-demo-disney-movie-character-app: "Initial commit: Disney frontend"
hd-demo-sierra-favorite-games-app:  "Initial commit: Sierra frontend"
hd-demo-resume-app:                "Initial commit: Resume frontend"
```

---

### Current State (Disney App - Old Architecture)

#### GitHub Repositories (3 repos)

```
1. https://github.com/hdavtian/my-disney-app
   - Type: Monorepo
   - Contains: frontend/ + backend/ + migrations/
   - Status: Active (production)

2. https://github.com/hdavtian/my-disney-app-assets
   - Type: Assets only
   - Contains: Disney character/movie images
   - Status: Active (production)

3. https://github.com/hdavtian/sierra-games
   - Type: Monorepo
   - Contains: frontend/ + backend/ + migrations/ + images/
   - Status: Active (needs migration + image extraction)
```

#### Azure Infrastructure (rg-disney-movies-app)

```
Resource Group: rg-disney-movies-app (West US 2)
├── Frontend
│   └── swa-movie-app-fe (Static Web App)
│       - URL: calm-ocean-0a6ef4d1e.3.azurestaticapps.net
│       - GitHub: hdavtian/my-disney-app
│       - Branch: main
│
├── Backend
│   ├── cae-disney (Container Apps Environment)
│   └── ca-movie-app-api (Container App)
│       - URL: ca-movie-app-api.delightfulcliff-b8bbe0ca.westus2.azurecontainerapps.io
│       - Type: Always-on service
│
├── Storage
│   └── disneyimages (Storage Account)
│       - Type: StorageV2 (Hot tier)
│       - Access: Public blob access enabled
│
└── Monitoring
    └── workspace-rgdisneymoviesapptKQ7 (Log Analytics)
```

#### Neon PostgreSQL Databases (Single Cluster)

```
Host: ep-falling-pine-aavgfbuo-pooler.westus3.azure.neon.tech:5432
Account: Neon Free Tier

Databases:
├── disneyapp
│   - User: neondb_owner
│   - Tables: characters, movies, hero_movie_carousel
│   - Size: ~180 characters + 831 movies
│
└── sierra_games
    - User: neondb_owner (same as disney)
    - Tables: games, publishers, etc.
```

**⚠️ Security Note:** Same database user (`neondb_owner`) for all databases is acceptable for demos but consider separate users for production:

- `disney_app_user` (GRANT SELECT, INSERT, UPDATE, DELETE ON disneyapp.\*)
- `sierra_app_user` (GRANT SELECT, INSERT, UPDATE, DELETE ON sierra_games.\*)
- Principle of least privilege (if disney app is compromised, sierra db is safe)

**Recommendation for Demos:** Keep single user (`neondb_owner`) for simplicity.

---

### Target State (New Multi-Demo Architecture)

#### GitHub Repositories (5 repos)

**1. Backend + Migrations (New)**

```
https://github.com/hdavtian/hd-demos-api
- Type: Monorepo (backend/ + backend-migrations/)
- Contains:
  ├── backend/                    ← Main API (Spring Boot)
  │   └── controller/
  │       ├── disney/            ← /api/disney/*
  │       ├── sierra/            ← /api/sierra/*
  │       └── resume/            ← /api/resume/*
  ├── backend-migrations/         ← Migration service
  │   ├── db/migration/
  │   │   ├── project1-disney/
  │   │   ├── project2-sierra/
  │   │   └── project3-resume/
  │   └── database/
  │       ├── disney/
  │       │   ├── characters.json
  │       │   └── movies.json
  │       └── sierra/
  │           └── games.json
  └── shared-models/              ← Shared entities
- Pipelines: deploy-migrations.yml, deploy-backend.yml
- Status: To be created
```

**2. Unified Assets Repository (New)**

```
https://github.com/hdavtian/hd-demos-assets
- Type: Assets only (images, videos, static files)
- Structure:
  ├── disney/
  │   ├── characters/
  │   │   ├── elsa.jpg
  │   │   └── anna.jpg
  │   └── movies/
  │       └── frozen.jpg
  ├── sierra/
  │   └── games/
  │       └── kingsquest1.jpg
  └── resume/
      └── screenshots/
          └── project1.jpg
- Pipeline: Upload to Azure Blob Storage
- Status: To be created
```

**3. Disney Frontend (New)**

```
https://github.com/hdavtian/hd-demo-disney-movie-character-app
- Type: Frontend only (React + Vite)
- Contains: src/, public/, vite.config.ts
- Environment:
  VITE_API_BASE_URL=https://api.demos.harma.dev/api/disney
  VITE_ASSETS_BASE_URL=https://hddemoassets.blob.core.windows.net/assets/disney
- Pipeline: deploy.yml → Azure Static Web Apps
- Status: To be created (migrate from my-disney-app/frontend/)
```

**4. Sierra Frontend (Existing, needs update)**

```
https://github.com/hdavtian/hd-demo-sierra-favorite-games-app
- Type: Frontend only (React + Vite)
- Current: sierra-games repo (monorepo)
- Migration needed:
  1. Extract frontend/ to new repo
  2. Update API URLs to point to hd-demos-api
  3. Extract images to hd-demos-assets
- Status: Needs migration
```

**5. Resume Frontend (New)**

```
https://github.com/hdavtian/hd-demo-resume-app
- Type: Frontend only (React + Vite)
- Contains: Portfolio/resume website
- Status: To be created
```

---

#### Azure Infrastructure (New Resource Group)

**New Resource Group: `rg-hd-demos` (West US 2)**

```
Resource Group: rg-hd-demos
├── Backend Services
│   ├── cae-hd-demos (Container Apps Environment)
│   ├── ca-hd-demos-migrations (Container App - Job)
│   │   - Type: Manual/scheduled job
│   │   - Image: ghcr.io/hdavtian/hd-demos-migrations:latest
│   │   - Trigger: On-demand or git push
│   │   - Env vars: ACTIVE_PROJECTS=disney,sierra,resume
│   └── ca-hd-demos-api (Container App - Service)
│       - Type: Always-on HTTP service
│       - Image: ghcr.io/hdavtian/hd-demos-api:latest
│       - URL: api.demos.harma.dev (custom domain)
│       - Replicas: 1-3 (auto-scale)
│       - CPU: 0.5 vCPU, Memory: 1 GB
│
├── Frontend Services
│   ├── swa-hd-demo-disney (Static Web App)
│   │   - GitHub: hdavtian/hd-demo-disney-movie-character-app
│   │   - Custom Domain: disney.demos.harma.dev
│   ├── swa-hd-demo-sierra (Static Web App)
│   │   - GitHub: hdavtian/hd-demo-sierra-favorite-games-app
│   │   - Custom Domain: sierra.demos.harma.dev
│   └── swa-hd-demo-resume (Static Web App)
│       - GitHub: hdavtian/hd-demo-resume-app
│       - Custom Domain: resume.harma.dev
│
├── Storage
│   └── hddemoassets (Storage Account)
│       - Type: StorageV2 (Hot tier)
│       - Container: assets/
│       - Structure:
│         ├── disney/characters/
│         ├── disney/movies/
│         ├── sierra/games/
│         └── resume/screenshots/
│       - CDN: Optional (Azure CDN for performance)
│       - Public access: Blob (read-only)
│
└── Monitoring
    ├── workspace-hd-demos (Log Analytics)
    └── appinsights-hd-demos (Application Insights)
```

---

#### Neon PostgreSQL (Updated Structure)

**Same cluster, new databases:**

```
Host: ep-falling-pine-aavgfbuo-pooler.westus3.azure.neon.tech:5432

Databases:
├── disneyapp (existing, unchanged)
│   - User: neondb_owner
│   - Status: Migrate data from old to new structure
│
├── sierra_games (existing, unchanged)
│   - User: neondb_owner
│   - Status: Keep as-is
│
└── resume_db (new)
    - User: neondb_owner
    - Status: Create new
```

**Database User Strategy (Recommended):**

Option 1: Single user (simpler for demos)

```sql
-- Keep using neondb_owner for all databases
-- Pros: Simple, fewer secrets to manage
-- Cons: Less secure (one compromised app = all DBs exposed)
```

Option 2: Per-project users (more secure)

```sql
-- Create separate users
CREATE USER disney_app WITH PASSWORD 'xxx';
GRANT CONNECT ON DATABASE disneyapp TO disney_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO disney_app;

CREATE USER sierra_app WITH PASSWORD 'yyy';
GRANT CONNECT ON DATABASE sierra_games TO sierra_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sierra_app;
```

**For demos: Option 1 (single user) is fine.**

---

### Transition Strategy: Parallel Migration (Zero Downtime)

**✅ CRITICAL: Zero Impact on Existing Setup**

The entire migration uses **NEW resources** - existing setup remains 100% untouched:

```
OLD (Stays Running):
├── Resource Group: rg-disney-movies-app
├── Static Web App: swa-movie-app-fe
├── Container App: ca-movie-app-api
├── Storage: disneyimages
├── Domain: movie-app.disney.harma.dev
└── Repos: my-disney-app, my-disney-app-assets, sierra-games
    (No changes to existing repos or GitHub Actions)

NEW (Built in Parallel):
├── Resource Group: rg-hd-demos ← Completely separate
├── Static Web Apps: swa-hd-demo-disney, swa-hd-demo-sierra
├── Container Apps: ca-hd-demos-api, ca-hd-demos-migrations
├── Storage: hddemoassets
├── Domains: demos.harma.dev (new subdomain)
└── Repos: hd-demos-api, hd-demos-assets, hd-demo-disney-*, hd-demo-sierra-*
    (All new repos, old ones untouched)
```

**Why separate Resource Group is PERFECT:**

- ✅ Zero risk to existing apps (different RG = complete isolation)
- ✅ Easy cleanup: `az group delete --name rg-hd-demos` removes everything
- ✅ If new architecture fails, old one unaffected
- ✅ Clear cost tracking (see new architecture cost separately)
- ✅ No accidental deletion of old resources

**Existing GitHub Actions:** Old repos continue deploying to old Azure resources. No conflicts.

---

#### Phase 1: Setup New Infrastructure

- [ ] **Step 1.1: Create New Azure Resource Group**

```powershell
az group create --name rg-hd-demos --location westus2
```

- [ ] **Step 1.2: Create New GitHub Repositories**

```bash
# Backend + Migrations
gh repo create hdavtian/hd-demos-api --public

# Assets
gh repo create hdavtian/hd-demos-assets --public

# Disney Frontend
gh repo create hdavtian/hd-demo-disney-movie-character-app --public

# Sierra Frontend (rename existing)
gh repo rename sierra-games hd-demo-sierra-favorite-games-app

# Resume Frontend
gh repo create hdavtian/hd-demo-resume-app --public
```

- [ ] **Step 1.3: Create Azure Container Apps Environment**

```powershell
az containerapp env create \
  --name cae-hd-demos \
  --resource-group rg-hd-demos \
  --location westus2
```

- [ ] **Step 1.4: Create Azure Storage Account**

```powershell
az storage account create \
  --name hddemoassets \
  --resource-group rg-hd-demos \
  --location westus2 \
  --sku Standard_LRS \
  --kind StorageV2 \
  --allow-blob-public-access true

# Create container
az storage container create \
  --name assets \
  --account-name hddemoassets \
  --public-access blob
```

- [ ] **✅ Phase 1 Testing:**

```powershell
# Verify resource group exists
az group show --name rg-hd-demos

# Verify Container Apps Environment is ready
az containerapp env show --name cae-hd-demos --resource-group rg-hd-demos

# Verify storage account accessible
az storage container show --name assets --account-name hddemoassets

# Verify GitHub repos created
gh repo view hdavtian/hd-demos-api
gh repo view hdavtian/hd-demos-assets
```

**Expected Result:** All Azure resources provisioned, all GitHub repos created, no errors.

**📋 Phase 1 Completion Checklist:**

- [ ] All 4 steps completed successfully
- [ ] All testing commands passed
- [ ] Azure resource group `rg-hd-demos` exists
- [ ] Container Apps Environment `cae-hd-demos` ready
- [ ] Storage account `hddemoassets` accessible
- [ ] All 5 GitHub repositories created
- [ ] ✅ **Mark Phase 1 as COMPLETE**

---

#### Phase 2: Migrate Backend

- [ ] **Step 2.1: Create hd-demos-api Repository Structure**

```bash
cd ~
git clone https://github.com/hdavtian/my-disney-app.git temp-disney
git clone https://github.com/hdavtian/sierra-games.git temp-sierra

# Create new repo structure
mkdir hd-demos-api
cd hd-demos-api

# Copy backend from disney
cp -r ../temp-disney/backend ./backend

# Copy migrations from disney
mkdir -p backend-migrations/src/main/resources/db/migration/project1-disney
cp -r ../temp-disney/backend/src/main/resources/db/migration/* \
  backend-migrations/src/main/resources/db/migration/project1-disney/

# Copy data files
mkdir -p backend-migrations/src/main/resources/database/disney
cp ../temp-disney/backend/src/main/resources/database/* \
  backend-migrations/src/main/resources/database/disney/

# Create shared-models module
mkdir -p shared-models/src/main/java/com/harmadavtian/shared/model
# Move Character.java, Movie.java to shared-models

# Update backend controllers to use /api/disney prefix
# (manual code changes needed)
```

- [ ] **Step 2.2: Add Sierra Games Backend**

```bash
# Copy sierra backend code
mkdir -p backend/src/main/java/com/harmadavtian/disneyapp/controller/sierra

# Copy sierra migrations
mkdir -p backend-migrations/src/main/resources/db/migration/project2-sierra
cp -r ../temp-sierra/backend/src/main/resources/db/migration/* \
  backend-migrations/src/main/resources/db/migration/project2-sierra/

# Copy sierra data
mkdir -p backend-migrations/src/main/resources/database/sierra
cp ../temp-sierra/backend/src/main/resources/database/* \
  backend-migrations/src/main/resources/database/sierra/
```

- [ ] **Step 2.3: Add Swagger/OpenAPI for API Testing**

Add **Springdoc OpenAPI** dependency to `backend/pom.xml`:

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.3.0</version>
</dependency>
```

Create `backend/src/main/java/com/harmadavtian/disneyapp/config/OpenApiConfig.java`:

```java
package com.harmadavtian.disneyapp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("HD Demos API")
                .version("1.0.0")
                .description("Unified API for Disney, Sierra, and Resume demos"))
            .servers(List.of(
                new Server()
                    .url("https://api.demos.harma.dev")
                    .description("Production"),
                new Server()
                    .url("http://localhost:8080")
                    .description("Local Development")
            ));
    }
}
```

Add controller-level annotations for grouping:

```java
// DisneyCharacterController.java
@RestController
@RequestMapping("/api/disney/characters")
@Tag(name = "Disney - Characters", description = "Disney character endpoints")
public class CharacterController {
    // ... existing code
}

// DisneyMovieController.java
@RestController
@RequestMapping("/api/disney/movies")
@Tag(name = "Disney - Movies", description = "Disney movie endpoints")
public class MovieController {
    // ... existing code
}

// SierraGamesController.java
@RestController
@RequestMapping("/api/sierra/games")
@Tag(name = "Sierra - Games", description = "Sierra games endpoints")
public class GamesController {
    // ... existing code
}
```

**Swagger UI will be available at:**

- **Local:** http://localhost:8080/swagger-ui.html
- **Production:** https://api.demos.harma.dev/swagger-ui.html
- **OpenAPI JSON:** https://api.demos.harma.dev/v3/api-docs

**Benefits:**

- Interactive API testing (no Postman needed)
- Auto-generated documentation
- Grouped by project (Disney, Sierra, Resume)
- Try-it-out functionality for all endpoints

- [ ] **Step 2.4: Create Parent POM**

```xml
<!-- pom.xml (root) -->
<project>
  <groupId>com.harmadavtian</groupId>
  <artifactId>hd-demos-parent</artifactId>
  <version>1.0.0</version>
  <packaging>pom</packaging>

  <modules>
    <module>shared-models</module>
    <module>backend</module>
    <module>backend-migrations</module>
  </modules>
</project>
```

- [ ] **Step 2.5: Setup CI/CD Pipelines**

```yaml
# .github/workflows/deploy-migrations.yml
# .github/workflows/deploy-backend.yml
(As designed earlier in conversation)
```

- [ ] **Step 2.6: Deploy to New Azure Container Apps**

```powershell
# Create migration job
az containerapp job create \
  --name ca-hd-demos-migrations \
  --resource-group rg-hd-demos \
  --environment cae-hd-demos \
  --image ghcr.io/hdavtian/hd-demos-migrations:latest \
  --trigger-type Manual

# Create API service
az containerapp create \
  --name ca-hd-demos-api \
  --resource-group rg-hd-demos \
  --environment cae-hd-demos \
  --image ghcr.io/hdavtian/hd-demos-api:latest \
  --target-port 8080 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3
```

- [ ] **✅ Phase 2 Testing:**

```powershell
# Test local build (in IntelliJ IDEA)
cd hd-demos-api
mvn clean install

# Test migrations locally (in IntelliJ IDEA)
cd backend-migrations
mvn spring-boot:run
# Should run migrations and seed data

# Test API locally (in IntelliJ IDEA)
cd backend
mvn spring-boot:run
# Server should start on port 8080

# Test endpoints locally
curl http://localhost:8080/api/disney/characters
curl http://localhost:8080/api/sierra/games
curl http://localhost:8080/swagger-ui.html

# Test Azure deployment
az containerapp job start --name ca-hd-demos-migrations --resource-group rg-hd-demos
az containerapp logs show --name ca-hd-demos-api --resource-group rg-hd-demos --follow

# Test API in Azure
curl https://ca-hd-demos-api.<hash>.westus2.azurecontainerapps.io/api/disney/characters
curl https://ca-hd-demos-api.<hash>.westus2.azurecontainerapps.io/swagger-ui.html
```

**Expected Result:** Migrations complete successfully, databases seeded, API returns data, Swagger UI loads.

**📋 Phase 2 Completion Checklist:**

- [ ] All 6 steps completed successfully
- [ ] All testing commands passed
- [ ] Repository structure created with 3 modules
- [ ] Backend code migrated (Disney + Sierra)
- [ ] Swagger/OpenAPI configured
- [ ] Parent POM created
- [ ] CI/CD pipelines configured
- [ ] Container Apps deployed (migrations + API)
- [ ] Local testing successful (IntelliJ)
- [ ] Azure deployment successful
- [ ] API endpoints returning data
- [ ] Swagger UI accessible
- [ ] ✅ **Mark Phase 2 as COMPLETE**

---

#### Phase 3: Migrate Assets

- [ ] **Step 3.1: Extract Images from Sierra Repo**

```bash
cd temp-sierra
# Copy images to hd-demos-assets repo
mkdir -p ~/hd-demos-assets/sierra/games
cp -r images/* ~/hd-demos-assets/sierra/games/
```

- [ ] **Step 3.2: Copy Disney Assets**

```bash
cd ~/my-disney-app-assets
cp -r * ~/hd-demos-assets/disney/
```

- [ ] **Step 3.3: Upload to Azure Blob Storage**

```powershell
az storage blob upload-batch \
  --account-name hddemoassets \
  --destination assets \
  --source ~/hd-demos-assets/ \
  --pattern "*"
```

- [ ] **✅ Phase 3 Testing:**

```powershell
# List uploaded blobs
az storage blob list \
  --account-name hddemoassets \
  --container-name assets \
  --output table

# Test image URLs (should be publicly accessible)
curl -I https://hddemoassets.blob.core.windows.net/assets/disney/characters/mickey-mouse.jpg
curl -I https://hddemoassets.blob.core.windows.net/assets/sierra/games/game-icon-1.jpg

# Verify folder structure
az storage blob list \
  --account-name hddemoassets \
  --container-name assets \
  --prefix "disney/" \
  --output table

az storage blob list \
  --account-name hddemoassets \
  --container-name assets \
  --prefix "sierra/" \
  --output table
```

**Expected Result:** All images uploaded, publicly accessible via URLs, organized in correct folder structure.

**📋 Phase 3 Completion Checklist:**

- [ ] All 3 steps completed successfully
- [ ] All testing commands passed
- [ ] Sierra images extracted from repo
- [ ] Disney assets copied
- [ ] All assets uploaded to Azure Blob Storage
- [ ] Images publicly accessible via URLs
- [ ] Folder structure correct (disney/, sierra/)
- [ ] ✅ **Mark Phase 3 as COMPLETE**

---

#### Phase 4: Migrate Frontends

- [ ] **Step 4.1: Disney Frontend**

```bash
# Extract from monorepo
cp -r temp-disney/frontend ~/hd-demo-disney-movie-character-app

cd ~/hd-demo-disney-movie-character-app

# Update environment variables
cat > .env.production << EOF
VITE_API_BASE_URL=https://ca-hd-demos-api.<hash>.westus2.azurecontainerapps.io/api/disney
VITE_ASSETS_BASE_URL=https://hddemoassets.blob.core.windows.net/assets/disney
EOF

# Create Azure Static Web App
az staticwebapp create \
  --name swa-hd-demo-disney \
  --resource-group rg-hd-demos \
  --location westus2
```

- [ ] **Step 4.2: Sierra Frontend**

```bash
# Extract from monorepo
cp -r temp-sierra/frontend ~/hd-demo-sierra-favorite-games-app

# Update environment
cat > .env.production << EOF
VITE_API_BASE_URL=https://ca-hd-demos-api.<hash>.westus2.azurecontainerapps.io/api/sierra
VITE_ASSETS_BASE_URL=https://hddemoassets.blob.core.windows.net/assets/sierra
EOF

# Create Static Web App
az staticwebapp create \
  --name swa-hd-demo-sierra \
  --resource-group rg-hd-demos
```

- [ ] **✅ Phase 4 Testing:**

```powershell
# Test local builds (check port 3000 first!)
cd hd-demo-disney-movie-character-app
npm install
npm run dev
# Should run on localhost:5173

cd ../hd-demo-sierra-favorite-games-app
npm install
npm run dev
# Should run on localhost:5174

# Test production builds
npm run build
# Check dist/ folder created

# Test deployed Static Web Apps
curl -I https://swa-hd-demo-disney.<hash>.azurestaticapps.net
curl -I https://swa-hd-demo-sierra.<hash>.azurestaticapps.net

# Manual browser testing
# - Navigate to each frontend
# - Click through features
# - Verify images load from Blob Storage
# - Verify API calls work (check Network tab)
# - Test on mobile and desktop viewports
```

**Expected Result:** Frontends deploy successfully, connect to new API, images load from Blob Storage, all features functional.

**📋 Phase 4 Completion Checklist:**

- [ ] All 2 steps completed successfully
- [ ] All testing commands passed
- [ ] Disney frontend extracted and configured
- [ ] Sierra frontend extracted and configured
- [ ] Environment variables updated
- [ ] Static Web Apps created
- [ ] Local builds successful
- [ ] Production builds successful
- [ ] Deployed apps accessible
- [ ] Images loading from Blob Storage
- [ ] API calls working
- [ ] Mobile responsive
- [ ] ✅ **Mark Phase 4 as COMPLETE**

---

#### Phase 5: Testing & Validation

- [ ] **Step 5.1: Test New Disney App**

```bash
# Test API
curl https://ca-hd-demos-api.<hash>.westus2.azurecontainerapps.io/api/disney/characters

# Test Frontend
open https://swa-hd-demo-disney.<hash>.azurestaticapps.net

# Verify images load from Blob Storage
```

- [ ] **Step 5.2: Test New Sierra App**

```bash
# Test API
curl https://ca-hd-demos-api.<hash>.westus2.azurecontainerapps.io/api/sierra/games

# Test Frontend
open https://swa-hd-demo-sierra.<hash>.azurestaticapps.net
```

- [ ] **Step 5.3: Parallel Run (1 week)**

```
Old Architecture (production):
- disney.harma.dev → calm-ocean-0a6ef4d1e.3.azurestaticapps.net

New Architecture (staging):
- disney-new.harma.dev → swa-hd-demo-disney.<hash>.azurestaticapps.net

Run both for 1 week, compare:
- Performance
- Functionality
- Cost
```

- [ ] **✅ Phase 5 Testing:**

```bash
# End-to-end smoke tests
curl https://ca-hd-demos-api.<hash>.westus2.azurecontainerapps.io/api/disney/characters | jq '.[:3]'
curl https://ca-hd-demos-api.<hash>.westus2.azurecontainerapps.io/api/disney/movies | jq '.[:3]'
curl https://ca-hd-demos-api.<hash>.westus2.azurecontainerapps.io/api/sierra/games | jq '.[:3]'

# Load testing (optional)
# ab -n 1000 -c 10 https://ca-hd-demos-api.<hash>.westus2.azurecontainerapps.io/api/disney/characters

# Browser testing checklist
# ✓ Disney frontend loads
# ✓ Sierra frontend loads
# ✓ All images display correctly
# ✓ Navigation works
# ✓ Search functionality works
# ✓ Favorites/cart features work
# ✓ No console errors
# ✓ Mobile responsive

# Monitor Azure Portal for errors
az monitor activity-log list --resource-group rg-hd-demos --max-events 10
```

**Expected Result:** All demos working end-to-end, performance acceptable, no critical errors.

**📋 Phase 5 Completion Checklist:**

- [ ] All 3 steps completed successfully
- [ ] All testing commands passed
- [ ] Disney app tested (API + Frontend)
- [ ] Sierra app tested (API + Frontend)
- [ ] Parallel run configured (old + new)
- [ ] End-to-end smoke tests passed
- [ ] Browser testing checklist complete
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] ✅ **Mark Phase 5 as COMPLETE**

---

#### Phase 6: DNS Configuration (GoDaddy + Azure)

**Current Domain Structure:**

```
harma.dev (registered with GoDaddy)
├── movie-app.disney.harma.dev → Disney Frontend (old)
└── api.movie-app.disney.harma.dev → Disney API (old)
```

**New Domain Structure:**

```
harma.dev
├── demos.harma.dev → New demos subdomain
│   ├── disney.demos.harma.dev → Disney Frontend (new)
│   ├── sierra.demos.harma.dev → Sierra Frontend (new)
│   ├── resume.harma.dev → Resume (new)
│   └── api.demos.harma.dev → Unified API (new)
│       ├── /api/disney/* → Disney endpoints
│       ├── /api/sierra/* → Sierra endpoints
│       └── /swagger-ui.html → API Documentation
└── movie-app.disney.harma.dev → Keep old running until cutover
```

- [ ] **Step 6.1: Configure Azure Static Web Apps Custom Domains**

```powershell
# Disney Frontend
az staticwebapp hostname set \
  --name swa-hd-demo-disney \
  --resource-group rg-hd-demos \
  --hostname disney.demos.harma.dev

# Sierra Frontend
az staticwebapp hostname set \
  --name swa-hd-demo-sierra \
  --resource-group rg-hd-demos \
  --hostname sierra.demos.harma.dev

# Resume Frontend
az staticwebapp hostname set \
  --name swa-hd-demo-resume \
  --resource-group rg-hd-demos \
  --hostname resume.harma.dev
```

- [ ] **Step 6.2: Configure Azure Container App Custom Domain (API)**

```powershell
# Add custom domain to API Container App
az containerapp hostname add \
  --name ca-hd-demos-api \
  --resource-group rg-hd-demos \
  --hostname api.demos.harma.dev

# Bind SSL certificate (automatic with Azure)
az containerapp hostname bind \
  --name ca-hd-demos-api \
  --resource-group rg-hd-demos \
  --hostname api.demos.harma.dev \
  --environment cae-hd-demos \
  --validation-method CNAME
```

**Step 6.3: Configure GoDaddy DNS Records**

Login to GoDaddy (https://dcc.godaddy.com/domains) → Manage DNS for `harma.dev`:

**Add CNAME Records:**

| Type  | Name           | Value                                                  | TTL |
| ----- | -------------- | ------------------------------------------------------ | --- |
| CNAME | `disney.demos` | `swa-hd-demo-disney.<hash>.azurestaticapps.net`        | 600 |
| CNAME | `sierra.demos` | `swa-hd-demo-sierra.<hash>.azurestaticapps.net`        | 600 |
| CNAME | `resume`       | `swa-hd-demo-resume.<hash>.azurestaticapps.net`        | 600 |
| CNAME | `api.demos`    | `ca-hd-demos-api.<hash>.westus2.azurecontainerapps.io` | 600 |

**Add TXT Record for Validation (Azure will provide this):**

| Type | Name                 | Value                      | TTL  |
| ---- | -------------------- | -------------------------- | ---- |
| TXT  | `asuid.disney.demos` | `<azure-validation-token>` | 3600 |
| TXT  | `asuid.api.demos`    | `<azure-validation-token>` | 3600 |

**DNS Propagation:** Wait 5-10 minutes, then verify:

```powershell
# Check DNS resolution
nslookup disney.demos.harma.dev
nslookup api.demos.harma.dev

# Test HTTPS (should work after Azure provisions SSL)
curl https://disney.demos.harma.dev
curl https://api.demos.harma.dev/api/disney/characters
```

```powershell
# Add custom domain to Container App
az containerapp hostname add \
  --name ca-hd-demos-api \
  --resource-group rg-hd-demos \
  --hostname api.demos.harma.dev
```

- [ ] **Step 6.4: Monitor Traffic**

```
Test new architecture first, then switch 100% when ready.
Keep old running until confident new one works.
```

- [ ] **✅ Phase 6 Testing:**

```powershell
# Verify DNS propagation
nslookup disney.demos.harma.dev
nslookup sierra.demos.harma.dev
nslookup api.demos.harma.dev

# Test custom domains with HTTPS
curl -I https://disney.demos.harma.dev
curl -I https://sierra.demos.harma.dev
curl -I https://api.demos.harma.dev/api/disney/characters

# Check SSL certificate validity
openssl s_client -connect disney.demos.harma.dev:443 -servername disney.demos.harma.dev < /dev/null

# Browser testing with custom domains
# ✓ https://disney.demos.harma.dev loads correctly
# ✓ https://sierra.demos.harma.dev loads correctly
# ✓ https://api.demos.harma.dev/swagger-ui.html loads
# ✓ No mixed content warnings
# ✓ SSL certificates valid (green padlock)

# Verify old domain still works
curl -I https://movie-app.disney.harma.dev
```

**Expected Result:** Custom domains resolve correctly, SSL certificates valid, old domain still operational.

**📋 Phase 6 Completion Checklist:**

- [ ] All 4 steps completed successfully
- [ ] All testing commands passed
- [ ] Azure Static Web Apps custom domains configured
- [ ] Azure Container App custom domain configured
- [ ] GoDaddy DNS records added (CNAME + TXT)
- [ ] DNS propagation complete (5-10 minutes)
- [ ] Custom domains resolve correctly
- [ ] HTTPS working with valid SSL certificates
- [ ] All apps accessible via custom domains
- [ ] Old domain still operational (zero impact)
- [ ] ✅ **Mark Phase 6 as COMPLETE**

---

#### Phase 7: Cleanup Old Infrastructure

- [ ] **Step 7.1: Verify New Architecture is Stable**

```bash
# Check error rates
# Check response times
# Check user feedback
```

- [ ] **Step 7.2: Delete Old Azure Resources**

```powershell
# Delete old resource group (CAREFUL!)
az group delete --name rg-disney-movies-app --yes --no-wait

# This deletes:
# - swa-movie-app-fe
# - ca-movie-app-api
# - cae-disney
# - disneyimages storage account
# - workspace-rgdisneymoviesapptKQ7
```

- [ ] **Step 7.3: Archive Old Repositories**

```bash
# Archive (don't delete, for historical reference)
gh repo archive hdavtian/my-disney-app
gh repo archive hdavtian/my-disney-app-assets
gh repo archive hdavtian/sierra-games

# Or make private
gh repo edit hdavtian/my-disney-app --visibility private
```

- [ ] **✅ Phase 7 Testing:**

```powershell
# Verify old resources deleted
az group show --name rg-disney-movies-app
# Should return error: ResourceGroupNotFound

# Verify new architecture still running
az group show --name rg-hd-demos
curl https://disney.demos.harma.dev
curl https://api.demos.harma.dev/api/disney/characters

# Check monthly Azure costs decreased
az consumption usage list --start-date 2024-01-01 --end-date 2024-01-31

# Verify archived repos
gh repo view hdavtian/my-disney-app
# Should show "Archived" badge
```

**Expected Result:** Old resources deleted, new architecture unaffected, cost savings realized, old repos archived for reference.

**📋 Phase 7 Completion Checklist:**

- [ ] All 3 steps completed successfully
- [ ] All testing commands passed
- [ ] New architecture verified stable
- [ ] Old Azure resource group deleted
- [ ] Old repositories archived
- [ ] Azure costs decreased
- [ ] New architecture unaffected by cleanup
- [ ] ✅ **Mark Phase 7 as COMPLETE**

**🎉 MIGRATION COMPLETE! All 7 phases finished.**

---

### Cost Comparison

#### Old Architecture (Disney Only)

```
Azure Static Web App:     Free
Container App (API):      $14.40/month
Storage Account:          $2/month
─────────────────────────────────
Total:                    $16.40/month
```

#### New Architecture (3 Demos)

```
3× Static Web Apps:       Free
Container App (API):      $14.40/month (shared)
Container App (Migrations): $0.50/month (job, minimal runtime)
Storage Account:          $3/month (3× projects)
─────────────────────────────────
Total:                    $17.90/month

Per-demo cost:            $5.97/month
```

**Savings at scale:**

- 5 demos: $30/month (old) vs $20/month (new) = **33% savings**
- 10 demos: $164/month (old) vs $25/month (new) = **85% savings**

---

### Timeline Summary

**Total Time: 3-5 hours (single session)**

| Time   | Task                                   | Effort          |
| ------ | -------------------------------------- | --------------- |
| 15 min | Create 5 GitHub repos                  | Quick           |
| 60 min | Copy code to hd-demos-api, update URLs | Straightforward |
| 30 min | Deploy backend + migrations to Azure   | Automated       |
| 30 min | Copy assets, deploy frontends          | Copy-paste      |
| 30 min | Test everything works                  | Smoke tests     |
| 15 min | Switch DNS (or just use new URLs)      | Done            |
| 15 min | Delete old Azure resources             | Cleanup         |

**If something breaks:** Just keep old setup running, fix new one, no rush.

---

### Next Steps (Immediate Actions)

**Today:**

1. ✅ Review this transition plan
2. ⬜ Create new GitHub repositories (5 repos)
3. ⬜ Create Azure resource group: `rg-hd-demos`

**This Week:** 4. ⬜ Setup `hd-demos-api` repo structure (backend + migrations) 5. ⬜ Migrate Disney backend code to new structure 6. ⬜ Test locally with Neon database

**Next Week:** 7. ⬜ Deploy migration service to Azure 8. ⬜ Deploy API service to Azure 9. ⬜ Migrate assets to new storage account

---

**Document Version**: 1.0  
**Last Updated**: November 9, 2025  
**Author**: GitHub Copilot + Harma Davtian
