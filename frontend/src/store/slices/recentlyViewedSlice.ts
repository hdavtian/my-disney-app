import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RecentlyViewedItem {
  id: string;
  name: string;
  timestamp: number;
}

interface RecentlyViewedState {
  movies: RecentlyViewedItem[];
  characters: RecentlyViewedItem[];
  maxItems: number;
}

const initialState: RecentlyViewedState = {
  movies: [],
  characters: [],
  maxItems: 20, // Store up to 20 items, but display less
};

const recentlyViewedSlice = createSlice({
  name: "recentlyViewed",
  initialState,
  reducers: {
    addRecentlyViewedMovie: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      const { id, name } = action.payload;
      const timestamp = Date.now();

      // Remove existing entry if present
      state.movies = state.movies.filter((item) => item.id !== id);

      // Add new entry at the beginning
      state.movies.unshift({ id, name, timestamp });

      // Keep only maxItems
      if (state.movies.length > state.maxItems) {
        state.movies = state.movies.slice(0, state.maxItems);
      }
    },

    addRecentlyViewedCharacter: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      const { id, name } = action.payload;
      const timestamp = Date.now();

      // Remove existing entry if present
      state.characters = state.characters.filter((item) => item.id !== id);

      // Add new entry at the beginning
      state.characters.unshift({ id, name, timestamp });

      // Keep only maxItems
      if (state.characters.length > state.maxItems) {
        state.characters = state.characters.slice(0, state.maxItems);
      }
    },

    clearRecentlyViewedMovies: (state) => {
      state.movies = [];
    },

    clearRecentlyViewedCharacters: (state) => {
      state.characters = [];
    },

    removeRecentlyViewedMovie: (state, action: PayloadAction<string>) => {
      state.movies = state.movies.filter((item) => item.id !== action.payload);
    },

    removeRecentlyViewedCharacter: (state, action: PayloadAction<string>) => {
      state.characters = state.characters.filter(
        (item) => item.id !== action.payload
      );
    },
  },
});

export const {
  addRecentlyViewedMovie,
  addRecentlyViewedCharacter,
  clearRecentlyViewedMovies,
  clearRecentlyViewedCharacters,
  removeRecentlyViewedMovie,
  removeRecentlyViewedCharacter,
} = recentlyViewedSlice.actions;

export default recentlyViewedSlice.reducer;
