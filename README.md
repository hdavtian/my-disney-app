# 🏰 Disney App

A modern, cinematic Disney character catalog web application combining **React** (frontend) and **Spring Boot** (backend) with comprehensive API documentation.

<div align="center">

<a href="https://react.dev/" target="_blank"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React"></a>
<a href="https://spring.io/projects/spring-boot" target="_blank"><img src="https://img.shields.io/badge/Spring%20Boot-3.3.0-6DB33F?logo=springboot" alt="Spring Boot"></a>
<a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" alt="TypeScript"></a>
<a href="https://openjdk.org/" target="_blank"><img src="https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk" alt="Java"></a>
<a href="https://www.postgresql.org/" target="_blank"><img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql" alt="PostgreSQL"></a>
<a href="https://swagger.io/" target="_blank"><img src="https://img.shields.io/badge/OpenAPI-3.0-85EA2D?logo=swagger" alt="Swagger"></a>
<a href="https://storybook.js.org/" target="_blank"><img src="https://img.shields.io/badge/Storybook-10.0-FF4785?logo=storybook" alt="Storybook"></a>

</div>

---

## 🚀 Live Demo

Experience the Disney App in production:

- **🎬 Live Application**: <a href="https://movie-app.disney.harma.dev" target="_blank">https://movie-app.disney.harma.dev</a>
- **📚 API Documentation (Swagger)**: <a href="https://api.movie-app.disney.harma.dev/swagger-ui/index.html" target="_blank">https://api.movie-app.disney.harma.dev/swagger-ui/index.html</a>
- **🎨 Component Library (Storybook)**: <a href="https://hdavtian.github.io/my-disney-app" target="_blank">https://hdavtian.github.io/my-disney-app</a>

---

## 🎯 Project Overview

Disney App is a creative and technical showcase demonstrating modern full-stack development with:

- **Immersive UI/UX**: Cinematic design inspired by Disney+, Netflix, and Hulu
- **Character Catalog**: Browse and explore 180+ Disney characters
- **Movie Database**: Comprehensive Disney movie collection with 830+ films
- **Parks & Attractions**: Explore 12 Disney parks worldwide with 334 attractions
- **Interactive Quiz**: Test your Disney knowledge
- **Dynamic Carousels**: Featured content with smooth animations
- **Responsive Design**: Mobile-first, works across all devices
- **API Documentation**: Interactive Swagger UI for backend exploration
- **Component Library**: Storybook documentation for React components

---

## 🏗️ Architecture

```
my-disney-app/
├── frontend/          # React 19 + Vite 7.2 + TypeScript + Redux Toolkit
├── backend/           # Spring Boot 3.3 + JPA + PostgreSQL
├── database/          # Data files and migration scripts
├── docs/              # Technical documentation
└── scripts/           # Utility scripts
```

### Technology Stack

#### Frontend

- **Framework**: React 19 with Vite 7.2
- **Language**: TypeScript 5.x
- **State Management**: Redux Toolkit
- **Styling**: SCSS 1.94 + Bootstrap + CSS Variables
- **Animations**: Framer Motion
- **Build Tool**: Vite 7.2

#### Backend

- **Framework**: Spring Boot 3.3.0
- **Language**: Java 21
- **Database**: PostgreSQL 16
- **ORM**: Spring Data JPA
- **Migrations**: Flyway
- **API Documentation**: SpringDoc OpenAPI 3
- **Build Tool**: Maven

#### DevOps

- **Containerization**: Docker & Docker Compose
- **Cloud Database**: Neon PostgreSQL
- **Deployment**: Azure Container Apps (planned)
- **Version Control**: Git + GitHub

---

## 🚀 Quick Start

### Prerequisites

**Frontend**:

- Node.js 18+ and npm
- Visual Studio Code (recommended)

**Backend**:

- Java 21 JDK
- Maven 3.8+
- Docker Desktop (for local PostgreSQL)
- IntelliJ IDEA Ultimate (recommended)

### Setup & Run

#### 1. Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# OR run Storybook component library
npm run storybook
```

Frontend will be available at: **http://localhost:5173**

Storybook will be available at: **http://localhost:6006** 🎨

#### 2. Backend Development

```bash
# Start local PostgreSQL
docker run --name disney-postgres \
  -e POSTGRES_DB=disneyapp \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=amelia \
  -p 5432:5432 -d postgres:16

# Navigate to backend directory (in IntelliJ IDEA)
# Open backend/pom.xml
# Run DisneyAppApplication.java with 'local' profile
```

Backend will be available at: **http://localhost:8080**

**Swagger UI**: **http://localhost:8080/swagger-ui.html** 📚

---

## 📚 API Documentation

### Interactive Swagger UI

Explore and test the API interactively:

**Production (Live)**: <a href="https://api.movie-app.disney.harma.dev/swagger-ui/index.html" target="_blank">https://api.movie-app.disney.harma.dev/swagger-ui/index.html</a> 🌐

**Local Development**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

Features:

- ✅ Try out endpoints directly in browser
- ✅ Complete request/response documentation
- ✅ Example values and schemas
- ✅ No Postman required

### Available Endpoints

**Characters API**:

- `GET /api/characters` - Get all Disney characters
- `GET /api/characters/{id}` - Get character by ID
- `GET /api/characters/ids` - Get all character IDs
- `GET /api/characters/random-except/{excludeId}?count=3` - Get random characters

**Movies API**:

- `GET /api/movies` - Get all Disney movies
- `GET /api/movies/{id}` - Get movie by ID
- `GET /api/movies/batch?ids=1,5,12` - Batch fetch movies by IDs

**Batch Fetch Endpoints** (Performance Optimized):

- `GET /api/movies/batch?ids=1,5,12,23,45` - Fetch multiple movies in one request
- `GET /api/characters/batch?ids=1,3,8,15,27` - Fetch multiple characters in one request
- `GET /api/attractions/batch?ids=1,2,7,45,88` - Fetch multiple attractions in one request

> **⚡ Performance**: Batch endpoints are optimized for loading favorites and related items. Instead of fetching all 800+ movies to display 3 favorites, batch endpoints fetch only what you need in a single HTTP request. This results in 10x faster load times and 100x smaller payloads.

**Disney Search API** (Unified Search):

- `GET /api/search?query={term}&categories=movies,characters,parks` - Aggregate search across all content
- `GET /api/search/capabilities` - Get available search scopes and fields
- **Match Modes**: Exact word matching or partial substring matching
- **Search Scopes**: Basic (titles/descriptions) or Extended (metadata, tags, years)
- **Field Highlighting**: Returns matched snippets with position markers for UI highlighting
- **Category Filtering**: Search movies, characters, parks/attractions independently or together

> **🔍 Smart Search**: The Disney Search API supports advanced features like word boundary matching, multi-field search (titles, descriptions, metadata), and intelligent highlighting. Search can target specific fields like creation year, movie rating, character type, park location, and more in extended mode.

**Carousel API**:

- `GET /api/carousels?location=homepage` - Get carousel items

**Disney Parks API**:

- `GET /api/parks` - Get all Disney parks worldwide
- `GET /api/parks/{urlId}` - Get park by URL ID
- `GET /api/parks/country/{country}` - Get parks by country
- `GET /api/parks/resort/{resort}` - Get parks by resort name
- `GET /api/parks/castle-parks` - Get all castle parks

**Disney Attractions API**:

- `GET /api/attractions` - Get all park attractions
- `GET /api/attractions/{urlId}` - Get attraction by URL ID
- `GET /api/attractions/park/{parkUrlId}` - Get attractions by park
- `GET /api/attractions/type/{type}` - Get attractions by type
- `GET /api/attractions/thrill-level/{level}` - Get attractions by thrill level
- `GET /api/attractions/operational/{isOperational}` - Get operational/closed attractions
- `GET /api/attractions/search?q={query}` - Search attractions by keyword

**Admin API** (Data Management):

- `POST /api/admin/reseed-characters` - Reseed character data
- `POST /api/admin/reseed-movies` - Reseed movie data
- `POST /api/admin/reseed-parks` - Reseed parks and attractions
- `POST /api/admin/reseed-attractions` - Reseed attractions only
- `POST /api/admin/reseed-all` - Reseed entire database

**OpenAPI Specification**:

- JSON: `http://localhost:8080/v3/api-docs`
- YAML: `http://localhost:8080/v3/api-docs.yaml`

---

## � Component Documentation (Storybook)

### Interactive Component Library

Explore all React components in an isolated, interactive environment:

**🔗 Live Storybook**: <a href="https://hdavtian.github.io/my-disney-app/" target="_blank">https://hdavtian.github.io/my-disney-app/</a> (Coming Soon)

**Local Development**: `http://localhost:6006`

Features:

- ✅ Browse all 7+ documented React components
- ✅ Interactive component playground
- ✅ View all component states and variants
- ✅ Copy-paste ready code examples
- ✅ Accessibility testing built-in
- ✅ Responsive viewport testing

### Documented Components

**Phase 1** (Current):

- `CharacterCard` - Display character information with favorite toggle
- `MovieCard` - Display movie details with poster and metadata
- `FavoriteButton` - Toggle favorites for characters and movies
- `SearchInput` - Generic search input with autocomplete
- `Navigation` - Main navigation bar with responsive mobile menu
- `Footer` - Site footer with links
- `ViewModeToggle` - Switch between grid and list views

**Phase 2-4** (Planned): Carousels, Grid Views, Quiz components, and more

### Run Storybook Locally

```bash
cd frontend
npm run storybook
```

Storybook will be available at: **http://localhost:6006** 🎨

### Deploy Storybook

Storybook automatically deploys to GitHub Pages via GitHub Actions on every push to `main` branch.

Manual deployment:

```bash
cd frontend
npm run deploy-storybook
```

---

## �📂 Project Structure

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/            # Page components (routing)
│   ├── store/            # Redux state management
│   ├── hooks/            # Custom React hooks
│   ├── styles/           # SCSS stylesheets
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── config/           # Configuration files
├── public/               # Static assets
└── vite.config.ts        # Vite configuration
```

### Backend (`/backend`)

```
backend/
├── src/main/java/com/harmadavtian/disneyapp/
│   ├── controller/       # REST API controllers
│   ├── service/          # Business logic
│   ├── repository/       # Data access layer
│   ├── model/            # Entity classes
│   └── config/           # Spring configuration
├── src/main/resources/
│   ├── application.properties              # Shared config
│   ├── application-local.properties        # Local dev
│   ├── application-prod.properties         # Production
│   └── db/migration/                       # Flyway migrations
├── Dockerfile            # Multi-stage Docker build
└── pom.xml              # Maven dependencies
```

---

## 🎨 Key Features

### Character Catalog

- Browse 180+ Disney characters
- Grid and list view modes
- Advanced filtering and search
- Character detail pages with movies
- Favorite characters functionality

### Movie Collection

- Comprehensive Disney movie database with 830+ films
- Movie detail pages with cast
- Release year, genre, and description
- High-quality movie posters

### Disney Parks & Attractions

- **12 Disney Parks Worldwide**: Explore all major Disney theme parks
- **334 Attractions**: Complete attraction catalog across all parks
- **Park Details**: Location, opening date, theme, and description
- **Attraction Filtering**: By park, type, thrill level, and operational status
- **Search Functionality**: Find attractions by keyword
- **Castle Parks**: Identify iconic castle parks

### Disney Search

- **Unified Search**: Search across movies, characters, and parks/attractions in one query
- **Match Modes**: Exact word matching (whole words only) or partial matching (substring)
- **Search Scopes**:
  - **Basic**: Search titles and descriptions
  - **Extended**: Include metadata (years, ratings, tags, types, locations)
- **Smart Highlighting**: Visual markup shows exactly where search terms match
- **Multi-Category**: Search all categories together or filter to specific types
- **Field-Level Results**: See which fields matched (title, description, year, rating, etc.)
- **Responsive Cards**: Inline image layout with badges showing content type and park names

### Character Quiz Game

- Interactive quiz with multiple-choice questions
- Real-time score tracking
- Character image recognition
- Progressive difficulty

### The Guessing Game

- **Hint-based trivia** for Disney movies and characters
- **Three game modes**: Movies only, Characters only, or Mixed
- **Difficulty levels**: Easy, Medium, Hard (affects hint complexity)
- **Question counts**: 10, 20, or 50 questions per session
- **Progressive hints**: Reveal hints one at a time to identify the answer
- **Smart selection**: Only uses movies/characters with available hints (792 movies, 172 characters)
- **Hint button**: Eliminates one wrong answer
- **Show Answer**: Reveals correct answer (counts as wrong)
- **Statistics tracking**: Tracks correct/incorrect answers and hint usage

### Dynamic Carousels

- Hero carousel on homepage
- Smooth transitions with Framer Motion
- Location-based content
- Featured characters and movies

### Responsive Design

- Mobile-first approach
- Breakpoints: 480px, 768px, 1280px
- Touch-friendly interactions
- Optimized images for all devices

---

## 🔧 Development

### Frontend

```bash
cd frontend
npm run dev          # Start dev server (Vite 7.2)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run storybook    # Run Storybook component library
```

### Backend Development

```bash
cd backend
mvn clean install    # Build project
mvn spring-boot:run  # Run application
mvn test            # Run tests
```

### Docker (Full Stack)

```bash
docker-compose up    # Start backend + PostgreSQL
docker-compose down  # Stop containers
```

---

## 📖 Documentation

Comprehensive documentation available in `/docs`:

- **[DISNEY_PARKS_ATTRACTIONS_IMPLEMENTATION_PLAN.md](docs/DISNEY_PARKS_ATTRACTIONS_IMPLEMENTATION_PLAN.md)** - Disney Parks feature documentation
- **[STORYBOOK_INTEGRATION_GUIDE.md](docs/STORYBOOK_INTEGRATION_GUIDE.md)** - Storybook setup and usage
- **[SWAGGER_OPENAPI_INTEGRATION.md](docs/SWAGGER_OPENAPI_INTEGRATION.md)** - Swagger implementation guide
- **[DEPLOYMENT_PLAN.md](docs/DEPLOYMENT_PLAN.md)** - Deployment instructions
- **[CHARACTER_QUIZ_GAME.md](docs/CHARACTER_QUIZ_GAME.md)** - Quiz feature documentation
- **[IMAGE_SERVING_STRATEGY.md](docs/IMAGE_SERVING_STRATEGY.md)** - Image optimization
- **[PERFORMANCE_OPTIMIZATION_PLAN.md](PERFORMANCE_OPTIMIZATION_PLAN.md)** - Performance tuning

---

## 🧪 Testing

### Frontend Testing

```bash
cd frontend
npm run test         # Run unit tests (when configured)
```

### Backend Testing

```bash
cd backend
mvn test            # Run all tests
mvn verify          # Run tests + integration tests
```

---

## 🚢 Deployment

### Frontend

- Platform: Azure Static Web Apps (planned)
- Build: Vite production build
- CDN: Azure CDN for static assets

### Backend

- Platform: Azure Container Apps
- Database: Neon PostgreSQL (cloud)
- CI/CD: GitHub Actions
- Container Registry: GitHub Container Registry (GHCR)
- **Monitoring**: Azure Application Insights (5GB/month free tier)

#### Monitoring & Observability

**Azure Application Insights** is configured for real-time monitoring:

- **📊 Performance Metrics**: Request rates, response times, failure rates
- **🐛 Error Tracking**: Exceptions, stack traces, failed requests
- **📈 Usage Analytics**: User sessions, page views, geographic distribution
- **🔍 Distributed Tracing**: Track requests across services
- **💰 Cost**: FREE (well under 5GB/month limit at current traffic)

**Access Application Insights**:

1. Azure Portal → `ca-movie-app-api-insights`
2. View live metrics, performance, failures, and usage
3. Set up custom alerts for error rates or slow responses

**Connection**: Auto-configured via `APPLICATIONINSIGHTS_CONNECTION_STRING` environment variable

#### Azure Container App Scaling Configuration

**Current Configuration**:

- **minReplicas**: 1 (Always running - eliminates cold starts)
- **maxReplicas**: 10 (Auto-scales based on demand)
- **Cost**: ~$10-15/month (exits free tier)

**Why minReplicas=1?**

- ✅ Eliminates 15-20 second cold start delays
- ✅ Instant API responses for first-time visitors
- ✅ Consistent performance for portfolio/demo purposes
- ⚠️ Moves out of Azure free tier (~180,000 vCPU-seconds/month limit)

**Toggle Between Always-On (Paid) and Scale-to-Zero (Free)**:

```bash
# Switch to ALWAYS-ON (no cold starts, ~$10-15/month)
az containerapp update \
  --name ca-movie-app-api \
  --resource-group rg-disney-movies-app \
  --min-replicas 1 \
  --max-replicas 10

# Switch to SCALE-TO-ZERO (free tier, 15-20s cold start on first request)
az containerapp update \
  --name ca-movie-app-api \
  --resource-group rg-disney-movies-app \
  --min-replicas 0 \
  --max-replicas 10

# Check current scaling configuration
az containerapp show \
  --name ca-movie-app-api \
  --resource-group rg-disney-movies-app \
  --query "{minReplicas:properties.template.scale.minReplicas, maxReplicas:properties.template.scale.maxReplicas, currentReplicas:properties.template.scale.rules}" \
  -o table
```

**Resource Details**:

- **Name**: `ca-movie-app-api`
- **Resource Group**: `rg-disney-movies-app`
- **Region**: West US 2
- **FQDN**: `ca-movie-app-api.delightfulcliff-b8bbe0ca.westus2.azurecontainerapps.io`
- **Custom Domain**: `api.movie-app.disney.harma.dev`
- **Container Resources**: 0.5 vCPU, 1 GiB memory

### Environment Variables

**Backend Production** (`prod` profile):

```bash
DATABASE_URL=jdbc:postgresql://your-neon-host:5432/disneyapp
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=your-secure-password
SPRING_PROFILES_ACTIVE=prod
```

---

## 🤝 Contributing

This is a personal portfolio project, but feedback and suggestions are welcome!

### Development Guidelines

**Frontend** (VS Code):

- Follow React 19 conventions
- Use functional components with hooks
- TypeScript for type safety
- SCSS modules for styling
- Named exports preferred

**Backend** (IntelliJ IDEA):

- Follow Spring Boot best practices
- Java 21 features encouraged
- Javadoc for all public APIs
- Package structure: `controller`, `service`, `repository`, `model`, `config`

---

## 📝 License

MIT License - This is a portfolio/showcase project.

---

## 👨‍💻 Author

**Harma Davtian**

- GitHub: <a href="https://github.com/hdavtian" target="_blank">@hdavtian</a>
- Project: <a href="https://github.com/hdavtian/my-disney-app" target="_blank">my-disney-app</a>

---

## 🙏 Acknowledgments

- Disney for inspiration and beloved characters
- Spring Boot and React communities
- PostgreSQL and Neon for database solutions
- Swagger/OpenAPI for excellent API documentation tools

---

<div align="center">

**Built with ❤️ using React, Spring Boot, and PostgreSQL**

[Frontend README](frontend/README.md) | [Backend README](backend/README.md) | [API Docs](http://localhost:8080/swagger-ui.html) | [Storybook](http://localhost:6006)

</div>
