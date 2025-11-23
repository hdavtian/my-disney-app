import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Movie } from "../../types/Movie";
import { MovieCard } from "../MovieCard";
import { SearchInput } from "../SearchInput";
import { CardSizeControl } from "../CardSizeControl";
import "./MoviesGridView.scss";

export interface MoviesGridViewProps {
  movies: Movie[];
  onMovieClick?: (movieId: string) => void;
  /** When true, the page owns the search input and results — hide internal search UI */
  hideSearch?: boolean;
  /** Pagination support for infinite scroll */
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  /** Number of items to load per page */
  pageSize?: number;
  /** Skip card animations (for load more scenario) */
  skipAnimation?: boolean;
  /** Number of columns to display (0 = use default) */
  gridColumns?: number;
  /** Callback when grid columns change */
  onGridColumnsChange?: (columns: number) => void;
  /** Min columns for grid size control */
  minColumns?: number;
  /** Max columns for grid size control */
  maxColumns?: number;
  /** Default columns for grid size control */
  defaultColumns?: number;
  /** Labels for grid size control */
  gridLabels?: string[];
}

export const MoviesGridView = ({
  movies,
  onMovieClick,
  hideSearch,
  onLoadMore,
  hasMore,
  isLoadingMore,
  pageSize = 20,
  skipAnimation = false,
  gridColumns = 0,
  onGridColumnsChange,
  minColumns = 2,
  maxColumns = 10,
  defaultColumns = 4,
  gridLabels = ["Cozy", "Normal", "Compact", "Dense"],
}: MoviesGridViewProps) => {
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>(movies);

  // Keep internal filtered list in sync when parent passes new `movies` (or filtered list)
  // This lets the page pass a filtered list down and have the grid render it.
  useEffect(() => {
    setFilteredMovies(movies);
  }, [movies]);

  const handleSearch = useCallback((results: Movie[]) => {
    setFilteredMovies(results);
  }, []);

  // Infinite scroll handler for window scroll
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 400; // 400px threshold for better trackpad detection

      if (isNearBottom && !isLoadingMore) {
        console.log("🔽 Infinite scroll triggered - Loading more movies...");
        onLoadMore();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onLoadMore, hasMore, isLoadingMore]);

  return (
    <div className="movies-grid-view">
      {!hideSearch && (
        <div className="movies-grid-view__search-container">
          <SearchInput
            items={movies}
            onSearch={handleSearch}
            // use concrete fields that exist on Movie
            searchFields={["title", "short_description", "director"]}
            placeholder="Search movies..."
            minCharacters={3}
            getDisplayText={(movie) => movie.title}
            getSecondaryText={(movie) =>
              `${movie.releaseYear} • ${movie.director}`
            }
            onSelectItem={(movie) => onMovieClick?.(movie.id)}
          />
        </div>
      )}

      {filteredMovies.length === 0 ? (
        <motion.div
          className="movies-grid-view__empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
            <polyline points="17 2 12 7 7 2" />
          </svg>
          <h3>No movies found</h3>
          <p>Try adjusting your search criteria</p>
        </motion.div>
      ) : (
        <>
          {onGridColumnsChange && (
            <div className="movies-grid-view__grid-controls">
              <CardSizeControl
                currentColumns={gridColumns}
                minColumns={minColumns}
                maxColumns={maxColumns}
                defaultColumns={defaultColumns}
                onChange={onGridColumnsChange}
                labels={gridLabels}
              />
            </div>
          )}
          <div
            className="movies-grid-view__grid"
            style={
              gridColumns > 0
                ? ({ "--grid-columns": gridColumns } as React.CSSProperties)
                : undefined
            }
          >
            {filteredMovies.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={onMovieClick}
                index={index}
                skipAnimation={skipAnimation}
              />
            ))}
          </div>

          {/* Infinite Scroll Section */}
          {hideSearch && onLoadMore && (
            <div className="movies-grid-view__load-more">
              {isLoadingMore && (
                <div className="movies-grid-view__loading">
                  <div className="spinner"></div>
                  Loading more movies...
                </div>
              )}

              {!isLoadingMore && hasMore && (
                <motion.div
                  className="movies-grid-view__scroll-indicator"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="movies-grid-view__scroll-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="7 13 12 18 17 13"></polyline>
                      <polyline points="7 6 12 11 17 6"></polyline>
                    </svg>
                  </div>
                  <p className="movies-grid-view__scroll-text">
                    Scroll down to load <strong>{pageSize} more movies</strong>
                  </p>
                </motion.div>
              )}

              {!hasMore && filteredMovies.length > 20 && (
                <motion.div
                  className="movies-grid-view__end-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <h3>That's all the movies!</h3>
                  <p>
                    You've reached the end of the collection (
                    {filteredMovies.length} movies)
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
