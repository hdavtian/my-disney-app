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
