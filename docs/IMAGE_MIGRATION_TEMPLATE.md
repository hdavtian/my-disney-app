# Image Migration Template: Separate Images into New Repository

**Purpose**: Guide your AI assistant through the process of separating images from your main codebase into a dedicated assets repository before deploying to production.

**Why This Matters**: Keeping large binary files (images) in your main code repository bloats the repo size, slows down CI/CD, and makes version control inefficient. This template helps you create a clean separation.

---

## 🚀 HOW TO USE THIS TEMPLATE

### Prerequisites

Before starting, ensure:

- [ ] You have images currently stored in your main repository (e.g., `frontend/public/images/`)
- [ ] You're using React + Vite (or similar framework with environment variables)
- [ ] You can create a new GitHub repository
- [ ] Your images are organized by feature/category (movies, products, users, etc.)

### Step 1: Provide Context to Your AI Assistant

Share this message with your AI assistant:

> "I need to migrate images from my main repository to a separate assets repository. My current setup:
>
> - Images location: `[YOUR_PATH_TO_IMAGES]` (e.g., `frontend/public/images/`)
> - Image categories: `[YOUR_CATEGORIES]` (e.g., `products`, `users`, `backgrounds`)
> - Framework: React + Vite
> - Current domain: `[YOUR_DOMAIN]`
>
> Please follow the steps in IMAGE_MIGRATION_TEMPLATE.md to help me:
>
> 1. Analyze my current image structure
> 2. Create assets configuration module
> 3. Update components to use the new system
> 4. Test locally
> 5. Create separate assets repository
> 6. Migrate images
> 7. Verify everything works
>
> Let's start with Step 2: Analyzing my current image setup."

---

## Phase 1: Analyze Current Image Setup

### Task 1.1: Document Current Image Structure

Ask your AI assistant to scan your project and document:

**Questions to answer:**

1. Where are images currently stored? (e.g., `public/images/`, `src/assets/`, etc.)
2. How are images organized? (by feature, by type, flat structure?)
3. What categories exist? (e.g., products, users, avatars, backgrounds)
4. How are images referenced in code? (relative paths, absolute paths, imports?)
5. Are there any environment-specific configurations?

**AI Prompt:**

> "Please scan my project and answer these questions about my current image setup:
>
> 1. List all directories containing images
> 2. Show me the current folder structure
> 3. Count images by category
> 4. Show examples of how images are referenced in components
> 5. Identify which components use images"

### Task 1.2: Choose Image Categories

Based on your app's features, define categories. Common examples:

| App Type      | Categories                                            |
| ------------- | ----------------------------------------------------- |
| E-commerce    | `products`, `categories`, `banners`, `brands`         |
| Social Media  | `avatars`, `posts`, `backgrounds`, `badges`           |
| Blog/CMS      | `articles`, `authors`, `thumbnails`, `featured`       |
| Entertainment | `movies`, `characters`, `posters`, `backgrounds`      |
| Real Estate   | `properties`, `agents`, `neighborhoods`, `floorplans` |

**Your Categories** (fill this out):

```
Category 1: _______________
Category 2: _______________
Category 3: _______________
Category 4: _______________
```

---

## Phase 2: Create Assets Configuration Module

### Task 2.1: Create Environment Files

Create these files in your `frontend/` directory:

#### File: `frontend/.env.production`

```bash
# Production asset URL (Azure Blob Storage or CDN)
# You'll update this after creating Azure Storage in deployment phase
VITE_ASSETS_BASE_URL=https://{yourstorageaccount}.blob.core.windows.net/images/{yourapp}
```

**Replace:**

- `{yourstorageaccount}` → Your Azure storage account name (e.g., `myappimages`)
- `{yourapp}` → Your app name (e.g., `todo-app`)

#### File: `frontend/.env.local` (create manually, not in Git)

```bash
# Local development - use local asset server
VITE_ASSETS_BASE_URL=http://localhost:5001

# OR temporarily test with production assets
# VITE_ASSETS_BASE_URL=https://{yourstorageaccount}.blob.core.windows.net/images/{yourapp}
```

**Purpose**:

- Override settings for local development
- Not committed to Git (add to `.gitignore`)
- Allows switching between local and remote assets

### Task 2.2: Update .gitignore

Add to your `.gitignore`:

```gitignore
# Environment variables (local overrides)
.env.local
.env.*.local

# Images - managed in separate assets repository
frontend/public/images/**
!frontend/public/images/.gitkeep
```

**AI Prompt:**

> "Please add these lines to my .gitignore file, ensuring they don't conflict with existing patterns."

### Task 2.3: Create Assets Configuration Module

**AI Prompt:**

> "Please create `frontend/src/config/assets.ts` based on this template. Replace `[CATEGORY]` with my actual categories: [LIST YOUR CATEGORIES]."

**File: `frontend/src/config/assets.ts`**

```typescript
/**
 * Assets Configuration Module
 *
 * Centralizes image URL generation with environment-specific base URLs
 * for development and production deployments.
 */

// Image category type - CUSTOMIZE THIS for your app
type ImageCategory = "category1" | "category2" | "category3"; // Replace with your actual categories

interface AssetsConfig {
  baseUrl: string;
  prefix: string;
}

let config: AssetsConfig | null = null;

/**
 * Initialize assets configuration from environment variables.
 * Call this once at app startup (in main.tsx).
 */
export function initializeAssetsConfig(): void {
  const baseUrl = import.meta.env.VITE_ASSETS_BASE_URL;
  const prefix = import.meta.env.VITE_ASSETS_PREFIX || "";

  if (!baseUrl) {
    if (import.meta.env.DEV) {
      console.warn(
        "[Assets Config] VITE_ASSETS_BASE_URL not set. Defaulting to http://localhost:5001"
      );
      config = {
        baseUrl: "http://localhost:5001",
        prefix: "",
      };
    } else {
      console.error(
        "[Assets Config] VITE_ASSETS_BASE_URL is required in production. Check your .env.production file."
      );
      config = {
        baseUrl: "",
        prefix: "",
      };
    }
  } else {
    config = {
      baseUrl: baseUrl.replace(/\/$/, ""), // Remove trailing slash
      prefix,
    };
  }

  console.log("[Assets Config] Initialized:", config);
}

/**
 * Sanitize filename to prevent path traversal and injection attacks.
 *
 * @param filename - Raw filename from database or API
 * @returns Sanitized filename or empty string if invalid
 */
function sanitizeFilename(filename: string | null | undefined): string {
  if (!filename || typeof filename !== "string") {
    return "";
  }

  // Remove leading slashes and path separators
  let clean = filename.replace(/^[\/\\]+/, "");

  // Reject path traversal attempts
  if (clean.includes("../") || clean.includes("..\\")) {
    console.warn("[Assets Config] Path traversal detected:", filename);
    return "";
  }

  // Reject filenames with slashes (should be filename only)
  if (clean.includes("/") || clean.includes("\\")) {
    console.warn("[Assets Config] Filename contains path separator:", filename);
    return "";
  }

  // Allow only alphanumeric, dots, underscores, dashes
  if (!/^[a-zA-Z0-9._-]+$/.test(clean)) {
    console.warn("[Assets Config] Invalid filename characters:", filename);
    return "";
  }

  return clean;
}

/**
 * Generate full URL for an image asset.
 *
 * @param category - Image category (e.g., 'products', 'users')
 * @param filename - Filename only (no paths), e.g., 'product123.jpg'
 * @returns Full URL to asset or placeholder if invalid
 */
export function getImageUrl(
  category: ImageCategory,
  filename: string | null | undefined
): string {
  if (!config) {
    console.error(
      "[Assets Config] Not initialized. Call initializeAssetsConfig() first."
    );
    return "/placeholder.png"; // Fallback placeholder
  }

  const sanitized = sanitizeFilename(filename);
  if (!sanitized) {
    console.warn("[Assets Config] Invalid filename detected:", filename);
    return "/placeholder.png";
  }

  // Build URL: baseUrl/prefix/category/filename
  const parts = [config.baseUrl];
  if (config.prefix) {
    parts.push(config.prefix);
  }
  parts.push(category, sanitized);

  return parts.join("/");
}

/**
 * Get the current assets base URL (for debugging or direct access)
 */
export function getAssetsBaseUrl(): string {
  return config?.baseUrl || "";
}
```

**Customization Required:**

1. Replace `type ImageCategory = 'category1' | 'category2' | ...` with YOUR actual categories
2. Example: `type ImageCategory = 'products' | 'users' | 'brands' | 'banners'`

### Task 2.4: Initialize in main.tsx

**AI Prompt:**

> "Please update my `frontend/src/main.tsx` to initialize the assets configuration at app startup."

Add this import and call at the top of `main.tsx`:

```typescript
import { initializeAssetsConfig } from "./config/assets";

// Initialize assets configuration
initializeAssetsConfig();

// Rest of your main.tsx...
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Phase 3: Update Components

### Task 3.1: Find All Components Using Images

**AI Prompt:**

> "Please search my codebase for all components that reference images. Look for:
>
> 1. `<img src=` patterns
> 2. `background-image:` in styles
> 3. Import statements for images
> 4. Hardcoded image paths
>
> Create a list of all files that need to be updated."

### Task 3.2: Update Each Component

For each component identified, update the image references:

**Before:**

```typescript
// Old hardcoded path
<img src={`/images/products/${product.image}`} alt={product.name} />
```

**After:**

```typescript
import { getImageUrl } from "../../config/assets";

// New centralized URL generation
<img src={getImageUrl("products", product.image)} alt={product.name} />;
```

**AI Prompt:**

> "Please update [COMPONENT_NAME] to use getImageUrl(). The component uses images from the '[CATEGORY]' category. Here are the current image references: [PASTE CODE]"

**Common Patterns:**

| Old Pattern                                              | New Pattern                                                               |
| -------------------------------------------------------- | ------------------------------------------------------------------------- |
| `src={`/images/products/${item.image}`}`                 | `src={getImageUrl('products', item.image)}`                               |
| `src={`/images/users/${user.avatar}`}`                   | `src={getImageUrl('users', user.avatar)}`                                 |
| `style={{ backgroundImage: \`url(/images/bg/${bg})\` }}` | `style={{ backgroundImage: \`url(${getImageUrl('backgrounds', bg)})\` }}` |

### Task 3.3: Handle Missing Images

Update components to gracefully handle missing images:

```typescript
<img
  src={getImageUrl("products", product.image)}
  alt={product.name}
  onError={(e) => {
    e.currentTarget.src = "/placeholder.png";
  }}
/>
```

---

## Phase 4: Test Locally

### Task 4.1: Set Up Local Asset Server

Create a simple local server to serve images during development.

**Option A: Use Python HTTP Server**

```bash
cd frontend/public/images
python -m http.server 5001
```

**Option B: Use Node.js http-server**

```bash
npm install -g http-server
cd frontend/public/images
http-server -p 5001 --cors
```

**Option C: Add npm script** (recommended)

Add to `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve:images": "npx http-server ./public/images -p 5001 --cors"
  }
}
```

### Task 4.2: Test with Local Images

1. **Start local image server:**

   ```bash
   npm run serve:images
   ```

2. **Create `.env.local`:**

   ```bash
   VITE_ASSETS_BASE_URL=http://localhost:5001
   ```

3. **Start dev server:**

   ```bash
   npm run dev
   ```

4. **Verify in browser:**
   - Open browser console
   - Look for: `[Assets Config] Initialized: { baseUrl: 'http://localhost:5001', ... }`
   - Check Network tab: images should load from `http://localhost:5001/[category]/[filename]`

**AI Prompt:**

> "I've set up the local asset server. Please help me verify:
>
> 1. Are all images loading correctly?
> 2. Are there any 404 errors in the Network tab?
> 3. Are there any console warnings or errors?"

### Task 4.3: Test Component Updates

**AI Prompt:**

> "Please create a checklist of all components that were updated and verify each one displays images correctly."

For each component:

- [ ] Component renders without errors
- [ ] Images load correctly
- [ ] Placeholder appears for missing images
- [ ] No console errors or warnings

---

## Phase 5: Create Separate Assets Repository

### Task 5.1: Create New GitHub Repository

1. Go to GitHub → New Repository
2. Repository name: `{yourapp}-assets` (e.g., `todo-app-assets`, `blog-site-assets`)
3. Description: "Image assets for [YOUR_APP_NAME]"
4. Visibility: Private (recommended) or Public
5. **Do NOT** initialize with README (we'll move existing files)
6. Click "Create repository"

### Task 5.2: Organize Assets Repository Structure

In your new assets repository, create this structure:

```
{yourapp}-assets/
├── README.md
├── category1/
│   ├── image1.jpg
│   └── image2.png
├── category2/
│   ├── image1.jpg
│   └── image2.png
└── category3/
    ├── image1.jpg
    └── image2.png
```

**Example structures:**

**E-commerce:**

```
myshop-assets/
├── products/
├── categories/
├── banners/
└── brands/
```

**Social Media:**

```
socialapp-assets/
├── avatars/
├── posts/
├── backgrounds/
└── badges/
```

### Task 5.3: Copy Images to Assets Repository

**Steps:**

1. **Clone the new assets repository:**

   ```bash
   git clone https://github.com/{yourorg}/{yourapp}-assets.git
   cd {yourapp}-assets
   ```

2. **Copy images from main repo:**

   ```bash
   # Copy category by category
   cp -r /path/to/main-repo/frontend/public/images/category1 ./
   cp -r /path/to/main-repo/frontend/public/images/category2 ./
   ```

3. **Create README.md:**

   ```markdown
   # {YourApp} Assets

   Image assets for {YourApp}.

   ## Structure

   - `category1/` - Description of category1 images
   - `category2/` - Description of category2 images

   ## Deployment

   These assets are automatically synced to Azure Blob Storage via GitHub Actions.

   ## Last Updated

   [DATE]
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Initial import of image assets"
   git push origin main
   ```

**AI Prompt:**

> "Please help me verify that all images were copied correctly:
>
> 1. Count images in original location
> 2. Count images in new assets repo
> 3. Confirm counts match
> 4. Check for any missing files"

---

## Phase 6: Remove Images from Main Repository

### Task 6.1: Backup First!

**CRITICAL**: Make a backup before deleting anything!

```bash
cd /path/to/main-repo
cp -r frontend/public/images ~/backup-images-$(date +%Y%m%d)
```

### Task 6.2: Delete Images from Main Repo

**AI Prompt:**

> "Please help me safely remove images from my main repository:
>
> 1. Verify all images exist in the new assets repository
> 2. Delete the images directory from main repo
> 3. Keep a .gitkeep file in the empty directory
> 4. Update .gitignore to exclude future images"

```bash
# In main repo
cd frontend/public/images

# Delete all category directories
rm -rf category1/ category2/ category3/

# Create .gitkeep to preserve directory structure
touch .gitkeep
```

### Task 6.3: Commit Changes

```bash
git add .
git commit -m "refactor: migrate images to separate assets repository

- Moved all images to {yourapp}-assets repository
- Updated components to use getImageUrl() helper
- Added environment-based asset URL configuration
- Images now served from Azure Blob Storage in production
"
git push origin main
```

---

## Phase 7: Final Verification

### Task 7.1: Test with Local Assets

1. **Start local image server from assets repo:**

   ```bash
   cd {yourapp}-assets
   python -m http.server 5001
   # OR
   npx http-server . -p 5001 --cors
   ```

2. **Update .env.local in main repo:**

   ```bash
   VITE_ASSETS_BASE_URL=http://localhost:5001
   ```

3. **Start dev server:**

   ```bash
   cd main-repo/frontend
   npm run dev
   ```

4. **Verify:**
   - [ ] All images load correctly
   - [ ] No 404 errors
   - [ ] Console shows: `[Assets Config] Initialized: { baseUrl: 'http://localhost:5001', ... }`

**AI Prompt:**

> "Please help me verify the local setup is working correctly by checking:
>
> 1. Console for initialization message
> 2. Network tab for image requests
> 3. Any error messages or warnings"

### Task 7.2: Repository Size Comparison

Check that your main repo is now significantly smaller:

```bash
# In main repo
git count-objects -vH

# Compare to backup size
du -sh ~/backup-images-*
```

**Expected Result**: Main repo should be much smaller (hundreds of MB or more saved!)

---

## Phase 8: Next Steps

### ✅ Migration Complete Checklist

- [ ] Assets repository created with organized structure
- [ ] Images copied to assets repository
- [ ] Assets config module created (`frontend/src/config/assets.ts`)
- [ ] All components updated to use `getImageUrl()`
- [ ] `.env.production` configured with placeholder Azure URL
- [ ] `.env.local` created (gitignored)
- [ ] `.gitignore` updated to exclude images
- [ ] Images deleted from main repository
- [ ] Changes committed to both repositories
- [ ] Local testing successful
- [ ] Main repo size significantly reduced

### 🚀 Ready for Deployment Template

**Now you're ready to use the DEPLOYMENT_INSTRUCTIONS_TEMPLATE.md!**

**Before proceeding:**

1. ✅ All image migration steps completed above
2. ✅ Local testing successful
3. ✅ Both repositories pushed to GitHub
4. ✅ Team members aware of new asset repository

**Next steps (in deployment template):**

1. Create Azure Blob Storage account
2. Update `.env.production` with actual Azure URL
3. Set up GitHub Actions to sync assets repository to Azure
4. Deploy main application using deployment template
5. Configure DNS for image CDN (optional)

---

## Troubleshooting

### Images Not Loading Locally

**Problem**: Images show as broken when running dev server.

**Solutions:**

1. Verify `.env.local` exists and has correct URL
2. Confirm local image server is running on port 5001
3. Check that image categories match between assets repo and code
4. Restart dev server after changing `.env.local`
5. Clear browser cache

### Console Errors: "Assets Config Not Initialized"

**Problem**: `getImageUrl()` called before initialization.

**Solution**:

1. Verify `initializeAssetsConfig()` is called in `main.tsx`
2. Ensure it's called BEFORE any components render
3. Check console for initialization message

### Wrong Images Loading

**Problem**: Images from wrong category or old cached images.

**Solutions:**

1. Verify category names in `getImageUrl()` match folder names exactly
2. Clear browser cache (hard refresh: Ctrl+Shift+R)
3. Check Network tab to see actual URLs being requested
4. Verify filenames in database match actual files (case-sensitive!)

### Port 5001 Already in Use

**Problem**: Can't start local asset server on port 5001.

**Solutions:**

1. Use different port: `http-server -p 5002`
2. Update `.env.local` to match new port
3. Kill process using port 5001: `lsof -ti:5001 | xargs kill` (Mac/Linux)

---

## Summary

By following this template, you have:

✅ **Separated concerns**: Code in main repo, images in assets repo  
✅ **Reduced repo size**: Main repo is now lightweight and fast  
✅ **Environment flexibility**: Easy switching between local and remote assets  
✅ **Security hardened**: Filename sanitization prevents path traversal  
✅ **Production ready**: Environment-based configuration for deployment  
✅ **Team friendly**: Clear separation allows content team to manage assets independently

**Next**: Use DEPLOYMENT_INSTRUCTIONS_TEMPLATE.md to deploy to production with Azure! 🚀

---

**Template Version**: 1.0  
**Last Updated**: November 8, 2025  
**Based on**: Disney App image migration implementation
