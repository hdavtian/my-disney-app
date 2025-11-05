import { useState, useEffect, useCallback } from "react";
import "./MoviesPage.scss";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchMovies } from "../../store/slices/moviesSlice";
import { addRecentlyViewedMovie } from "../../store/slices/recentlyViewedSlice";
import { ViewModeToggle, ViewMode } from "../../components/ViewModeToggle";
import { MoviesGridView } from "../../components/MoviesGridView";
import { MoviesListView } from "../../components/MoviesListView";
import { SearchInput } from "../../components/SearchInput";
import { Movie } from "../../types/Movie";

export const MoviesPage = () => {
  const dispatch = useAppDispatch();
  const { movies, loading, error } = useAppSelector((state) => state.movies);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  // local filtered list controlled by this page's SearchInput
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>(movies);

  useEffect(() => {
    dispatch(fetchMovies());
  }, [dispatch]);

  // sync filtered list when store movies update
  useEffect(() => {
    setFilteredMovies(movies);
  }, [movies]);

  const handleMovieClick = useCallback(
    (movieId: string) => {
      const movie = movies.find((m: { id: string }) => m.id === movieId);
      if (movie) {
        dispatch(addRecentlyViewedMovie({ id: movie.id, name: movie.title }));
        // Navigation is handled by MovieCard component
      }
    },
    [movies, dispatch]
  );

  const handleSearch = useCallback((results: Movie[]) => {
    setFilteredMovies(results);
  }, []);
  if (loading) {
    return (
      <motion.div
        className="page-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="movies-page__loading">Loading movies...</div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="page-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="movies-page__error">Error: {error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="page-container movies-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="movies-page__header">
        <div className="movies-page__header-content">
          <h1>Disney Movies</h1>
          <p>
            Explore the enchanting collection of Disney's cinematic
            masterpieces.
          </p>
        </div>

        <div className="movies-page__controls">
          <SearchInput
            items={movies}
            onSearch={handleSearch}
            searchFields={["title", "short_description", "director"]}
            placeholder="Search movies..."
            minCharacters={2}
            getDisplayText={(movie: Movie) => movie.title}
            getSecondaryText={(movie: Movie) =>
              `${movie.releaseYear} • ${movie.director}`
            }
            onSelectItem={(movie: Movie) => handleMovieClick(movie.id)}
          />

          <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
        </div>
      </div>

      <div className="movies-page__content">
        {viewMode === "grid" ? (
          <MoviesGridView
            movies={filteredMovies}
            onMovieClick={handleMovieClick}
            hideSearch={true}
          />
        ) : (
          <MoviesListView />
        )}
      </div>
    </motion.div>
  );
};
