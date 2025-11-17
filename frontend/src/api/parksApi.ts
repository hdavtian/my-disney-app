import { Park } from "../types/Park";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Parks API Service
 * Handles all HTTP requests for Disney Parks data
 */
export const parksApi = {
  /**
   * Get all Disney parks
   */
  getAllParks: async (): Promise<Park[]> => {
    const response = await fetch(`${API_BASE_URL}/api/parks`);
    if (!response.ok) throw new Error("Failed to fetch parks");
    return response.json();
  },

  /**
   * Get a specific park by URL ID
   */
  getParkByUrlId: async (urlId: string): Promise<Park> => {
    const response = await fetch(`${API_BASE_URL}/api/parks/${urlId}`);
    if (!response.ok) throw new Error(`Failed to fetch park: ${urlId}`);
    return response.json();
  },

  /**
   * Get parks by country
   */
  getParksByCountry: async (country: string): Promise<Park[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/parks/country/${encodeURIComponent(country)}`
    );
    if (!response.ok)
      throw new Error(`Failed to fetch parks by country: ${country}`);
    return response.json();
  },

  /**
   * Get parks by resort
   */
  getParksByResort: async (resort: string): Promise<Park[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/parks/resort/${encodeURIComponent(resort)}`
    );
    if (!response.ok)
      throw new Error(`Failed to fetch parks by resort: ${resort}`);
    return response.json();
  },

  /**
   * Get only castle parks
   */
  getCastleParks: async (): Promise<Park[]> => {
    const response = await fetch(`${API_BASE_URL}/api/parks/castle-parks`);
    if (!response.ok) throw new Error("Failed to fetch castle parks");
    return response.json();
  },
};
