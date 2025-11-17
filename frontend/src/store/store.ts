import { configureStore } from "@reduxjs/toolkit";
import charactersReducer from "./slices/charactersSlice";
import moviesReducer from "./slices/moviesSlice";
import favoritesReducer from "./slices/favoritesSlice";
import recentlyViewedReducer from "./slices/recentlyViewedSlice";
import quizReducer from "./slices/quizSlice";
import uiPreferencesReducer from "./slices/uiPreferencesSlice";
import themeReducer from "./slices/themeSlice";
import parksReducer from "./slices/parksSlice";
import attractionsReducer from "./slices/attractionsSlice";
import {
  localStorageSyncMiddleware,
  loadPreferencesFromStorage,
  loadThemeFromStorage,
} from "./middleware/localStorageSyncMiddleware";
import { rehydratePreferences } from "./slices/uiPreferencesSlice";
import { initializeTheme } from "./slices/themeSlice";

// Configure store
export const store = configureStore({
  reducer: {
    characters: charactersReducer,
    movies: moviesReducer,
    favorites: favoritesReducer,
    recentlyViewed: recentlyViewedReducer,
    quiz: quizReducer,
    uiPreferences: uiPreferencesReducer,
    theme: themeReducer,
    parks: parksReducer,
    attractions: attractionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageSyncMiddleware),
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Rehydrate UI preferences from localStorage on app initialization
const storedPreferences = loadPreferencesFromStorage();
if (storedPreferences) {
  store.dispatch(rehydratePreferences(storedPreferences));
}

// Rehydrate theme from localStorage on app initialization
const storedTheme = loadThemeFromStorage();
if (storedTheme) {
  store.dispatch(
    initializeTheme({
      selectedTheme: storedTheme.selectedTheme || "auto",
      appliedTheme: storedTheme.appliedTheme || "theme-dark",
    })
  );
}
