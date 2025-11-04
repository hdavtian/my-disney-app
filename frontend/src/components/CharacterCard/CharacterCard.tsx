import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Character } from "../../types/Character";
import { FavoriteButton } from "../FavoriteButton/FavoriteButton";
import { getImageUrl } from "../../config/assets";
import "./CharacterCard.scss";

export interface CharacterCardProps {
  character: Character;
  onClick?: (characterId: string) => void;
  index?: number;
  // Quiz-specific props
  showTitle?: boolean;
  enableFavoriting?: boolean;
  disableNavigation?: boolean;
}

export const CharacterCard = ({
  character,
  onClick,
  index = 0,
  showTitle = true,
  enableFavoriting = true,
  disableNavigation = false,
}: CharacterCardProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    // Always call the onClick callback if provided
    onClick?.(character.id);

    // Only navigate if navigation is enabled
    if (!disableNavigation) {
      e.preventDefault();
      navigate(`/character/${character.id}`);
    }
  };

  const imageContent = (
    <div className="character-card__image">
      <img
        src={
          character.profile_image1
            ? getImageUrl("characters", character.profile_image1)
            : character.imageUrl ||
              `https://picsum.photos/seed/${character.id}-character/400/400`
        }
        alt={character.name}
        loading="lazy"
      />
      <div className="character-card__overlay">
        <div className="character-card__category-badge">
          {character.category}
        </div>
      </div>
    </div>
  );

  const titleContent = showTitle && (
    <h3 className="character-card__name">{character.name}</h3>
  );

  return (
    <motion.div
      className="character-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
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

      {enableFavoriting && (
        <div className="character-card__favorite">
          <FavoriteButton
            id={character.id}
            type="character"
            ariaLabel={`Favorite ${character.name}`}
          />
        </div>
      )}
    </motion.div>
  );
};
