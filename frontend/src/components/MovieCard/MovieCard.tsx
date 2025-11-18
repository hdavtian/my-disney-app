import { motion } from "framer-motion";
import { useState } from "react";
import { Movie } from "../../types/Movie";
import { FavoriteButton } from "../FavoriteButton/FavoriteButton";
import { getImageUrl } from "../../config/assets";
import "./MovieCard.scss";

export interface MovieCardProps {
  movie: Movie;
  onClick?: (movieId: string) => void;
  index?: number;
}

export const MovieCard = ({ movie, onClick, index = 0 }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Call the optional onClick callback if provided
    if (onClick) {
      e.preventDefault();
      onClick(movie.id);
    }
    // If no onClick handler, let the link navigate normally
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(true); // Still hide skeleton even on error
  };

  return (
    <motion.div
      className="movie-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <a
        href={`/movie/${movie.id}`}
        className="movie-card__link"
        aria-label={`View details for ${movie.title}`}
        onClick={handleClick}
      >
        <div className="movie-card__image">
          {!imageLoaded && (
            <div className="movie-card__skeleton">
              <div className="skeleton skeleton--image"></div>
            </div>
          )}
          <img
            src={
              movie.image_1
                ? getImageUrl("movies", movie.image_1)
                : movie.posterUrl ||
                  `https://picsum.photos/seed/${movie.id}-movie/400/300`
            }
            alt={movie.title}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        </div>
        <div className="movie-card__info">
          {!imageLoaded && (
            <>
              <div className="skeleton skeleton--title"></div>
              <div className="skeleton skeleton--meta"></div>
            </>
          )}
          <div className="movie-card__title-row">
            <FavoriteButton
              id={movie.id}
              type="movie"
              ariaLabel={`Favorite ${movie.title}`}
              size={20}
            />
            <h3
              className="movie-card__title"
              style={{ opacity: imageLoaded ? 1 : 0 }}
            >
              {movie.title}
            </h3>
          </div>
          <div
            className="movie-card__meta"
            style={{ opacity: imageLoaded ? 1 : 0 }}
          >
            <span className="movie-card__year">{movie.releaseYear}</span>
            <span className="movie-card__rating">{movie.rating || "PG"}</span>
          </div>
        </div>
      </a>
    </motion.div>
  );
};
