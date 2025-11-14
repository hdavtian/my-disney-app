import { configureStore } from "@reduxjs/toolkit";
import charactersReducer from "./slices/charactersSlice";
import moviesReducer from "./slices/moviesSlice";
import favoritesReducer from "./slices/favoritesSlice";
import recentlyViewedReducer from "./slices/recentlyViewedSlice";
import quizReducer from "./slices/quizSlice";
import uiPreferencesReducer from "./slices/uiPreferencesSlice";
import {
  localStorageSyncMiddleware,
  loadPreferencesFromStorage,
} from "./middleware/localStorageSyncMiddleware";
import { rehydratePreferences } from "./slices/uiPreferencesSlice";

// Configure store
export const store = configureStore({
  reducer: {
    characters: charactersReducer,
    movies: moviesReducer,
    favorites: favoritesReducer,
    recentlyViewed: recentlyViewedReducer,
    quiz: quizReducer,
    uiPreferences: uiPreferencesReducer,
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
