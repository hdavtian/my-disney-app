import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCharacters } from "../../store/slices/charactersSlice";
import { fetchMovies } from "../../store/slices/moviesSlice";
import { FavoriteButton } from "../../components/FavoriteButton/FavoriteButton";
import { MovieCard } from "../../components/MovieCard/MovieCard";
import { Character } from "../../types/Character";
import { getImageUrl } from "../../config/assets";
import "./CharacterDetailPage.scss";

export const CharacterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { characters, loading: charactersLoading } = useAppSelector(
    (state) => state.characters
  );
  const { movies, loading: moviesLoading } = useAppSelector(
    (state) => state.movies
  );
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    if (characters.length === 0) {
      dispatch(fetchCharacters());
    }
    if (movies.length === 0) {
      dispatch(fetchMovies());
    }
  }, [dispatch, characters.length, movies.length]);

  useEffect(() => {
    if (id && characters.length > 0) {
      const foundCharacter = characters.find((c) => String(c.id) === id);
      setCharacter(foundCharacter || null);
    }
  }, [id, characters]);

  const characterMovies = movies.filter((movie) =>
    character?.movies?.includes(String(movie.id))
  );

  const getCategoryColor = (category: Character["category"]) => {
    const colors: Record<Character["category"], string> = {
      princess: "var(--princess-pink)",
      villain: "var(--villain-purple)",
      hero: "var(--hero-blue)",
      sidekick: "var(--sidekick-orange)",
      other: "var(--gray-500)",
    };
    return colors[category] || colors.other;
  };

  if (charactersLoading || moviesLoading) {
    return (
      <div className="character-detail-page">
        <div className="character-detail-page__loading">
          Loading character details...
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="character-detail-page">
        <div className="character-detail-page__error">
          <h2>Character Not Found</h2>
          <p>The character you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="character-detail-page__back-button"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="character-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Content */}
      <div
        className="character-detail-page__content"
        style={{
          backgroundImage: `url(${
            character.background_image1
              ? getImageUrl("characters", character.background_image1)
              : character.imageUrl ||
                `https://picsum.photos/seed/${character.id}-bg/1920/1080`
          })`,
        }}
      >
        {/* Back Button */}
        <div className="character-detail-page__back-wrapper">
          <button
            onClick={() => navigate(-1)}
            className="character-detail-page__back-button"
          >
            ← Back
          </button>
        </div>

        <div className="character-detail-page__main">
          {/* Character Image */}
          <motion.div
            className="character-detail-page__image-section"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="character-detail-page__character-image">
              <img
                src={
                  character.profile_image1
                    ? getImageUrl("characters", character.profile_image1)
                    : character.imageUrl ||
                      `https://picsum.photos/seed/${character.id}/600/600`
                }
                alt={character.name}
                loading="lazy"
              />
              <div className="character-detail-page__favorite">
                <FavoriteButton
                  id={character.id}
                  type="character"
                  ariaLabel={`Favorite ${character.name}`}
                />
              </div>
            </div>
          </motion.div>

          {/* Character Info */}
          <motion.div
            className="character-detail-page__info-section"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div
              className="character-detail-page__category"
              style={{
                backgroundColor: getCategoryColor(character.category),
              }}
            >
              {character.category}
            </div>

            <h1 className="character-detail-page__name">{character.name}</h1>

            <div className="character-detail-page__meta">
              {character.franchise && (
                <>
                  <span className="character-detail-page__franchise">
                    {character.franchise}
                  </span>
                  {(character.first_appearance || character.debut) && (
                    <span className="character-detail-page__separator">•</span>
                  )}
                </>
              )}
              {(character.first_appearance || character.debut) && (
                <span className="character-detail-page__debut">
                  {character.first_appearance || character.debut}
                </span>
              )}
            </div>

            <div className="character-detail-page__description">
              <h2>About {character.name}</h2>
              <p>
                {character.long_description ||
                  character.short_description ||
                  "No description available."}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Tags Section */}
        {character.tags && character.tags.length > 0 && (
          <motion.div
            className="character-detail-page__tags-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3>Character Traits</h3>
            <div className="character-detail-page__tags">
              {character.tags.map((tag, index) => (
                <span key={index} className="character-detail-page__tag">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Movies Section */}
        {characterMovies.length > 0 && (
          <motion.div
            className="character-detail-page__movies-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="character-detail-page__section-title">
              Featured In
            </h2>
            <div className="character-detail-page__movies-grid">
              {characterMovies.map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  index={index}
                  onClick={(movieId) => navigate(`/movie/${movieId}`)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
