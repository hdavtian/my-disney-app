import { Middleware } from "@reduxjs/toolkit";

// Constants
const STORAGE_KEY = "disney-app-ui-preferences";
const DEBOUNCE_DELAY = 500; // milliseconds

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Middleware to sync UI preferences state to localStorage
 * Uses debouncing to avoid excessive writes
 */
export const localStorageSyncMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);

    // Only sync on uiPreferences actions
    const actionType = (action as { type?: string }).type;
    if (actionType?.startsWith("uiPreferences/")) {
      console.log(`💾 UI Preferences action: ${actionType}`);

      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new debounced save
      debounceTimer = setTimeout(() => {
        try {
          const state = store.getState();
          const uiPreferences = (state as { uiPreferences?: unknown })
            .uiPreferences;

          // Save to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(uiPreferences));
          console.log("💾 Saved to localStorage:", uiPreferences);
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
      console.log("📖 Loaded from localStorage:", parsed);
      return parsed;
    }
  } catch (error) {
    console.error("Failed to load UI preferences from localStorage:", error);
  }
  console.log("📖 No preferences in localStorage, using defaults");
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
