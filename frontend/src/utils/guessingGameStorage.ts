/**
 * Local Storage utilities for Guessing Game state persistence
 * Saves game state so users can continue where they left off after navigating away
 */

import type {
  guessing_game_options,
  game_question,
} from "../types/guessingGame";

const STORAGE_KEY = "disney-guessing-game-state";

export interface guessing_game_saved_state {
  is_active: boolean;
  is_complete: boolean;
  options: guessing_game_options | null;
  results: {
    questions: game_question[];
    score: { correct: number; incorrect: number; show_answers_used: number };
  } | null;
  current_question_index?: number; // For mid-game progress
  current_question_state?: {
    // Detailed state for current question
    selected_answer: string;
    has_used_hint: boolean;
    has_shown_answer: boolean;
    is_correct: boolean | null;
  } | null;
  last_updated: number; // Timestamp
}

/**
 * Saves the current game state to localStorage
 */
export const save_guessing_game_state = (
  state: guessing_game_saved_state
): void => {
  try {
    const state_with_timestamp: guessing_game_saved_state = {
      ...state,
      last_updated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state_with_timestamp));
  } catch (error) {
    console.error("Failed to save guessing game state:", error);
  }
};

/**
 * Loads the saved game state from localStorage
 * Returns null if no saved state exists or if it's expired (older than 7 days)
 */
export const load_guessing_game_state =
  (): guessing_game_saved_state | null => {
    try {
      const saved_data = localStorage.getItem(STORAGE_KEY);
      if (!saved_data) return null;

      const parsed_state: guessing_game_saved_state = JSON.parse(saved_data);

      // Check if state is expired (7 days = 604800000 ms)
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      if (
        parsed_state.last_updated &&
        Date.now() - parsed_state.last_updated > SEVEN_DAYS_MS
      ) {
        clear_guessing_game_state();
        return null;
      }

      return parsed_state;
    } catch (error) {
      console.error("Failed to load guessing game state:", error);
      return null;
    }
  };

/**
 * Clears the saved game state from localStorage
 */
export const clear_guessing_game_state = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear guessing game state:", error);
  }
};

/**
 * Checks if there is a saved game state available
 */
export const has_saved_game_state = (): boolean => {
  const saved_state = load_guessing_game_state();
  return (
    saved_state !== null && (saved_state.is_active || saved_state.is_complete)
  );
};
