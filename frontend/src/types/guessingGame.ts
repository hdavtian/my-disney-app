/**
 * Types for The Guessing Game
 * A hint-based trivia game for Disney movies and characters
 */

/**
 * Game category - determines what type of content to guess
 */
export type game_category = "movies" | "characters" | "mixed";

/**
 * Difficulty level - affects hint complexity
 * 1 = Easy, 2 = Medium, 3 = Hard
 */
export type difficulty_level = 1 | 2 | 3;

/**
 * Number of questions in a game session
 */
export type question_count = 10 | 20 | 50;

/**
 * Game options selected on the start screen
 */
export interface guessing_game_options {
  category: game_category;
  difficulty: difficulty_level;
  question_count: question_count;
}

/**
 * Hint from backend (character or movie)
 */
export interface game_hint {
  id: number;
  content: string;
  difficulty: difficulty_level;
  hint_type: string;
  character_url_id?: string;
  movie_url_id?: string;
}

/**
 * Answer choice for a question
 */
export interface answer_choice {
  id: number;
  url_id: string;
  name: string;
  title?: string; // For movies
  profile_image_1?: string; // For characters
  image_1?: string; // For movies
  is_correct: boolean;
  is_eliminated: boolean; // True if eliminated by hint button
}

/**
 * A single question in the game
 */
export interface game_question {
  question_number: number;
  category: "movie" | "character";
  correct_answer: answer_choice;
  wrong_answers: answer_choice[];
  all_answers: answer_choice[]; // Shuffled array of correct + wrong
  revealed_hints: game_hint[];
  available_hints: game_hint[];
  hint_button_used: boolean;
  show_answer_used: boolean;
  is_answered: boolean;
  selected_answer?: answer_choice;
  is_correct?: boolean;
}

/**
 * Game session state
 */
export interface guessing_game_state {
  is_active: boolean;
  is_starting: boolean;
  is_complete: boolean;
  options: guessing_game_options | null;
  questions: game_question[];
  current_question_index: number;
  score: {
    correct: number;
    incorrect: number;
    hints_revealed: number;
    hint_buttons_used: number;
    show_answers_used: number;
  };
  available_movie_ids: number[];
  available_character_ids: number[];
}

/**
 * API response for IDs with hints
 */
export type ids_with_hints_response = number[];

/**
 * API response for random movies/characters
 */
export interface movie_response {
  id: number;
  url_id: string;
  title: string;
  short_description: string;
  creation_year: number;
  movie_rating: string;
  image_1: string;
}

export interface character_response {
  id: number;
  url_id: string;
  name: string;
  short_description: string;
  category: string;
  character_type: string;
  species: string;
  profile_image_1: string;
}
