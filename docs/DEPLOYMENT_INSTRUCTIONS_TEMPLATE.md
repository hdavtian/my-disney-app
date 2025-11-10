# Deployment Instructions Template for React + Spring Boot Projects

**Purpose**: Use these instructions to deploy a React (Vite) + Spring Boot application with similar architecture to the Disney App project.

**Tech Stack Assumed**:

- Frontend: React 19+ with Vite, TypeScript, SCSS
- Backend: Spring Boot 3.x (Java 21), PostgreSQL database
- Deployment: Azure Static Web Apps (frontend) + Azure Container Apps (backend) + Neon PostgreSQL
- CI/CD: GitHub Actions
- Assets: Azure Storage + CDN (optional)
- DNS: GoDaddy or similar registrar

---

## 🚀 HOW TO USE THIS TEMPLATE

### Step 1: Copy This File to Your New Project

1. Open your new project in a separate VS Code instance
2. Copy this entire file to `docs/DEPLOYMENT_INSTRUCTIONS.md` in your new project
3. Share this file with your AI assistant in the new project

### Step 2: Replace All Placeholders

Before following the deployment steps, you **MUST** replace these placeholders throughout the entire document:

| Placeholder             | Replace With                                | Example                                      |
| ----------------------- | ------------------------------------------- | -------------------------------------------- |
| `{yourapp}`             | Your app name (lowercase, hyphen-separated) | `todo-app`, `blog-site`, `shop-portal`       |
| `{yourdomain}`          | Your domain name (without TLD)              | `example`, `mycompany`, `johndoe`            |
| `{tld}`                 | Top-level domain                            | `com`, `dev`, `io`, `net`                    |
| `{yourpackage}`         | Your Java package name                      | `com.example.todoapp`, `com.mycompany.blog`  |
| `{yourorg}`             | Your GitHub organization or username        | `johndoe`, `acme-corp`                       |
| `YOUR_GITHUB_USERNAME`  | Your actual GitHub username                 | `johndoe`                                    |
| `[neon-host]`           | Neon PostgreSQL host from connection string | `ep-cool-moon-12345.us-west-2.aws.neon.tech` |
| `[neon-username]`       | Neon database username                      | `myuser`                                     |
| `[neon-password]`       | Neon database password                      | `secretpassword123`                          |
| `[dbname]`              | Database name                               | `myapp`, `production_db`                     |
| `[local-db-name]`       | Local Docker database name                  | `myapp_local`                                |
| `{your-local-password}` | Your local Docker Postgres password         | `postgres`, `dev123`                         |

### Step 3: Use Find & Replace (CRITICAL!)

**Do NOT start deployment until you've replaced ALL placeholders!**

In VS Code:

1. Press `Ctrl+H` (Windows/Linux) or `Cmd+H` (Mac)
2. Enable "Replace in file" mode
3. Replace each placeholder one by one:
   - Find: `{yourapp}`
   - Replace with: `myactualapp` (your app name)
   - Click "Replace All"
4. Repeat for all placeholders in the table above

### Step 4: Verify Replacements

**Search for leftover placeholders to avoid mixing projects:**

1. Press `Ctrl+F` (Windows/Linux) or `Cmd+F` (Mac)
2. Search for: `{` or `disney` or `movie-app`
3. If you find any Disney-related terms or unreplaced placeholders, fix them!

**Common mistakes to avoid:**

- ❌ Leaving `{yourapp}` unchanged → deployment will fail
- ❌ Using `movie-app` or `disney` in your new project → wrong project!
- ❌ Forgetting to update Java package names → build errors
- ❌ Mixing up domain names → DNS won't resolve

### Step 5: Example Transformation

**Before (template)**:

```
Domain: {yourapp}.{yourdomain}.{tld}
Package: com.{yourpackage}.config
Image: ghcr.io/YOUR_GITHUB_USERNAME/{yourapp}-api
```

**After (for a todo app on johndoe.com)**:

```
Domain: todo.johndoe.com
Package: com.johndoe.todoapp.config
Image: ghcr.io/johndoe/todo-api
```

### Step 6: Ask AI Assistant to Validate

After replacing placeholders, ask your AI assistant:

> "Please scan this deployment instructions file and confirm:
>
> 1. All placeholders have been replaced
> 2. No references to 'disney' or 'movie-app' remain
> 3. All domains and package names are consistent with my project: [YOUR_PROJECT_NAME]"

### Step 7: Follow the Phases

Once validated, follow the deployment phases in order:

1. Phase 1: Database Setup
2. Phase 2: Frontend Deployment
3. Phase 3: Backend Deployment
4. Phase 4: CI/CD Automation
5. Phase 5: Assets (Optional)
6. Phase 6: DNS Configuration
7. Phase 7: Verification

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] GitHub repository with React frontend and Spring Boot backend
- [ ] Azure account (free tier works for demos)
- [ ] Domain name at GoDaddy (or DNS provider)
- [ ] GitHub account with repository admin access
- [ ] Node.js 18+ and npm installed locally
- [ ] Java 21+ and Maven installed locally (for backend development)
- [ ] Docker installed (optional, for local testing)

---

## Phase 1: Database Setup (Neon PostgreSQL)

### 1.1 Create Neon Project

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click **"Create Project"**
3. Configure:
   - Project name: `{your-project-name}` (e.g., `my-app-prod`)
   - Database name: `{appname}` (e.g., `myapp`)
   - Region: Choose closest to your Azure region (e.g., `West US 3`)
   - Tier: **Free** (0.5 GB storage, suitable for demos)
4. Click **"Create Project"**
5. **Save the connection string** - you'll see:
   ```
   postgres://[user]:[password]@[host]/[dbname]?sslmode=require
   ```

### 1.2 Configure Spring Boot Database Connection

Update `backend/src/main/resources/application-prod.properties`:

```properties
# Neon PostgreSQL Production Database
spring.datasource.url=jdbc:postgresql://[neon-host]/[dbname]?sslmode=require
spring.datasource.username=[neon-username]
spring.datasource.password=[neon-password]
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Flyway migrations
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
```

Create `application-local.properties` for local development (keep your local Docker Postgres):

```properties
# Local PostgreSQL (Docker)
spring.datasource.url=jdbc:postgresql://localhost:5432/[local-db-name]
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 1.3 Test Migrations

Run Flyway migrations against Neon database:

```bash
cd backend
mvn clean flyway:migrate -Dspring.profiles.active=prod
```

Verify tables created in Neon dashboard.

### 1.4 Local Development Setup (IntelliJ IDEA)

**Important**: For local development in IntelliJ, you do NOT need to set environment variables. We use Spring profiles instead.

#### How It Works:

1. **Spring Profile Strategy**:

   - `application-local.properties` → Local development (your Docker Postgres)
   - `application-prod.properties` → Production deployment (Neon, uses env vars)

2. **IntelliJ Run Configuration**:

   - Default profile is `local` (no configuration needed)
   - IntelliJ automatically uses `application-local.properties`
   - No environment variables required in IDE

3. **Local Database Connection** (already in `application-local.properties`):

   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/{dbname}
   spring.datasource.username=postgres
   spring.datasource.password={your-local-password}
   ```

4. **What Gets Committed to Git**:
   - ✅ `application-local.properties` - Safe to commit (local Docker credentials only)
   - ✅ `application-prod.properties` - Safe to commit (uses env var placeholders)
   - ❌ Actual production secrets - Never committed (stored in Azure)

#### Optional: If You Want to Test with Production Database Locally

If you need to test against Neon database from IntelliJ:

**Option A: Environment Variables in IntelliJ**

1. Run → Edit Configurations
2. Select your Spring Boot configuration
3. Under "Environment variables", add:
   ```
   DATABASE_URL=jdbc:postgresql://[neon-host]/[dbname]?sslmode=require
   DATABASE_USERNAME=[neon-username]
   DATABASE_PASSWORD=[neon-password]
   SPRING_PROFILES_ACTIVE=prod
   ```
4. Click OK

**Option B: Create application-dev.properties** (Recommended)

```properties
# Dev profile for testing with Neon
spring.datasource.url=jdbc:postgresql://[neon-host]/[dbname]?sslmode=require
spring.datasource.username=[neon-username]
spring.datasource.password=[neon-password]
spring.jpa.hibernate.ddl-auto=validate
```

Add to `.gitignore`:

```
application-dev.properties
```

Run with: `-Dspring.profiles.active=dev`

---

## Phase 2: Frontend Deployment (Azure Static Web Apps)

### 2.1 Prepare Frontend Configuration

Create `frontend/public/staticwebapp.config.json`:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif,webp,avif,svg}", "/api/*"]
  },
  "mimeTypes": {
    ".json": "application/json",
    ".js": "application/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml"
  },
  "globalHeaders": {
    "Cache-Control": "public, max-age=31536000, immutable"
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/*",
      "allowedRoles": ["anonymous"]
    }
  ]
}
```

Update `frontend/src/config/api.ts` (create if doesn't exist):

```typescript
// API configuration based on environment
const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
  BASE_URL: isDevelopment
    ? "http://localhost:8080/api"
    : "https://api.{yourapp}.{yourdomain}.{tld}/api",
  TIMEOUT: 10000,
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
```

### 2.2 Create Azure Static Web App

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **"Static Web Apps"** → Click **"Create"**
3. Configure:
   - **Subscription**: Choose your subscription
   - **Resource Group**: Create new `rg-{yourapp}` (e.g., `rg-myapp`)
   - **Name**: `swa-{yourapp}-fe` (e.g., `swa-myapp-fe`)
   - **Plan type**: **Free**
   - **Region**: Choose closest region
   - **Deployment details**:
     - Source: **GitHub**
     - Organization: Your GitHub username
     - Repository: Your repo name
     - Branch: `main`
     - Build Presets: **React**
     - App location: `/frontend`
     - Output location: `dist`
4. Click **"Review + Create"** → **"Create"**

**Important**: Azure will automatically:

- Create a GitHub Actions workflow file in `.github/workflows/`
- Add a secret `AZURE_STATIC_WEB_APPS_API_TOKEN` to your GitHub repo

### 2.3 Configure Custom Domain

After deployment completes:

1. In Azure Portal, go to your Static Web App
2. Click **"Custom domains"** in left menu
3. Click **"+ Add"** → **"Custom domain on other DNS"**
4. Enter: `{yourapp}.{yourdomain}.{tld}` (e.g., `myapp.example.com`)
5. Azure will show you a CNAME record to add
6. Go to **GoDaddy** (or your DNS provider):
   - DNS Management → Add Record
   - Type: **CNAME**
   - Name: `{yourapp}` (e.g., `myapp`)
   - Value: `{swa-name}.azurestaticapps.net` (from Azure portal)
   - TTL: 600 (10 minutes)
7. Back in Azure, click **"Validate"** → Wait for SSL certificate (5-10 minutes)
8. Once validated, enable **"HTTPS only"**

---

## Phase 3: Backend Deployment (Azure Container Apps)

### 3.1 Create Dockerfile

Create `backend/Dockerfile`:

```dockerfile
# Multi-stage build for Spring Boot backend
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
```

Create `backend/.dockerignore`:

```
target/
.mvn/
mvnw
mvnw.cmd
*.log
.git
.gitignore
README.md
```

### 3.2 Configure CORS

Update `backend/src/main/java/com/{yourpackage}/config/WebConfig.java`:

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:5173",  // Local dev
                    "https://{yourapp}.{yourdomain}.{tld}"  // Production frontend
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 3.3 Build and Push Docker Image to GHCR

1. **Create Personal Access Token** (if not already done):

   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Scopes: Check `write:packages`, `read:packages`, `delete:packages`
   - Save token securely

2. **Login to GHCR**:

   ```bash
   echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```

3. **Build and Push**:

   ```bash
   cd backend

   # Build image
   docker build -t ghcr.io/YOUR_GITHUB_USERNAME/{yourapp}-api:latest .

   # Test locally (optional)
   docker run -p 8080:8080 \
     -e SPRING_DATASOURCE_URL="jdbc:postgresql://[neon-host]/[dbname]?sslmode=require" \
     -e SPRING_DATASOURCE_USERNAME="[neon-username]" \
     -e SPRING_DATASOURCE_PASSWORD="[neon-password]" \
     ghcr.io/YOUR_GITHUB_USERNAME/{yourapp}-api:latest

   # Push to GHCR
   docker push ghcr.io/YOUR_GITHUB_USERNAME/{yourapp}-api:latest
   ```

### 3.4 Create Azure Container Apps Environment

1. Go to Azure Portal → Search **"Container Apps"**
2. Click **"Container Apps Environments"** → **"Create"**
3. Configure:
   - **Resource Group**: Use same `rg-{yourapp}`
   - **Environment name**: `cae-{yourapp}` (e.g., `cae-myapp`)
   - **Region**: Same as Static Web App
   - **Zone redundancy**: Disabled (for free tier)
4. Click **"Create"**

### 3.5 Deploy Backend Container App

1. In Azure Portal → **"Container Apps"** → **"Create"**
2. **Basics tab**:
   - **Resource Group**: `rg-{yourapp}`
   - **Container app name**: `ca-{yourapp}-api` (e.g., `ca-myapp-api`)
   - **Region**: Same region
   - **Container Apps Environment**: Select `cae-{yourapp}`
3. **Container tab**:
   - **Image source**: Container registry
   - **Registry**: `ghcr.io`
   - **Image**: `YOUR_GITHUB_USERNAME/{yourapp}-api`
   - **Image tag**: `latest`
   - **Registry login**: Manual
     - Registry server: `ghcr.io`
     - Username: Your GitHub username
     - Password: Your GitHub token (from step 3.3)
4. **Ingress tab**:
   - **Ingress**: Enabled
   - **Ingress traffic**: Accepting traffic from anywhere
   - **Ingress type**: HTTP
   - **Target port**: `8080`
5. **Secrets** (add these):
   - Name: `db-url`, Value: `jdbc:postgresql://[neon-host]/[dbname]?sslmode=require`
   - Name: `db-username`, Value: `[neon-username]`
   - Name: `db-password`, Value: `[neon-password]`
6. **Environment variables** (reference secrets):
   - `SPRING_DATASOURCE_URL` → Reference secret `db-url`
   - `SPRING_DATASOURCE_USERNAME` → Reference secret `db-username`
   - `SPRING_DATASOURCE_PASSWORD` → Reference secret `db-password`
   - `SPRING_PROFILES_ACTIVE` → Value: `prod`
7. Click **"Review + Create"** → **"Create"**

### 3.6 Configure Custom Domain for Backend

1. In Azure Portal → Your Container App → **"Custom domains"**
2. Click **"Add custom domain"**
3. Enter: `api.{yourapp}.{yourdomain}.{tld}` (e.g., `api.myapp.example.com`)
4. Azure shows CNAME record to add
5. Go to **GoDaddy**:
   - Type: **CNAME**
   - Name: `api.{yourapp}` (e.g., `api.myapp`)
   - Value: `{container-app-fqdn}` (from Azure portal)
   - TTL: 600
6. Back in Azure → **"Validate"** → Wait for SSL certificate
7. Enable **"HTTPS only"**

### 3.7 Update Frontend API Configuration

Update `frontend/src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: isDevelopment
    ? "http://localhost:8080/api"
    : "https://api.{yourapp}.{yourdomain}.{tld}/api", // Your actual domain
  TIMEOUT: 10000,
};
```

Commit and push → GitHub Actions will redeploy frontend automatically.

---

## Phase 4: CI/CD Automation with GitHub Actions

### 4.1 Frontend Workflow

GitHub already created `.github/workflows/azure-static-web-apps-*.yml`. Verify it looks like:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3

      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend"
          output_location: "dist"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

### 4.2 Backend Workflow

Create `.github/workflows/backend-deploy.yml`:

```yaml
name: Backend Deploy to Azure Container Apps

on:
  push:
    branches:
      - main
    paths:
      - "backend/**"
  workflow_dispatch:

env:
  IMAGE_NAME: ghcr.io/${{ github.repository_owner }}/{yourapp}-api
  CONTAINER_APP_NAME: ca-{yourapp}-api
  RESOURCE_GROUP: rg-{yourapp}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: "21"
          distribution: "temurin"
          cache: "maven"

      - name: Build with Maven
        run: |
          cd backend
          mvn clean package -DskipTests

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        run: |
          cd backend
          docker build -t ${{ env.IMAGE_NAME }}:${{ github.sha }} .
          docker tag ${{ env.IMAGE_NAME }}:${{ github.sha }} ${{ env.IMAGE_NAME }}:latest
          docker push ${{ env.IMAGE_NAME }}:${{ github.sha }}
          docker push ${{ env.IMAGE_NAME }}:latest

      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy to Azure Container Apps
        uses: azure/container-apps-deploy-action@v1
        with:
          containerAppName: ${{ env.CONTAINER_APP_NAME }}
          resourceGroup: ${{ env.RESOURCE_GROUP }}
          imageToDeploy: ${{ env.IMAGE_NAME }}:${{ github.sha }}
```

### 4.3 Add Azure Credentials to GitHub Secrets

1. In Azure Portal → Open **Cloud Shell** (Bash)
2. Run:
   ```bash
   az ad sp create-for-rbac \
     --name "github-actions-{yourapp}" \
     --role contributor \
     --scopes /subscriptions/{subscription-id}/resourceGroups/rg-{yourapp} \
     --sdk-auth
   ```
3. Copy entire JSON output
4. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
5. Click **"New repository secret"**
   - Name: `AZURE_CREDENTIALS`
   - Value: Paste JSON from step 3
6. Click **"Add secret"**

---

## Phase 5: Optional - Image Assets with Azure Storage + CDN

**Important Architecture Decision**: Keep images in a **separate repository** to avoid bloating your main codebase and to enable independent asset deployments.

### 5.0 Repository Strategy (Recommended)

For optimal project organization and deployment speed:

1. **Main Repository**: `{yourorg}/{yourapp}`

   - Contains: Source code, configuration, documentation only
   - Excludes: All images and large media files
   - Size: Lightweight (~500KB-1MB)

2. **Assets Repository**: `{yourorg}/{yourapp}-assets`
   - Contains: All images, videos, fonts, and other static assets
   - Structure: Organized by feature (characters, movies, backgrounds, etc.)
   - Deployment: Separate GitHub Actions workflow to sync with Azure Storage

**Benefits**:

- ✅ Main repo stays lightweight for fast cloning and CI/CD
- ✅ Asset updates don't trigger full app redeployment
- ✅ Different teams can manage code vs content independently
- ✅ Easier to version control large binary files (Git LFS optional)
- ✅ Clear separation of concerns (code vs content)

**Setup Steps**:

1. Create separate GitHub repository: `{yourorg}/{yourapp}-assets`
2. Move all images from `frontend/public/images` to assets repo
3. Organize by feature:

   ```
   {yourapp}-assets/
   ├── characters/
   │   ├── mickey.jpg
   │   └── minnie.jpg
   ├── movies/
   │   ├── movie1.jpg
   │   └── movie2.jpg
   └── backgrounds/
       └── hero-bg.jpg
   ```

4. Add `.gitignore` to main repo:
   ```
   # Exclude images - managed in separate assets repo
   frontend/public/images/**
   !frontend/public/images/.gitkeep
   ```

### 5.1 Create Storage Account

1. Azure Portal → **Storage accounts** → **Create**
2. Configure:
   - **Resource Group**: `rg-{yourapp}`
   - **Storage account name**: `{yourapp}images` (e.g., `myappimages`, must be globally unique)
   - **Region**: Same as other resources
   - **Performance**: Standard
   - **Redundancy**: LRS (cheapest)
3. Click **"Review + Create"** → **"Create"**

### 5.2 Create Public Container

1. Go to Storage account → **Containers** → **+ Container**
2. Name: `images`
3. Public access level: **Blob** (anonymous read for blobs)
4. Click **"Create"**

### 5.3 Upload Images (Manual or CI/CD)

Create folder structure in container:

```
/images
  /{yourapp}/
    /characters/
    /movies/
    /backgrounds/
```

**Option A: Manual Upload** (one-time setup)

Upload via Azure Portal or Azure CLI:

```bash
az storage blob upload-batch \
  --account-name {yourapp}images \
  --destination images/{yourapp} \
  --source ./local-images-folder \
  --pattern "*"
```

**Option B: Automated CI/CD** (Recommended for assets repository)

Create `.github/workflows/deploy-assets.yml` in your **assets repository**:

```yaml
name: Deploy Assets to Azure Storage

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  STORAGE_ACCOUNT: {yourapp}images
  CONTAINER_NAME: images
  DESTINATION_PATH: {yourapp}

jobs:
  deploy-assets:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout assets repository
        uses: actions/checkout@v3

      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Install azcopy
        run: |
          wget https://aka.ms/downloadazcopy-v10-linux
          tar -xvf downloadazcopy-v10-linux
          sudo cp ./azcopy_linux_amd64_*/azcopy /usr/bin/
          sudo chmod +x /usr/bin/azcopy

      - name: Sync assets to Azure Storage
        run: |
          # Get storage account key
          STORAGE_KEY=$(az storage account keys list \
            --account-name ${{ env.STORAGE_ACCOUNT }} \
            --query '[0].value' \
            --output tsv)

          # Sync files (delta upload - only changed files)
          azcopy sync \
            "./" \
            "https://${{ env.STORAGE_ACCOUNT }}.blob.core.windows.net/${{ env.CONTAINER_NAME }}/${{ env.DESTINATION_PATH }}" \
            --delete-destination=false \
            --recursive=true \
            --skip-version-check
        env:
          AZCOPY_AUTO_LOGIN_TYPE: AZCLI

      - name: Purge CDN cache (if using CDN)
        run: |
          # Optional: Purge CDN to refresh cached assets
          az cdn endpoint purge \
            --resource-group rg-{yourapp} \
            --profile-name cdn-{yourapp} \
            --name {yourapp}-cdn \
            --content-paths "/*"
        continue-on-error: true

      - name: Summary
        run: |
          echo "✅ Assets deployed successfully!"
          echo "🌐 Storage URL: https://${{ env.STORAGE_ACCOUNT }}.blob.core.windows.net/${{ env.CONTAINER_NAME }}/${{ env.DESTINATION_PATH }}"
```

**What this workflow does**:

1. Triggers on push to main branch in assets repository
2. Uses `azcopy sync` for delta uploads (only changed files)
3. Optionally purges CDN cache for immediate updates
4. Independent from main app deployment

**Required GitHub Secrets** (in assets repository):

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

Same service principal as main repo (has access to storage account).

### 5.4 Optional: Add Azure CDN

1. Azure Portal → **CDN profiles** → **Create**
2. Configure:
   - **Resource Group**: `rg-{yourapp}`
   - **Name**: `cdn-{yourapp}`
   - **Pricing tier**: Standard Microsoft
   - **CDN endpoint name**: `{yourapp}-cdn`
   - **Origin type**: Storage
   - **Origin hostname**: `{yourapp}images.blob.core.windows.net`
3. After creation → **Custom domains** → Add `images.{yourapp}.{yourdomain}.{tld}`
4. Add CNAME in GoDaddy:
   - Name: `images.{yourapp}`
   - Value: `{yourapp}-cdn.azureedge.net`

### 5.5 Configure Assets in Frontend

Create `frontend/src/config/assets.ts`:

```typescript
const ASSETS_BASE_URL =
  import.meta.env.VITE_ASSETS_BASE_URL ||
  "https://{yourapp}images.blob.core.windows.net/images/{yourapp}";

export const getAssetUrl = (path: string): string => {
  return `${ASSETS_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

// Usage in components:
// <img src={getAssetUrl('/characters/mickey.jpg')} alt="Mickey" />
```

Add to `.env.production`:

```
VITE_ASSETS_BASE_URL=https://images.{yourapp}.{yourdomain}.{tld}/{yourapp}
```

---

## Phase 6: DNS Configuration Summary (GoDaddy)

In GoDaddy DNS Management, add these CNAME records:

| Type  | Name                     | Value                            | TTL |
| ----- | ------------------------ | -------------------------------- | --- |
| CNAME | `{yourapp}`              | `{swa-name}.azurestaticapps.net` | 600 |
| CNAME | `api.{yourapp}`          | `{container-app-fqdn}`           | 600 |
| CNAME | `images.{yourapp}` (opt) | `{yourapp}-cdn.azureedge.net`    | 600 |

**Example** (if app is `myapp` and domain is `example.com`):

- `myapp.example.com` → Points to Static Web App
- `api.myapp.example.com` → Points to Container App backend
- `images.myapp.example.com` → Points to CDN (optional)

---

## Phase 7: Verification Checklist

After deployment, verify:

- [ ] Frontend loads at `https://{yourapp}.{yourdomain}.{tld}`
- [ ] Backend health check: `https://api.{yourapp}.{yourdomain}.{tld}/api/health`
- [ ] Database connection works (check backend logs in Azure)
- [ ] CORS allows frontend to call backend
- [ ] SSL certificates valid on all domains
- [ ] GitHub Actions workflows run successfully
- [ ] Images load from CDN/Storage (if configured)
- [ ] Check Azure costs after 24 hours (should be near $0 on free tiers)

---

## Cost Estimates (Monthly, Demo Traffic)

| Service                | Tier/Plan   | Estimated Cost |
| ---------------------- | ----------- | -------------- |
| Azure Static Web Apps  | Free        | $0             |
| Azure Container Apps   | Consumption | $0-5           |
| Neon PostgreSQL        | Free        | $0             |
| Azure Storage (images) | Hot, LRS    | <$1            |
| Azure CDN (optional)   | Standard    | <$1            |
| **Total**              |             | **$0-7/month** |

---

## Troubleshooting Common Issues

### Frontend not loading after custom domain setup

- Wait 10-15 minutes for DNS propagation
- Check DNS with: `nslookup {yourapp}.{yourdomain}.{tld}`
- Verify CNAME points to correct `.azurestaticapps.net` URL

### Backend CORS errors

- Check `WebConfig.java` has correct frontend domain
- Verify backend is running: visit `/api/health` endpoint directly
- Check browser console for exact CORS error message

### Database connection failures

- Verify Neon database is running (check Neon dashboard)
- Check connection string format includes `?sslmode=require`
- Verify secrets are correctly set in Container App environment variables

### Docker build fails

- Ensure Maven build succeeds locally: `mvn clean package`
- Check Dockerfile paths match your project structure
- Verify Java version in Dockerfile matches `pom.xml` (`21`)

### GitHub Actions workflow fails

- Check secrets are set: `AZURE_STATIC_WEB_APPS_API_TOKEN`, `AZURE_CREDENTIALS`
- Verify workflow file paths (`app_location`, `output_location`)
- Check workflow logs in GitHub Actions tab

---

## Rollback Procedures

### Frontend Rollback

1. Go to GitHub → Actions → Find successful previous deployment
2. Click "Re-run all jobs" to redeploy previous version
3. Or: revert commit locally and push

### Backend Rollback

1. Azure Portal → Container App → **Revisions**
2. Find previous healthy revision
3. Click **"Activate"** on previous revision
4. Set traffic to 100% on previous revision

---

## Security Best Practices

- [ ] Never commit `.env` files or connection strings to Git
- [ ] Use GitHub Secrets for all sensitive values
- [ ] Enable "HTTPS only" on all Azure services
- [ ] Keep dependencies updated (`npm audit`, `mvn versions:display-dependency-updates`)
- [ ] Set up Azure Alerts for container restarts and 5xx errors
- [ ] Rotate GitHub tokens and Azure credentials every 90 days
- [ ] Configure Content Security Policy headers in Static Web App
- [ ] Enable Azure DDoS protection if traffic increases

---

## Secrets Management Reference

### Overview: Where Secrets Live

| Secret Type                  | Local Dev (IntelliJ)                       | Production (Azure)           | GitHub Actions |
| ---------------------------- | ------------------------------------------ | ---------------------------- | -------------- |
| Database credentials         | `application-local.properties` (committed) | Azure Container Apps Secrets | N/A            |
| API keys                     | `application-local.properties` or env vars | Azure Container Apps Secrets | N/A            |
| Azure deployment credentials | N/A                                        | N/A                          | GitHub Secrets |
| Static Web App token         | N/A                                        | N/A                          | GitHub Secrets |

### Local Development (IntelliJ IDEA)

**No environment variables needed!** Use Spring profiles:

```properties
# application-local.properties (committed to Git - safe)
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=postgres
spring.datasource.password=local-password
```

**Why this is safe**: These credentials only work on your local Docker container, not production.

### Production (Azure Container Apps)

**Secrets stored in Azure Portal**:

1. Navigate to: Azure Portal → Container Apps → `ca-{yourapp}-api` → **Secrets**
2. Add secrets:

   - `db-url`: `jdbc:postgresql://[neon-host]/[dbname]?sslmode=require`
   - `db-username`: `[neon-username]`
   - `db-password`: `[neon-password]`

3. Reference in **Environment Variables**:
   - `SPRING_DATASOURCE_URL` → References secret `db-url`
   - `SPRING_DATASOURCE_USERNAME` → References secret `db-username`
   - `SPRING_DATASOURCE_PASSWORD` → References secret `db-password`
   - `SPRING_PROFILES_ACTIVE` → Value: `prod` (not a secret)

**How Spring Boot reads them**:

Your `application-prod.properties` uses placeholders:

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/fallback}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:postgres}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:changeme}
```

At runtime, Azure Container Apps injects the environment variables, and Spring Boot reads them.

### GitHub Actions (CI/CD)

**Secrets stored in GitHub Repository**:

1. Navigate to: GitHub repo → Settings → Secrets and variables → **Actions**
2. Required secrets:
   - `AZURE_CLIENT_ID` - Service principal client ID
   - `AZURE_TENANT_ID` - Azure tenant ID
   - `AZURE_SUBSCRIPTION_ID` - Azure subscription ID
   - `AZURE_STATIC_WEB_APPS_API_TOKEN` - Frontend deployment token (auto-created by Azure)
   - `GITHUB_TOKEN` - Auto-generated by GitHub (for GHCR access)

**Used in workflows**:

```yaml
- name: Azure Login
  uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

### How to Update Production Secrets

**Via Azure Portal**:

1. Azure Portal → Container Apps → `ca-{yourapp}-api`
2. Click **Secrets** (left menu)
3. Edit the secret values
4. Click **Save**
5. Container automatically restarts with new values

**Via Azure CLI**:

```bash
az containerapp secret set \
  --name ca-{yourapp}-api \
  --resource-group rg-{yourapp} \
  --secrets \
    "db-url=jdbc:postgresql://new-host/dbname?sslmode=require" \
    "db-username=newuser" \
    "db-password=newpassword"
```

**Via GitHub Actions** (for GitHub secrets):

1. GitHub repo → Settings → Secrets and variables → Actions
2. Click on secret name
3. Update value
4. Click **Update secret**

### Testing Production Database Locally (Optional)

If you need to test your app against production database from IntelliJ:

**Option 1: Create `application-dev.properties`** (Recommended)

```properties
# Never commit this file - add to .gitignore!
spring.datasource.url=jdbc:postgresql://[neon-host]/[dbname]?sslmode=require
spring.datasource.username=[neon-username]
spring.datasource.password=[neon-password]
spring.jpa.hibernate.ddl-auto=validate
```

Add to `.gitignore`:

```
**/application-dev.properties
```

Run with: IntelliJ Run Configuration → Active profiles: `dev`

**Option 2: IntelliJ Environment Variables**

1. Run → Edit Configurations → Your Spring Boot app
2. Environment variables:
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://[neon-host]/[dbname]?sslmode=require;
   SPRING_DATASOURCE_USERNAME=[neon-username];
   SPRING_DATASOURCE_PASSWORD=[neon-password];
   SPRING_PROFILES_ACTIVE=prod
   ```
3. Apply → OK

### Security Checklist for Secrets

- [ ] ✅ Local credentials use Docker defaults (safe to commit)
- [ ] ❌ Never commit production credentials to Git
- [ ] ✅ Production secrets stored in Azure Portal (encrypted at rest)
- [ ] ✅ GitHub Actions uses OIDC or service principal (no long-lived passwords)
- [ ] ✅ Rotate production database password every 90 days
- [ ] ✅ Use separate databases for dev/staging/production
- [ ] ✅ Audit who has access to Azure Portal and GitHub repo
- [ ] ✅ Enable Azure Key Vault if managing many secrets (optional upgrade)

---

## Post-Deployment Monitoring

### Azure Portal Monitoring

- **Static Web App**: Monitor → Metrics → View traffic/bandwidth
- **Container App**: Monitoring → Log stream → Watch real-time logs
- **Container App**: Monitoring → Metrics → CPU/Memory usage

### Set up Basic Alerts

1. Azure Portal → Container App → Alerts → **Create alert rule**
2. Condition: "Container restart count > 5 in 1 hour"
3. Action: Email to your address
4. Repeat for: "HTTP 5xx errors > 10 in 5 minutes"

---

## Next Steps

After successful deployment:

1. **Performance Optimization**

   - Add Redis cache for API responses (optional)
   - Enable Application Insights for deep observability
   - Configure CDN caching rules

2. **Additional Environments**

   - Create `staging` branch and environment
   - Deploy staging to `staging.{yourapp}.{yourdomain}.{tld}`

3. **Monitoring & Alerts**

   - Set up Azure Monitor alerts
   - Configure Slack/Teams notifications
   - Enable Azure Application Insights

4. **Backup Strategy**
   - Configure Neon database backups (included in free tier)
   - Document recovery procedures

---

## Reference Links

- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Container Apps Docs](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Neon PostgreSQL Docs](https://neon.tech/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GoDaddy DNS Management](https://www.godaddy.com/help/manage-dns-680)

---

## 📋 Final Pre-Deployment Checklist

Before you start deploying, verify you've completed these steps:

### Template Customization

- [ ] Copied this file to your new project
- [ ] Replaced ALL `{yourapp}` placeholders with your actual app name
- [ ] Replaced ALL `{yourdomain}` and `{tld}` with your actual domain
- [ ] Replaced `{yourpackage}` with your Java package structure
- [ ] Replaced `YOUR_GITHUB_USERNAME` with your actual username
- [ ] Replaced all Neon database placeholders (`[neon-host]`, `[neon-username]`, etc.)
- [ ] Searched for `{` and found NO remaining placeholders
- [ ] Searched for `disney` and found NO references (unless that's your actual project!)
- [ ] Searched for `movie-app` and found NO references

### Domain Names Verification

- [ ] Frontend domain is correct: `{yourapp}.{yourdomain}.{tld}`
- [ ] Backend API domain is correct: `api.{yourapp}.{yourdomain}.{tld}`
- [ ] Assets domain (if using): `images.{yourapp}.{yourdomain}.{tld}`
- [ ] All three domains are consistent throughout the document

### Azure Resource Names Verification

- [ ] Resource group: `rg-{yourapp}` (e.g., `rg-todo-app`)
- [ ] Static Web App: `swa-{yourapp}-fe` (e.g., `swa-todo-app-fe`)
- [ ] Container App Environment: `cae-{yourapp}` (e.g., `cae-todo-app`)
- [ ] Container App: `ca-{yourapp}-api` (e.g., `ca-todo-app-api`)
- [ ] Storage Account: `{yourapp}images` (e.g., `todoimages`, must be globally unique)

### Java Package Names Verification

- [ ] Package name follows pattern: `com.{yourdomain}.{yourapp}`
- [ ] Example: `com.example.todoapp` or `com.johndoe.blog`
- [ ] WebConfig.java path updated: `src/main/java/com/{yourpackage}/config/WebConfig.java`
- [ ] All Java imports updated to use new package name

### Docker & GitHub Container Registry

- [ ] Image name: `ghcr.io/{YOUR_GITHUB_USERNAME}/{yourapp}-api`
- [ ] Example: `ghcr.io/johndoe/todo-api`
- [ ] No references to `movie-app-api` or `disney`

### Database Configuration

- [ ] Neon database name chosen: `{dbname}` (e.g., `todoapp`)
- [ ] Local database name chosen: `{local-db-name}` (e.g., `todoapp_local`)
- [ ] Local password set: `{your-local-password}`
- [ ] Connection strings updated in `application-prod.properties`
- [ ] Connection strings updated in `application-local.properties`

### AI Assistant Validation

- [ ] Asked AI to scan for unreplaced placeholders
- [ ] Asked AI to verify no Disney/movie-app references remain
- [ ] Asked AI to confirm domain names are consistent

---

## Customization Checklist

**This section is now deprecated - see "HOW TO USE THIS TEMPLATE" section at the top of this document for complete instructions.**

---

**Last Updated**: November 8, 2025  
**Template Version**: 2.0  
**Based on**: Disney App deployment (movie-app.disney.harma.dev)
**Template Source**: https://github.com/hdavtian/my-disney-app

## Template Usage Summary

This template was created from a production deployment of the Disney Movies app. Key architectural decisions documented here:

1. **Separate Assets Repository** - Images stored in separate repo for performance
2. **Spring Profile Strategy** - No IntelliJ environment variables needed
3. **Azure Free Tier** - Optimized for near-$0 monthly costs
4. **OIDC Authentication** - GitHub Actions uses service principal, no long-lived secrets
5. **Progressive DNS** - GoDaddy CNAME records for all subdomains

**When in doubt**: Ask your AI assistant to help validate replacements and guide you through each phase.
