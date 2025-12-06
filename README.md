# 🏰 Disney App

A modern, cinematic Disney character catalog web application combining **React** (frontend) and **Spring Boot** (backend) with comprehensive API documentation.

<div align="center">

<a href="https://react.dev/" target="_blank"><img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React"></a>
<a href="https://spring.io/projects/spring-boot" target="_blank"><img src="https://img.shields.io/badge/Spring%20Boot-3.3.0-6DB33F?logo=springboot" alt="Spring Boot"></a>
<a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript" alt="TypeScript"></a>
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
├── frontend/          # React 18.3 + Vite 7.2 + TypeScript + Redux Toolkit
├── backend/           # Spring Boot 3.3 + JPA + PostgreSQL
├── database/          # Data files and migration scripts
├── docs/              # Technical documentation
└── scripts/           # Utility scripts
```

### Technology Stack

#### Frontend

- **Framework**: React 18.3 with Vite 7.2
- **Language**: TypeScript 5.5
- **State Management**: Redux Toolkit
- **Styling**: SCSS 1.77 + Bootstrap + CSS Variables
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

# Create .env.local file with environment variables
# Copy .env.local.example if available or create manually:
# VITE_API_BASE_URL=http://localhost:8080

# Start development server
npm run dev

# OR run Storybook component library
npm run storybook
```

Frontend will be available at: **http://localhost:3000**

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

The Disney App backend follows OpenAPI 3.0 standards and provides comprehensive API documentation through Swagger UI.

**Production (Live)**: <a href="https://api.movie-app.disney.harma.dev/swagger-ui/index.html" target="_blank">https://api.movie-app.disney.harma.dev/swagger-ui/index.html</a> 🌐

**Local Development**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## 📚 Component Documentation (Storybook)

Explore all React components in an isolated, interactive environment.

**🔗 Live Storybook**: <a href="https://hdavtian.github.io/my-disney-app/" target="_blank">https://hdavtian.github.io/my-disney-app/</a>

**Local Development**: `http://localhost:6006`

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

### YouTube Video Integration

- **Video showcase** on About page
- **Modal player** with theater mode
- **2-column slider** layout with video thumbnails and descriptions
- **Keyboard navigation** and accessibility support
- **"Watch on YouTube"** and fullscreen options

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

## 🚢 Deployment

### Frontend

- **Platform**: Azure Static Web Apps
- **Build**: Vite production build
- **CDN**: Azure CDN for static assets
- **Live URL**: <a href="https://movie-app.disney.harma.dev" target="_blank">https://movie-app.disney.harma.dev</a>
- **Environment Variables**: Set in Azure Static Web App configuration:
  - `VITE_API_BASE_URL` - Production API URL
  - `VITE_ASSETS_BASE_URL` - Azure Blob Storage URL for images
  - `VITE_GA_MEASUREMENT_ID` - Google Analytics ID

### Backend

- **Platform**: Azure Container Apps
- **Database**: Neon PostgreSQL (cloud)
- **CI/CD**: GitHub Actions
- **Container Registry**: GitHub Container Registry (GHCR)
- **Live API**: <a href="https://api.movie-app.disney.harma.dev" target="_blank">https://api.movie-app.disney.harma.dev</a>
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
