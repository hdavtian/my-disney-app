import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Park } from "../../../../types/Park";
import { useAppDispatch } from "../../../../hooks/redux";
import { selectPark } from "../../../../store/slices/parksSlice";
import "./ParkChooser.scss";

interface ParkChooserProps {
  parks: Park[];
  selectedPark: Park | null;
}

export const ParkChooser = ({ parks, selectedPark }: ParkChooserProps) => {
  const dispatch = useAppDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update index when selected park changes
  useEffect(() => {
    if (selectedPark) {
      const index = parks.findIndex((p) => p.url_id === selectedPark.url_id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [selectedPark, parks]);

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : parks.length - 1;
    setCurrentIndex(newIndex);
    dispatch(selectPark(parks[newIndex]));
  };

  const handleNext = () => {
    const newIndex = currentIndex < parks.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    dispatch(selectPark(parks[newIndex]));
  };

  const handleSelectPark = (park: Park) => {
    dispatch(selectPark(park));
    setShowOverlay(false);
  };

  // Handle mouse wheel for park navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (e.deltaY > 0) {
          handleNext();
        } else {
          handlePrevious();
        }
      }, 50);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, [currentIndex, parks.length]);

  if (parks.length === 0) {
    return (
      <div className="park-chooser park-chooser--empty">No parks available</div>
    );
  }

  const currentPark = parks[currentIndex];
  const [imageError, setImageError] = useState(false);
  const backgroundImage =
    imageError || !currentPark?.image_1
      ? `https://picsum.photos/seed/park-${
          currentPark?.url_id || "default"
        }/1920/1080`
      : currentPark.image_1;

  return (
    <div className="park-chooser" ref={containerRef}>
      {/* Background Image with Parallax */}
      <motion.div
        key={`bg-${currentPark?.url_id}`}
        className="park-chooser__background"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <img
          src={backgroundImage}
          alt={currentPark?.name || "Park"}
          onError={() => setImageError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </motion.div>

      {/* Gradient Overlay */}
      <div className="park-chooser__overlay" />

      {/* Park Info */}
      <motion.div
        key={`info-${currentPark?.url_id}`}
        className="park-chooser__info"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <h1 className="park-chooser__name">{currentPark?.name}</h1>
        <p className="park-chooser__location">
          {currentPark?.city && `${currentPark.city}, `}
          {currentPark?.state_region && `${currentPark.state_region}, `}
          {currentPark?.country}
        </p>
        {currentPark?.opening_date && (
          <p className="park-chooser__opened">
            Opened {currentPark.opening_date[0]}
          </p>
        )}
      </motion.div>

      {/* Navigation Controls */}
      <div className="park-chooser__controls">
        <p className="park-chooser__hint">
          scroll down for other parks or{" "}
          <button
            className="park-chooser__choose-link"
            onClick={() => setShowOverlay(true)}
          >
            choose your park
          </button>
        </p>
        <div className="park-chooser__arrows">
          <button
            className="park-chooser__arrow park-chooser__arrow--up"
            onClick={handlePrevious}
            aria-label="Previous park"
          >
            ↑
          </button>
          <button
            className="park-chooser__arrow park-chooser__arrow--down"
            onClick={handleNext}
            aria-label="Next park"
          >
            ↓
          </button>
        </div>
      </div>

      {/* Park Selection Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="park-chooser__selection-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOverlay(false)}
          >
            <motion.div
              className="park-chooser__selection-menu"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="park-chooser__selection-title">
                Choose Your Park
              </h2>
              <div className="park-chooser__selection-list">
                {parks.map((park) => (
                  <button
                    key={park.url_id}
                    className={`park-chooser__selection-item ${
                      park.url_id === currentPark?.url_id
                        ? "park-chooser__selection-item--active"
                        : ""
                    }`}
                    onClick={() => handleSelectPark(park)}
                  >
                    {park.name}
                  </button>
                ))}
              </div>
              <button
                className="park-chooser__selection-close"
                onClick={() => setShowOverlay(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
