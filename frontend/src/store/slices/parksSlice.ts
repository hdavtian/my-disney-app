import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Park } from "../../types/Park";
import { parksApi } from "../../api/parksApi";
import { CacheService } from "../../utils/cacheService";

interface ParksState {
  parks: Park[];
  selectedPark: Park | null;
  loading: boolean;
  error: string | null;
}

const initialState: ParksState = {
  parks: [],
  selectedPark: null,
  loading: false,
  error: null,
};

// Async thunk to fetch all parks with caching
export const fetchParks = createAsyncThunk(
  "parks/fetchParks",
  async (_, { rejectWithValue }) => {
    try {
      const cacheKey = "parks_list";

      // Check cache first
      const cachedData = CacheService.get<Park[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // If no cache, fetch from API
      const data = await parksApi.getAllParks();

      // Cache the response
      CacheService.set(cacheKey, data);

      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch parks"
      );
    }
  }
);

// Async thunk to fetch a single park by URL ID with caching
export const fetchParkByUrlId = createAsyncThunk(
  "parks/fetchParkByUrlId",
  async (urlId: string, { rejectWithValue }) => {
    try {
      const cacheKey = `park_${urlId}`;

      // Check cache first
      const cachedData = CacheService.get<Park>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // If no cache, fetch from API
      const data = await parksApi.getParkByUrlId(urlId);

      // Cache the response
      CacheService.set(cacheKey, data);

      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : `Failed to fetch park: ${urlId}`
      );
    }
  }
);

const parksSlice = createSlice({
  name: "parks",
  initialState,
  reducers: {
    selectPark: (state, action: PayloadAction<Park>) => {
      state.selectedPark = action.payload;
    },
    clearSelectedPark: (state) => {
      state.selectedPark = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all parks
      .addCase(fetchParks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParks.fulfilled, (state, action) => {
        state.loading = false;
        state.parks = action.payload;
        // Auto-select first park if none selected
        if (!state.selectedPark && action.payload.length > 0) {
          state.selectedPark = action.payload[0];
        }
      })
      .addCase(fetchParks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch park by URL ID
      .addCase(fetchParkByUrlId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParkByUrlId.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPark = action.payload;
        // Also update in parks array if it exists
        const index = state.parks.findIndex(
          (p) => p.url_id === action.payload.url_id
        );
        if (index !== -1) {
          state.parks[index] = action.payload;
        }
      })
      .addCase(fetchParkByUrlId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectPark, clearSelectedPark, clearError } = parksSlice.actions;
export default parksSlice.reducer;
