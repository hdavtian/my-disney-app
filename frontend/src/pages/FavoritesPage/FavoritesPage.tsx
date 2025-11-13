import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useFavorites } from "../../hooks/useFavorites";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchMovies } from "../../store/slices/moviesSlice";
import { fetchCharacters } from "../../store/slices/charactersSlice";
import {
  addRecentlyViewedMovie,
  addRecentlyViewedCharacter,
} from "../../store/slices/recentlyViewedSlice";
import { Movie } from "../../types/Movie";
import { Character } from "../../types/Character";
import { ViewModeToggle, ViewMode } from "../../components/ViewModeToggle";
import { MovieCard } from "../../components/MovieCard/MovieCard";
import { CharacterCard } from "../../components/CharacterCard/CharacterCard";
import { SearchInput } from "../../components/SearchInput";
import "./FavoritesPage.scss";

type FavoriteItem =
  | { type: "movie"; data: Movie }
  | { type: "character"; data: Character };

export const FavoritesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const allMovies = useAppSelector((state) => state.movies.movies);
  const allCharacters = useAppSelector((state) => state.characters.characters);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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

  // maintain a filtered list controlled by the page search
  const [filteredFavorites, setFilteredFavorites] =
    useState<FavoriteItem[]>(favoriteItems);

  // keep in sync when favorites or source data changes
  useEffect(() => {
    setFilteredFavorites(favoriteItems);
  }, [favoriteItems]);

  // Build a lightweight search index of favorite items for SearchInput
  const searchIndex = favoriteItems.map((item) => {
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

  const handleSearch = useCallback((results: any[]) => {
    setFilteredFavorites(results.map((r) => r.original as FavoriteItem));
  }, []);

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
            getDisplayText={(i: any) => i.title}
            getSecondaryText={(i: any) => i.secondary}
          />

          <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
        </div>
      </div>

      {!hasFavorites ? (
        <div className="favorites-page__empty">
          <p>No favorites yet. Add movies or characters to your favorites!</p>
        </div>
      ) : (
        <div
          className={`favorites-page__content favorites-page__content--${viewMode}`}
        >
          {viewMode === "grid" ? (
            <div className="favorites-grid">
              {filteredFavorites.map((item, idx) =>
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
          ) : (
            <div className="favorites-list favorites-list--list">
              {filteredFavorites.map((item) => (
                <div
                  key={`${item.type}-${item.data.id}`}
                  className="favorites-list__row"
                >
                  {item.type === "movie" ? (
                    <MovieCard
                      movie={item.data as Movie}
                      onClick={() => handleMovieClick(item.data.id)}
                    />
                  ) : (
                    <CharacterCard
                      character={item.data as Character}
                      onClick={() => handleCharacterClick(item.data.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
