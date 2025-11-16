/**
 * Assets configuration module for centralized image URL generation.
 * Handles environment-specific base URLs and path sanitization.
 */

// Type definitions for asset kinds
type AssetKind = "movies" | "characters";

// Configuration constants
const ALLOWED_FILENAME_PATTERN = /^[a-zA-Z0-9._-]+$/;
const PLACEHOLDER_IMAGE = "/placeholder.png";

/**
 * Get the base URL for assets from environment variables.
 * Cached on first access for performance.
 */
let cachedBaseUrl: string | undefined = undefined;
let cachedPrefix: string | undefined = undefined;

function getAssetsBaseUrl(): string {
  if (cachedBaseUrl !== undefined) {
    return cachedBaseUrl;
  }

  const baseUrl = import.meta.env.VITE_ASSETS_BASE_URL;
  const isDev = import.meta.env.DEV;

  if (!baseUrl) {
    if (isDev) {
      console.warn(
        "[Assets Config] VITE_ASSETS_BASE_URL not set. Defaulting to http://localhost:5001 for development."
      );
      cachedBaseUrl = "http://localhost:5001";
    } else {
      console.error(
        "[Assets Config] VITE_ASSETS_BASE_URL is not set in production! Image loading will fail."
      );
      cachedBaseUrl = "";
    }
  } else {
    cachedBaseUrl = baseUrl;
  }

  return cachedBaseUrl;
}

function getAssetsPrefix(): string {
  if (cachedPrefix !== undefined) {
    return cachedPrefix;
  }

  const prefix = import.meta.env.VITE_ASSETS_PREFIX;
  cachedPrefix = prefix ? `/${prefix.replace(/^\/+|\/+$/g, "")}` : "";

  return cachedPrefix;
}

/**
 * Sanitize a filename to prevent path traversal and other security issues.
 *
 * @param filename - The filename to sanitize
 * @returns Sanitized filename or null if invalid
 */
function sanitizeFilename(filename: string): string | null {
  if (!filename || typeof filename !== "string") {
    return null;
  }

  // Remove leading/trailing whitespace
  let sanitized = filename.trim();

  // Remove any leading slashes
  sanitized = sanitized.replace(/^\/+/, "");

  // Reject path traversal attempts
  if (
    sanitized.includes("..") ||
    sanitized.includes("/") ||
    sanitized.includes("\\")
  ) {
    console.warn(`[Assets Config] Invalid filename detected: ${filename}`);
    return null;
  }

  // Validate against allowed pattern
  if (!ALLOWED_FILENAME_PATTERN.test(sanitized)) {
    console.warn(
      `[Assets Config] Filename contains invalid characters: ${filename}`
    );
    return null;
  }

  return sanitized;
}

/**
 * Construct a full URL for an image asset.
 *
 * @param kind - The type of asset ('movies' or 'characters')
 * @param filename - The filename (without path or extension)
 * @returns Full URL to the asset or placeholder if invalid
 *
 * @example
 * // Development (VITE_ASSETS_BASE_URL=http://localhost:5001)
 * getImageUrl('movies', 'frozen')
 * // Returns: 'http://localhost:5001/movies/webp/frozen.webp'
 *
 * @example
 * // Production (VITE_ASSETS_BASE_URL=https://cdn.example.com)
 * getImageUrl('characters', 'elsa')
 * // Returns: 'https://cdn.example.com/characters/webp/elsa.webp'
 *
 * @example
 * // With versioning (VITE_ASSETS_PREFIX=v123)
 * getImageUrl('movies', 'moana')
 * // Returns: 'https://cdn.example.com/v123/movies/webp/moana.webp'
 */
export function getImageUrl(kind: AssetKind, filename: string): string {
  // Handle missing or empty filename
  if (!filename) {
    return PLACEHOLDER_IMAGE;
  }

  // Sanitize the filename
  const sanitized = sanitizeFilename(filename);
  if (!sanitized) {
    return PLACEHOLDER_IMAGE;
  }

  // Add .webp extension if no extension present
  const filenameWithExt = sanitized.includes(".")
    ? sanitized
    : `${sanitized}.webp`;

  // Get base URL and optional prefix
  const baseUrl = getAssetsBaseUrl();
  const prefix = getAssetsPrefix();

  // Construct the full URL with /webp subdirectory
  // Format: {baseUrl}{prefix}/{kind}/webp/{filename}.webp
  const url = `${baseUrl}${prefix}/${kind}/webp/${filenameWithExt}`;

  // Collapse any duplicate slashes (except in protocol://)
  return url.replace(/([^:]\/)\/+/g, "$1");
}

/**
 * Preload the assets configuration (useful for initialization).
 * Call this early in app startup to validate configuration.
 */
export function initializeAssetsConfig(): void {
  const baseUrl = getAssetsBaseUrl();
  const prefix = getAssetsPrefix();
  const isDev = import.meta.env.DEV;

  console.log("[Assets Config] Initialized:", {
    baseUrl,
    prefix: prefix || "(none)",
    environment: isDev ? "development" : "production",
  });
}
