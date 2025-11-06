import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Character } from "../../types";
import { getApiUrl, API_ENDPOINTS } from "../../config/api";
import { CacheService } from "../../utils/cacheService";

interface CharactersState {
  characters: Character[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    movie: string;
    category: string;
  };
}

const initialState: CharactersState = {
  characters: [],
  loading: false,
  error: null,
  filters: {
    search: "",
    movie: "",
    category: "",
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

const charactersSlice = createSlice({
  name: "characters",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setMovieFilter: (state, action: PayloadAction<string>) => {
      state.filters.movie = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        movie: "",
        category: "",
      };
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
  },
});

export const {
  setSearchFilter,
  setMovieFilter,
  setCategoryFilter,
  clearFilters,
} = charactersSlice.actions;

export default charactersSlice.reducer;
