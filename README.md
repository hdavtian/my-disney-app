# 🏰 Disney App

A modern, cinematic Disney character catalog web application combining **React** (frontend) and **Spring Boot** (backend) with comprehensive API documentation.

<div align="center">

<a href="https://react.dev/" target="_blank"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React"></a>
<a href="https://spring.io/projects/spring-boot" target="_blank"><img src="https://img.shields.io/badge/Spring%20Boot-3.3.0-6DB33F?logo=springboot" alt="Spring Boot"></a>
<a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" alt="TypeScript"></a>
<a href="https://openjdk.org/" target="_blank"><img src="https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk" alt="Java"></a>
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
- **Movie Database**: Comprehensive Disney movie collection
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
- **Language**: Java 17
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

- Java 17 JDK
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

**Carousel API**:

- `GET /api/carousels?location=homepage` - Get carousel items

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

- Comprehensive Disney movie database
- Movie detail pages with cast
- Release year, genre, and description
- High-quality movie posters

### Character Quiz Game

- Interactive quiz with multiple-choice questions
- Real-time score tracking
- Character image recognition
- Progressive difficulty

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
- Java 17 features encouraged
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
