import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { video_content } from "../../types/video.types";
import { YouTubeVideo } from "../YouTubeVideo";
import { VideoModal } from "../VideoModal";
import "./VideoSlider.scss";

interface VideoSliderProps {
  videos: video_content[];
  className?: string;
}

/**
 * VideoSlider Component
 * Displays videos in a multi-column grid with 2 videos per row
 * Each video card has a stacked layout: video thumbnail on top, title/description below
 * Navigation: arrows and pagination dots
 */
export const VideoSlider = ({ videos, className = "" }: VideoSliderProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>("");
  const [direction, setDirection] = useState(0);

  const VIDEOS_PER_PAGE = 2; // Display 2 videos per page

  if (!videos || videos.length === 0) {
    return (
      <div className={`video-slider video-slider--empty ${className}`}>
        <p>No videos available</p>
      </div>
    );
  }

  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const startIndex = currentPage * VIDEOS_PER_PAGE;
  const currentVideos = videos.slice(startIndex, startIndex + VIDEOS_PER_PAGE);

  const handleNext = () => {
    setDirection(1);
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentPage ? 1 : -1);
    setCurrentPage(index);
  };

  const handleVideoPlay = (videoId: string, title: string) => {
    setSelectedVideoId(videoId);
    setSelectedVideoTitle(title);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideoId(null);
    setSelectedVideoTitle("");
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrev();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  return (
    <div
      className={`video-slider ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Video slider"
    >
      <div className="video-slider__container">
        {/* Navigation arrows */}
        {videos.length > 1 && (
          <>
            <button
              className="video-slider__arrow video-slider__arrow--prev"
              onClick={handlePrev}
              aria-label="Previous video"
              title="Previous (←)"
            >
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path
                  fill="currentColor"
                  d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
                />
              </svg>
            </button>
            <button
              className="video-slider__arrow video-slider__arrow--next"
              onClick={handleNext}
              aria-label="Next video"
              title="Next (→)"
            >
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path
                  fill="currentColor"
                  d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
                />
              </svg>
            </button>
          </>
        )}

        {/* Slider content */}
        <div className="video-slider__content">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentPage}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="video-slider__slide"
            >
              <div className="video-slider__grid">
                {currentVideos.map((video, index) => (
                  <div key={startIndex + index} className="video-slider__card">
                    <div className="video-slider__video-wrapper">
                      <YouTubeVideo
                        video={video}
                        onPlay={(videoId) =>
                          handleVideoPlay(videoId, video.title)
                        }
                      />
                    </div>
                    <div className="video-slider__info">
                      <h3 className="video-slider__title">{video.title}</h3>
                      <p className="video-slider__description">
                        {video.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination dots */}
        {totalPages > 1 && (
          <div className="video-slider__pagination">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                className={`video-slider__dot ${
                  index === currentPage ? "video-slider__dot--active" : ""
                }`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to page ${index + 1}`}
                aria-current={index === currentPage ? "true" : "false"}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video modal */}
      {selectedVideoId && (
        <VideoModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          videoId={selectedVideoId}
          title={selectedVideoTitle}
        />
      )}
    </div>
  );
};
