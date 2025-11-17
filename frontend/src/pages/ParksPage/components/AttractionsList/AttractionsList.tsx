import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Attraction } from "../../../../types/Attraction";
import { getImageUrl } from "../../../../config/assets";
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
  const imageUrl = attraction.image_1
    ? getImageUrl("attractions", attraction.image_1)
    : "/placeholder.png";

  return (
    <div className="attraction-card-wrapper">
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
          <img src={imageUrl} alt={attraction.name} />
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
      {isSelected && (
        <>
          <div className="photo-corner photo-corner--top-left" />
          <div className="photo-corner photo-corner--top-right" />
          <div className="photo-corner photo-corner--bottom-left" />
          <div className="photo-corner photo-corner--bottom-right" />
        </>
      )}
    </div>
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(true);

  const handleAttractionClick = (attraction: Attraction) => {
    dispatch(selectAttraction(attraction));
  };

  // Track scroll position to show/hide top and bottom buttons
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isAtTop = scrollTop < 10;
      const isAtBottom = scrollTop > scrollHeight - clientHeight - 10;

      setShowScrollUp(!isAtTop);
      setShowScrollDown(!isAtBottom);
      setShowScrollTop(scrollTop > 100);
      setShowScrollBottom(scrollTop < scrollHeight - clientHeight - 100);
    };

    scrollElement.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [attractions]);

  const scrollUp = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientHeight * 0.85;
      scrollRef.current.scrollBy({
        top: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollDown = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientHeight * 0.85;
      scrollRef.current.scrollBy({
        top: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
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
        <div className="attractions-list__controls">
          {showScrollUp && (
            <button
              className="attractions-list__control-btn"
              onClick={scrollUp}
              aria-label="Scroll up"
              title="Scroll up"
            >
              ↑
            </button>
          )}
          {showScrollDown && (
            <button
              className="attractions-list__control-btn"
              onClick={scrollDown}
              aria-label="Scroll down"
              title="Scroll down"
            >
              ↓
            </button>
          )}
          {showScrollTop && (
            <button
              className="attractions-list__control-btn attractions-list__control-btn--jump"
              onClick={scrollToTop}
              aria-label="Jump to top"
              title="Jump to top"
            >
              ⇈
            </button>
          )}
          {showScrollBottom && (
            <button
              className="attractions-list__control-btn attractions-list__control-btn--jump"
              onClick={scrollToBottom}
              aria-label="Jump to bottom"
              title="Jump to bottom"
            >
              ⇊
            </button>
          )}
        </div>
      </div>

      <div className="attractions-list__scroll" ref={scrollRef}>
        <div className="attractions-list__scroll-content">
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
    </div>
  );
};
