import { motion } from "framer-motion";
import { useState } from "react";
import { Character } from "../../types/Character";
import { FavoriteButton } from "../FavoriteButton/FavoriteButton";
import { getImageUrl } from "../../config/assets";
import "./CharacterCard.scss";

export interface CharacterCardProps {
  character: Character;
  onClick?: (characterId: string) => void;
  index?: number;
  skipAnimation?: boolean;
  // Quiz-specific props
  showTitle?: boolean;
  enableFavoriting?: boolean;
  disableNavigation?: boolean;
  size?: "normal" | "large";
}

export const CharacterCard = ({
  character,
  onClick,
  index = 0,
  skipAnimation = false,
  showTitle = true,
  enableFavoriting = true,
  disableNavigation = false,
  size = "normal",
}: CharacterCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Always call the onClick callback if provided
    onClick?.(character.id);

    // Navigation is handled by the parent page, not here
    // Only prevent default if navigation is disabled
    if (disableNavigation) {
      e.preventDefault();
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(true); // Still hide skeleton even on error
  };

  const imageContent = (
    <div className="character-card__image">
      {!imageLoaded && (
        <div className="character-card__skeleton">
          <div className="skeleton skeleton--image"></div>
        </div>
      )}
      <img
        src={
          character.profile_image1
            ? getImageUrl("characters", character.profile_image1)
            : character.imageUrl ||
              `https://picsum.photos/seed/${character.id}-character/400/400`
        }
        alt={character.name}
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ opacity: imageLoaded ? 1 : 0 }}
      />
      <div className="character-card__overlay">
        <div className="character-card__category-badge">
          {character.category}
        </div>
      </div>
    </div>
  );

  const titleContent = showTitle && (
    <>
      {!imageLoaded && <div className="skeleton skeleton--title"></div>}
      <div className="character-card__title-row">
        {enableFavoriting && (
          <FavoriteButton
            id={character.id}
            type="character"
            ariaLabel={`Favorite ${character.name}`}
            size={20}
          />
        )}
        <h3
          className="character-card__name"
          style={{ opacity: imageLoaded ? 1 : 0 }}
        >
          {character.name}
        </h3>
      </div>
    </>
  );

  return (
    <motion.div
      className={`character-card ${
        size === "large" ? "character-card--large" : ""
      }`}
      initial={skipAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        skipAnimation ? { duration: 0 } : { duration: 0.3, delay: index * 0.05 }
      }
    >
      {disableNavigation ? (
        <div
          className="character-card__content"
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick(e as any);
            }
          }}
          aria-label={showTitle ? `${character.name}` : "Character for quiz"}
        >
          {imageContent}
          {titleContent}
        </div>
      ) : (
        <a
          href={`/character/${character.id}`}
          className="character-card__link"
          aria-label={`View details for ${character.name}`}
          onClick={handleClick}
        >
          {imageContent}
          {titleContent}
        </a>
      )}
    </motion.div>
  );
};
