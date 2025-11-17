import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Attraction } from "../../types/Attraction";
import { attractionsApi } from "../../api/attractionsApi";
import { CacheService } from "../../utils/cacheService";

interface AttractionsState {
  // Attractions keyed by park URL ID for efficient lookup
  attractionsByPark: Record<string, Attraction[]>;
  selectedAttraction: Attraction | null;
  loading: boolean;
  error: string | null;
}

const initialState: AttractionsState = {
  attractionsByPark: {},
  selectedAttraction: null,
  loading: false,
  error: null,
};

// Async thunk to fetch attractions for a specific park with caching
export const fetchAttractionsByPark = createAsyncThunk(
  "attractions/fetchAttractionsByPark",
  async (parkUrlId: string, { rejectWithValue }) => {
    try {
      const cacheKey = `attractions_park_${parkUrlId}`;

      // Check cache first
      const cachedData = CacheService.get<Attraction[]>(cacheKey);
      if (cachedData) {
        return { parkUrlId, attractions: cachedData };
      }

      // If no cache, fetch from API
      const data = await attractionsApi.getAttractionsByPark(parkUrlId);

      // Cache the response
      CacheService.set(cacheKey, data);

      return { parkUrlId, attractions: data };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : `Failed to fetch attractions for park: ${parkUrlId}`
      );
    }
  }
);

const attractionsSlice = createSlice({
  name: "attractions",
  initialState,
  reducers: {
    selectAttraction: (state, action: PayloadAction<Attraction>) => {
      state.selectedAttraction = action.payload;
    },
    clearSelectedAttraction: (state) => {
      state.selectedAttraction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch attractions by park
      .addCase(fetchAttractionsByPark.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttractionsByPark.fulfilled, (state, action) => {
        state.loading = false;
        const { parkUrlId, attractions } = action.payload;
        state.attractionsByPark[parkUrlId] = attractions;

        // Auto-select first attraction if none selected or if changing parks
        if (attractions.length > 0) {
          state.selectedAttraction = attractions[0];
        }
      })
      .addCase(fetchAttractionsByPark.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectAttraction, clearSelectedAttraction, clearError } =
  attractionsSlice.actions;
export default attractionsSlice.reducer;
