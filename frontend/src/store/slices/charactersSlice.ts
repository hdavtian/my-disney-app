import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Character } from "../../types";
import { getApiUrl, API_ENDPOINTS } from "../../config/api";
import { CacheService } from "../../utils/cacheService";
import { charactersApi } from "../../api/charactersApi";

interface CharactersState {
  characters: Character[];
  displayedCharacters: Character[]; // Characters currently shown (paginated)
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    movie: string;
    category: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    hasMore: boolean;
    isLoadingMore: boolean;
  };
}

const initialState: CharactersState = {
  characters: [],
  displayedCharacters: [],
  loading: false,
  error: null,
  filters: {
    search: "",
    movie: "",
    category: "",
  },
  pagination: {
    page: 0,
    pageSize: 20,
    hasMore: true,
    isLoadingMore: false,
  },
};

// Async thunk to fetch all characters from the API with caching
export const fetchCharacters = createAsyncThunk(
  "characters/fetchCharacters",
  async (_, { rejectWithValue }) => {
    try {
      const cacheKey = "characters_list";

      // Check cache first
      const cachedData = CacheService.get<Character[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // If no cache, fetch from API
      const response = await fetch(getApiUrl(API_ENDPOINTS.CHARACTERS));
      if (!response.ok) {
        throw new Error("Failed to fetch characters");
      }
      const data = (await response.json()) as Character[];

      // Cache the response
      CacheService.set(cacheKey, data);

      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }
);

// Async thunk to fetch a single character by ID with caching
export const fetchCharacterById = createAsyncThunk(
  "characters/fetchCharacterById",
  async (id: number, { rejectWithValue }) => {
    try {
      const cacheKey = `character_${id}`;

      // Check cache first
      const cachedData = CacheService.get<Character>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // If no cache, fetch from API
      const response = await fetch(
        getApiUrl(`${API_ENDPOINTS.CHARACTERS}/${id}`)
      );
      if (!response.ok) {
        throw new Error("Failed to fetch character");
      }
      const data = (await response.json()) as Character;

      // Cache the response
      CacheService.set(cacheKey, data);

      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }
);

// Async thunk to batch fetch characters by IDs with caching and deduplication
export const fetchCharactersByIds = createAsyncThunk(
  "characters/fetchCharactersByIds",
  async (ids: number[], { rejectWithValue }) => {
    try {
      if (ids.length === 0) return [];

      // Fetch from API using batch endpoint
      const data = await charactersApi.getCharactersByIds(ids);

      // Cache each character individually
      data.forEach((character) => {
        const cacheKey = `character_${character.id}`;
        CacheService.set(cacheKey, character);
      });

      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to batch fetch characters"
      );
    }
  }
);

// Async thunk to load more characters (pagination)
export const loadMoreCharacters = createAsyncThunk(
  "characters/loadMoreCharacters",
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState() as { characters: CharactersState };
      const { characters, pagination, filters } = state.characters;

      // If no characters loaded yet, fetch them first
      if (characters.length === 0) {
        await dispatch(fetchCharacters());
        return;
      }

      // Apply filters to characters
      let filteredCharacters = characters;

      if (filters.search) {
        filteredCharacters = filteredCharacters.filter((character) =>
          character.name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.movie) {
        filteredCharacters = filteredCharacters.filter((character) =>
          character.movies?.some((movie) =>
            movie.toLowerCase().includes(filters.movie.toLowerCase())
          )
        );
      }

      if (filters.category) {
        filteredCharacters = filteredCharacters.filter(
          (character) => character.category === filters.category
        );
      }

      const nextPage = pagination.page + 1;
      const startIndex = nextPage * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const newCharacters = filteredCharacters.slice(startIndex, endIndex);

      return {
        newCharacters,
        hasMore: endIndex < filteredCharacters.length,
        nextPage,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }
);

const charactersSlice = createSlice({
  name: "characters",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      // Reset pagination when filter changes
      state.pagination.page = 0;
      state.pagination.hasMore = true;
      // Reapply pagination with new filter
      const filteredCharacters = state.characters.filter(
        (character) =>
          character.name.toLowerCase().includes(action.payload.toLowerCase()) &&
          (!state.filters.movie ||
            character.movies?.some((movie) =>
              movie.toLowerCase().includes(state.filters.movie.toLowerCase())
            )) &&
          (!state.filters.category ||
            character.category === state.filters.category)
      );
      // Preserve the current display count if larger than pageSize
      const currentDisplayCount = Math.max(
        state.displayedCharacters.length,
        state.pagination.pageSize
      );
      state.displayedCharacters = filteredCharacters.slice(
        0,
        currentDisplayCount
      );
      state.pagination.hasMore =
        filteredCharacters.length > currentDisplayCount;
    },
    setMovieFilter: (state, action: PayloadAction<string>) => {
      state.filters.movie = action.payload;
      // Reset pagination when filter changes
      state.pagination.page = 0;
      state.pagination.hasMore = true;
      // Reapply pagination with new filter
      const filteredCharacters = state.characters.filter(
        (character) =>
          (!state.filters.search ||
            character.name
              .toLowerCase()
              .includes(state.filters.search.toLowerCase())) &&
          (!action.payload ||
            character.movies?.some((movie) =>
              movie.toLowerCase().includes(action.payload.toLowerCase())
            )) &&
          (!state.filters.category ||
            character.category === state.filters.category)
      );
      state.displayedCharacters = filteredCharacters.slice(
        0,
        state.pagination.pageSize
      );
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload;
      // Reset pagination when filter changes
      state.pagination.page = 0;
      state.pagination.hasMore = true;
      // Reapply pagination with new filter
      const filteredCharacters = state.characters.filter(
        (character) =>
          (!state.filters.search ||
            character.name
              .toLowerCase()
              .includes(state.filters.search.toLowerCase())) &&
          (!state.filters.movie ||
            character.movies?.some((movie) =>
              movie.toLowerCase().includes(state.filters.movie.toLowerCase())
            )) &&
          (!action.payload || character.category === action.payload)
      );
      state.displayedCharacters = filteredCharacters.slice(
        0,
        state.pagination.pageSize
      );
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        movie: "",
        category: "",
      };
      // Reset pagination and show initial characters
      state.pagination.page = 0;
      state.pagination.hasMore = true;
      state.displayedCharacters = state.characters.slice(
        0,
        state.pagination.pageSize
      );
    },
    resetPagination: (state) => {
      state.pagination.page = 0;
      state.pagination.hasMore = true;
      state.displayedCharacters = state.characters.slice(
        0,
        state.pagination.pageSize
      );
    },
    // Restore pagination state from UI preferences
    restorePaginationState: (state, action: PayloadAction<number>) => {
      const itemsToShow = action.payload;
      state.displayedCharacters = state.characters.slice(0, itemsToShow);
      state.pagination.page =
        Math.floor(itemsToShow / state.pagination.pageSize) - 1;
      state.pagination.hasMore = state.characters.length > itemsToShow;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchCharacters
    builder.addCase(fetchCharacters.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCharacters.fulfilled, (state, action) => {
      state.loading = false;
      state.characters = action.payload;
      state.error = null;
      // Only initialize displayed characters if we don't have any yet
      // This allows restorePaginationState to work after fetch
      if (state.displayedCharacters.length === 0) {
        state.displayedCharacters = action.payload.slice(
          0,
          state.pagination.pageSize
        );
        state.pagination.page = 0;
        state.pagination.hasMore =
          action.payload.length > state.pagination.pageSize;
      }
    });
    builder.addCase(fetchCharacters.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle fetchCharacterById
    builder.addCase(fetchCharacterById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCharacterById.fulfilled, (state, action) => {
      state.loading = false;
      // Optionally update a single character in the array if it exists
      const index = state.characters.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.characters[index] = action.payload;
      } else {
        state.characters.push(action.payload);
      }
      state.error = null;
    });
    builder.addCase(fetchCharacterById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle fetchCharactersByIds
    builder.addCase(fetchCharactersByIds.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCharactersByIds.fulfilled, (state, action) => {
      state.loading = false;
      // Merge batch results into existing characters array (avoid duplicates)
      action.payload.forEach((character) => {
        const index = state.characters.findIndex((c) => c.id === character.id);
        if (index !== -1) {
          state.characters[index] = character;
        } else {
          state.characters.push(character);
        }
      });
      state.error = null;
    });
    builder.addCase(fetchCharactersByIds.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle loadMoreCharacters
    builder.addCase(loadMoreCharacters.pending, (state) => {
      state.pagination.isLoadingMore = true;
    });
    builder.addCase(loadMoreCharacters.fulfilled, (state, action) => {
      state.pagination.isLoadingMore = false;
      if (action.payload) {
        state.displayedCharacters.push(...action.payload.newCharacters);
        state.pagination.page = action.payload.nextPage;
        state.pagination.hasMore = action.payload.hasMore;
      }
    });
    builder.addCase(loadMoreCharacters.rejected, (state, action) => {
      state.pagination.isLoadingMore = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setSearchFilter,
  setMovieFilter,
  setCategoryFilter,
  clearFilters,
  resetPagination,
  restorePaginationState,
} = charactersSlice.actions;

export default charactersSlice.reducer;
