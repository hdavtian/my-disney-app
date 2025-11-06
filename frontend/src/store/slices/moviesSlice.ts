import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Movie } from "../../types";
import { getApiUrl, API_ENDPOINTS } from "../../config/api";
import { CacheService } from "../../utils/cacheService";

interface MoviesState {
  movies: Movie[];
  displayedMovies: Movie[]; // Movies currently shown (paginated)
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    genre: string;
    year: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    hasMore: boolean;
    isLoadingMore: boolean;
  };
}

const initialState: MoviesState = {
  movies: [],
  displayedMovies: [],
  loading: false,
  error: null,
  filters: {
    search: "",
    genre: "",
    year: "",
  },
  pagination: {
    page: 0,
    pageSize: 20,
    hasMore: true,
    isLoadingMore: false,
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

// Async thunk to load more movies (pagination)
export const loadMoreMovies = createAsyncThunk(
  "movies/loadMoreMovies",
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState() as { movies: MoviesState };
      const { movies, pagination, filters } = state.movies;

      // If no movies loaded yet, fetch them first
      if (movies.length === 0) {
        await dispatch(fetchMovies());
        return;
      }

      // Apply filters to movies
      let filteredMovies = movies;

      if (filters.search) {
        filteredMovies = filteredMovies.filter(
          (movie) =>
            movie.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            (movie.short_description &&
              movie.short_description
                .toLowerCase()
                .includes(filters.search.toLowerCase())) ||
            (movie.long_description &&
              movie.long_description
                .toLowerCase()
                .includes(filters.search.toLowerCase()))
        );
      }

      if (filters.genre) {
        filteredMovies = filteredMovies.filter((movie) =>
          movie.genre?.some((g) =>
            g.toLowerCase().includes(filters.genre.toLowerCase())
          )
        );
      }

      if (filters.year) {
        filteredMovies = filteredMovies.filter(
          (movie) => movie.releaseYear?.toString() === filters.year
        );
      }

      const nextPage = pagination.page + 1;
      const startIndex = nextPage * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const newMovies = filteredMovies.slice(startIndex, endIndex);

      return {
        newMovies,
        hasMore: endIndex < filteredMovies.length,
        nextPage,
      };
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
      // Reset pagination when filter changes
      state.pagination.page = 0;
      state.pagination.hasMore = true;
      // Reapply pagination with new filter
      const filteredMovies = state.movies.filter(
        (movie) =>
          (movie.title.toLowerCase().includes(action.payload.toLowerCase()) ||
            (movie.short_description &&
              movie.short_description
                .toLowerCase()
                .includes(action.payload.toLowerCase())) ||
            (movie.long_description &&
              movie.long_description
                .toLowerCase()
                .includes(action.payload.toLowerCase()))) &&
          (!state.filters.genre ||
            movie.genre?.some((g) =>
              g.toLowerCase().includes(state.filters.genre.toLowerCase())
            )) &&
          (!state.filters.year ||
            movie.releaseYear?.toString() === state.filters.year)
      );
      state.displayedMovies = filteredMovies.slice(
        0,
        state.pagination.pageSize
      );
    },
    setGenreFilter: (state, action: PayloadAction<string>) => {
      state.filters.genre = action.payload;
      // Reset pagination when filter changes
      state.pagination.page = 0;
      state.pagination.hasMore = true;
      // Reapply pagination with new filter
      const filteredMovies = state.movies.filter(
        (movie) =>
          (!state.filters.search ||
            movie.title
              .toLowerCase()
              .includes(state.filters.search.toLowerCase()) ||
            (movie.short_description &&
              movie.short_description
                .toLowerCase()
                .includes(state.filters.search.toLowerCase())) ||
            (movie.long_description &&
              movie.long_description
                .toLowerCase()
                .includes(state.filters.search.toLowerCase()))) &&
          (!action.payload ||
            movie.genre?.some((g) =>
              g.toLowerCase().includes(action.payload.toLowerCase())
            )) &&
          (!state.filters.year ||
            movie.releaseYear?.toString() === state.filters.year)
      );
      state.displayedMovies = filteredMovies.slice(
        0,
        state.pagination.pageSize
      );
    },
    setYearFilter: (state, action: PayloadAction<string>) => {
      state.filters.year = action.payload;
      // Reset pagination when filter changes
      state.pagination.page = 0;
      state.pagination.hasMore = true;
      // Reapply pagination with new filter
      const filteredMovies = state.movies.filter(
        (movie) =>
          (!state.filters.search ||
            movie.title
              .toLowerCase()
              .includes(state.filters.search.toLowerCase()) ||
            (movie.short_description &&
              movie.short_description
                .toLowerCase()
                .includes(state.filters.search.toLowerCase())) ||
            (movie.long_description &&
              movie.long_description
                .toLowerCase()
                .includes(state.filters.search.toLowerCase()))) &&
          (!state.filters.genre ||
            movie.genre?.some((g) =>
              g.toLowerCase().includes(state.filters.genre.toLowerCase())
            )) &&
          (!action.payload || movie.releaseYear?.toString() === action.payload)
      );
      state.displayedMovies = filteredMovies.slice(
        0,
        state.pagination.pageSize
      );
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        genre: "",
        year: "",
      };
      // Reset pagination and show initial movies
      state.pagination.page = 0;
      state.pagination.hasMore = true;
      state.displayedMovies = state.movies.slice(0, state.pagination.pageSize);
    },
    resetPagination: (state) => {
      state.pagination.page = 0;
      state.pagination.hasMore = true;
      state.displayedMovies = state.movies.slice(0, state.pagination.pageSize);
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
      // Initialize displayed movies with first page
      state.displayedMovies = action.payload.slice(
        0,
        state.pagination.pageSize
      );
      state.pagination.page = 0;
      state.pagination.hasMore =
        action.payload.length > state.pagination.pageSize;
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

    // Handle loadMoreMovies
    builder.addCase(loadMoreMovies.pending, (state) => {
      state.pagination.isLoadingMore = true;
    });
    builder.addCase(loadMoreMovies.fulfilled, (state, action) => {
      state.pagination.isLoadingMore = false;
      if (action.payload) {
        state.displayedMovies.push(...action.payload.newMovies);
        state.pagination.page = action.payload.nextPage;
        state.pagination.hasMore = action.payload.hasMore;
      }
    });
    builder.addCase(loadMoreMovies.rejected, (state, action) => {
      state.pagination.isLoadingMore = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setSearchFilter,
  setGenreFilter,
  setYearFilter,
  clearFilters,
  resetPagination,
} = moviesSlice.actions;

export default moviesSlice.reducer;
