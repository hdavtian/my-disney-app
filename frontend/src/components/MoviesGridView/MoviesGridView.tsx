import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Movie } from "../../types/Movie";
import { MovieCard } from "../MovieCard";
import { SearchInput } from "../SearchInput";
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
}

export const MoviesGridView = ({
  movies,
  onMovieClick,
  hideSearch,
  onLoadMore,
  hasMore,
  isLoadingMore,
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
    if (!onLoadMore || !hasMore || hideSearch) return;

    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200; // 200px threshold

      if (isNearBottom && !isLoadingMore) {
        onLoadMore();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onLoadMore, hasMore, isLoadingMore, hideSearch]);

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
          <div className="movies-grid-view__grid">
            {filteredMovies.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={onMovieClick}
                index={index}
              />
            ))}
          </div>

          {/* Load More Section */}
          {hideSearch && onLoadMore && (
            <div className="movies-grid-view__load-more">
              {isLoadingMore && (
                <div className="movies-grid-view__loading">
                  <div className="spinner"></div>
                  Loading more movies...
                </div>
              )}

              {!isLoadingMore && hasMore && (
                <motion.button
                  className="movies-grid-view__load-more-btn btn-primary"
                  onClick={onLoadMore}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Load More Movies
                </motion.button>
              )}

              {!hasMore && filteredMovies.length > 20 && (
                <div className="movies-grid-view__end-message">
                  You've seen all movies!
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
