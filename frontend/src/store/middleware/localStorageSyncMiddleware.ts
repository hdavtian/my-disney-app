import { Middleware } from "@reduxjs/toolkit";

// Constants
const STORAGE_KEY = "disney-app-ui-preferences";
const THEME_STORAGE_KEY = "disney-app-theme";
const DEBOUNCE_DELAY = 500; // milliseconds

// Debounce timers
let uiDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let themeDebounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Middleware to sync UI preferences and theme state to localStorage
 * Uses debouncing to avoid excessive writes
 */
export const localStorageSyncMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);

    const actionType = (action as { type?: string }).type;

    // Sync UI preferences
    if (actionType?.startsWith("uiPreferences/")) {
      console.log(`💾 UI Preferences action: ${actionType}`);

      // Clear existing timer
      if (uiDebounceTimer) {
        clearTimeout(uiDebounceTimer);
      }

      // Set new debounced save
      uiDebounceTimer = setTimeout(() => {
        try {
          const state = store.getState();
          const uiPreferences = (state as { uiPreferences?: unknown })
            .uiPreferences;

          // Save to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(uiPreferences));
          console.log(
            "💾 Saved UI preferences to localStorage:",
            uiPreferences
          );
        } catch (error) {
          console.error(
            "Failed to save UI preferences to localStorage:",
            error
          );
          // Handle quota exceeded or other localStorage errors
          if (error instanceof Error && error.name === "QuotaExceededError") {
            console.warn(
              "localStorage quota exceeded. Unable to save preferences."
            );
          }
        }
      }, DEBOUNCE_DELAY);
    }

    // Sync theme
    if (actionType?.startsWith("theme/")) {
      console.log(`🎨 Theme action: ${actionType}`);

      // Clear existing timer
      if (themeDebounceTimer) {
        clearTimeout(themeDebounceTimer);
      }

      // Set new debounced save
      themeDebounceTimer = setTimeout(() => {
        try {
          const state = store.getState();
          const theme = (state as { theme?: unknown }).theme;

          // Save to localStorage
          localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
          console.log("🎨 Saved theme to localStorage:", theme);
        } catch (error) {
          console.error("Failed to save theme to localStorage:", error);
          if (error instanceof Error && error.name === "QuotaExceededError") {
            console.warn("localStorage quota exceeded. Unable to save theme.");
          }
        }
      }, DEBOUNCE_DELAY);
    }

    return result;
  };
/**
 * Load UI preferences from localStorage
 * Call this during app initialization to rehydrate state
 */
export const loadPreferencesFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("📖 Loaded UI preferences from localStorage:", parsed);
      return parsed;
    }
  } catch (error) {
    console.error("Failed to load UI preferences from localStorage:", error);
  }
  console.log("📖 No UI preferences in localStorage, using defaults");
  return null;
};

/**
 * Load theme from localStorage
 * Call this during app initialization to rehydrate theme state
 */
export const loadThemeFromStorage = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("📖 Loaded theme from localStorage:", parsed);
      return parsed;
    }
  } catch (error) {
    console.error("Failed to load theme from localStorage:", error);
  }
  console.log("📖 No theme in localStorage, using defaults");
  return null;
};

/**
 * Clear UI preferences from localStorage
 */
export const clearPreferencesFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear UI preferences from localStorage:", error);
  }
};
