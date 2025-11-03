import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCharacters } from "../../store/slices/charactersSlice";
import { Character } from "../../types/Character";
import { FavoriteButton } from "../FavoriteButton/FavoriteButton";
import { getImageUrl } from "../../config/assets";

interface CharacterCirclesProps {
  characters?: Character[];
  isSearchActive?: boolean;
  loading?: boolean;
}

export const CharacterCircles = ({
  characters: propCharacters,
  isSearchActive = false,
  loading = false,
}: CharacterCirclesProps) => {
  const navigate = useNavigate();
  console.log("[CharacterCircles] characters:", propCharacters);
  console.log("[CharacterCircles] loading:", loading);
  console.log("[CharacterCircles] isSearchActive:", isSearchActive);
  const dispatch = useAppDispatch();
  const { characters: storeCharacters, error } = useAppSelector(
    (state) => state.characters
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!propCharacters) {
      dispatch(fetchCharacters());
    }
  }, [dispatch, propCharacters]);

  const characters = propCharacters || storeCharacters;

  // Responsive circles per view
  const getCirclesPerView = () => {
    if (window.innerWidth <= 480) return 1; // Mobile
    return 10; // All other breakpoints
  };

  const [circlesPerView] = useState(getCirclesPerView());
  const maxIndex = Math.max(0, characters.length - circlesPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 2, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 2, 0));
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

      // Scroll logic (move 2 at a time)
      if (e.deltaY > 0) {
        // Scroll down = move right
        setCurrentIndex((prev) => Math.min(prev + 2, maxIndex));
      } else {
        // Scroll up = move left
        setCurrentIndex((prev) => Math.max(prev - 2, 0));
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
      <div className="character-circles">
        <div className="character-circles__loading">Loading characters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="character-circles">
        <div className="character-circles__error">Error: {error}</div>
      </div>
    );
  }

  if (characters.length === 0 && isSearchActive && !loading) {
    return (
      <div className="character-circles">
        <div className="character-circles__empty">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ opacity: 0.3, marginBottom: "1rem" }}
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <p>No characters found matching your search</p>
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
    <div className="character-circles">
      <div
        ref={containerRef}
        className={`character-circles__container ${
          isScrolling ? "character-circles__container--scrolling" : ""
        }`}
      >
        {currentIndex > 0 && (
          <button
            className="character-circles__nav character-circles__nav--prev"
            onClick={prevSlide}
            aria-label="Previous characters"
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

        <div className="character-circles__track">
          <motion.div
            className="character-circles__items"
            animate={{ x: `-${currentIndex * (100 / circlesPerView)}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {characters.map((character, index) => (
              <motion.div
                key={character.id}
                className="character-circle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                {/* Clickable character link */}
                <a
                  href={`/character/${character.id}`}
                  className="character-circle__link"
                  aria-label={`View details for ${character.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/character/${character.id}`);
                  }}
                >
                  <div className="character-circle__image">
                    <img
                      src={
                        character.profile_image1
                          ? getImageUrl("characters", character.profile_image1)
                          : character.imageUrl ||
                            `https://picsum.photos/seed/${character.id}-char/300/300`
                      }
                      alt={character.name}
                    />
                    <div className="character-circle__overlay">
                      <span className="character-circle__category">
                        {character.category || "Disney"}
                      </span>
                    </div>
                  </div>
                  <h4 className="character-circle__name">{character.name}</h4>
                </a>
                {/* Favorite button (clickable independently) */}
                <div className="character-circle__favorite">
                  <FavoriteButton
                    id={character.id}
                    type="character"
                    ariaLabel={`Favorite ${character.name}`}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {currentIndex < maxIndex && (
          <button
            className="character-circles__nav character-circles__nav--next"
            onClick={nextSlide}
            aria-label="Next characters"
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
