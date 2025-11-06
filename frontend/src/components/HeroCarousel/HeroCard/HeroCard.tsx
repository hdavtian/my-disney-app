import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./HeroCard.scss";

export interface HeroSlide {
  id: string;
  title: string;
  description: string;
  backgroundImage: string;
  buttonText: string;
}

interface HeroCardProps {
  slide: HeroSlide;
}

export const HeroCard = ({ slide }: HeroCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (slide.id) {
      navigate(`/movie/${slide.id}`);
    }
  };

  return (
    <div className="hero-slide">
      {/* Left Column - 60% */}
      <div className="hero-slide__content">
        <motion.h1
          className="hero-slide__title"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {slide.title}
        </motion.h1>

        <motion.p
          className="hero-slide__description"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {slide.description}
        </motion.p>

        <motion.button
          className="hero-slide__button"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
        >
          {slide.buttonText || "View Details"}
        </motion.button>
      </div>

      {/* Right Column - 40% (blank for now) */}
      <div className="hero-slide__media">
        {/* This will be populated later */}
      </div>
    </div>
  );
};
