import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addFavorite,
  removeFavorite,
  hydrateFavorites,
  cleanExpiredFavorites,
} from "../store/slices/favoritesSlice";
import { RootState } from "../store/store";

export type FavoriteType = "movie" | "character" | "attraction";
export interface FavoriteItem {
  id: string | number;
  type: FavoriteType;
  addedAt: number;
}

const FAVORITES_KEY = "disneyapp_favorites";
const EXPIRY_DAYS = 30;

function getStoredFavorites(): FavoriteItem[] {
  const raw = localStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as FavoriteItem[];
    const now = Date.now();
    return arr.filter(
      (fav) => now - fav.addedAt < EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );
  } catch {
    return [];
  }
}

function saveFavorites(favorites: FavoriteItem[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function useFavorites() {
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorites.items);

  // Hydrate from localStorage on first use
  const hydrate = useCallback(() => {
    const stored = getStoredFavorites();
    dispatch(hydrateFavorites(stored));
    dispatch(cleanExpiredFavorites());
  }, [dispatch]);

  const isFavorite = useCallback(
    (id: string | number, type: FavoriteType) => {
      return favorites.some((fav) => fav.id === id && fav.type === type);
    },
    [favorites]
  );

  const add = useCallback(
    (id: string | number, type: FavoriteType) => {
      const newFav: FavoriteItem = { id, type, addedAt: Date.now() };
      const updated = [...favorites, newFav];
      saveFavorites(updated);
      dispatch(addFavorite(newFav));
    },
    [favorites, dispatch]
  );

  const remove = useCallback(
    (id: string | number, type: FavoriteType) => {
      const updated = favorites.filter(
        (fav) => !(fav.id === id && fav.type === type)
      );
      saveFavorites(updated);
      dispatch(removeFavorite({ id, type }));
    },
    [favorites, dispatch]
  );

  return {
    favorites,
    isFavorite,
    add,
    remove,
    hydrate,
  };
}
