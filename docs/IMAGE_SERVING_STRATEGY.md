# Image Serving Strategy Implementation

## Overview

This implementation centralizes image URL generation for the Disney App, supporting environment-specific asset base URLs for development and production deployments.

## Architecture

### Environment Variables

- **`.env.local`** (not tracked): Development configuration
  - `VITE_ASSETS_BASE_URL=http://localhost:5001`
- **`.env.production`** (tracked): Production configuration
  - `VITE_ASSETS_BASE_URL=https://<prod-assets-host>`
- **Optional**: `VITE_ASSETS_PREFIX` for cache busting/versioning (e.g., `/v123`)

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

### Asset Server Setup

1. Assets served at `http://localhost:5001`
2. Must match directory structure:
   - `/movies/` for movie images
   - `/characters/` for character images

### Vite Configuration

Already configured to proxy API requests in `vite.config.ts` if needed.

## Production Deployment

### Build Configuration

1. Set `VITE_ASSETS_BASE_URL` in `.env.production`
2. Upload assets to CDN preserving structure
3. Update `.env.production` with CDN URL
4. Build: `npm run build`
5. Environment variables are embedded at build time

### CDN Setup

- Upload all movie images to `/movies/` directory
- Upload all character images to `/characters/` directory
- Configure CDN to serve with appropriate CORS headers
- Optional: Enable immutable caching with `VITE_ASSETS_PREFIX`

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

1. **Development**: Start local asset server on port 5001

   ```bash
   cd frontend
   npm run dev
   ```

   - Verify movie images load
   - Verify character images load

2. **Production Build**: Test with production config
   ```bash
   npm run build
   npm run preview
   ```
   - Check console for initialization message
   - Verify no 404s for images

### Automated Tests

Location: `frontend/src/config/assets.test.ts`

- Validates URL generation
- Tests security sanitization
- Checks placeholder fallback

## Troubleshooting

### Images Not Loading

1. Check console for `[Assets Config]` messages
2. Verify `VITE_ASSETS_BASE_URL` is set
3. Confirm asset server is running on correct port
4. Check browser network tab for 404s

### Invalid Filenames

- Watch console for sanitization warnings
- Ensure filenames only use: `a-z A-Z 0-9 . _ -`
- No slashes or path components in filenames

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
