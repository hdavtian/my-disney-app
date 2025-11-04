import { configureStore } from "@reduxjs/toolkit";
import charactersReducer from "./slices/charactersSlice";
import moviesReducer from "./slices/moviesSlice";
import favoritesReducer from "./slices/favoritesSlice";
import recentlyViewedReducer from "./slices/recentlyViewedSlice";
import quizReducer from "./slices/quizSlice";

export const store = configureStore({
  reducer: {
    characters: charactersReducer,
    movies: moviesReducer,
    favorites: favoritesReducer,
    recentlyViewed: recentlyViewedReducer,
    quiz: quizReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
