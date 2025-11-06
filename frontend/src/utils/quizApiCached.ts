import { Character } from "../types";

/**
 * Cached quiz API - uses Redux cached characters instead of making HTTP requests
 * This improves performance by eliminating ~20+ API calls per quiz session
 */

let cachedCharacters: Character[] = [];

/**
 * Initialize the cached characters data
 * This should be called when characters are loaded into Redux
 */
export const initializeCachedCharacters = (characters: Character[]): void => {
  cachedCharacters = [...characters];
};

/**
 * Get all character IDs from cached data
 */
export const fetchCharacterIds = async (): Promise<string[]> => {
  if (cachedCharacters.length === 0) {
    throw new Error(
      "Cached characters not initialized yet. Please wait for characters to load."
    );
  }
  return cachedCharacters.map((char) => String(char.id));
};

/**
 * Get random character IDs excluding the specified ID from cached data
 */
export const fetchRandomCharacterIds = async (
  excludeId: string,
  count: number = 3
): Promise<string[]> => {
  if (cachedCharacters.length === 0) {
    throw new Error(
      "Cached characters not initialized yet. Please wait for characters to load."
    );
  }
  const availableCharacters = cachedCharacters.filter(
    (char) => String(char.id) !== String(excludeId)
  );
  const shuffled = [...availableCharacters].sort(() => Math.random() - 0.5);
  const selectedIds = shuffled.slice(0, count).map((char) => char.id);
  return selectedIds;
};

/**
 * Get a specific character by ID from cached data
 */
export const fetchCharacterById = async (id: string): Promise<Character> => {
  const character = cachedCharacters.find(
    (char) => String(char.id) === String(id)
  );
  if (character) {
    return character;
  } else {
    throw new Error(`Character with ID ${id} not found in cache`);
  }
};

/**
 * Get multiple characters by IDs from cached data
 */
export const fetchCharactersByIds = async (
  ids: string[]
): Promise<Character[]> => {
  if (cachedCharacters.length === 0) {
    throw new Error(
      "Cached characters not initialized yet. Please wait for characters to load."
    );
  }
  const characters = ids
    .map((id) =>
      cachedCharacters.find((char) => String(char.id) === String(id))
    )
    .filter(Boolean) as Character[];
  return characters;
};

/**
 * Check if cached characters are available and sufficient for quiz
 */
export const hasSufficientCharacters = (): boolean => {
  return cachedCharacters.length >= 20; // Need at least 20 characters for a good quiz
};

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = () => {
  return {
    totalCharacters: cachedCharacters.length,
    charactersWithImages: cachedCharacters.filter(
      (char) => char.profile_image1 || char.imageUrl || char.thumbnailUrl
    ).length,
    charactersWithMovies: cachedCharacters.filter(
      (char) => char.movies && char.movies.length > 0
    ).length,
  };
};
