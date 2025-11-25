/**
 * API client for The Guessing Game
 * Handles all backend communication for hint-based trivia game
 */

import {
  ids_with_hints_response,
  game_hint,
  movie_response,
  character_response,
  difficulty_level,
} from "../types/guessingGame";

const API_BASE_URL = "http://localhost:8080/api";

/**
 * Get all movie IDs that have hints available
 */
export const fetch_movie_ids_with_hints =
  async (): Promise<ids_with_hints_response> => {
    const response = await fetch(`${API_BASE_URL}/movies/ids-with-hints`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch movie IDs with hints: ${response.statusText}`
      );
    }
    return response.json();
  };

/**
 * Get all character IDs that have hints available
 */
export const fetch_character_ids_with_hints =
  async (): Promise<ids_with_hints_response> => {
    const response = await fetch(`${API_BASE_URL}/characters/ids-with-hints`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch character IDs with hints: ${response.statusText}`
      );
    }
    return response.json();
  };

/**
 * Get random movies excluding specific IDs
 * @param exclude_ids Array of movie IDs to exclude
 * @param count Number of random movies to return
 */
export const fetch_random_movies_except = async (
  exclude_ids: number[],
  count: number = 3
): Promise<movie_response[]> => {
  const exclude_param =
    exclude_ids.length > 0 ? `exclude_ids=${exclude_ids.join(",")}` : "";
  const url = `${API_BASE_URL}/movies/random-except?${exclude_param}&count=${count}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch random movies: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get random characters excluding specific IDs
 * @param exclude_ids Array of character IDs to exclude
 * @param count Number of random characters to return
 */
export const fetch_random_characters_except = async (
  exclude_ids: number[],
  count: number = 3
): Promise<character_response[]> => {
  const exclude_param =
    exclude_ids.length > 0 ? `exclude_ids=${exclude_ids.join(",")}` : "";
  const url = `${API_BASE_URL}/characters/random-except?${exclude_param}&count=${count}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch random characters: ${response.statusText}`
    );
  }
  return response.json();
};

/**
 * Get a random movie hint by difficulty
 * @param movie_url_id The URL ID of the movie
 * @param difficulty Difficulty level (1=easy, 2=medium, 3=hard)
 */
export const fetch_random_movie_hint = async (
  movie_url_id: string,
  difficulty: difficulty_level
): Promise<game_hint> => {
  const url = `${API_BASE_URL}/movie-hints/random?movie_url_id=${movie_url_id}&difficulty=${difficulty}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch movie hint: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get a random character hint by difficulty
 * @param character_url_id The URL ID of the character
 * @param difficulty Difficulty level (1=easy, 2=medium, 3=hard)
 */
export const fetch_random_character_hint = async (
  character_url_id: string,
  difficulty: difficulty_level
): Promise<game_hint> => {
  const url = `${API_BASE_URL}/character-hints/random?character_url_id=${character_url_id}&difficulty=${difficulty}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch character hint: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get a movie by ID
 * @param id The movie ID
 */
export const fetch_movie_by_id = async (
  id: number
): Promise<movie_response> => {
  const response = await fetch(`${API_BASE_URL}/movies/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch movie: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get a character by ID
 * @param id The character ID
 */
export const fetch_character_by_id = async (
  id: number
): Promise<character_response> => {
  const response = await fetch(`${API_BASE_URL}/characters/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch character: ${response.statusText}`);
  }
  return response.json();
};
