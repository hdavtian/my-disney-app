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
import { getApiUrl } from "../config/api";

/**
 * Get all movie IDs that have hints available
 */
export const fetch_movie_ids_with_hints =
  async (): Promise<ids_with_hints_response> => {
    const response = await fetch(getApiUrl("/api/movies/ids-with-hints"));
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
    const response = await fetch(getApiUrl("/api/characters/ids-with-hints"));
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
  const url = getApiUrl(
    `/api/movies/random-except?${exclude_param}&count=${count}`
  );

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
  const url = getApiUrl(
    `/api/characters/random-except?${exclude_param}&count=${count}`
  );

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
  const url = getApiUrl(
    `/api/movie-hints/random?movie_url_id=${movie_url_id}&difficulty=${difficulty}`
  );

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch movie hint: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get all hints for a movie
 * @param movie_url_id The URL ID of the movie
 */
export const fetch_all_movie_hints = async (
  movie_url_id: string
): Promise<game_hint[]> => {
  const url = getApiUrl(`/api/movie-hints/${movie_url_id}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch movie hints: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get hints for multiple movies in a single batch request
 * @param movie_url_ids Array of movie URL IDs
 * @returns Map of movie URL IDs to their hints
 */
export const fetch_batch_movie_hints = async (
  movie_url_ids: string[]
): Promise<Record<string, game_hint[]>> => {
  const url_ids_param = movie_url_ids.join(",");
  const url = getApiUrl(`/api/movie-hints/batch?urlIds=${url_ids_param}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch batch movie hints: ${response.statusText}`
    );
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
  const url = getApiUrl(
    `/api/character-hints/random?character_url_id=${character_url_id}&difficulty=${difficulty}`
  );

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch character hint: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get all hints for a character
 * @param character_url_id The URL ID of the character
 */
export const fetch_all_character_hints = async (
  character_url_id: string
): Promise<game_hint[]> => {
  const url = getApiUrl(`/api/character-hints/${character_url_id}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch character hints: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Get hints for multiple characters in a single batch request
 * @param character_url_ids Array of character URL IDs
 * @returns Map of character URL IDs to their hints
 */
export const fetch_batch_character_hints = async (
  character_url_ids: string[]
): Promise<Record<string, game_hint[]>> => {
  const url_ids_param = character_url_ids.join(",");
  const url = getApiUrl(`/api/character-hints/batch?urlIds=${url_ids_param}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch batch character hints: ${response.statusText}`
    );
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
  const response = await fetch(getApiUrl(`/api/movies/${id}`));
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
  const response = await fetch(getApiUrl(`/api/characters/${id}`));
  if (!response.ok) {
    throw new Error(`Failed to fetch character: ${response.statusText}`);
  }
  return response.json();
};
