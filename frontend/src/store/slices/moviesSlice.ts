import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Movie } from "../../types";
import { getApiUrl, API_ENDPOINTS } from "../../config/api";
import { CacheService } from "../../utils/cacheService";

interface MoviesState {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    genre: string;
    year: string;
  };
}

const initialState: MoviesState = {
  movies: [],
  loading: false,
  error: null,
  filters: {
    search: "",
    genre: "",
    year: "",
  },
};

// Async thunk to fetch all movies from the API with caching
export const fetchMovies = createAsyncThunk(
  "movies/fetchMovies",
  async (_, { rejectWithValue }) => {
    try {
      const cacheKey = "movies_list";

      // Check cache first
      const cachedData = CacheService.get<Movie[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // If no cache, fetch from API
      const response = await fetch(getApiUrl(API_ENDPOINTS.MOVIES));
      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }
      const data = (await response.json()) as Movie[];

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

// Async thunk to fetch a single movie by ID with caching
export const fetchMovieById = createAsyncThunk(
  "movies/fetchMovieById",
  async (id: number, { rejectWithValue }) => {
    try {
      const cacheKey = `movie_${id}`;

      // Check cache first
      const cachedData = CacheService.get<Movie>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // If no cache, fetch from API
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.MOVIES}/${id}`));
      if (!response.ok) {
        throw new Error("Failed to fetch movie");
      }
      const data = (await response.json()) as Movie;

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

const moviesSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setGenreFilter: (state, action: PayloadAction<string>) => {
      state.filters.genre = action.payload;
    },
    setYearFilter: (state, action: PayloadAction<string>) => {
      state.filters.year = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        genre: "",
        year: "",
      };
    },
  },
  extraReducers: (builder) => {
    // Handle fetchMovies
    builder.addCase(fetchMovies.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMovies.fulfilled, (state, action) => {
      state.loading = false;
      state.movies = action.payload;
      state.error = null;
    });
    builder.addCase(fetchMovies.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle fetchMovieById
    builder.addCase(fetchMovieById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMovieById.fulfilled, (state, action) => {
      state.loading = false;
      // Optionally update a single movie in the array if it exists
      const index = state.movies.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.movies[index] = action.payload;
      } else {
        state.movies.push(action.payload);
      }
      state.error = null;
    });
    builder.addCase(fetchMovieById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setSearchFilter, setGenreFilter, setYearFilter, clearFilters } =
  moviesSlice.actions;

export default moviesSlice.reducer;
