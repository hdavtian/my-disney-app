import { Character } from "../types";
import { getApiUrl } from "../config/api";

/**
 * Fetch all character IDs for quiz initialization
 */
export const fetchCharacterIds = async (): Promise<string[]> => {
  try {
    const response = await fetch(getApiUrl("/api/characters/ids"));
    if (!response.ok) {
      throw new Error(`Failed to fetch character IDs: ${response.status}`);
    }
    const ids: number[] = await response.json();
    return ids.map((id) => id.toString());
  } catch (error) {
    console.error("Error fetching character IDs:", error);
    throw new Error("Failed to load character data for quiz");
  }
};

/**
 * Fetch random character IDs excluding the specified ID
 */
export const fetchRandomCharacterIds = async (
  excludeId: string,
  count: number = 3
): Promise<string[]> => {
  try {
    const response = await fetch(
      getApiUrl(`/api/characters/random-except/${excludeId}?count=${count}`)
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch random character IDs: ${response.status}`
      );
    }

    const ids: number[] = await response.json();
    return ids.map((id) => id.toString());
  } catch (error) {
    console.error("Error fetching random character IDs:", error);
    throw new Error("Failed to generate quiz question");
  }
};

/**
 * Fetch a specific character by ID
 */
export const fetchCharacterById = async (id: string): Promise<Character> => {
  try {
    const response = await fetch(getApiUrl(`/api/characters/${id}`));
    if (!response.ok) {
      throw new Error(`Failed to fetch character: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching character ${id}:`, error);
    throw new Error(`Failed to load character data`);
  }
};

/**
 * Fetch multiple characters by IDs
 */
export const fetchCharactersByIds = async (
  ids: string[]
): Promise<Character[]> => {
  try {
    const promises = ids.map((id) => fetchCharacterById(id));
    const characters = await Promise.all(promises);
    return characters;
  } catch (error) {
    console.error("Error fetching multiple characters:", error);
    throw new Error("Failed to load character data for quiz");
  }
};
