import { useState } from "react";
import { motion } from "framer-motion";
import { Attraction } from "../../../../types/Attraction";
import { useAppDispatch } from "../../../../hooks/redux";
import { selectAttraction } from "../../../../store/slices/attractionsSlice";
import "./AttractionsList.scss";

interface AttractionCardProps {
  attraction: Attraction;
  index: number;
  onClick: (attraction: Attraction) => void;
  isSelected: boolean;
}

const AttractionCard = ({
  attraction,
  index,
  onClick,
  isSelected,
}: AttractionCardProps) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl =
    imageError || !attraction.image_1
      ? `https://picsum.photos/seed/attraction-${attraction.url_id}/400/300`
      : attraction.image_1;

  return (
    <motion.button
      className={`attraction-card ${
        isSelected ? "attraction-card--selected" : ""
      }`}
      onClick={() => onClick(attraction)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <div className="attraction-card__image">
        <img
          src={imageUrl}
          alt={attraction.name}
          onError={() => setImageError(true)}
        />
      </div>
      <div className="attraction-card__overlay" />
      <div className="attraction-card__active-overlay" />
      <div className="attraction-card__content">
        <h3 className="attraction-card__name">{attraction.name}</h3>
        {attraction.attraction_type && (
          <span className="attraction-card__type">
            {attraction.attraction_type}
          </span>
        )}
      </div>
    </motion.button>
  );
};

interface AttractionsListProps {
  attractions: Attraction[];
  loading: boolean;
  parkName?: string;
  selectedAttraction?: Attraction | null;
}

export const AttractionsList = ({
  attractions,
  loading,
  parkName,
  selectedAttraction,
}: AttractionsListProps) => {
  const dispatch = useAppDispatch();

  const handleAttractionClick = (attraction: Attraction) => {
    dispatch(selectAttraction(attraction));
  };

  if (loading) {
    return (
      <div className="attractions-list attractions-list--loading">
        <div className="attractions-list__loading-text">
          Loading attractions...
        </div>
      </div>
    );
  }

  if (attractions.length === 0) {
    return (
      <div className="attractions-list attractions-list--empty">
        <p>No attractions available</p>
      </div>
    );
  }

  return (
    <div className="attractions-list">
      <div className="attractions-list__header">
        <h2 className="attractions-list__title">{parkName} Attractions</h2>
        <p className="attractions-list__count">
          {attractions.length} attractions
        </p>
      </div>

      <div className="attractions-list__scroll">
        {attractions.map((attraction, index) => {
          return (
            <AttractionCard
              key={attraction.url_id}
              attraction={attraction}
              index={index}
              onClick={handleAttractionClick}
              isSelected={selectedAttraction?.url_id === attraction.url_id}
            />
          );
        })}
      </div>
    </div>
  );
};
