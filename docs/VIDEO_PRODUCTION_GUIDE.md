# Disney App - Technical Walkthrough Video Series

## 📹 Video Production Guide - Phase 1: Scene Outline

**Target Audience:** Technical professionals, senior developers, engineering managers  
**Video Style:** Fast-paced, focused, under-the-hood deep dive  
**Total Estimated Runtime:** 7-10 minutes (20 scenes × 20-30 seconds each)

---

## 🎬 Scene List

### **SECTION 1: Project Architecture & Setup (Scenes 1-4)**

#### **Scene 1: The Monorepo Structure**

**Duration:** 20 seconds  
**What to Show:** VS Code Explorer showing root directory structure  
**Key Points:**

- Frontend/backend separation with independent toolchains
- Database, docs, and scripts organization
- Professional project scaffolding with two-IDE workflow (VS Code + IntelliJ)

#### **Scene 2: Tech Stack Overview**

**Duration:** 25 seconds  
**What to Show:** package.json and pom.xml side-by-side, README badges  
**Key Points:**

- Frontend: React 19, Vite 7.2, TypeScript, Redux Toolkit, Framer Motion
- Backend: Spring Boot 3.3, Java 17, PostgreSQL, Flyway migrations
- DevOps: Docker, Azure Container Apps, Neon cloud database

#### **Scene 3: Development Environment Duality**

**Duration:** 20 seconds  
**What to Show:** Screen split with VS Code (frontend) and IntelliJ IDEA (backend)  
**Key Points:**

- IDE-specific optimizations: VS Code for React/TypeScript, IntelliJ for Java/Spring
- Parallel development with hot reload on both sides
- Terminal showing concurrent `npm run dev` and `mvn spring-boot:run`

#### **Scene 4: Database Architecture**

**Duration:** 25 seconds  
**What to Show:** Database schema diagram or pgAdmin showing table relationships  
**Key Points:**

- Flyway version-controlled migrations (V1, V2)
- Complex relationships: characters ↔ movies, parks ↔ attractions
- Foreign key constraints with cascade deletes
- Indexed queries for performance

---

### **SECTION 2: Backend Engineering (Scenes 5-8)**

#### **Scene 5: Spring Boot Layered Architecture**

**Duration:** 30 seconds  
**What to Show:** IntelliJ showing package structure: controller → service → repository → model  
**Key Points:**

- Clean separation of concerns
- JPA entities with Lombok reducing boilerplate
- Repository pattern with Spring Data JPA custom queries
- RESTful controller design with proper HTTP semantics

#### **Scene 6: Swagger/OpenAPI Documentation**

**Duration:** 25 seconds  
**What to Show:** Live Swagger UI with expandable endpoints, Try It Out feature  
**Key Points:**

- SpringDoc OpenAPI auto-generation from annotations
- 30+ documented endpoints across Characters, Movies, Parks, Attractions
- Interactive API testing without Postman
- Production deployment: api.movie-app.disney.harma.dev/swagger-ui

#### **Scene 7: Flyway Database Migrations**

**Duration:** 25 seconds  
**What to Show:** Flyway migration files (V1, V2) and flyway_schema_history table  
**Key Points:**

- Version-controlled, idempotent schema changes
- Zero-downtime deployments
- Automatic migration on application startup
- Safe rollback strategies with IF NOT EXISTS guards

#### **Scene 8: Data Seeding Strategy**

**Duration:** 25 seconds  
**What to Show:** DataSeeder.java code and JSON seed files  
**Key Points:**

- JSON-based seed data (180 characters, 830 movies, 12 parks, 334 attractions)
- Idempotent seeding (count check before insert)
- Admin reseed endpoints for production data updates
- CommandLineRunner pattern for initialization

---

### **SECTION 3: Frontend Architecture (Scenes 9-12)**

#### **Scene 9: Redux Toolkit State Management**

**Duration:** 30 seconds  
**What to Show:** Redux DevTools showing state tree, slice files in VS Code  
**Key Points:**

- Centralized state: characters, movies, favorites, quiz, UI preferences, theme, parks
- localStorage sync middleware for persistence
- Type-safe reducers with TypeScript
- Slice pattern for modular state management

#### **Scene 10: Component Architecture & Reusability**

**Duration:** 25 seconds  
**What to Show:** VS Code showing component folder, multiple components using same patterns  
**Key Points:**

- 20+ modular React components
- Functional components with hooks (useState, useEffect, custom hooks)
- Props interface definitions for type safety
- Component composition patterns (CharacterCard, MovieCard, AttractionCard)

#### **Scene 11: Custom Hooks Pattern**

**Duration:** 20 seconds  
**What to Show:** hooks/ directory, example custom hook implementation  
**Key Points:**

- useTheme for dynamic theming
- useFavorites for local storage integration
- useDebounce for search optimization
- Separation of logic from presentation

#### **Scene 12: SCSS Theming System**

**Duration:** 25 seconds  
**What to Show:** themes/ directory, CSS variables, theme switcher UI in action  
**Key Points:**

- Six branded themes (Dark, Light, Star Wars, Marvel, Walt Disney, Pixar)
- CSS custom properties for runtime theme switching
- Auto mode with prefers-color-scheme detection
- Body class application pattern

---

### **SECTION 4: Advanced Features (Scenes 13-16)**

#### **Scene 13: Storybook Component Library**

**Duration:** 30 seconds  
**What to Show:** Live Storybook UI showing component variants, controls, accessibility checks  
**Key Points:**

- Isolated component development and documentation
- Interactive playground with Storybook controls
- Accessibility testing with @storybook/addon-a11y
- GitHub Pages deployment: hdavtian.github.io/my-disney-app

#### **Scene 14: Character Quiz Game Logic**

**Duration:** 30 seconds  
**What to Show:** Quiz component code, Redux quiz slice, game state flow  
**Key Points:**

- Randomized character selection with exclusion logic
- Score tracking and answer validation
- State machine pattern for quiz flow
- Responsive image loading and caching

#### **Scene 15: Framer Motion Animations**

**Duration:** 20 seconds  
**What to Show:** Code showing motion components, live carousel transitions  
**Key Points:**

- Declarative animation API
- Swiper integration for hero carousel
- Hover effects and micro-interactions
- Performance-optimized with CSS transforms

#### **Scene 16: API Integration & Error Handling**

**Duration:** 25 seconds  
**What to Show:** API service files, fetch calls, error boundary components  
**Key Points:**

- Centralized API configuration
- Async/await patterns with try-catch
- Loading states and error feedback
- Environment-based API URL switching (local vs. production)

---

### **SECTION 5: DevOps & Production (Scenes 17-20)**

#### **Scene 17: Docker Multi-Stage Build**

**Duration:** 25 seconds  
**What to Show:** Dockerfile for backend, docker-compose.yml  
**Key Points:**

- Multi-stage build optimization (Maven build → Runtime image)
- Docker Compose for local development (app + PostgreSQL)
- Health checks and container orchestration
- Image size optimization strategies

#### **Scene 18: Azure Container Apps Deployment**

**Duration:** 30 seconds  
**What to Show:** Azure Portal showing Container App configuration, scaling settings  
**Key Points:**

- Auto-scaling configuration (minReplicas: 1, maxReplicas: 10)
- Always-on architecture eliminates cold starts
- Custom domain with SSL (api.movie-app.disney.harma.dev)
- Environment variable management for secrets

#### **Scene 19: Neon Serverless PostgreSQL**

**Duration:** 20 seconds  
**What to Show:** Neon dashboard, connection string configuration  
**Key Points:**

- Cloud-native PostgreSQL with auto-scaling
- Connection pooling for performance
- Automated backups and point-in-time recovery
- Cost-effective serverless pricing model

#### **Scene 20: Performance Optimizations**

**Duration:** 25 seconds  
**What to Show:** Network tab showing optimized requests, Lighthouse scores  
**Key Points:**

- Image optimization (WebP format migration)
- Lazy loading and code splitting with React.lazy
- API response caching strategies
- Lighthouse performance audit results (aim: 90+ score)

---

## 📊 Summary Statistics

- **Total Scenes:** 20
- **Estimated Total Duration:** 8-10 minutes
- **Section Breakdown:**
  - Architecture & Setup: 4 scenes (~90 seconds)
  - Backend Engineering: 4 scenes (~105 seconds)
  - Frontend Architecture: 4 scenes (~100 seconds)
  - Advanced Features: 4 scenes (~105 seconds)
  - DevOps & Production: 4 scenes (~100 seconds)

---

## 🎯 Key Technical Highlights Covered

✅ Monorepo architecture with dual-IDE workflow  
✅ Spring Boot REST API with Swagger documentation  
✅ Flyway database migrations  
✅ Redux Toolkit state management  
✅ Custom React hooks pattern  
✅ SCSS theming system with CSS variables  
✅ Storybook component documentation  
✅ Docker containerization  
✅ Azure Container Apps deployment  
✅ Neon serverless PostgreSQL  
✅ Performance optimization strategies

---

---

---

# 🎬 PHASE 2: DETAILED PRODUCTION SCRIPTS

## How to Use This Guide

For each scene:

1. **File to Open** - Which file(s) to display in your editor
2. **Screen Setup** - How to arrange your screen/windows
3. **What to Show** - Specific lines, sections, or UI elements to highlight
4. **Narration Script** - Exactly what to say (read naturally, not word-for-word)
5. **Actions** - Mouse movements, scrolling, clicking

---

## SECTION 1: Project Architecture & Setup

### Scene 1: The Monorepo Structure

**Duration:** 20 seconds

**File to Open:** None (Explorer view only)

**Screen Setup:**

- VS Code full screen
- Explorer sidebar expanded
- Collapse all folders first, then expand to show top-level structure

**What to Show:**

1. Start with Explorer collapsed
2. Expand to reveal: `frontend/`, `backend/`, `docs/`, `scripts/`
3. Briefly expand `frontend/src/` to show `components/`, `pages/`, `store/`
4. Briefly expand `backend/src/main/java/com/harmadavtian/disneyapp/` to show `controller/`, `service/`, `repository/`, `model/`

**Narration:**

> "This is a full-stack monorepo with clean separation. Frontend in React with TypeScript, backend in Spring Boot with Java 17. Each side has its own build system and toolchain. I develop the frontend in VS Code and the backend in IntelliJ IDEA - using the right tool for each job. Notice the docs folder for comprehensive documentation and scripts for automation."

**Actions:**

- Slow scroll through folder structure
- Pause briefly on `frontend/src/` and `backend/src/main/java/`
- Show the parallel organization

---

### Scene 2: Tech Stack Overview

**Duration:** 25 seconds

**Files to Open:**

1. `frontend/package.json`
2. `backend/pom.xml`
3. `README.md` (for badges section)

**Screen Setup:**

- Split screen: `package.json` (left) | `pom.xml` (right)
- Switch to README.md for final 5 seconds

**What to Show:**

**In package.json:**

- Line 11-21: dependencies section (React 18, Redux Toolkit, Framer Motion, Swiper)
- Line 7: `"dev": "vite"` script
- Line 26-27: Vite 7.2

**In pom.xml:**

- Line 7-9: Spring Boot parent 3.3.0
- Line 14: Java 17
- Line 17-20: spring-boot-starter-data-jpa
- Line 21-24: spring-boot-starter-web
- Line 29-32: PostgreSQL driver
- Line 45-48: SpringDoc OpenAPI

**In README.md:**

- Lines 7-15: Technology badges

**Narration:**

> "The frontend runs on React 19 with Vite 7.2 for lightning-fast HMR. State management through Redux Toolkit, animations with Framer Motion. Backend is Spring Boot 3.3 on Java 17 with JPA for ORM, PostgreSQL for persistence, and Flyway for schema migrations. SpringDoc generates OpenAPI documentation automatically. Everything is strongly typed - TypeScript on the frontend, Java on the backend."

**Actions:**

- Scroll to dependencies in package.json
- Scroll to dependencies in pom.xml
- Switch to README to show badges
- Quick scroll through badge section

---

### Scene 3: Development Environment Duality

**Duration:** 20 seconds

**Files to Open:**

- VS Code: `frontend/src/App.tsx`
- IntelliJ IDEA: `backend/src/main/java/com/harmadavtian/disneyapp/DisneyAppApplication.java`

**Screen Setup:**

- Record desktop showing both IDEs open side-by-side
- Terminal visible at bottom showing both dev servers running

**What to Show:**

1. VS Code running `npm run dev` in terminal (port 5173)
2. IntelliJ running Spring Boot app (port 8080)
3. Both terminals showing active logs
4. Quick tab through files in each IDE to show syntax highlighting

**Narration:**

> "I run dual development environments simultaneously. VS Code optimized for React and TypeScript with instant Vite HMR. IntelliJ IDEA for Spring Boot with powerful Java refactoring tools. Both dev servers run in parallel - frontend on port 5173, backend on 8080. Make a change on either side and see it instantly. This setup maximizes productivity for full-stack development."

**Actions:**

- Show split screen with both IDEs
- Highlight terminals with running processes
- Quick switch between IDE tabs
- Show cursor in both environments

---

### Scene 4: Database Architecture

**Duration:** 25 seconds

**Files to Open:**

1. `backend/src/main/resources/db/migration/V1__Create_tables.sql`
2. `backend/src/main/resources/db/migration/V2__Create_disney_parks_tables.sql`

**Alternative:** Use database client (pgAdmin, DBeaver) showing visual schema

**Screen Setup:**

- Show migration files OR database client with ERD diagram

**What to Show:**

**If showing migration files:**

- V1: Lines showing CREATE TABLE for `characters`, `movies`, `movie_characters`
- V2: Lines showing CREATE TABLE for `disney_parks`, `disney_parks_attractions`
- Highlight FOREIGN KEY constraints
- Highlight CREATE INDEX statements

**If showing database client:**

- Tables view showing all 6 tables
- Relationships/ERD diagram showing FK relationships
- Indexes tab showing performance indexes

**Narration:**

> "Database architecture uses Flyway for version-controlled migrations. V1 created characters and movies with a join table for many-to-many relationships. V2 added Disney parks and attractions with a one-to-many relationship. Notice the foreign key constraints with cascade deletes - referential integrity enforced at the database level. Multiple indexes optimize queries - especially for parks by country and attractions by park. Everything is idempotent using IF NOT EXISTS for zero-downtime deployments."

**Actions:**

- Scroll through migration SQL
- Highlight FK constraint lines
- Highlight CREATE INDEX statements
- OR navigate database schema visually

---

## SECTION 2: Backend Engineering

### Scene 5: Spring Boot Layered Architecture

**Duration:** 30 seconds

**Files to Open (in sequence):**

1. `backend/src/main/java/com/harmadavtian/disneyapp/controller/CharacterController.java`
2. `backend/src/main/java/com/harmadavtian/disneyapp/service/CharacterService.java`
3. `backend/src/main/java/com/harmadavtian/disneyapp/repository/CharacterRepository.java`
4. `backend/src/main/java/com/harmadavtian/disneyapp/model/Character.java`

**Screen Setup:**

- IntelliJ IDEA full screen
- Project structure visible in left sidebar showing package hierarchy

**What to Show:**

**CharacterController.java:**

- Class annotation: `@RestController`, `@RequestMapping("/api/characters")`
- One method: `getAllCharacters()` with `@GetMapping`
- Show service injection via constructor

**CharacterService.java:**

- `@Service` annotation
- Business logic methods
- Repository injection

**CharacterRepository.java:**

- Interface extending `JpaRepository<Character, Long>`
- Custom query methods like `findByNameContainingIgnoreCase`

**Character.java:**

- `@Entity` and `@Table` annotations
- `@Id` and `@GeneratedValue`
- Field annotations: `@Column`, `@JsonProperty`
- Lombok annotations: `@Data`, `@NoArgsConstructor`

**Narration:**

> "Classic Spring Boot layered architecture. Controller layer handles HTTP requests and routes to services. Service layer contains business logic - kept separate from web concerns. Repository layer uses Spring Data JPA for database access. The model defines JPA entities mapped to database tables. Notice the Lombok annotations reducing boilerplate - no manual getters, setters, or constructors needed. Repository extends JpaRepository giving us CRUD operations for free, plus custom queries using method name conventions. Clean separation of concerns makes this easy to test and maintain."

**Actions:**

- Quickly tab through all 4 files (2-3 seconds each)
- Highlight annotations as you mention them
- Show package structure in sidebar
- Scroll to show method signatures

---

### Scene 6: Swagger/OpenAPI Documentation

**Duration:** 25 seconds

**Files to Open:**

1. Browser: `http://localhost:8080/swagger-ui/index.html` (or production URL)
2. IntelliJ: `backend/src/main/java/com/harmadavtian/disneyapp/controller/DisneyParkController.java` (showing annotations)

**Screen Setup:**

- Split: Swagger UI (70%) | Code (30%)

**What to Show:**

**In Swagger UI:**

- Expand "Disney Parks" section showing 5 endpoints
- Expand one endpoint (e.g., GET /api/parks)
- Click "Try it out" button
- Execute the request
- Show response with actual data

**In Code:**

- Show `@Tag` annotation
- Show `@Operation` annotation with summary and description
- Show `@Parameter` annotation on method parameters

**Narration:**

> "SpringDoc OpenAPI generates this interactive documentation automatically from code annotations. Over 30 endpoints documented across Characters, Movies, Parks, and Attractions. Each endpoint has descriptions, parameter details, and example responses. Click Try It Out to test directly in the browser - no Postman needed. This is live in production at api.movie-app.disney.harma.dev. The annotations are minimal - one Tag for the controller, one Operation per endpoint. SpringDoc handles the rest including request/response schemas from our Java types."

**Actions:**

- Scroll through endpoint list
- Expand an endpoint
- Click "Try it out"
- Execute and show response
- Switch to code to show annotations
- Back to Swagger showing schema section

---

### Scene 7: Flyway Database Migrations

**Duration:** 25 seconds

**Files to Open:**

1. `backend/src/main/resources/db/migration/V2__Create_disney_parks_tables.sql`
2. Database client showing `flyway_schema_history` table

**Screen Setup:**

- Migration file (top 60%) | flyway_schema_history table (bottom 40%)

**What to Show:**

**In V2 migration file:**

- Header comments explaining purpose
- `CREATE TABLE IF NOT EXISTS disney_parks`
- `CREATE TABLE IF NOT EXISTS disney_parks_attractions`
- `CREATE INDEX IF NOT EXISTS` statements
- `CONSTRAINT fk_attraction_park FOREIGN KEY...` with `ON DELETE CASCADE`

**In flyway_schema_history:**

- Records showing V1 and V2 migrations
- Columns: version, description, script, installed_on, success
- Checksum column (ensures migration hasn't been modified)

**Narration:**

> "Flyway manages database schema evolution with version-controlled SQL scripts. Each migration has a version number and runs exactly once. V2 created the Disney Parks tables with idempotent DDL - every statement uses IF NOT EXISTS so it's safe to run multiple times. Foreign key constraints ensure data integrity, cascade deletes prevent orphaned records. Flyway tracks execution in the schema history table with checksums to detect tampering. This enables zero-downtime deployments - new code and schema deploy together automatically. Rolling back is just reverting the migration file and running a rollback script."

**Actions:**

- Scroll through migration showing key sections
- Highlight IF NOT EXISTS clauses
- Highlight FK constraint with CASCADE
- Switch to database table
- Point out version, checksum, success columns

---

### Scene 8: Data Seeding Strategy

**Duration:** 25 seconds

**Files to Open:**

1. `backend/src/main/java/com/harmadavtian/disneyapp/service/DataSeeder.java`
2. `backend/src/main/resources/database/disney_characters.json` (preview)
3. IntelliJ terminal showing seeding logs

**Screen Setup:**

- Code editor (top 60%) | Terminal with logs (bottom 40%)

**What to Show:**

**In DataSeeder.java:**

- Class annotation: `@Component` and implements `CommandLineRunner`
- Constructor with repository injections
- `run()` method showing count checks:
  ```java
  if (characterRepository.count() == 0) {
      seedCharacters();
  }
  ```
- One seed method showing ObjectMapper usage:
  ```java
  ClassPathResource resource = new ClassPathResource("database/disney_characters.json");
  List<Character> characters = objectMapper.readValue(...)
  characterRepository.saveAll(characters);
  ```

**In JSON file:**

- Show structure of one character object with all fields

**In Terminal:**

- Logs showing: "Seeded 180 characters", "Seeded 830 movies", etc.

**Narration:**

> "Data seeding uses the CommandLineRunner pattern - runs once on application startup. Before seeding, we check if the table is empty with a count query. This makes it idempotent - restart the app a hundred times, still only one copy of the data. Seed data lives in JSON files - 180 characters, 830 movies, 12 parks, 334 attractions. Jackson ObjectMapper deserializes JSON directly to JPA entities, then saveAll performs a batch insert. For production updates, admin endpoints trigger reseed operations - delete all, reload from JSON, return the count. No downtime, no manual database access needed."

**Actions:**

- Scroll through DataSeeder showing count check pattern
- Highlight count check line
- Show one seed method implementation
- Quick peek at JSON structure
- Show terminal with successful seed logs

---

## SECTION 3: Frontend Architecture

### Scene 9: Redux Toolkit State Management

**Duration:** 30 seconds

**Files to Open:**

1. `frontend/src/store/store.ts`
2. `frontend/src/store/slices/charactersSlice.ts`
3. Browser: Redux DevTools showing state tree

**Screen Setup:**

- VS Code (60% left) | Browser with Redux DevTools (40% right)

**What to Show:**

**In store.ts:**

- Import statements showing all slices
- `configureStore` with all reducers: characters, movies, favorites, quiz, theme, parks, attractions, etc.
- Middleware configuration

**In charactersSlice.ts:**

- `createSlice` with name, initialState, reducers
- Actions: `setCharacters`, `setLoading`, `setError`
- Selectors: `selectCharacters`, `selectCharactersLoading`
- TypeScript interfaces for state

**In Redux DevTools:**

- State tree showing all slices
- Click on characters slice to show state structure
- Show action history
- Click an action to show diff

**Narration:**

> "Redux Toolkit centralizes all application state. Seven slices manage different domains - characters, movies, favorites, quiz state, UI preferences, theming, and parks data. Each slice defines its own state shape, reducers for updates, and selectors for reading. Everything is strongly typed with TypeScript interfaces. The store configuration is dead simple - just import your slices and add them to the reducers object. Middleware syncs specific slices to localStorage for persistence across sessions. Redux DevTools shows the entire state tree and time-travel debugging - click any action to see before and after state."

**Actions:**

- Show store.ts imports and configuration
- Switch to slice file showing createSlice
- Switch to browser with Redux DevTools
- Expand state tree
- Click through actions showing diffs
- Show time-travel feature

---

### Scene 10: Component Architecture & Reusability

**Duration:** 25 seconds

**Files to Open:**

1. `frontend/src/components/CharacterCard/CharacterCard.tsx`
2. `frontend/src/components/MovieCard/MovieCard.tsx`
3. VS Code Explorer showing components folder

**Screen Setup:**

- Split view: CharacterCard.tsx (left) | MovieCard.tsx (right)
- Bottom: Explorer showing components folder

**What to Show:**

**In CharacterCard.tsx:**

- Interface for props (CharacterCardProps with all properties typed)
- Functional component with destructured props
- useState for local state
- Component JSX structure
- Event handlers

**In MovieCard.tsx:**

- Similar structure showing pattern consistency
- Different props interface
- Same compositional approach

**In Explorer:**

- Components folder showing 20+ component folders
- Each folder contains: Component.tsx, Component.module.scss, index.ts

**Narration:**

> "Over 20 modular React components following consistent patterns. Each component has a TypeScript interface defining its props - full type safety at compile time. Functional components with hooks for state and side effects. CharacterCard and MovieCard share the same structure but accept different data shapes. Notice the compositional approach - small, focused components that do one thing well. Each component folder has its own SCSS module for scoped styling and an index file for clean imports. This makes components portable and reusable across different pages."

**Actions:**

- Show interface definitions at top of files
- Scroll through component showing hooks
- Highlight JSX return statement
- Switch to Explorer showing folder structure
- Expand one component folder showing files

---

### Scene 11: Custom Hooks Pattern

**Duration:** 20 seconds

**Files to Open:**

1. `frontend/src/hooks/useTheme.ts`
2. Component using it: `frontend/src/components/SiteSettings/SiteSettings.tsx` (showing usage)

**Screen Setup:**

- Split: Hook file (left 50%) | Component using it (right 50%)

**What to Show:**

**In useTheme.ts:**

- Function signature with return type
- useSelector hooks reading from Redux
- useDispatch for actions
- Custom logic (e.g., theme application)
- Return object with values and functions

**In SiteSettings.tsx:**

- Import statement
- Hook usage: `const { selectedTheme, changeTheme } = useTheme();`
- Using returned values in JSX
- Calling functions from the hook

**Narration:**

> "Custom hooks extract reusable logic from components. useTheme encapsulates all theme management - reading current theme from Redux, applying it to the DOM, detecting system preferences, and exposing a changeTheme function. Components just import the hook and destructure what they need. This separates logic from presentation - the component doesn't care how themes work, it just calls changeTheme. Other hooks follow the same pattern - useFavorites for localStorage integration, useDebounce for search optimization. Test the logic once in the hook, reuse it everywhere."

**Actions:**

- Show hook implementation with useSelector and useDispatch
- Highlight return statement
- Switch to component showing import and usage
- Show how component uses theme values
- Highlight changeTheme function call

---

### Scene 12: SCSS Theming System

**Duration:** 25 seconds

**Files to Open:**

1. `frontend/src/styles/themes/_theme-dark.scss`
2. `frontend/src/styles/themes/_theme-star-wars.scss`
3. Browser showing live theme switching on the website

**Screen Setup:**

- Code editor (60% left) | Browser with site (40% right)

**What to Show:**

**In \_theme-dark.scss:**

```scss
body.theme-dark {
  --bg-primary: #000000;
  --text-primary: #ffffff;
  --accent-primary: #4a90e2;
  // ... more variables
}
```

**In \_theme-star-wars.scss:**

```scss
body.theme-star-wars {
  --bg-primary: #000000;
  --text-primary: #e0e0e0;
  --accent-primary: #ffe81f; // Star Wars yellow
  // ... more variables
}
```

**In Browser:**

- Open Settings modal
- Show theme selector with 6 themes
- Click different themes showing instant switching
- Body element class changing in DevTools

**Narration:**

> "Six branded themes using CSS custom properties for runtime switching. Each theme is a body class defining the same CSS variable names with different values. Background colors, text colors, accent colors - all controlled by variables. Components reference variables, not hardcoded colors. When you select a new theme, JavaScript adds a class to the body element and all colors update instantly - no page reload, no flash. The Auto mode detects system preference with prefers-color-scheme and watches for changes. This pattern makes adding new themes trivial - just define new variable values."

**Actions:**

- Show dark theme variable definitions
- Show Star Wars theme with different values
- Switch to browser
- Open settings/theme selector
- Click through themes showing instant changes
- Open DevTools to show body class changing

---

## SECTION 4: Advanced Features

### Scene 13: Storybook Component Library

**Duration:** 30 seconds

**Files to Open:**

1. Browser: Storybook (http://localhost:6006 or deployed URL)
2. VS Code: `frontend/src/components/CharacterCard/CharacterCard.stories.tsx`

**Screen Setup:**

- Storybook UI (70% left) | Stories file (30% right)

**What to Show:**

**In Storybook UI:**

- Component list sidebar showing documented components
- Select CharacterCard
- Show different stories: Default, With Long Name, Loading State
- Demonstrate Controls panel - change props interactively
- Show Accessibility tab running checks
- Switch to MovieCard to show variety

**In .stories.tsx file:**

```typescript
export default {
  title: 'Components/CharacterCard',
  component: CharacterCard,
  parameters: { ... }
} as Meta<typeof CharacterCard>;

export const Default: Story = {
  args: {
    character: { ... }
  }
};

export const Loading: Story = {
  args: { isLoading: true }
};
```

**Narration:**

> "Storybook provides isolated component development and living documentation. Seven components fully documented with multiple states and variants. Each story represents a different use case - default state, loading state, error state. The Controls panel lets you modify props interactively without touching code. Accessibility tab runs automated checks against WCAG guidelines. This is deployed to GitHub Pages for the whole team to reference. Writing stories forces you to build flexible components with clear props interfaces. When QA or design reviews a component, they see every possible state in one place."

**Actions:**

- Navigate component sidebar
- Switch between different stories
- Use Controls panel to change props in real-time
- Show Accessibility tab
- Run accessibility check
- Switch to code showing story definitions

---

### Scene 14: Character Quiz Game Logic

**Duration:** 30 seconds

**Files to Open:**

1. `frontend/src/store/slices/quizSlice.ts`
2. `frontend/src/components/CharacterQuiz/CharacterQuiz.tsx`
3. Browser showing quiz in action

**Screen Setup:**

- Redux slice (40% left) | Component (30% center) | Browser (30% right)

**What to Show:**

**In quizSlice.ts:**

- State interface: currentCharacter, choices, score, questionNumber, gameStatus
- Reducers: startQuiz, submitAnswer, nextQuestion
- Logic for randomizing choices
- Score calculation

**In CharacterQuiz.tsx:**

- Component using quiz state via useSelector
- Dispatching quiz actions
- Event handlers for answer selection
- Conditional rendering based on game status

**In Browser:**

- Show quiz starting
- Select an answer
- Show score update
- Progress to next question

**Narration:**

> "The quiz game uses Redux for state management with a clean state machine pattern. Quiz state tracks current character, multiple choice options, score, and game status. When starting a quiz, we randomly select characters and generate three wrong answers plus the correct one. The submitAnswer reducer validates the choice, updates the score, and transitions to the next question. Component layer just dispatches actions and renders current state. This separation lets us test game logic independently from UI. Notice how Redux DevTools shows every action - startQuiz, submitAnswer, nextQuestion - making debugging trivial."

**Actions:**

- Show state interface in slice
- Show reducer logic for answer validation
- Switch to component showing dispatch calls
- Switch to browser playing through one question
- Open Redux DevTools showing quiz actions

---

### Scene 15: Framer Motion Animations

**Duration:** 20 seconds

**Files to Open:**

1. `frontend/src/components/HeroCarousel/HeroCarousel.tsx` (showing motion components)
2. Browser showing carousel with animations

**Screen Setup:**

- Code (50% left) | Browser with live carousel (50% right)

**What to Show:**

**In HeroCarousel.tsx:**

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, x: 100 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -100 }}
  transition={{ duration: 0.5 }}
>
  {/* carousel content */}
</motion.div>;
```

**In Browser:**

- Carousel sliding between items
- Hover effects on cards
- Smooth transitions

**Narration:**

> "Framer Motion provides declarative animations with minimal code. This hero carousel defines initial, animate, and exit states for each slide. Framer Motion handles the interpolation and timing. Transitions use hardware-accelerated CSS transforms for 60fps performance. Hover effects are equally simple - just define whileHover props. Combined with Swiper for touch gestures and pagination, we get a production-quality carousel in under 200 lines. The best part - animations are responsive by default, adapting to any screen size."

**Actions:**

- Show motion component with props
- Highlight initial, animate, exit, transition
- Switch to browser
- Interact with carousel (clicking, swiping)
- Hover over cards showing micro-interactions

---

### Scene 16: API Integration & Error Handling

**Duration:** 25 seconds

**Files to Open:**

1. `frontend/src/api/charactersApi.ts`
2. Component consuming it: `frontend/src/pages/CharactersPage/CharactersPage.tsx`
3. Browser DevTools Network tab showing requests

**Screen Setup:**

- API file (40% left) | Component (30% center) | Browser DevTools (30% right)

**What to Show:**

**In charactersApi.ts:**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const fetchAllCharacters = async (): Promise<Character[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/characters`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch characters:", error);
    throw error;
  }
};
```

**In CharactersPage.tsx:**

- useEffect calling API
- Loading state while fetching
- Error state if request fails
- Success state rendering data

**In Browser DevTools:**

- Network tab showing API calls
- Request/response headers
- Response payload
- Timing information

**Narration:**

> "API layer centralizes all backend communication with environment-based configuration. The base URL switches between local development and production via Vite env variables. Each API function uses async/await with try-catch for error handling. Components consume these functions in useEffect hooks with proper loading and error states. If a request fails, we catch it, log it, and show user-friendly feedback. DevTools Network tab shows all API calls - request timing, headers, payload size. This pattern keeps components clean - they don't know about fetch or error handling, they just call functions and handle three states: loading, error, or success."

**Actions:**

- Show API_BASE_URL configuration
- Show fetch with try-catch
- Switch to component showing three-state rendering
- Switch to browser DevTools Network tab
- Show successful request with response data
- Show request timing

---

## SECTION 5: DevOps & Production

### Scene 17: Docker Multi-Stage Build

**Duration:** 25 seconds

**Files to Open:**

1. `backend/Dockerfile`
2. `backend/docker-compose.yml`
3. Terminal running `docker-compose up`

**Screen Setup:**

- Dockerfile (50% left) | docker-compose.yml (25% right) | Terminal (25% bottom)

**What to Show:**

**In Dockerfile:**

```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**In docker-compose.yml:**

- Services: app and database
- Environment variables
- Port mappings
- Volumes for persistence
- Health checks

**In Terminal:**

- Logs showing container startup
- Spring Boot initialization
- Database connection success

**Narration:**

> "Multi-stage Docker build optimizes image size and security. Stage one uses full Maven image to compile Java code and run tests. Stage two copies only the JAR file into a slim JRE runtime image - no Maven, no source code, just what's needed to run. Final image is under 300MB versus over 800MB with single-stage. Docker Compose orchestrates local development - Spring Boot app plus PostgreSQL database with volumes for data persistence. Environment variables configure database connection. Health checks ensure containers are ready before marking them healthy. One command starts the entire backend stack."

**Actions:**

- Show Dockerfile with stage comments
- Highlight COPY --from=build line
- Switch to docker-compose showing services
- Show terminal with container logs
- Show successful startup

---

### Scene 18: Azure Container Apps Deployment

**Duration:** 30 seconds

**Files to Open:**

1. Browser: Azure Portal showing Container App
2. VS Code: `backend/src/main/resources/application-prod.properties` (environment config)

**Screen Setup:**

- Azure Portal (70% left) | Config file (30% right)

**What to Show:**

**In Azure Portal:**

- Container Apps overview page
- Revision management showing active revision
- Scale configuration: minReplicas: 1, maxReplicas: 10
- Custom domain configuration (api.movie-app.disney.harma.dev)
- Environment variables (masked)
- Monitoring showing metrics (CPU, memory, request count)
- Logs showing recent requests

**In application-prod.properties:**

```properties
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}
spring.jpa.hibernate.ddl-auto=none
spring.flyway.enabled=true
```

**Narration:**

> "Deployed to Azure Container Apps with auto-scaling configuration. Minimum one replica eliminates cold starts - the app is always warm and responds instantly. Maximum ten replicas handles traffic spikes automatically. Custom domain with managed SSL certificates - Azure handles renewal. Environment variables inject database credentials and production config without hardcoding secrets. The prod profile disables Hibernate schema generation - Flyway handles all schema changes. Monitoring dashboard shows real-time metrics - CPU, memory, request latency. Logs stream in real-time for debugging. Deployment is zero-downtime - new revision starts, health checks pass, traffic shifts over, old revision terminates."

**Actions:**

- Navigate Azure Portal showing resource
- Show scaling configuration
- Show custom domain settings
- Show environment variables (masked)
- Show monitoring charts
- Show live logs
- Switch to config file showing variable references

---

### Scene 19: Neon Serverless PostgreSQL

**Duration:** 20 seconds

**Files to Open:**

1. Browser: Neon dashboard
2. Database client (DBeaver/pgAdmin) showing connection

**Screen Setup:**

- Neon dashboard (60% left) | Database client (40% right)

**What to Show:**

**In Neon Dashboard:**

- Project overview
- Database instance details
- Connection string (partially masked)
- Storage metrics
- Branches feature (if using)
- Automated backups section
- Compute settings showing auto-suspend

**In Database Client:**

- Connected to Neon instance
- Tables showing data
- Query execution showing response time

**Narration:**

> "Neon provides serverless PostgreSQL with auto-scaling compute and storage. Database automatically scales up during traffic spikes and scales down to zero when idle - pay only for what you use. Connection pooling built-in handles thousands of concurrent connections. Automated backups with point-in-time recovery protect against data loss. Database branches let you create full copies instantly for testing - like Git branches for your database. No server management, no patching, no capacity planning. Just a connection string and you're running production PostgreSQL in the cloud."

**Actions:**

- Show Neon dashboard overview
- Highlight auto-scaling features
- Show connection string section
- Switch to database client
- Show connected tables with data
- Run a quick query showing performance

---

### Scene 20: Performance Optimizations

**Duration:** 25 seconds

**Files to Open:**

1. Browser: Chrome DevTools Performance tab
2. Browser: Lighthouse audit results
3. Browser: Network tab showing optimized resources

**Screen Setup:**

- Full browser with DevTools open showing different tabs

**What to Show:**

**In Network Tab:**

- WebP images loading (small file sizes)
- Compressed API responses (gzip)
- Fast load times (<200ms)
- Waterfall showing parallel requests
- Cache headers on static assets

**In Performance Tab:**

- Recording of page load
- Main thread activity
- Highlight minimal blocking time
- Smooth 60fps rendering

**In Lighthouse:**

- Performance score (90+)
- Metrics: FCP, LCP, TTI, CLS
- Opportunities section mostly green
- Best practices score

**Narration:**

> "Performance optimizations across the stack. Images migrated to WebP format - 30-40% smaller than PNG with same quality. Vite code-splitting creates separate bundles so users only download what they need. React lazy loading defers non-critical components. API responses use gzip compression. Static assets served with cache headers for browser caching. Lighthouse audit shows 90+ performance score with sub-2-second Time to Interactive. Network waterfall demonstrates parallel asset loading. Main thread stays responsive during user interactions. These optimizations compound - faster load, better engagement, higher conversion."

**Actions:**

- Show Network tab with filtered images
- Highlight WebP format and file sizes
- Switch to Performance recording
- Play through timeline showing smooth rendering
- Switch to Lighthouse results
- Scroll through metrics showing green scores
- Highlight key metrics: FCP, LCP, TTI

---

## 🎬 PRODUCTION TIPS

**General Guidelines:**

1. **Voice & Pacing:**

   - Speak clearly but conversationally
   - Don't rush - let visuals breathe for 1-2 seconds
   - Emphasize technical terms slightly

2. **Screen Recording:**

   - Use 1920x1080 resolution minimum
   - Hide desktop clutter/personal info
   - Use dark themes for code (easier on eyes)
   - Increase font sizes (16-18pt for code)

3. **Mouse Movements:**

   - Slow, deliberate movements
   - Highlight sections by hovering briefly
   - Use cursor to guide viewer's eye

4. **Transitions:**

   - 1-second fade between scenes
   - Section headers (2 seconds) between major sections
   - Soft background music (very low, non-distracting)

5. **Editing:**
   - Cut dead air and pauses
   - Speed up slow scrolling (1.25-1.5x)
   - Add subtle zoom for important code sections
   - Lower third text for filenames/URLs

**Recording Order:**

- Record all scenes for Section 1, then 2, etc.
- Do multiple takes if needed
- Leave 3 seconds of silence before and after each scene (easier to edit)

---

## ✅ CHECKLIST BEFORE RECORDING

- [ ] All dependencies installed and apps running
- [ ] Database seeded with data
- [ ] Browser tabs prepared (Swagger, Storybook, live site)
- [ ] Code editors configured (font size, theme, layout)
- [ ] Docker containers running (for Docker scene)
- [ ] Azure Portal logged in (for deployment scenes)
- [ ] Clear desktop, close unnecessary apps
- [ ] Disable notifications
- [ ] Test audio levels
- [ ] Test screen recording software
- [ ] Review narration scripts
- [ ] Have water nearby (20 scenes is a lot of talking!)

---

**You're ready to create a killer technical showcase! 🚀**
