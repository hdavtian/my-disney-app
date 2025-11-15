# WebP Image Migration

**Date:** November 15, 2025  
**Goal:** Migrate all images from JPG/PNG to WebP format for performance optimization

---

## 🎯 Objective

Convert all character and movie images to WebP format to reduce file sizes by **50%+** while maintaining visual quality. This is a key frontend optimization demonstrating modern image format adoption.

---

## 📊 Performance Impact

**Before Migration:**

- Format: JPG/PNG
- Average file size: ~200-500KB per image
- Total bandwidth: High

**After Migration:**

- Format: WebP
- Average file size: ~100-250KB per image (50%+ reduction)
- Total bandwidth: **50%+ reduction**
- Quality: Visually identical

---

## 🏗️ Architecture Decision: Extension-Agnostic Approach

### Strategy: Store Semantic Names (No Extensions)

**Database/JSON:** Store `frozen` instead of `frozen.jpg`  
**Code:** Append `.webp` in `getImageUrl()` function dynamically

### Why This Approach?

✅ **Future-proof**: Easy to upgrade to AVIF or other formats  
✅ **Single source of truth**: Format decision lives in code, not data  
✅ **Modern pattern**: Aligns with CDN/image service conventions (Cloudinary, Imgix)  
✅ **Clean data**: Semantic names (e.g., `elsa`, `frozen`) not technical file names  
✅ **Easy rollback**: Change one line of code to switch formats

---

## 📁 Asset Organization

### Local Assets Repository Structure

**Repository Path:** `C:\sites\my-disney-app-assets`

```
/dist
  /movies
    *.jpg (original images - kept in place)
    /webp
      frozen.webp
      moana.webp
      lion_king.webp
      ...
  /characters
    *.png (original images - kept in place)
    /webp
      elsa.webp
      anna.webp
      simba.webp
      ...
```

**Key Notes:**

- ✅ Original JPG/PNG images remain in `dist/movies` and `dist/characters`
- ✅ New WebP versions are in `dist/movies/webp` and `dist/characters/webp` subdirectories
- ✅ File names are identical except for extension (e.g., `frozen.jpg` → `frozen.webp`)

### Azure Blob Storage Update

**Base URL:** `https://disneyimages.blob.core.windows.net/images/disney-movies-app`

**Paths:**

- Movies (WebP): `{baseUrl}/dist/movies/webp/*.webp`
- Characters (WebP): `{baseUrl}/dist/characters/webp/*.webp`

**Legacy Paths (for rollback):**

- Movies (Original): `{baseUrl}/dist/movies/*.jpg`
- Characters (Original): `{baseUrl}/dist/characters/*.png`

---

## 🔧 Implementation Steps

### Phase 1: Update JSON Source Files ✅

Remove file extensions from all image references:

**Characters JSON:**

```json
// Before
{
  "profile_image_1": "elsa.png",
  "background_image_1": "frozen_bg.jpg"
}

// After
{
  "profile_image_1": "elsa",
  "background_image_1": "frozen_bg"
}
```

**Movies JSON:**

```json
// Before
{
  "image_1": "frozen_poster.jpg",
  "image_2": "frozen_scene.jpg"
}

// After
{
  "image_1": "frozen_poster",
  "image_2": "frozen_scene"
}
```

**Files Updated:**

- `backend/src/main/resources/database/characters.json`
- `backend/src/main/resources/database/movies.json`

### Phase 2: Update Database via Reseed Endpoints

Hit existing reseed endpoints to update database with new JSON data:

```bash
POST /api/admin/reseed/characters
POST /api/admin/reseed/movies
```

No manual SQL needed! 🎉

### Phase 4: Update Environment Variables

Update paths to point to WebP subdirectories:

**.env.production:**

```bash
VITE_ASSETS_BASE_URL=https://disneyimages.blob.core.windows.net/images/disney-movies-app/dist/movies/webp
VITE_ASSETS_BASE_URL=https://disneyimages.blob.core.windows.net/images/disney-movies-app/dist/characters/webp
```

**Note:** Since we have two different paths (movies/webp and characters/webp), we need to update `getImageUrl()` to construct the full path including the `/webp` subdirectory.

**.env.local (development):**

```bash
# Option 1: Azure (for testing with real WebP images)
VITE_ASSETS_BASE_URL=https://disneyimages.blob.core.windows.net/images/disney-movies-app/dist

# Option 2: Local server pointing to assets repo
VITE_ASSETS_BASE_URL=http://localhost:5001/dist
```

### Updated Phase 3: Modify `getImageUrl()` for WebP Subdirectory

Modify `frontend/src/config/assets.ts` to append `/webp` subdirectory and `.webp` extension:

```typescript
export function getImageUrl(kind: AssetKind, filename: string): string {
  if (!filename) return PLACEHOLDER_IMAGE;

  const sanitized = sanitizeFilename(filename);
  if (!sanitized) return PLACEHOLDER_IMAGE;

  // Add .webp extension if no extension present
  const filenameWithExt = sanitized.includes(".")
    ? sanitized
    : `${sanitized}.webp`;

  const baseUrl = getAssetsBaseUrl();
  const prefix = getAssetsPrefix();

  // Include /webp subdirectory in path
  const url = `${baseUrl}${prefix}/${kind}/webp/${filenameWithExt}`;
  return url.replace(/([^:]\/)\/+/g, "$1");
}
```

### Phase 5: Upload WebP Images to Azure

Upload converted WebP images to Azure Blob Storage from local assets repository:

```bash
# Upload movies WebP images
az storage blob upload-batch \
  --account-name disneyimages \
  --destination images/disney-movies-app/dist/movies/webp \
  --source C:/sites/my-disney-app-assets/dist/movies/webp \
  --pattern "*.webp"

# Upload characters WebP images
az storage blob upload-batch \
  --account-name disneyimages \
  --destination images/disney-movies-app/dist/characters/webp \
  --source C:/sites/my-disney-app-assets/dist/characters/webp \
  --pattern "*.webp"
```

**Source directories:**

- Movies: `C:\sites\my-disney-app-assets\dist\movies\webp\*.webp`
- Characters: `C:\sites\my-disney-app-assets\dist\characters\webp\*.webp`

---

## ✅ Testing Checklist

### Development Testing

- [ ] Update JSON files (remove extensions)
- [ ] Hit reseed endpoints successfully
- [ ] Update `getImageUrl()` function
- [ ] Update `.env.local` to point to `/dist`
- [ ] Restart dev server (`npm run dev`)
- [ ] Check browser console for `[Assets Config] Initialized:` with correct URL
- [ ] Verify Network tab shows `.webp` images loading
- [ ] Verify all images display correctly:
  - [ ] Hero carousel backgrounds
  - [ ] Character cards
  - [ ] Movie cards
  - [ ] Detail pages (characters & movies)
  - [ ] Character circles
  - [ ] Movie sliders
- [ ] Check for 404 errors (none expected)
- [ ] Verify lazy loading still works
- [ ] Verify skeleton states still work

### Production Build Testing

```bash
npm run build
npm run preview
```

- [ ] Build completes successfully
- [ ] All images load from Azure `/dist` path
- [ ] No CORS errors
- [ ] File sizes reduced in Network tab
- [ ] Lighthouse audit shows improved performance score

### Performance Validation

**Metrics to capture:**

1. **File Size Comparison:**

   - Open Network tab → Filter by images
   - Compare old JPG/PNG sizes vs new WebP sizes
   - Document % reduction

2. **Lighthouse Audit:**

   - Run before/after audit
   - Compare "Serve images in next-gen formats" score
   - Document performance score improvement

3. **Total Page Weight:**
   - Characters page (20 images initially)
   - Movies page (20 images initially)
   - Homepage carousel
   - Document bandwidth savings

---

## 🔄 Rollback Plan

If issues arise, rollback is simple:

### Quick Rollback (Code Only)

Change `getImageUrl()` to remove `/webp` subdirectory and use original extensions:

```typescript
// Remove /webp from path
const url = `${baseUrl}${prefix}/${kind}/${sanitized}`;

// Or keep original extensions in JSON and restore them
const filenameWithExt = sanitized.includes(".")
  ? sanitized
  : `${sanitized}.jpg`; // Or .png for characters
```

**Note:** Original images are still in `dist/movies/*.jpg` and `dist/characters/*.png`, so rollback only requires code changes.

### Full Rollback (Data + Code)

1. Restore JSON files from git: `git checkout HEAD -- backend/src/main/resources/database/*.json`
2. Re-run reseed endpoints
3. Revert `getImageUrl()` changes
4. Revert `.env` changes

---

## 📈 Future Enhancements

### Phase 2: AVIF Support (Future)

When browser support improves, add AVIF with WebP fallback:

```typescript
export function getImageUrl(
  kind: AssetKind,
  filename: string,
  format: "avif" | "webp" = "avif"
): string {
  // Detect browser support and return appropriate format
  const supportedFormat = supportsAVIF() ? "avif" : "webp";
  const filenameWithExt = `${sanitized}.${supportedFormat}`;
  // ...
}
```

### Phase 3: Responsive Images (Future)

Add size variants for different viewports:

```typescript
// Generate srcset for responsive loading
export function getImageSrcSet(kind: AssetKind, filename: string): string {
  const base = sanitizeFilename(filename);
  return `
    ${getImageUrl(kind, `${base}-400w.webp`)} 400w,
    ${getImageUrl(kind, `${base}-800w.webp`)} 800w,
    ${getImageUrl(kind, `${base}-1200w.webp`)} 1200w
  `;
}
```

---

## 📝 Files Modified

### Code Changes

- `frontend/src/config/assets.ts` - Added `.webp` extension logic
- `frontend/.env.production` - Updated path to `/dist`
- `frontend/.env.local` - Updated path to `/dist`

### Data Changes

- `backend/src/main/resources/database/characters.json` - Removed extensions
- `backend/src/main/resources/database/movies.json` - Removed extensions

### Documentation

- `docs/WEBP_MIGRATION.md` - This file

---

## 🎯 Success Criteria

✅ All images load successfully in WebP format  
✅ 50%+ reduction in image file sizes  
✅ No visual quality degradation  
✅ No 404 errors or broken images  
✅ Lighthouse performance score improved  
✅ Lazy loading and skeleton states preserved  
✅ All existing functionality works as before

---

## 🚀 Deployment Steps (Summary)

1. ✅ Convert images to WebP (completed in assets repo)
2. ✅ Upload WebP images to Azure `/dist` directory
3. Update JSON files (remove extensions)
4. Update `getImageUrl()` function (append `.webp`)
5. Update environment variables (add `/dist` path)
6. Hit reseed endpoints to update database
7. Test locally with dev server
8. Build and test production bundle
9. Deploy to Azure Static Web Apps
10. Verify in production
11. Run Lighthouse audit and document improvements

---

**Status:** 🟡 Ready to implement  
**Risk Level:** 🟢 Low (easy rollback, non-breaking)  
**Impact:** 🟢 High (50%+ bandwidth savings)
