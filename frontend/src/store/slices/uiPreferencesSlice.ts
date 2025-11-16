import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ViewMode = "grid" | "list";
export type ThemeMode = "light" | "dark";

interface PagePreferences {
  viewMode: ViewMode;
  gridItemsToShow: number;
  searchQuery: string;
  gridColumns: number;
  lastUpdated: number;
}

interface UiPreferencesState {
  movies: PagePreferences;
  characters: PagePreferences;
  theme: ThemeMode;
}

const DEFAULT_PAGE_PREFERENCES: PagePreferences = {
  viewMode: "grid",
  gridItemsToShow: 20,
  searchQuery: "",
  gridColumns: 0, // 0 means use default per page
  lastUpdated: Date.now(),
};

const initialState: UiPreferencesState = {
  movies: { ...DEFAULT_PAGE_PREFERENCES },
  characters: { ...DEFAULT_PAGE_PREFERENCES },
  theme: "light",
};

const uiPreferencesSlice = createSlice({
  name: "uiPreferences",
  initialState,
  reducers: {
    // Movies actions
    setMoviesViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.movies.viewMode = action.payload;
      state.movies.lastUpdated = Date.now();
    },
    setMoviesGridItemsToShow: (state, action: PayloadAction<number>) => {
      state.movies.gridItemsToShow = action.payload;
      state.movies.lastUpdated = Date.now();
    },
    setMoviesSearchQuery: (state, action: PayloadAction<string>) => {
      state.movies.searchQuery = action.payload;
      state.movies.lastUpdated = Date.now();
    },
    incrementMoviesGridItems: (state, action: PayloadAction<number>) => {
      state.movies.gridItemsToShow += action.payload;
      state.movies.lastUpdated = Date.now();
      console.log(
        `📊 Movies gridItemsToShow incremented to: ${state.movies.gridItemsToShow}`
      );
    },
    setMoviesGridColumns: (state, action: PayloadAction<number>) => {
      state.movies.gridColumns = action.payload;
      state.movies.lastUpdated = Date.now();
    },
    resetMoviesPreferences: (state) => {
      state.movies = { ...DEFAULT_PAGE_PREFERENCES };
    },

    // Characters actions
    setCharactersViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.characters.viewMode = action.payload;
      state.characters.lastUpdated = Date.now();
    },
    setCharactersGridItemsToShow: (state, action: PayloadAction<number>) => {
      state.characters.gridItemsToShow = action.payload;
      state.characters.lastUpdated = Date.now();
    },
    setCharactersSearchQuery: (state, action: PayloadAction<string>) => {
      state.characters.searchQuery = action.payload;
      state.characters.lastUpdated = Date.now();
    },
    incrementCharactersGridItems: (state, action: PayloadAction<number>) => {
      state.characters.gridItemsToShow += action.payload;
      state.characters.lastUpdated = Date.now();
      console.log(
        `📊 Characters gridItemsToShow incremented to: ${state.characters.gridItemsToShow}`
      );
    },
    setCharactersGridColumns: (state, action: PayloadAction<number>) => {
      state.characters.gridColumns = action.payload;
      state.characters.lastUpdated = Date.now();
    },
    resetCharactersPreferences: (state) => {
      state.characters = { ...DEFAULT_PAGE_PREFERENCES };
    },

    // Theme actions
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },

    // Global reset
    resetAllPreferences: (state) => {
      state.movies = { ...DEFAULT_PAGE_PREFERENCES };
      state.characters = { ...DEFAULT_PAGE_PREFERENCES };
      state.theme = "light";
    },

    // Rehydrate from localStorage
    rehydratePreferences: (
      _state,
      action: PayloadAction<UiPreferencesState>
    ) => {
      return action.payload;
    },
  },
});

export const {
  setMoviesViewMode,
  setMoviesGridItemsToShow,
  setMoviesSearchQuery,
  incrementMoviesGridItems,
  setMoviesGridColumns,
  resetMoviesPreferences,
  setCharactersViewMode,
  setCharactersGridItemsToShow,
  setCharactersSearchQuery,
  incrementCharactersGridItems,
  setCharactersGridColumns,
  resetCharactersPreferences,
  setTheme,
  toggleTheme,
  resetAllPreferences,
  rehydratePreferences,
} = uiPreferencesSlice.actions;

export default uiPreferencesSlice.reducer;
