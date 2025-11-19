import { Attraction } from "../types/Attraction";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Attractions API Service
 * Handles all HTTP requests for Disney Park Attractions data
 */
export const attractionsApi = {
  /**
   * Get all attractions across all parks
   */
  getAllAttractions: async (): Promise<Attraction[]> => {
    const response = await fetch(`${API_BASE_URL}/api/attractions`);
    if (!response.ok) throw new Error("Failed to fetch attractions");
    return response.json();
  },

  /**
   * Get a specific attraction by URL ID
   */
  getAttractionByUrlId: async (urlId: string): Promise<Attraction> => {
    const response = await fetch(`${API_BASE_URL}/api/attractions/${urlId}`);
    if (!response.ok) throw new Error(`Failed to fetch attraction: ${urlId}`);
    return response.json();
  },

  /**
   * Get all attractions for a specific park
   */
  getAttractionsByPark: async (parkUrlId: string): Promise<Attraction[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/attractions/park/${parkUrlId}`
    );
    if (!response.ok)
      throw new Error(`Failed to fetch attractions for park: ${parkUrlId}`);
    return response.json();
  },

  /**
   * Get only operational attractions for a specific park
   */
  getOperationalAttractionsByPark: async (
    parkUrlId: string
  ): Promise<Attraction[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/attractions/park/${parkUrlId}/operational`
    );
    if (!response.ok)
      throw new Error(
        `Failed to fetch operational attractions for park: ${parkUrlId}`
      );
    return response.json();
  },

  /**
   * Get attractions by type (e.g., "Roller Coaster", "Dark Ride")
   */
  getAttractionsByType: async (
    attractionType: string
  ): Promise<Attraction[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/attractions/type/${encodeURIComponent(
        attractionType
      )}`
    );
    if (!response.ok)
      throw new Error(`Failed to fetch attractions by type: ${attractionType}`);
    return response.json();
  },

  /**
   * Get attractions by thrill level (e.g., "Intense", "Moderate", "Mild")
   */
  getAttractionsByThrillLevel: async (
    thrillLevel: string
  ): Promise<Attraction[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/attractions/thrill/${encodeURIComponent(
        thrillLevel
      )}`
    );
    if (!response.ok)
      throw new Error(
        `Failed to fetch attractions by thrill level: ${thrillLevel}`
      );
    return response.json();
  },

  /**
   * Batch fetch attractions by IDs
   * Optimized for loading multiple attractions in a single request (e.g., favorites)
   *
   * @param ids - Array of attraction IDs to fetch
   * @returns Array of attractions matching the provided IDs
   *
   * @example
   * const attractions = await attractionsApi.getAttractionsByIds([3564, 3438, 3439]);
   * // Returns 3 attractions in a single HTTP request
   */
  getAttractionsByIds: async (ids: number[]): Promise<Attraction[]> => {
    if (ids.length === 0) return [];

    const response = await fetch(
      `${API_BASE_URL}/api/attractions/batch?ids=${ids.join(",")}`
    );
    if (!response.ok) throw new Error("Failed to batch fetch attractions");
    return response.json();
  },
};
