/**
 * API configuration module for centralized backend URL management.
 * Handles environment-specific API base URLs and endpoint construction.
 */

/**
 * Get the base URL for API calls from environment variables.
 * Cached on first access for performance.
 */
let cachedApiBaseUrl: string | undefined = undefined;

function getApiBaseUrl(): string {
  if (cachedApiBaseUrl !== undefined) {
    return cachedApiBaseUrl;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const isDev = import.meta.env.DEV;

  if (!baseUrl) {
    if (isDev) {
      console.warn(
        "[API Config] VITE_API_BASE_URL not set. Defaulting to http://localhost:8080 for development."
      );
      cachedApiBaseUrl = "http://localhost:8080";
    } else {
      console.error(
        "[API Config] VITE_API_BASE_URL is not set in production! API calls will fail."
      );
      cachedApiBaseUrl = "";
    }
  } else {
    // Remove trailing slash for consistency
    cachedApiBaseUrl = baseUrl.replace(/\/+$/, "");
  }

  return cachedApiBaseUrl!;
}

/**
 * Construct a full URL for an API endpoint.
 *
 * @param endpoint - The API endpoint path (with or without leading slash)
 * @returns Full URL to the API endpoint
 *
 * @example
 * // Development (VITE_API_BASE_URL not set)
 * getApiUrl('/api/movies')
 * // Returns: 'http://localhost:8080/api/movies'
 *
 * @example
 * // Production (VITE_API_BASE_URL=https://ca-movie-app-api.delightfulcliff-b8bbe0ca.westus2.azurecontainerapps.io)
 * getApiUrl('/api/characters/123')
 * // Returns: 'https://ca-movie-app-api.delightfulcliff-b8bbe0ca.westus2.azurecontainerapps.io/api/characters/123'
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${baseUrl}${normalizedEndpoint}`;
}

/**
 * Preload the API configuration (useful for initialization).
 * Call this early in app startup to validate configuration.
 */
export function initializeApiConfig(): void {
  const baseUrl = getApiBaseUrl();
  const isDev = import.meta.env.DEV;

  console.log("[API Config] Initialized:", {
    baseUrl,
    environment: isDev ? "development" : "production",
  });
}

// Common API endpoints
export const API_ENDPOINTS = {
  MOVIES: "/api/movies",
  CHARACTERS: "/api/characters",
  CAROUSELS: "/api/carousels",
  HEALTH: "/actuator/health",
  INFO: "/actuator/info",
  METRICS: "/actuator/metrics",
} as const;
