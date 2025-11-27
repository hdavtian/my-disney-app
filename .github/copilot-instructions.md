# Copilot Instructions for Disney App

## 🎯 Purpose

This project — **Disney App** — is a creative and technical showcase combining strong engineering and cinematic design.  
Goal: build a **modern Disney character catalog** using **React (frontend)** and **Spring Boot (backend)**, demonstrating front-end polish and clean architecture.

---

## 🧭 Visual & UX Guidelines

- Design style: cinematic and immersive, inspired by Disney+, Netflix, and Hulu.
- Navigation:
  - Top bar: Characters | Movies | Favorites | About this Demo
  - Optional left panel: filters and sorting.
- Layout:
  - Grid-based, card-centric design with hover effects and transitions.
  - Use **Framer Motion** for smooth animations.
- Aesthetic:
  - Light theme, vibrant accent colors.
  - Fully responsive across mobile → desktop.
- Use semantic HTML and ARIA attributes for accessibility.

---

## 🧱 Technical Architecture

### Frontend

- Framework: React 19+ + **Vite** + Redux Toolkit
- Styling: SCSS + Bootstrap + CSS variables
- Build Tool: Node / NPM + Vite
- Editor: Visual Studio Code
- Components should be **functional**, use **hooks**, and have **modular SCSS**.
- Prefer **named exports** over default exports.
- Use **Vite conventions**:
  - Entry file: `main.tsx`
  - Root HTML: `index.html`
  - Static assets: `/public` directory
  - Dev command: `npm run dev` → `vite` server
  - Build command: `npm run build` → optimized static output

### Backend

- Language: Java 21 (or latest stable)
- Framework: Spring Boot 3.x + JPA + Lombok
- Database: PostgreSQL
- Editor: IntelliJ IDEA Ultimate
- Package root: `com.harmadavtian.disneyapp`
  - Subpackages: `controller`, `service`, `repository`, `model`, `config`
- Include Javadoc on all public classes and methods.

### DevOps

- Monorepo directories:
  - `/frontend`
  - `/backend`
  - `/database`
  - `/docs`
  - `/scripts`
- Version control: Git + GitHub
- `.gitignore`: exclude build artifacts, IDE configs, Docker volumes.
- Docker integration planned later.

### CLI Tools Available

- **Azure CLI (`az`)**: Use for Azure resource management, deployments, configuration
  - Examples: `az webapp`, `az storage`, `az keyvault`, `az login`
  - Prefer `az` commands over Azure Portal for automation and scripting
- **GitHub CLI (`gh`)**: Use for GitHub operations, PRs, issues, workflows
  - Examples: `gh pr create`, `gh issue list`, `gh workflow run`
  - Prefer `gh` commands for GitHub automation instead of web UI
- **PowerShell**: Default shell environment (see Critical Workflow Rules below)
- **Docker + PostgreSQL CLI**: Direct database access via Docker container
  - Container name: `strange_gagarin`
  - Database: `disneyapp`
  - Username: `postgres`
  - Password: `amelia`
  - **List databases**: `docker exec strange_gagarin psql -U postgres -c "\l"`
  - **List tables**: `docker exec strange_gagarin psql -U postgres -d disneyapp -c "\dt"`
  - **Connect to disneyapp**: `docker exec -it strange_gagarin psql -U postgres -d disneyapp`
  - **Run SQL query**: `docker exec strange_gagarin psql -U postgres -d disneyapp -c "SELECT COUNT(*) FROM characters;"`
  - **Check extensions**: `docker exec strange_gagarin psql -U postgres -d disneyapp -c "\dx"`
  - **Describe table structure**: `docker exec strange_gagarin psql -U postgres -d disneyapp -c "\d table_name"`
  - Use this for schema verification, migration checks, pgvector validation, etc.

---

## 🌐 Website Behavior

- Responsive breakpoints:
  - 0–480px (mobile)
  - 481–768px (tablet)
  - 769–1279px (desktop)
  - 1280px+ (large desktop)
- Maintain consistent spacing, typography, and theme variables.

---

## 🧩 HTML Rules

- Use semantic HTML5 tags and ARIA attributes.
- Each top-level section needs a contextual class for SCSS targeting.
- Avoid inline styles.
- Properly nest and indent markup.

---

## 🧠 AI / Copilot Behavior

- Development is done using **two IDEs**:
  - **Visual Studio Code** for frontend (React, JS/TS, SCSS, Next.js).
  - **IntelliJ IDEA Ultimate** for backend (Java, Spring Boot, SQL).
- Copilot should:
  - Generate or modify code, files, and directories as requested.
  - Follow syntax and conventions of each language.
  - Apply per-language rules as defined below.
- All Java builds and Maven commands must run in **IntelliJ IDEA**, not VS Code.
- Avoid suggesting terminal commands that open new ports if a dev server is already running.
- Respect structure and naming conventions defined throughout this file.
- Copilot must prioritize file-specific instruction files (`.instructions.md`) over these global rules.

### ⚡ Critical Workflow Rules (ALWAYS FOLLOW)

**Terminal Command Paths:**

- **ALWAYS use absolute paths** when running npm/mvn commands - never run from wrong directory
- **Frontend commands:** Must run in `C:\sites\my-disney-app\frontend` directory
  - Example: `cd C:\sites\my-disney-app\frontend; npm run dev`
  - Example: `cd C:\sites\my-disney-app\frontend; npm run build`
- **Backend commands:** Must run in `C:\sites\my-disney-app\backend` directory
  - Example: `cd C:\sites\my-disney-app\backend; mvn clean compile`
  - Example: `cd C:\sites\my-disney-app\backend; mvn test`
- **NEVER** run npm commands from root `C:\sites\my-disney-app` - this will fail with ENOENT errors

**Frontend Dev Server Management:**

- **BEFORE running `npm run dev` or `npm start`:** ALWAYS check if port 3000 is already running
- **Check terminal history** or use `netstat` to verify if dev server is already active
- **DO NOT start multiple dev servers** - this creates unnecessary secondary ports (3001, 3002, etc.) and wastes time
- If dev server is already running on port 3000, skip the `npm run dev` command entirely
- Only start dev server if it's confirmed to NOT be running

**Backend Server Management:**

- **BEFORE testing backend APIs:** ALWAYS check if port 8080 is already running
- **DO NOT** attempt to start or stop the backend server - always ask the user
- **AFTER modifying Java code:** IMMEDIATELY ask user to restart backend server in IntelliJ - DO NOT attempt to test endpoints before asking
- **NEVER** try to test endpoints and fail before asking - this wastes time
- **CAN** run `mvn clean compile` to check for compilation errors (but NOT to run the server)
- **CAN** run `mvn test` to run unit tests
- **MUST** use cURL to test API endpoints after user confirms backend restart
- User runs backend server via IntelliJ IDEA

**Swagger/OpenAPI Documentation:**

- **ALWAYS use realistic example values** in `@Parameter` annotations for Swagger endpoints
- **NEVER use placeholder values** like `"frozen"`, `"1,5,12"`, or generic examples that won't work
- **Example values MUST be actual working values** from the database that will return successful responses
- **Verify example format** matches the actual data format (e.g., `"snow_white_and_the_seven_dwarfs"` not `"frozen"`)
- **For ID parameters**: Use actual IDs from database (e.g., `"2494,2495,2496"` for movies, `"362,363,364"` for characters)
- **For url_id parameters**: Use snake_case full names (e.g., `"snow_white_and_the_seven_dwarfs"`, `"aladdin"`)
- **Goal**: Users should be able to click "Try it out" in Swagger UI and get successful responses immediately without guessing values

**Swagger Security - CRITICAL:**

- **NEVER expose secrets, API keys, or passwords** in Swagger annotations (`@Parameter`, `@Schema`, `example` attributes)
- **For API key parameters**: Use placeholder values like `"your-api-key-here"` or `"••••••••"` in examples
- **For password/access code parameters**: Use generic examples like `"example-access-code"` or `"enter-your-code"`
- **For authentication headers**: Document that key is required but NEVER show actual production keys
- **Examples of SAFE documentation**:
  - ✅ `example = "your-admin-api-key"` for X-Admin-API-Key header
  - ✅ `example = "premium-access-code"` for access code request body
  - ✅ `example = "sk_live_abc123xyz789"` for generic secret format examples
  - ✅ `description = "Premium access code (contact admin for code)"` in parameter docs
- **Examples of UNSAFE documentation** (NEVER DO THIS):
  - ❌ Using actual production API keys in examples
  - ❌ Using actual passwords or access codes in examples
  - ❌ Copying real secrets into Swagger annotations "just for testing"
- **Remember**: Swagger UI is publicly accessible in production - treat all examples as public documentation

**Environment Variables & Configuration Management:**

- **NEVER hardcode environment-specific values** (URLs, API keys, database connections, storage paths)
- **ALWAYS check existing environment files** before adding new configuration:
  - **Frontend**: `frontend/.env.production` (Vite variables with `VITE_` prefix)
  - **Backend**: `backend/src/main/resources/application.properties` and profile-specific files
- **Environment variable patterns**:
  - Frontend: `VITE_API_BASE_URL`, `VITE_ASSETS_BASE_URL`, etc.
  - Backend: Spring Boot properties (can use `${ENV_VAR:default}` syntax)
- **Production mistake prevention**:
  - Hardcoded `localhost` URLs will break in production
  - Hardcoded API keys expose security risks
  - Always externalize configuration
- **When adding new features requiring configuration**:
  1. Check if similar config already exists in env files
  2. Follow existing naming conventions
  3. Add to appropriate env file(s)
  4. Document in relevant README
  5. Use environment variables in code, never hardcode

---

## 🧩 JavaScript / TypeScript Rules

- For **plain `.js` files**, follow js.instructions.md rules.
- For **plain `.ts` files**, follow ts.instructions.md rules.
- For **React `.tsx` / `.jsx` files**, follow react.instructions.md rules.

---

## 🧩 Java / Spring Boot Rules

- Use java.instructions.md for all Java and Spring Boot files.

---

## 🧩 SQL and Database Rules

- Use sql.instructions.md for all database-related files and SQL scripts.

---

## 🧩 Style Rules (SCSS/CSS)

- Use style.instructions.md for all styling files (`.scss`, `.css`).
