import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./MoviesPage.scss";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchMovies,
  loadMoreMovies,
  setSearchFilter,
} from "../../store/slices/moviesSlice";
import { addRecentlyViewedMovie } from "../../store/slices/recentlyViewedSlice";
import { ViewModeToggle, ViewMode } from "../../components/ViewModeToggle";
import { MoviesGridView } from "../../components/MoviesGridView";
import { MoviesListView } from "../../components/MoviesListView";
import { SearchInput } from "../../components/SearchInput";
import { Movie } from "../../types/Movie";

export const MoviesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { movies, displayedMovies, loading, error, pagination } =
    useAppSelector((state) => state.movies);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    dispatch(fetchMovies());
  }, [dispatch]);

  const handleMovieClick = useCallback(
    (movieId: string) => {
      const movie = movies.find((m: { id: string }) => m.id === movieId);
      if (movie) {
        dispatch(addRecentlyViewedMovie({ id: movie.id, name: movie.title }));
        navigate(`/movie/${movie.id}`);
      }
    },
    [movies, dispatch, navigate]
  );

  const handleSearch = useCallback(
    (_results: Movie[], query: string) => {
      // SearchInput handles the filtering, but we update Redux state with the query
      dispatch(setSearchFilter(query));
    },
    [dispatch]
  );

  const handleSearchItemClick = useCallback(
    (movie: Movie) => {
      dispatch(addRecentlyViewedMovie({ id: movie.id, name: movie.title }));
      navigate(`/movie/${movie.id}`);
    },
    [dispatch, navigate]
  );

  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoadingMore) {
      dispatch(loadMoreMovies());
    }
  }, [dispatch, pagination.hasMore, pagination.isLoadingMore]);
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
            onSelectItem={handleSearchItemClick}
          />

          <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
        </div>
      </div>

      <div className="movies-page__content">
        {viewMode === "grid" ? (
          <MoviesGridView
            movies={displayedMovies}
            onMovieClick={handleMovieClick}
            onLoadMore={handleLoadMore}
            hasMore={pagination.hasMore}
            isLoadingMore={pagination.isLoadingMore}
            hideSearch={true}
          />
        ) : (
          <MoviesListView
            movies={displayedMovies}
            onMovieClick={handleMovieClick}
          />
        )}
      </div>
    </motion.div>
  );
};
