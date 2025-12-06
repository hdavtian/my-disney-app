/**
 * YouTube utility functions for video handling
 * Provides helpers for extracting video IDs, generating thumbnails, and embed URLs
 */

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 *
 * @param url - YouTube video URL
 * @returns Video ID or null if invalid
 */
export const extractVideoId = (url: string): string | null => {
  if (!url) return null;

  // Match various YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Get YouTube thumbnail URL for a video
 * Uses high-quality thumbnail (maxresdefault) with fallback to hqdefault
 *
 * @param videoId - YouTube video ID
 * @param quality - Thumbnail quality ('maxres' | 'hq' | 'mq' | 'sd')
 * @returns Thumbnail URL
 */
export const getYouTubeThumbnail = (
  videoId: string,
  quality: "maxres" | "hq" | "mq" | "sd" = "maxres"
): string => {
  const qualityMap = {
    maxres: "maxresdefault",
    hq: "hqdefault",
    mq: "mqdefault",
    sd: "sddefault",
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

/**
 * Generate YouTube embed URL with optimal parameters
 *
 * @param videoId - YouTube video ID
 * @param autoplay - Auto-play video when loaded
 * @returns Embed URL with parameters
 */
export const getYouTubeEmbedUrl = (
  videoId: string,
  autoplay: boolean = false
): string => {
  // Use minimal or no parameters to avoid cross-origin console errors
  // Plain embed URL works just like Angular implementation
  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Get direct YouTube watch URL from video ID
 *
 * @param videoId - YouTube video ID
 * @returns Full YouTube watch URL
 */
export const getYouTubeWatchUrl = (videoId: string): string => {
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * Fetch video metadata from YouTube Data API (requires API key)
 *
 * @param videoId - YouTube video ID
 * @param apiKey - YouTube Data API key
 * @returns Video metadata (title, description, thumbnail, duration)
 */
export const fetchYouTubeMetadata = async (
  videoId: string,
  apiKey: string
): Promise<{
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
} | null> => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("YouTube API error:", response.status);
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.error("Video not found:", videoId);
      return null;
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;

    return {
      title: snippet.title,
      description: snippet.description,
      thumbnail: snippet.thumbnails.maxres?.url || snippet.thumbnails.high.url,
      duration: contentDetails.duration,
    };
  } catch (error) {
    console.error("Error fetching YouTube metadata:", error);
    return null;
  }
};

/**
 * Validate if a string is a valid YouTube URL
 *
 * @param url - URL to validate
 * @returns true if valid YouTube URL
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  return extractVideoId(url) !== null;
};
