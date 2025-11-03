# Image Serving Strategy Implementation

## Overview

This implementation centralizes image URL generation for the Disney App, supporting environment-specific asset base URLs for development and production deployments.

## Architecture

### Environment Variables

The app uses three environment files to manage asset URLs across different environments:

#### 1. `.env.local` (gitignored - for local development)

**Purpose**: Override settings for local development without affecting the repository.

```bash
# Use local asset server (default for development)
VITE_ASSETS_BASE_URL=http://localhost:5001

# OR test with remote Azure Blob Storage while developing locally
# VITE_ASSETS_BASE_URL=https://disneyimages.blob.core.windows.net/images/disney-movies-app
```

- ✅ Gitignored - never committed to repository
- ✅ Allows switching between local and remote assets during development
- ✅ Takes precedence over `.env.production` when running `npm run dev`

#### 2. `.env.production` (tracked in repository)

**Purpose**: Production configuration for deployed builds.

```bash
# Azure Blob Storage URL for Disney App assets
VITE_ASSETS_BASE_URL=https://disneyimages.blob.core.windows.net/images/disney-movies-app
```

- ✅ Committed to repository
- ✅ Used during `npm run build` for production builds
- ✅ Points to Azure Blob Storage CDN
- ✅ Currently configured: `disneyimages.blob.core.windows.net/images/disney-movies-app`

#### 3. `.env.development` (optional - if needed)

**Purpose**: Shared development defaults for the team.

```bash
# Default development configuration
VITE_ASSETS_BASE_URL=http://localhost:5001
```

- Can be tracked in repository for team-wide defaults
- Overridden by `.env.local` if present
- Not currently used (using `.env.local` instead)

#### Optional: Cache Busting

**For any environment file:**

```bash
VITE_ASSETS_PREFIX=v123  # Adds version prefix to all URLs
```

### Environment Priority (Vite)

1. `.env.local` (highest priority - local overrides)
2. `.env.production` (when building with `npm run build`)
3. `.env.development` (when running `npm run dev`, if no `.env.local`)
4. Built-in defaults in `assets.ts` (fallback if nothing is set)

### Assets Config Module

**Location**: `frontend/src/config/assets.ts`

#### Core Function: `getImageUrl(kind, filename)`

- **Parameters**:
  - `kind`: `'movies'` | `'characters'`
  - `filename`: File name without path (e.g., `'frozen.jpg'`)
- **Returns**: Full URL to asset or placeholder if invalid
- **Path Format**: `${BASE_URL}${PREFIX}/${kind}/${filename}`

#### Security Features

- **Filename Sanitization**:

  - Rejects path traversal (`../`, `..\\`)
  - Rejects filenames with slashes
  - Allows only alphanumeric, dots, underscores, dashes
  - Strips leading slashes
  - Returns placeholder for invalid/empty filenames

- **Environment Handling**:
  - Development: Warns and defaults to `http://localhost:5001` if missing
  - Production: Logs error clearly if missing (fail early)

#### Initialization

Called in `main.tsx` on app startup:

```typescript
initializeAssetsConfig();
```

## Component Integration

### Updated Components

All components now use `getImageUrl()` instead of hardcoded paths:

#### Character Components

- `CharacterCard`: Profile images
- `CharacterCircles`: Circle thumbnails
- `CharacterDetailPage`: Profile and background images

#### Movie Components

- `MovieCard`: Poster images
- `MovieSlider`: Slider thumbnails (supports both image_1 and image_2)
- `MovieDetailPage`: Poster and backdrop images
- `HeroCarousel`: Hero background images

### Usage Pattern

```typescript
import { getImageUrl } from '../../config/assets';

// In component
<img src={getImageUrl('movies', movie.image_1)} alt={movie.title} />
<img src={getImageUrl('characters', character.profile_image1)} alt={character.name} />
```

## Directory Structure

### Asset Folders (Server/CDN)

```
/movies/
  └── frozen.jpg
  └── moana.png
/characters/
  └── elsa.png
  └── maui.jpg
```

### No Model Changes

- `movies.filename` and `characters.filename` remain filename-only
- No schema or database changes required
- Models store only the filename, not full paths

## Local Development

### Three Ways to Develop Locally

#### Option 1: Local Asset Server (Default)

**Best for**: Offline development, faster iteration

`.env.local`:

```bash
VITE_ASSETS_BASE_URL=http://localhost:5001
```

Requirements:

1. Run local asset server on port 5001
2. Assets must match directory structure:
   - `http://localhost:5001/movies/` for movie images
   - `http://localhost:5001/characters/` for character images

#### Option 2: Remote Azure Assets (Testing)

**Best for**: Testing with production data, verifying uploads

`.env.local`:

```bash
VITE_ASSETS_BASE_URL=https://disneyimages.blob.core.windows.net/images/disney-movies-app
```

Benefits:

- No local asset server needed
- Test with actual production images
- Verify Azure Blob Storage configuration
- Debug CORS or CDN issues

#### Option 3: Mixed Development

Switch between local and remote by commenting/uncommenting in `.env.local`:

```bash
# Remote (active)
VITE_ASSETS_BASE_URL=https://disneyimages.blob.core.windows.net/images/disney-movies-app

# Local (commented out)
# VITE_ASSETS_BASE_URL=http://localhost:5001
```

### Vite Configuration

Already configured to proxy API requests in `vite.config.ts` if needed.

## Production Deployment

### Build Configuration

`.env.production` is already configured with Azure Blob Storage:

```bash
VITE_ASSETS_BASE_URL=https://disneyimages.blob.core.windows.net/images/disney-movies-app
```

**Build Process:**

1. ✅ `.env.production` is already set (tracked in repository)
2. Run production build: `npm run build`
3. Environment variables are embedded at build time
4. Deploy `dist/` folder to hosting platform

**Note**: `.env.local` is ignored during production builds - only `.env.production` is used.

### Azure Blob Storage Setup

Current configuration uses Azure Blob Storage:

- **Account**: `disneyimages`
- **Container**: `images`
- **Base Path**: `/disney-movies-app/`
- **Structure**:
  ```
  https://disneyimages.blob.core.windows.net/images/disney-movies-app/
    ├── movies/
    │   ├── 101_dalmatians_1.jpg
    │   ├── frozen_1.jpg
    │   └── ...
    └── characters/
        ├── prf_3_peas-in-a-pod.png
        ├── elsa.png
        └── ...
  ```

**CDN Configuration:**

- ✅ Upload all movie images to `/movies/` subdirectory
- ✅ Upload all character images to `/characters/` subdirectory
- ✅ Configure CORS headers to allow your domain
- ✅ Enable public read access on the container
- Optional: Enable Azure CDN for edge caching with `VITE_ASSETS_PREFIX`

## Cache Busting (Optional)

To enable versioned assets:

```bash
# .env.production
VITE_ASSETS_BASE_URL=https://cdn.example.com
VITE_ASSETS_PREFIX=v123
```

This generates URLs like:

```
https://cdn.example.com/v123/movies/frozen.jpg
```

## Testing

### Manual Verification

#### 1. Test with Local Assets

**`.env.local`**: `VITE_ASSETS_BASE_URL=http://localhost:5001`

```bash
cd frontend
npm run dev
```

Verify:

- ✅ Console shows: `[Assets Config] Initialized: { baseUrl: 'http://localhost:5001', ... }`
- ✅ Movie images load from local server
- ✅ Character images load from local server
- ✅ Hero carousel background loads

#### 2. Test with Azure Blob Storage (Development)

**`.env.local`**: `VITE_ASSETS_BASE_URL=https://disneyimages.blob.core.windows.net/images/disney-movies-app`

```bash
cd frontend
npm run dev
```

Verify:

- ✅ Console shows Azure Blob URL in initialization
- ✅ Network tab shows images loading from `disneyimages.blob.core.windows.net`
- ✅ No CORS errors
- ✅ All images display correctly

#### 3. Test Production Build

```bash
cd frontend
npm run build
npm run preview
```

Verify:

- ✅ Uses `.env.production` (Azure Blob Storage)
- ✅ Check console for initialization message
- ✅ No 404s for images in Network tab
- ✅ Images load from production CDN

### Automated Tests

Location: `frontend/src/config/assets.test.ts`

- Validates URL generation
- Tests security sanitization
- Checks placeholder fallback

## Troubleshooting

### Images Not Loading

1. **Check Environment File Priority**

   - `.env.local` overrides everything in development
   - Delete or rename `.env.local` to use `.env.production` defaults
   - Check which file is active: look at console `[Assets Config] Initialized` message

2. **Verify Base URL**

   ```bash
   # Check your current .env.local
   cat frontend/.env.local

   # Should show either:
   VITE_ASSETS_BASE_URL=http://localhost:5001  # Local
   # OR
   VITE_ASSETS_BASE_URL=https://disneyimages.blob.core.windows.net/images/disney-movies-app  # Azure
   ```

3. **Restart Dev Server**

   - Environment variables are loaded at startup
   - Changes to `.env` files require restart: `Ctrl+C` then `npm run dev`

4. **Check Console & Network**

   - Console: `[Assets Config]` initialization message shows which URL is active
   - Network tab: Check if requests go to `localhost:5001` or `disneyimages.blob.core.windows.net`
   - Look for 404s or CORS errors

5. **Azure-Specific Issues**
   - Verify container is public or has correct access policies
   - Check CORS settings in Azure Blob Storage
   - Verify filenames match exactly (case-sensitive)

### Invalid Filenames

- Watch console for sanitization warnings: `[Assets Config] Invalid filename detected`
- Ensure filenames only use: `a-z A-Z 0-9 . _ -`
- No slashes or path components in filenames
- Backend may return paths like `/movies/file.jpg` - these are automatically handled by the `resolveImageUrl()` helper in HeroCarousel

## Migration Notes

### What Changed

- ✅ All image paths now use `getImageUrl()` helper
- ✅ Environment-specific base URLs
- ✅ Centralized sanitization and validation
- ✅ Placeholder fallback for missing images

### What Didn't Change

- ❌ No database schema changes
- ❌ No model property changes
- ❌ Filenames remain filename-only (no paths)
- ❌ No component structure changes

## Security Considerations

1. **Path Traversal Protection**: Filenames cannot escape asset directory
2. **Injection Prevention**: Special characters rejected
3. **Validation**: All filenames validated against whitelist pattern
4. **Fail-Safe**: Invalid inputs return placeholder, not error
5. **Logging**: Security warnings logged to console for monitoring
