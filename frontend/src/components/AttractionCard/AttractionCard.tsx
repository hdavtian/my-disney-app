import { motion } from "framer-motion";
import { useState } from "react";
import { Attraction } from "../../types/Attraction";
import { FavoriteButton } from "../FavoriteButton/FavoriteButton";
import { getImageUrl } from "../../config/assets";
import "./AttractionCard.scss";

export interface AttractionCardProps {
  attraction: Attraction;
  onClick?: (attractionId: number) => void;
  index?: number;
}

export const AttractionCard = ({
  attraction,
  onClick,
  index = 0,
}: AttractionCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Call the optional onClick callback if provided
    if (onClick) {
      e.preventDefault();
      onClick(attraction.id);
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
      className="attraction-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <a
        href={`/parks`}
        className="attraction-card__link"
        aria-label={`View details for ${attraction.name}`}
        onClick={handleClick}
      >
        <div className="attraction-card__image">
          {!imageLoaded && (
            <div className="attraction-card__skeleton">
              <div className="skeleton skeleton--image"></div>
            </div>
          )}
          <img
            src={
              attraction.image_1
                ? getImageUrl("attractions", attraction.image_1)
                : `https://picsum.photos/seed/${attraction.id}-attraction/400/300`
            }
            alt={attraction.name}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        </div>
        <div className="attraction-card__info">
          {!imageLoaded && (
            <>
              <div className="skeleton skeleton--title"></div>
              <div className="skeleton skeleton--meta"></div>
            </>
          )}
          <div className="attraction-card__title-row">
            <FavoriteButton
              id={attraction.id}
              type="attraction"
              ariaLabel={`Favorite ${attraction.name}`}
              size={20}
            />
            <h3
              className="attraction-card__title"
              style={{ opacity: imageLoaded ? 1 : 0 }}
            >
              {attraction.name}
            </h3>
          </div>
          <div
            className="attraction-card__meta"
            style={{ opacity: imageLoaded ? 1 : 0 }}
          >
            {attraction.land_area && (
              <span className="attraction-card__land">
                {attraction.land_area}
              </span>
            )}
            {attraction.attraction_type && (
              <span className="attraction-card__type">
                {attraction.attraction_type}
              </span>
            )}
          </div>
        </div>
      </a>
    </motion.div>
  );
};
