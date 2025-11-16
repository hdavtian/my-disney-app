import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useFavorites } from "../../hooks/useFavorites";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchMovies } from "../../store/slices/moviesSlice";
import { fetchCharacters } from "../../store/slices/charactersSlice";
import {
  setFavoritesGridColumns,
  setFavoritesSearchQuery,
} from "../../store/slices/uiPreferencesSlice";
import {
  addRecentlyViewedMovie,
  addRecentlyViewedCharacter,
} from "../../store/slices/recentlyViewedSlice";
import { Movie } from "../../types/Movie";
import { Character } from "../../types/Character";
import { CardSizeControl } from "../../components/CardSizeControl";
import { MovieCard } from "../../components/MovieCard/MovieCard";
import { CharacterCard } from "../../components/CharacterCard/CharacterCard";
import { SearchInput } from "../../components/SearchInput";
import "./FavoritesPage.scss";

type FavoriteItem =
  | { type: "movie"; data: Movie }
  | { type: "character"; data: Character };

type FilterType = "all" | "movies" | "characters";

export const FavoritesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const allMovies = useAppSelector((state) => state.movies.movies);
  const allCharacters = useAppSelector((state) => state.characters.characters);
  const { gridColumns, searchQuery } = useAppSelector(
    (state) =>
      state.uiPreferences.favorites ?? { gridColumns: 0, searchQuery: "" }
  );

  // Filter state
  const [filterType, setFilterType] = useState<FilterType>("all");

  // Grid size configuration
  const minColumns = 2;
  const maxColumns = 6;
  const defaultColumns = 4;

  // Use default if gridColumns is 0 or out of bounds
  const activeColumns =
    gridColumns === 0 || gridColumns < minColumns || gridColumns > maxColumns
      ? defaultColumns
      : gridColumns;

  // Ensure movies and characters are loaded
  useEffect(() => {
    if (allMovies.length === 0) {
      dispatch(fetchMovies());
    }
    if (allCharacters.length === 0) {
      dispatch(fetchCharacters());
    }
  }, [dispatch, allMovies.length, allCharacters.length]);

  // Build a combined favorites array preserving the user's saved order
  const favoriteItems = useMemo<FavoriteItem[]>(() => {
    return favorites
      .map((fav) => {
        if (fav.type === "movie") {
          const movie = allMovies.find((m) => m.id === fav.id);
          return movie ? { type: "movie", data: movie } : null;
        }
        if (fav.type === "character") {
          const character = allCharacters.find((c) => c.id === fav.id);
          return character ? { type: "character", data: character } : null;
        }
        return null;
      })
      .filter(Boolean) as FavoriteItem[];
  }, [favorites, allMovies, allCharacters]);

  const hasFavorites = favoriteItems.length > 0;

  // Build a lightweight search index of favorite items for SearchInput
  const searchIndex = useMemo(() => {
    return favoriteItems.map((item) => {
      if (item.type === "movie") {
        const m = item.data as Movie;
        return {
          id: `movie-${m.id}`,
          title: m.title,
          secondary: `${m.releaseYear || ""}`,
          original: item,
        };
      }
      const c = item.data as Character;
      return {
        id: `char-${c.id}`,
        title: c.name,
        secondary: `${c.debut || ""}`,
        original: item,
      };
    });
  }, [favoriteItems]);

  // Apply search filter and type filter to favoriteItems
  const filteredFavorites = useMemo(() => {
    let items = favoriteItems;

    // Apply type filter first
    if (filterType === "movies") {
      items = items.filter((item) => item.type === "movie");
    } else if (filterType === "characters") {
      items = items.filter((item) => item.type === "character");
    }

    // Then apply search filter
    if (!searchQuery) {
      return items;
    }

    const lowerQuery = searchQuery.toLowerCase();
    return items.filter((item) => {
      if (item.type === "movie") {
        const movie = item.data as Movie;
        return (
          movie.title.toLowerCase().includes(lowerQuery) ||
          movie.releaseYear?.toString().includes(lowerQuery)
        );
      } else {
        const character = item.data as Character;
        return (
          character.name.toLowerCase().includes(lowerQuery) ||
          character.debut?.toLowerCase().includes(lowerQuery)
        );
      }
    });
  }, [favoriteItems, searchQuery, filterType]);

  const handleSearch = useCallback(
    (_results: any[], query: string) => {
      dispatch(setFavoritesSearchQuery(query));
    },
    [dispatch]
  );

  const handleMovieClick = useCallback(
    (movieId: string) => {
      const movie = allMovies.find((m) => m.id === movieId);
      if (movie) {
        dispatch(addRecentlyViewedMovie({ id: movie.id, name: movie.title }));
        navigate(`/movie/${movie.id}`);
      }
    },
    [allMovies, dispatch, navigate]
  );

  const handleCharacterClick = useCallback(
    (characterId: string) => {
      const character = allCharacters.find((c) => c.id === characterId);
      if (character) {
        dispatch(
          addRecentlyViewedCharacter({ id: character.id, name: character.name })
        );
        navigate(`/character/${character.id}`);
      }
    },
    [allCharacters, dispatch, navigate]
  );

  const handleGridColumnsChange = useCallback(
    (columns: number) => {
      dispatch(setFavoritesGridColumns(columns));
    },
    [dispatch]
  );

  const handleResetSearch = useCallback(() => {
    dispatch(setFavoritesSearchQuery(""));
  }, [dispatch]);

  const handleFilterChange = useCallback((type: FilterType) => {
    setFilterType(type);
  }, []);

  return (
    <motion.div
      className="page-container favorites-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="favorites-page__header">
        <div className="favorites-page__header-content">
          <h1>Favorites</h1>
          <p>
            Your saved movies and characters — shown with their native cards.
          </p>
        </div>

        <div className="favorites-page__controls">
          <SearchInput
            items={searchIndex}
            onSearch={handleSearch}
            searchFields={["title", "secondary"]}
            placeholder="Search favorites..."
            minCharacters={1}
            initialValue={searchQuery}
            getDisplayText={(i: any) => i.title}
            getSecondaryText={(i: any) => i.secondary}
          />
          {searchQuery && (
            <button
              className="favorites-page__reset-search"
              onClick={handleResetSearch}
              aria-label="Reset search"
            >
              <i className="fas fa-times-circle"></i>
              <span>Reset Search</span>
            </button>
          )}
        </div>
      </div>

      {!hasFavorites ? (
        <div className="favorites-page__empty">
          <p>No favorites yet. Add movies or characters to your favorites!</p>
        </div>
      ) : (
        <div className="favorites-page__content">
          <div className="favorites-page__grid-controls">
            <div className="favorites-page__filter-buttons">
              <button
                className={`favorites-page__filter-button ${
                  filterType === "all" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("all")}
                aria-label="Show all favorites"
              >
                All
              </button>
              <button
                className={`favorites-page__filter-button ${
                  filterType === "movies" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("movies")}
                aria-label="Show movies only"
              >
                Movies
              </button>
              <button
                className={`favorites-page__filter-button ${
                  filterType === "characters" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("characters")}
                aria-label="Show characters only"
              >
                Characters
              </button>
            </div>
            <CardSizeControl
              currentColumns={activeColumns}
              minColumns={minColumns}
              maxColumns={maxColumns}
              defaultColumns={defaultColumns}
              onChange={handleGridColumnsChange}
            />
          </div>
          <div
            className="favorites-grid"
            style={{
              gridTemplateColumns: `repeat(${activeColumns}, 1fr)`,
            }}
          >
            {filteredFavorites.map((item: FavoriteItem, idx: number) =>
              item.type === "movie" ? (
                <MovieCard
                  key={`movie-${item.data.id}`}
                  movie={item.data}
                  onClick={() => handleMovieClick(item.data.id)}
                  index={idx}
                />
              ) : (
                <CharacterCard
                  key={`char-${item.data.id}`}
                  character={item.data}
                  onClick={() => handleCharacterClick(item.data.id)}
                  index={idx}
                />
              )
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
