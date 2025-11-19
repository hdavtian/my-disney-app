import { Character } from "../types/Character";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Characters API Service
 * Handles all HTTP requests for Disney Characters data
 */
export const charactersApi = {
  /**
   * Get all characters
   */
  getAllCharacters: async (): Promise<Character[]> => {
    const response = await fetch(`${API_BASE_URL}/api/characters`);
    if (!response.ok) throw new Error("Failed to fetch characters");
    return response.json();
  },

  /**
   * Get a specific character by ID
   */
  getCharacterById: async (id: number): Promise<Character> => {
    const response = await fetch(`${API_BASE_URL}/api/characters/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch character: ${id}`);
    return response.json();
  },

  /**
   * Batch fetch characters by IDs
   * Optimized for loading multiple characters in a single request (e.g., favorites)
   *
   * @param ids - Array of character IDs to fetch
   * @returns Array of characters matching the provided IDs
   *
   * @example
   * const characters = await charactersApi.getCharactersByIds([187, 182, 183]);
   * // Returns 3 characters in a single HTTP request
   */
  getCharactersByIds: async (ids: number[]): Promise<Character[]> => {
    if (ids.length === 0) return [];

    const response = await fetch(
      `${API_BASE_URL}/api/characters/batch?ids=${ids.join(",")}`
    );
    if (!response.ok) throw new Error("Failed to batch fetch characters");
    return response.json();
  },

  /**
   * Get movies featuring a specific character
   */
  getCharacterMovies: async (id: number): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/api/characters/${id}/movies`);
    if (!response.ok)
      throw new Error(`Failed to fetch movies for character: ${id}`);
    return response.json();
  },
};
