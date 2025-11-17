import { motion } from "framer-motion";
import { Attraction } from "../../../../types/Attraction";
import { getImageUrl } from "../../../../config/assets";
import "./AttractionDetails.scss";

interface AttractionDetailsProps {
  attraction: Attraction | null;
  loading: boolean;
}

export const AttractionDetails = ({
  attraction,
  loading,
}: AttractionDetailsProps) => {
  if (loading && !attraction) {
    return (
      <div className="attraction-details attraction-details--loading">
        <div className="attraction-details__loading-text">Loading...</div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="attraction-details attraction-details--empty">
        <p>Select an attraction to view details</p>
      </div>
    );
  }

  const bgImage = attraction.image_1
    ? getImageUrl("attractions", attraction.image_1)
    : "/placeholder.png";

  return (
    <motion.div
      key={attraction.url_id}
      className="attraction-details"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Image */}
      <div className="attraction-details__background">
        <img
          src={bgImage}
          alt={attraction.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="attraction-details__overlay" />

      {/* Content */}
      <div className="attraction-details__content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="attraction-details__title">{attraction.name}</h2>

          <div className="attraction-details__meta">
            {attraction.attraction_type && (
              <span className="attraction-details__badge">
                {attraction.attraction_type}
              </span>
            )}
            {attraction.thrill_level && (
              <span
                className={`attraction-details__badge attraction-details__badge--${attraction.thrill_level.toLowerCase()}`}
              >
                {attraction.thrill_level}
              </span>
            )}
            {attraction.is_operational !== undefined && (
              <span
                className={`attraction-details__badge ${
                  attraction.is_operational
                    ? "attraction-details__badge--operational"
                    : "attraction-details__badge--closed"
                }`}
              >
                {attraction.is_operational ? "Operational" : "Closed"}
              </span>
            )}
          </div>

          {attraction.short_description && (
            <p className="attraction-details__description">
              {attraction.short_description}
            </p>
          )}

          <div className="attraction-details__info">
            {attraction.land_area && (
              <div className="attraction-details__info-item">
                <strong>Land:</strong> {attraction.land_area}
              </div>
            )}
            {attraction.duration_minutes && (
              <div className="attraction-details__info-item">
                <strong>Duration:</strong> {attraction.duration_minutes} minutes
              </div>
            )}
            {attraction.height_requirement_inches && (
              <div className="attraction-details__info-item">
                <strong>Height Requirement:</strong>{" "}
                {attraction.height_requirement_inches}" (
                {Math.round(attraction.height_requirement_inches * 2.54)} cm)
              </div>
            )}
            {attraction.opening_date && (
              <div className="attraction-details__info-item">
                <strong>Opened:</strong> {attraction.opening_date[1]}/
                {attraction.opening_date[2]}/{attraction.opening_date[0]}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
