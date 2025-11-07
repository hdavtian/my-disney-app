import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Virtual } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchMovies } from "../../store/slices/moviesSlice";
import { Movie } from "../../types/Movie";
import { MovieCard } from "../MovieCard/MovieCard";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/virtual";

interface MovieCarouselProps {
  movies?: Movie[];
  isSearchActive?: boolean;
  loading?: boolean;
}

export const MovieCarousel = ({
  movies: propMovies,
  isSearchActive = false,
  loading: propLoading = false,
}: MovieCarouselProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    movies: storeMovies,
    loading: storeLoading,
    error,
  } = useAppSelector((state) => state.movies);

  useEffect(() => {
    if (!propMovies) {
      dispatch(fetchMovies());
    }
  }, [dispatch, propMovies]);

  const movies = propMovies || storeMovies;
  const loading = propLoading || storeLoading;

  const handleMovieClick = (movieId: string) => {
    navigate(`/movie/${movieId}`);
  };

  if (loading) {
    return (
      <div className="movie-carousel">
        <div className="movie-carousel__loading">Loading movies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-carousel">
        <div className="movie-carousel__error">Error: {error}</div>
      </div>
    );
  }

  if (movies.length === 0 && isSearchActive) {
    return (
      <div className="movie-carousel">
        <div className="movie-carousel__empty">
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
    <div className="movie-carousel">
      <div className="movie-carousel__container">
        <Swiper
          modules={[Navigation, Virtual]}
          navigation={{
            prevEl: ".movie-carousel__nav--prev",
            nextEl: ".movie-carousel__nav--next",
          }}
          virtual
          slidesPerView={6}
          slidesPerGroup={6}
          spaceBetween={16}
          breakpoints={{
            0: {
              slidesPerView: 1,
              slidesPerGroup: 1,
              spaceBetween: 16,
            },
            481: {
              slidesPerView: 2,
              slidesPerGroup: 2,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 4,
              slidesPerGroup: 4,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 6,
              slidesPerGroup: 6,
              spaceBetween: 16,
            },
          }}
          watchSlidesProgress
        >
          {movies.map((movie, index) => (
            <SwiperSlide key={movie.id} virtualIndex={index}>
              <MovieCard
                movie={movie}
                onClick={handleMovieClick}
                index={index}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Controls */}
        <button
          className="movie-carousel__nav movie-carousel__nav--prev"
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

        <button
          className="movie-carousel__nav movie-carousel__nav--next"
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
      </div>
    </div>
  );
};
