import { useState } from "react";
import { motion } from "framer-motion";
import { video_content } from "../../types/video.types";
import { extractVideoId, getYouTubeThumbnail } from "../../utils/youtube.utils";
import "./YouTubeVideo.scss";

interface YouTubeVideoProps {
  video: video_content;
  onPlay?: (videoId: string) => void;
  className?: string;
}

/**
 * YouTubeVideo Component
 * Displays a YouTube video thumbnail with play button overlay
 * Clicking opens the video in a modal (controlled by parent)
 */
export const YouTubeVideo = ({
  video,
  onPlay,
  className = "",
}: YouTubeVideoProps) => {
  const [thumbnailError, setThumbnailError] = useState(false);
  const videoId = extractVideoId(video.youtube_url);

  if (!videoId) {
    return (
      <div className={`youtube-video youtube-video--error ${className}`}>
        <p>Invalid YouTube URL</p>
      </div>
    );
  }

  // Use provided thumbnail or fetch from YouTube
  const thumbnailUrl =
    video.thumbnail_url ||
    getYouTubeThumbnail(videoId, thumbnailError ? "hq" : "maxres");

  const handleClick = () => {
    if (onPlay) {
      onPlay(videoId);
    }
  };

  const handleThumbnailError = () => {
    // Fallback to lower quality if maxres fails
    if (!thumbnailError) {
      setThumbnailError(true);
    }
  };

  return (
    <motion.div
      className={`youtube-video ${className}`}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="youtube-video__thumbnail">
        <img
          src={thumbnailUrl}
          alt={video.title}
          onError={handleThumbnailError}
          loading="lazy"
        />

        {/* Play button overlay */}
        <div className="youtube-video__play-button" aria-label="Play video">
          <svg viewBox="0 0 68 48" className="youtube-video__play-icon">
            <path
              d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
              fill="#f00"
            />
            <path d="M 45,24 27,14 27,34" fill="#fff" />
          </svg>
        </div>

        {/* Hover overlay */}
        <div className="youtube-video__overlay" />
      </div>
    </motion.div>
  );
};
