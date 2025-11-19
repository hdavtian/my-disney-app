import { Movie } from "../types/Movie";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Movies API Service
 * Handles all HTTP requests for Disney Movies data
 */
export const moviesApi = {
  /**
   * Get all movies
   */
  getAllMovies: async (): Promise<Movie[]> => {
    const response = await fetch(`${API_BASE_URL}/api/movies`);
    if (!response.ok) throw new Error("Failed to fetch movies");
    return response.json();
  },

  /**
   * Get a specific movie by ID
   */
  getMovieById: async (id: number): Promise<Movie> => {
    const response = await fetch(`${API_BASE_URL}/api/movies/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch movie: ${id}`);
    return response.json();
  },

  /**
   * Batch fetch movies by IDs
   * Optimized for loading multiple movies in a single request (e.g., favorites)
   *
   * @param ids - Array of movie IDs to fetch
   * @returns Array of movies matching the provided IDs
   *
   * @example
   * const movies = await moviesApi.getMoviesByIds([880, 881, 882]);
   * // Returns 3 movies in a single HTTP request
   */
  getMoviesByIds: async (ids: number[]): Promise<Movie[]> => {
    if (ids.length === 0) return [];

    const response = await fetch(
      `${API_BASE_URL}/api/movies/batch?ids=${ids.join(",")}`
    );
    if (!response.ok) throw new Error("Failed to batch fetch movies");
    return response.json();
  },

  /**
   * Get characters in a specific movie
   */
  getMovieCharacters: async (id: number): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/api/movies/${id}/characters`);
    if (!response.ok)
      throw new Error(`Failed to fetch characters for movie: ${id}`);
    return response.json();
  },
};
