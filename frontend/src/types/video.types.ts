/**
 * Video content data structure for YouTube videos
 * This interface defines the shape of video data used throughout the application
 *
 * Future: This will match the backend VideoContent entity when we add database support
 */
export interface video_content {
  /**
   * Full YouTube video URL (e.g., "https://www.youtube.com/watch?v=VIDEO_ID")
   */
  youtube_url: string;

  /**
   * Video title displayed in the slider
   */
  title: string;

  /**
   * Video description displayed alongside the video
   */
  description: string;

  /**
   * Optional: YouTube thumbnail URL
   * If not provided, will be fetched via YouTube Data API or use default
   */
  thumbnail_url?: string;
}
