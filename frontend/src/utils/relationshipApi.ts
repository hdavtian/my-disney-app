/**
 * API service for movie-character relationships.
 * Provides methods to fetch characters in movies and movies featuring characters.
 */

import {
  getApiUrl,
  getMovieCharactersEndpoint,
  getCharacterMoviesEndpoint,
} from "../config/api";
import type { CharacterSummary } from "../types/Character";
import type { MovieSummary } from "../types/Movie";

/**
 * Fetch all characters that appear in a specific movie.
 *
 * @param movieId - The movie ID (number or string)
 * @returns Promise resolving to array of CharacterSummary objects
 * @throws Error if the API request fails
 *
 * @example
 * const characters = await fetchMovieCharacters(1);
 * console.log(`Found ${characters.length} characters`);
 */
export async function fetchMovieCharacters(
  movieId: number | string
): Promise<CharacterSummary[]> {
  try {
    const endpoint = getMovieCharactersEndpoint(movieId);
    const url = getApiUrl(endpoint);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch characters for movie ${movieId}: ${response.status} ${response.statusText}`
      );
    }

    const characters: CharacterSummary[] = await response.json();
    return characters;
  } catch (error) {
    console.error("[Relationship API] Error fetching movie characters:", error);
    throw error;
  }
}

/**
 * Fetch all movies that feature a specific character.
 *
 * @param characterId - The character ID (number or string)
 * @returns Promise resolving to array of MovieSummary objects
 * @throws Error if the API request fails
 *
 * @example
 * const movies = await fetchCharacterMovies(92);
 * console.log(`Character appears in ${movies.length} movies`);
 */
export async function fetchCharacterMovies(
  characterId: number | string
): Promise<MovieSummary[]> {
  try {
    const endpoint = getCharacterMoviesEndpoint(characterId);
    const url = getApiUrl(endpoint);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch movies for character ${characterId}: ${response.status} ${response.statusText}`
      );
    }

    const movies: MovieSummary[] = await response.json();
    return movies;
  } catch (error) {
    console.error("[Relationship API] Error fetching character movies:", error);
    throw error;
  }
}
