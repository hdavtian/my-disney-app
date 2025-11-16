import { useEffect, useState } from "react";
import { MovieSummary, Movie } from "../../types/Movie";
import { fetchCharacterMovies } from "../../utils/relationshipApi";
import { MovieCard } from "../MovieCard/MovieCard";
import "./RelatedMovies.scss";

export interface RelatedMoviesProps {
  characterId: number | string;
  displayStyle?: "grid" | "carousel";
}

export const RelatedMovies = ({
  characterId,
  displayStyle = "grid",
}: RelatedMoviesProps) => {
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert MovieSummary to Movie type for MovieCard
  const toMovie = (summary: MovieSummary): Movie => ({
    id: String(summary.id),
    title: summary.title,
    posterUrl: "",
    image_1: summary.image_1,
    short_description: summary.short_description,
    releaseYear: summary.creation_year || 0,
    rating: summary.movie_rating,
  });

  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCharacterMovies(characterId);

        if (isMounted) {
          setMovies(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load movies"
          );
          console.error("[RelatedMovies] Error:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMovies();

    return () => {
      isMounted = false;
    };
  }, [characterId]);

  if (loading) {
    return (
      <div className="related-movies">
        <h2 className="related-movies__title">
          Movies Featuring This Character
        </h2>
        <div className={`related-movies__${displayStyle}`}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="related-movies__skeleton">
              <div className="skeleton skeleton--image"></div>
              <div className="skeleton skeleton--text"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="related-movies">
        <h2 className="related-movies__title">
          Movies Featuring This Character
        </h2>
        <div className="related-movies__error">
          <p>Unable to load movies at this time.</p>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="related-movies">
        <h2 className="related-movies__title">
          Movies Featuring This Character
        </h2>
        <div className="related-movies__empty">
          <p>No movie information available for this character yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="related-movies">
      <h2 className="related-movies__title">
        Movies Featuring This Character
        <span className="related-movies__count">({movies.length})</span>
      </h2>
      <div className={`related-movies__${displayStyle}`}>
        {movies.map((movieSummary, index) => (
          <MovieCard
            key={movieSummary.id}
            movie={toMovie(movieSummary)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};
