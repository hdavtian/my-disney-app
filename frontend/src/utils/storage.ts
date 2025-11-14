import { CacheService } from "./cacheService";
import { clearPreferencesFromStorage } from "../store/middleware/localStorageSyncMiddleware";

/**
 * Storage utility for managing site data (cache, cookies, localStorage)
 * Used by Site Settings for data management operations
 */

// Constants
const FAVORITES_KEY = "disney_favorites";
const RECENTLY_VIEWED_KEY = "disney_recentlyViewed";
const QUIZ_STATE_KEY = "disney_quiz_state";
const DISCLAIMER_KEY = "disney_disclaimer_accepted";

/**
 * Clear all cached API data (characters, movies, etc.)
 * Uses the existing CacheService
 */
export const clearCache = (): { success: boolean; error?: string } => {
  try {
    CacheService.clear();
    console.log("✅ Cache cleared successfully");
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to clear cache:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Clear all site cookies
 * Note: Modern browsers have limitations on clearing cookies via JavaScript
 */
export const clearCookies = (): { success: boolean; error?: string } => {
  try {
    const cookies = document.cookie.split(";");
    let clearedCount = 0;

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name =
        eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

      // Clear cookie by setting expiry to past date
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      clearedCount++;
    }

    console.log(`✅ Cookies cleared: ${clearedCount} cookies`);
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to clear cookies:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Clear localStorage except essential data
 * Preserves: disclaimer acceptance (so users don't see it again)
 */
export const clearLocalStorage = (
  options: { preserveDisclaimer?: boolean } = {}
): { success: boolean; error?: string } => {
  try {
    const { preserveDisclaimer = true } = options;

    // Save disclaimer state if needed
    let disclaimerState: string | null = null;
    if (preserveDisclaimer) {
      disclaimerState = localStorage.getItem(DISCLAIMER_KEY);
    }

    // Clear all localStorage
    localStorage.clear();

    // Restore disclaimer state
    if (preserveDisclaimer && disclaimerState) {
      localStorage.setItem(DISCLAIMER_KEY, disclaimerState);
    }

    console.log("✅ localStorage cleared successfully");
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to clear localStorage:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Clear only UI preferences from localStorage
 */
export const clearUiPreferences = (): { success: boolean; error?: string } => {
  try {
    clearPreferencesFromStorage();
    console.log("✅ UI preferences cleared successfully");
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to clear UI preferences:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Clear only user data (favorites, recently viewed, quiz state)
 * Preserves: cache, UI preferences, disclaimer
 */
export const clearUserData = (): { success: boolean; error?: string } => {
  try {
    const keysToRemove = [FAVORITES_KEY, RECENTLY_VIEWED_KEY, QUIZ_STATE_KEY];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log("✅ User data cleared successfully");
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to clear user data:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Reset all site data (cache + cookies + localStorage)
 * Nuclear option - clears everything except disclaimer
 */
export const resetAllSiteData = (
  options: { preserveDisclaimer?: boolean } = {}
): { success: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Clear cache
  const cacheResult = clearCache();
  if (!cacheResult.success && cacheResult.error) {
    errors.push(`Cache: ${cacheResult.error}`);
  }

  // Clear cookies
  const cookiesResult = clearCookies();
  if (!cookiesResult.success && cookiesResult.error) {
    errors.push(`Cookies: ${cookiesResult.error}`);
  }

  // Clear localStorage
  const storageResult = clearLocalStorage(options);
  if (!storageResult.success && storageResult.error) {
    errors.push(`Storage: ${storageResult.error}`);
  }

  const success = errors.length === 0;
  if (success) {
    console.log("✅ All site data reset successfully");
  } else {
    console.error("❌ Some data reset operations failed:", errors);
  }

  return { success, errors };
};

/**
 * Get approximate cache size in bytes and formatted string
 */
export const getCacheSize = (): { bytes: number; formatted: string } => {
  try {
    const stats = CacheService.getStats();

    // Parse the formatted size (e.g., "123.4 KB") back to bytes
    const kbMatch = stats.totalSize.match(/([\d.]+)\s*KB/);
    const kb = kbMatch ? parseFloat(kbMatch[1]) : 0;
    const bytes = Math.round(kb * 1024);

    return {
      bytes,
      formatted: stats.totalSize,
    };
  } catch (error) {
    console.error("Failed to get cache size:", error);
    return { bytes: 0, formatted: "0 KB" };
  }
};

/**
 * Get detailed cache statistics
 */
export const getCacheStats = () => {
  try {
    return CacheService.getStats();
  } catch (error) {
    console.error("Failed to get cache stats:", error);
    return {
      totalItems: 0,
      totalSize: "0 KB",
      items: [],
    };
  }
};

/**
 * Get total localStorage usage across all keys
 */
export const getLocalStorageSize = (): { bytes: number; formatted: string } => {
  try {
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += new Blob([key + item]).size;
        }
      }
    }

    const kb = totalSize / 1024;
    const mb = kb / 1024;

    const formatted = mb > 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(1)} KB`;

    return { bytes: totalSize, formatted };
  } catch (error) {
    console.error("Failed to get localStorage size:", error);
    return { bytes: 0, formatted: "0 KB" };
  }
};

/**
 * Check if localStorage is available and has space
 */
export const checkStorageHealth = (): {
  available: boolean;
  hasSpace: boolean;
  usage: { bytes: number; formatted: string };
} => {
  const available = CacheService.isAvailable();
  const usage = getLocalStorageSize();

  // Most browsers have ~5-10MB localStorage limit
  const hasSpace = usage.bytes < 8 * 1024 * 1024; // 8MB threshold

  return { available, hasSpace, usage };
};

/**
 * Get last cache clear timestamp
 * Stored in localStorage to track when cache was last cleared
 */
export const getLastCacheClearTimestamp = (): number | null => {
  try {
    const timestamp = localStorage.getItem("disney_last_cache_clear");
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch {
    return null;
  }
};

/**
 * Set last cache clear timestamp
 */
export const setLastCacheClearTimestamp = (): void => {
  try {
    localStorage.setItem("disney_last_cache_clear", Date.now().toString());
  } catch (error) {
    console.error("Failed to set cache clear timestamp:", error);
  }
};
