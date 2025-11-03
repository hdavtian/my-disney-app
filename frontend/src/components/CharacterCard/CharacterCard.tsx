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
}

export const CharacterCard = ({
  character,
  onClick,
  index = 0,
}: CharacterCardProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Call the optional onClick callback if provided
    onClick?.(character.id);

    // Navigate to the detail page
    navigate(`/character/${character.id}`);
  };

  return (
    <motion.div
      className="character-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <a
        href={`/character/${character.id}`}
        className="character-card__link"
        aria-label={`View details for ${character.name}`}
        onClick={handleClick}
      >
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
        <h3 className="character-card__name">{character.name}</h3>
      </a>
      <div className="character-card__favorite">
        <FavoriteButton
          id={character.id}
          type="character"
          ariaLabel={`Favorite ${character.name}`}
        />
      </div>
    </motion.div>
  );
};
