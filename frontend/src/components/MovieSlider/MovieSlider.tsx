import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchMovies } from "../../store/slices/moviesSlice";
import { Movie } from "../../types/Movie";
import { FavoriteButton } from "../FavoriteButton/FavoriteButton";
import { getImageUrl } from "../../config/assets";

interface MovieSliderProps {
  movies?: Movie[];
  isSearchActive?: boolean;
  loading?: boolean;
}

export const MovieSlider = ({
  movies: propMovies,
  isSearchActive = false,
  loading = false,
}: MovieSliderProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { movies: storeMovies, error } = useAppSelector(
    (state) => state.movies
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!propMovies) {
      dispatch(fetchMovies());
    }
  }, [dispatch, propMovies]);

  const movies = propMovies || storeMovies;

  // Responsive cards per view
  const getCardsPerView = () => {
    if (window.innerWidth <= 480) return 1; // Mobile
    return 6; // All other breakpoints
  };

  const [cardsPerView] = useState(getCardsPerView());
  const maxIndex = Math.max(0, movies.length - cardsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Show scrolling indicator
      setIsScrolling(true);

      // Clear existing timeout
      const timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);

      // Scroll logic
      if (e.deltaY > 0) {
        // Scroll down = move right
        setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
      } else {
        // Scroll up = move left
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }

      return () => clearTimeout(timeoutId);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [maxIndex]);

  if (loading) {
    return (
      <div className="movie-slider">
        <div className="movie-slider__loading">Loading movies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-slider">
        <div className="movie-slider__error">Error: {error}</div>
      </div>
    );
  }

  if (movies.length === 0 && isSearchActive && !loading) {
    return (
      <div className="movie-slider">
        <div className="movie-slider__empty">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ opacity: 0.3, marginBottom: "1rem" }}
          >
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
            <polyline points="17 2 12 7 7 2" />
          </svg>
          <p>No movies found matching your search</p>
          <span
            style={{ fontSize: "0.875rem", opacity: 0.6, marginTop: "0.5rem" }}
          >
            Try a different search term
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-slider">
      <div
        ref={containerRef}
        className={`movie-slider__container ${
          isScrolling ? "movie-slider__container--scrolling" : ""
        }`}
      >
        {currentIndex > 0 && (
          <button
            className="movie-slider__nav movie-slider__nav--prev"
            onClick={prevSlide}
            aria-label="Previous movies"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <div className="movie-slider__track">
          <motion.div
            className="movie-slider__cards"
            animate={{ x: `-${currentIndex * (100 / cardsPerView)}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {movies.map((movie) => (
              <div key={movie.id} className="movie-card">
                {/* Clickable card link (entire card) */}
                <a
                  href={`/movie/${movie.id}`}
                  className="movie-card__link"
                  aria-label={`View details for ${movie.title}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/movie/${movie.id}`);
                  }}
                >
                  <div className="movie-card__image">
                    <img
                      src={
                        movie.image_1
                          ? getImageUrl("movies", movie.image_1)
                          : movie.image_2
                          ? getImageUrl("movies", movie.image_2)
                          : movie.posterUrl ||
                            `https://picsum.photos/seed/${movie.id}-movie/400/300`
                      }
                      alt={movie.title}
                    />
                  </div>
                  <div className="movie-card__info">
                    <h3 className="movie-card__title">{movie.title}</h3>
                    <div className="movie-card__meta">
                      <span className="movie-card__year">
                        {movie.releaseYear}
                      </span>
                      <span className="movie-card__rating">
                        {movie.rating || "PG"}
                      </span>
                    </div>
                  </div>
                </a>
                {/* Favorite button (clickable independently) */}
                <div className="movie-card__favorite">
                  <FavoriteButton
                    id={movie.id}
                    type="movie"
                    ariaLabel={`Favorite ${movie.title}`}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {currentIndex < maxIndex && (
          <button
            className="movie-slider__nav movie-slider__nav--next"
            onClick={nextSlide}
            aria-label="Next movies"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
