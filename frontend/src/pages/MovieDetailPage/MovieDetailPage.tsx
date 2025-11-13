import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchMovies } from "../../store/slices/moviesSlice";
import { fetchCharacters } from "../../store/slices/charactersSlice";
import { FavoriteButton } from "../../components/FavoriteButton/FavoriteButton";
import { CharacterCard } from "../../components/CharacterCard/CharacterCard";
import { Movie } from "../../types/Movie";
import { getImageUrl } from "../../config/assets";
import "./MovieDetailPage.scss";

export const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { movies, loading: moviesLoading } = useAppSelector(
    (state) => state.movies
  );
  const { characters, loading: charactersLoading } = useAppSelector(
    (state) => state.characters
  );
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (movies.length === 0) {
      dispatch(fetchMovies());
    }
    if (characters.length === 0) {
      dispatch(fetchCharacters());
    }
  }, [dispatch, movies.length, characters.length]);

  useEffect(() => {
    if (id && movies.length > 0) {
      const foundMovie = movies.find((m) => String(m.id) === id);
      setMovie(foundMovie || null);
      setIsInitialized(true);
    }
  }, [id, movies]);

  const movieCharacters = characters.filter((char) =>
    movie?.characters?.includes(String(char.id))
  );

  // Show loading state if data is being fetched OR if we haven't initialized yet
  if (moviesLoading || charactersLoading || !isInitialized) {
    return (
      <div className="movie-detail-page">
        <div className="movie-detail-page__loading">
          Loading movie details...
        </div>
      </div>
    );
  }

  // Only show "not found" after we've initialized and confirmed it doesn't exist
  if (!movie) {
    return (
      <div className="page-container movie-detail-page">
        <div className="movie-detail-page__error">
          <h2>Movie Not Found</h2>
          <p>The movie you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="movie-detail-page__back-button"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="page-container movie-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Content */}
      <div
        className="movie-detail-page__content"
        style={{
          backgroundImage: `url(${
            movie.image_2
              ? getImageUrl("movies", movie.image_2)
              : movie.backdropUrl ||
                movie.posterUrl ||
                `https://picsum.photos/seed/${movie.id}-bg/1920/1080`
          })`,
        }}
      >
        {/* Back Button */}
        <div className="movie-detail-page__back-wrapper">
          <button
            onClick={() => navigate(-1)}
            className="movie-detail-page__back-button"
          >
            ← Back
          </button>
        </div>

        <div className="movie-detail-page__main">
          {/* Movie Poster */}
          <motion.div
            className="movie-detail-page__image-section"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="movie-detail-page__movie-image">
              <img
                src={
                  movie.image_1
                    ? getImageUrl("movies", movie.image_1)
                    : movie.posterUrl ||
                      `https://picsum.photos/seed/${movie.id}/600/600`
                }
                alt={movie.title}
                loading="lazy"
              />
              <div className="movie-detail-page__favorite">
                <FavoriteButton
                  id={movie.id}
                  type="movie"
                  ariaLabel={`Favorite ${movie.title}`}
                />
              </div>
            </div>
          </motion.div>

          {/* Movie Info */}
          <motion.div
            className="movie-detail-page__info-section"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h1 className="movie-detail-page__title">{movie.title}</h1>

            <div className="movie-detail-page__meta">
              <span className="movie-detail-page__year">
                {movie.releaseYear}
              </span>
              {movie.duration && (
                <>
                  <span className="movie-detail-page__separator">•</span>
                  <span className="movie-detail-page__duration">
                    {movie.duration} min
                  </span>
                </>
              )}
              {movie.rating && (
                <>
                  <span className="movie-detail-page__separator">•</span>
                  <span className="movie-detail-page__rating">
                    {movie.rating}
                  </span>
                </>
              )}
            </div>

            {movie.genre &&
              Array.isArray(movie.genre) &&
              movie.genre.length > 0 && (
                <div className="movie-detail-page__genres">
                  {movie.genre.map((genre, index) => (
                    <span key={index} className="movie-detail-page__genre-tag">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

            <div className="movie-detail-page__description">
              <h2>Synopsis</h2>
              <p>
                {movie.long_description ||
                  movie.short_description ||
                  "No description available."}
              </p>
            </div>

            {movie.director && (
              <div className="movie-detail-page__director">
                <h3>Directed by</h3>
                <p>{movie.director}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Characters Section */}
        {movieCharacters.length > 0 && (
          <motion.div
            className="movie-detail-page__characters-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="movie-detail-page__section-title">
              Featured Characters
            </h2>
            <div className="movie-detail-page__characters-grid">
              {movieCharacters.map((character, index: number) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  index={index}
                  onClick={(characterId: string) =>
                    navigate(`/character/${characterId}`)
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
