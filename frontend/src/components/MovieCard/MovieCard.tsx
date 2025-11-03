import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Movie } from "../../types/Movie";
import { FavoriteButton } from "../FavoriteButton/FavoriteButton";
import "./MovieCard.scss";

export interface MovieCardProps {
  movie: Movie;
  onClick?: (movieId: string) => void;
  index?: number;
}

export const MovieCard = ({ movie, onClick, index = 0 }: MovieCardProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Call the optional onClick callback if provided
    onClick?.(movie.id);

    // Navigate to the detail page
    navigate(`/movie/${movie.id}`);
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
          <img
            src={
              movie.image_1
                ? `/movies/${movie.image_1}`
                : movie.posterUrl ||
                  `https://picsum.photos/seed/${movie.id}-movie/400/300`
            }
            alt={movie.title}
            loading="lazy"
          />
        </div>
        <div className="movie-card__info">
          <h3 className="movie-card__title">{movie.title}</h3>
          <div className="movie-card__meta">
            <span className="movie-card__year">{movie.releaseYear}</span>
            <span className="movie-card__rating">{movie.rating || "PG"}</span>
          </div>
        </div>
      </a>
      <div className="movie-card__favorite">
        <FavoriteButton
          id={movie.id}
          type="movie"
          ariaLabel={`Favorite ${movie.title}`}
        />
      </div>
    </motion.div>
  );
};
