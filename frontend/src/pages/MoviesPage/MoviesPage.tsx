import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./MoviesPage.scss";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchMovies,
  loadMoreMovies,
  setSearchFilter,
  restorePaginationState,
} from "../../store/slices/moviesSlice";
import {
  setMoviesViewMode,
  setMoviesSearchQuery,
  incrementMoviesGridItems,
} from "../../store/slices/uiPreferencesSlice";
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
  const { viewMode, gridItemsToShow, searchQuery } = useAppSelector(
    (state) => state.uiPreferences.movies
  );

  // Track if we've restored pagination state
  const hasRestoredPagination = useRef(false);

  // Fetch movies on mount
  useEffect(() => {
    dispatch(fetchMovies());
  }, [dispatch]);

  // Restore pagination state after movies are loaded (only once)
  useEffect(() => {
    if (
      movies.length > 0 &&
      gridItemsToShow > 20 &&
      !hasRestoredPagination.current
    ) {
      console.log(`🔄 Restoring Movies pagination: ${gridItemsToShow} items`);
      console.log(
        `   Current displayedMovies count: ${displayedMovies.length}`
      );
      dispatch(restorePaginationState(gridItemsToShow));
      hasRestoredPagination.current = true;
    }
    // Only run when movies are first loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, movies.length]);

  // Restore search query from UI preferences (run AFTER pagination restore)
  useEffect(() => {
    if (searchQuery && movies.length > 0 && hasRestoredPagination.current) {
      console.log(`🔍 Restoring search query: "${searchQuery}"`);
      dispatch(setSearchFilter(searchQuery));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, movies.length]);

  // Debug: Log displayedMovies count whenever it changes
  useEffect(() => {
    console.log(
      `📊 Movies page - displayedMovies count: ${displayedMovies.length}`
    );
  }, [displayedMovies.length]);

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
      dispatch(setMoviesSearchQuery(query));
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

  const handleResetSearch = useCallback(() => {
    dispatch(setSearchFilter(""));
    dispatch(setMoviesSearchQuery(""));
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoadingMore) {
      console.log(
        `🔽 Load More clicked - Current items: ${displayedMovies.length}, Adding: ${pagination.pageSize}`
      );
      dispatch(loadMoreMovies());
      // Increment the grid items count by pageSize (default 20)
      dispatch(incrementMoviesGridItems(pagination.pageSize));
    }
  }, [
    dispatch,
    pagination.hasMore,
    pagination.isLoadingMore,
    pagination.pageSize,
    displayedMovies.length,
  ]);

  const handleViewModeChange = useCallback(
    (newMode: ViewMode) => {
      dispatch(setMoviesViewMode(newMode));
    },
    [dispatch]
  );
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
            initialValue={searchQuery}
            getDisplayText={(movie: Movie) => movie.title}
            getSecondaryText={(movie: Movie) =>
              `${movie.releaseYear} • ${movie.director}`
            }
            onSelectItem={handleSearchItemClick}
          />

          <ViewModeToggle
            currentMode={viewMode}
            onModeChange={handleViewModeChange}
          />
          {searchQuery && (
            <button
              className="movies-page__reset-search"
              onClick={handleResetSearch}
              aria-label="Reset search"
            >
              <i className="fas fa-times-circle"></i>
              <span>Reset Search</span>
            </button>
          )}
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
          <MoviesListView movies={movies} onMovieClick={handleMovieClick} />
        )}
      </div>
    </motion.div>
  );
};
