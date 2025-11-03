import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { FavoriteItem } from "../../hooks/useFavorites";

interface FavoritesState {
  items: FavoriteItem[];
}

const initialState: FavoritesState = {
  items: [],
};

export const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    hydrateFavorites(state, action: PayloadAction<FavoriteItem[]>) {
      state.items = action.payload;
    },
    addFavorite(state, action: PayloadAction<FavoriteItem>) {
      state.items.push(action.payload);
    },
    removeFavorite(
      state,
      action: PayloadAction<{ id: string | number; type: string }>
    ) {
      state.items = state.items.filter(
        (fav) =>
          !(fav.id === action.payload.id && fav.type === action.payload.type)
      );
    },
    cleanExpiredFavorites(state) {
      const now = Date.now();
      const EXPIRY_DAYS = 30;
      state.items = state.items.filter(
        (fav) => now - fav.addedAt < EXPIRY_DAYS * 24 * 60 * 60 * 1000
      );
    },
  },
});

export const {
  hydrateFavorites,
  addFavorite,
  removeFavorite,
  cleanExpiredFavorites,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
