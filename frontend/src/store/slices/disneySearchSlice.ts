import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  fetchSearchCapabilities,
  fetchSearchResults,
} from "../../api/disneySearchApi";
import {
  MatchMode,
  SearchCapabilitiesResponse,
  SearchCategoryKey,
  SearchHistoryEntry,
  SearchResultsResponse,
  SearchScopeKey,
} from "../../types/DisneySearch";

export interface DisneySearchState {
  query: string;
  selectedCategories: SearchCategoryKey[];
  scopeSelections: Record<SearchCategoryKey, SearchScopeKey>;
  matchMode: MatchMode;
  capabilities?: SearchCapabilitiesResponse;
  capabilitiesLoading: boolean;
  history: SearchHistoryEntry[];
  results: SearchResultsResponse;
  loading: boolean;
  error?: string | null;
}

const MAX_HISTORY = 10;

const initialState: DisneySearchState = {
  query: "",
  selectedCategories: ["movies", "characters", "parks"],
  scopeSelections: {
    movies: "basic",
    characters: "basic",
    parks: "basic",
  },
  matchMode: "exact",
  capabilitiesLoading: false,
  history: [],
  results: {},
  loading: false,
  error: null,
};

export const loadCapabilities = createAsyncThunk<SearchCapabilitiesResponse>(
  "disneySearch/loadCapabilities",
  async () => {
    return fetchSearchCapabilities();
  }
);

export const executeSearch = createAsyncThunk<
  SearchResultsResponse,
  {
    query: string;
    categories: SearchCategoryKey[];
    scopes: Record<SearchCategoryKey, SearchScopeKey>;
    matchMode: MatchMode;
  }
>(
  "disneySearch/executeSearch",
  async ({ query, categories, scopes, matchMode }) => {
    return fetchSearchResults({ query, categories, scopes, matchMode });
  }
);

const disneySearchSlice = createSlice({
  name: "disneySearch",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setMatchMode(state, action: PayloadAction<MatchMode>) {
      state.matchMode = action.payload;
    },
    toggleCategory(state, action: PayloadAction<SearchCategoryKey>) {
      const category = action.payload;
      if (state.selectedCategories.includes(category)) {
        if (state.selectedCategories.length === 1) {
          return;
        }
        state.selectedCategories = state.selectedCategories.filter(
          (item) => item !== category
        );
      } else {
        state.selectedCategories = [...state.selectedCategories, category];
      }
    },
    setScopeSelection(
      state,
      action: PayloadAction<{
        category: SearchCategoryKey;
        scope: SearchScopeKey;
      }>
    ) {
      const { category, scope } = action.payload;
      state.scopeSelections = {
        ...state.scopeSelections,
        [category]: scope,
      };
    },
    applyScopePreset(
      state,
      action: PayloadAction<Partial<Record<SearchCategoryKey, SearchScopeKey>>>
    ) {
      state.scopeSelections = {
        ...state.scopeSelections,
        ...action.payload,
      };
    },
    restoreFromHistory(state, action: PayloadAction<SearchHistoryEntry>) {
      state.query = action.payload.query;
      state.selectedCategories = action.payload.categories;
      state.scopeSelections = action.payload.scopes;
    },
    clearResults(state) {
      state.results = {};
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCapabilities.pending, (state) => {
        state.capabilitiesLoading = true;
        state.error = null;
      })
      .addCase(loadCapabilities.fulfilled, (state, action) => {
        state.capabilitiesLoading = false;
        state.capabilities = action.payload;
      })
      .addCase(loadCapabilities.rejected, (state, action) => {
        state.capabilitiesLoading = false;
        state.error = action.error.message ?? "Failed to load capabilities";
      })
      .addCase(executeSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;

        const normalizedQuery = state.query.trim();
        if (normalizedQuery.length > 0) {
          const entry: SearchHistoryEntry = {
            query: normalizedQuery,
            categories: [...state.selectedCategories],
            scopes: { ...state.scopeSelections },
            timestamp: Date.now(),
          };
          state.history = [entry, ...state.history].slice(0, MAX_HISTORY);
        }
      })
      .addCase(executeSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Disney Search request failed";
      });
  },
});

export const {
  setQuery,
  setMatchMode,
  toggleCategory,
  setScopeSelection,
  applyScopePreset,
  restoreFromHistory,
  clearResults,
  clearError,
} = disneySearchSlice.actions;

export const selectDisneySearchState = (state: RootState) => state.disneySearch;
export const selectDisneySearchHistory = (state: RootState) =>
  state.disneySearch.history;

export default disneySearchSlice.reducer;
