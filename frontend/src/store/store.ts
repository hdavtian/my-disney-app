import { configureStore } from "@reduxjs/toolkit";
import charactersReducer from "./slices/charactersSlice";
import moviesReducer from "./slices/moviesSlice";
import favoritesReducer from "./slices/favoritesSlice";
import recentlyViewedReducer from "./slices/recentlyViewedSlice";

export const store = configureStore({
  reducer: {
    characters: charactersReducer,
    movies: moviesReducer,
    favorites: favoritesReducer,
    recentlyViewed: recentlyViewedReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
