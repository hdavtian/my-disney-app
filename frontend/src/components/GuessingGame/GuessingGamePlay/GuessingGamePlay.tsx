import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  guessing_game_options,
  game_question,
  game_hint,
  answer_choice,
} from "../../../types/guessingGame";
import {
  fetch_random_movies_except,
  fetch_random_characters_except,
  fetch_all_movie_hints,
  fetch_all_character_hints,
} from "../../../api/guessingGameApi";
import "./GuessingGamePlay.scss";

export interface GuessingGamePlayProps {
  options: guessing_game_options;
  on_game_complete: (stats: game_statistics) => void;
  on_quit: () => void;
}

interface game_statistics {
  questions: game_question[];
  score: {
    correct: number;
    incorrect: number;
    show_answers_used: number;
  };
}

export const GuessingGamePlay = ({
  options,
  on_game_complete,
  on_quit,
}: GuessingGamePlayProps) => {
  // Game state
  const [current_question, set_current_question] =
    useState<game_question | null>(null);
  const [all_questions, set_all_questions] = useState<game_question[]>([]);
  const [question_number, set_question_number] = useState(1);
  const [score, set_score] = useState({ correct: 0, incorrect: 0 });
  const [total_show_answers_used, set_total_show_answers_used] = useState(0);

  // Question state
  const [revealed_hints, set_revealed_hints] = useState<game_hint[]>([]);
  const [selected_answer, set_selected_answer] = useState<answer_choice | null>(
    null
  );
  const [is_answered, set_is_answered] = useState(false);
  const [loading, set_loading] = useState(true);
  const [show_answer_used, set_show_answer_used] = useState(false);

  // Difficulty mapping: 1 = 4 answers, 2 = 6 answers, 3 = 8 answers
  const get_answer_count = (difficulty: number): number => {
    const counts: Record<number, number> = { 1: 4, 2: 6, 3: 8 };
    return counts[difficulty] || 4;
  };

  // Difficulty mapping: 1 = 3 hints, 2 = 2 hints, 3 = 1 hint
  const get_initial_hints_count = (difficulty: number): number => {
    const counts: Record<number, number> = { 1: 3, 2: 2, 3: 1 };
    return counts[difficulty] || 2;
  };

  /**
   * Load a new question
   */
  const load_new_question = async () => {
    try {
      set_loading(true);
      set_revealed_hints([]);
      set_selected_answer(null);
      set_is_answered(false);
      set_show_answer_used(false);

      // Determine category for this question
      const category =
        options.category === "mixed"
          ? Math.random() > 0.5
            ? "movies"
            : "characters"
          : options.category;

      if (category === "movies") {
        await load_movie_question();
      } else {
        await load_character_question();
      }
    } catch (error) {
      console.error("Error loading question:", error);
    } finally {
      set_loading(false);
    }
  };

  /**
   * Load a movie question
   */
  const load_movie_question = async () => {
    // Fetch random movie for correct answer
    const correct_movies = await fetch_random_movies_except([], 1);
    if (!correct_movies || correct_movies.length === 0) {
      throw new Error("Failed to fetch correct movie");
    }

    const correct_movie = correct_movies[0];
    const answer_count = get_answer_count(options.difficulty);
    const wrong_count = answer_count - 1;

    // Fetch wrong answers
    const wrong_movies = await fetch_random_movies_except(
      [correct_movie.id],
      wrong_count
    );

    // Convert to answer choices
    const correct_answer: answer_choice = {
      id: correct_movie.id,
      url_id: correct_movie.url_id,
      name: correct_movie.title,
      title: correct_movie.title,
      image_1: correct_movie.image_1,
      is_correct: true,
      is_eliminated: false,
    };

    const wrong_answers: answer_choice[] = wrong_movies.map((movie) => ({
      id: movie.id,
      url_id: movie.url_id,
      name: movie.title,
      title: movie.title,
      image_1: movie.image_1,
      is_correct: false,
      is_eliminated: false,
    }));

    // Shuffle all answers
    const all_answers = [...wrong_answers, correct_answer].sort(
      () => Math.random() - 0.5
    );

    // Fetch hints for correct movie
    const all_hints: game_hint[] = await fetch_all_movie_hints(
      correct_movie.url_id
    );

    // Reveal initial hints based on difficulty
    const initial_count = get_initial_hints_count(options.difficulty);
    const initial_hints = all_hints.slice(0, initial_count);

    set_revealed_hints(initial_hints);

    const question: game_question = {
      question_number,
      category: "movie",
      correct_answer,
      wrong_answers,
      all_answers,
      revealed_hints: initial_hints,
      hint_button_used: false,
      show_answer_used: false,
      is_answered: false,
    };

    set_current_question(question);
  };

  /**
   * Load a character question
   */
  const load_character_question = async () => {
    // Fetch random character for correct answer
    const correct_characters = await fetch_random_characters_except([], 1);
    if (!correct_characters || correct_characters.length === 0) {
      throw new Error("Failed to fetch correct character");
    }

    const correct_character = correct_characters[0];
    const answer_count = get_answer_count(options.difficulty);
    const wrong_count = answer_count - 1;

    // Fetch wrong answers
    const wrong_characters = await fetch_random_characters_except(
      [correct_character.id],
      wrong_count
    );

    // Convert to answer choices
    const correct_answer: answer_choice = {
      id: correct_character.id,
      url_id: correct_character.url_id,
      name: correct_character.name,
      profile_image_1: correct_character.profile_image_1,
      is_correct: true,
      is_eliminated: false,
    };

    const wrong_answers: answer_choice[] = wrong_characters.map(
      (character) => ({
        id: character.id,
        url_id: character.url_id,
        name: character.name,
        profile_image_1: character.profile_image_1,
        is_correct: false,
        is_eliminated: false,
      })
    );

    // Shuffle all answers
    const all_answers = [...wrong_answers, correct_answer].sort(
      () => Math.random() - 0.5
    );

    // Fetch hints for correct character
    const all_hints: game_hint[] = await fetch_all_character_hints(
      correct_character.url_id
    );

    // Reveal initial hints based on difficulty
    const initial_count = get_initial_hints_count(options.difficulty);
    const initial_hints = all_hints.slice(0, initial_count);

    set_revealed_hints(initial_hints);

    const question: game_question = {
      question_number,
      category: "character",
      correct_answer,
      wrong_answers,
      all_answers,
      revealed_hints: initial_hints,
      hint_button_used: false,
      show_answer_used: false,
      is_answered: false,
    };

    set_current_question(question);
  };

  /**
   * Use hint button - highlights a random wrong answer
   */
  const use_hint_button = () => {
    if (is_answered || !current_question) return;

    // Find all wrong answers that aren't eliminated
    const wrong_answers = current_question.all_answers.filter(
      (a) => !a.is_correct && !a.is_eliminated
    );

    if (wrong_answers.length === 0) return;

    // Randomly select one wrong answer to eliminate
    const random_index = Math.floor(Math.random() * wrong_answers.length);
    const to_eliminate = wrong_answers[random_index];

    const updated_answers = current_question.all_answers.map((answer) => {
      if (answer.id === to_eliminate.id) {
        return { ...answer, is_eliminated: true };
      }
      return answer;
    });

    set_current_question({
      ...current_question,
      all_answers: updated_answers,
    });
  };

  /**
   * Use show answer button - reveals correct answer
   */
  const use_show_answer = () => {
    if (show_answer_used || is_answered || !current_question) return;

    const correct = current_question.correct_answer;
    set_selected_answer(correct);
    set_is_answered(true);
    set_show_answer_used(true);
    set_total_show_answers_used((prev) => prev + 1);
    set_score((prev) => ({ ...prev, correct: prev.correct + 1 }));
  };

  /**
   * Handle answer selection
   */
  const handle_answer_select = (answer: answer_choice) => {
    if (is_answered || answer.is_eliminated) return;

    set_selected_answer(answer);
  };

  /**
   * Submit answer
   */
  const submit_answer = () => {
    if (!selected_answer || is_answered || !current_question) return;

    const correct = selected_answer.is_correct;
    set_is_answered(true);

    if (correct) {
      set_score((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      set_score((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  /**
   * Move to next question
   */
  const next_question = () => {
    // Save the current question to history
    if (current_question) {
      set_all_questions((prev) => [...prev, current_question]);
    }

    if (question_number >= options.question_count) {
      // Game complete - pass all questions and score
      const final_questions = current_question
        ? [...all_questions, current_question]
        : all_questions;

      const stats: game_statistics = {
        questions: final_questions,
        score: {
          correct: score.correct,
          incorrect: score.incorrect,
          show_answers_used: total_show_answers_used,
        },
      };
      on_game_complete(stats);
    } else {
      set_question_number((prev) => prev + 1);
      load_new_question();
    }
  };

  // Load first question on mount
  useEffect(() => {
    load_new_question();
  }, []);

  if (loading || !current_question) {
    return (
      <div className="guessing-game-play guessing-game-play--loading">
        <div className="loading-spinner">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="guessing-game-play">
      {/* Score Row */}
      <div className="guessing-game-play__score-row">
        <div className="score-item">
          <span className="score-label">Question:</span>
          <span className="score-value">
            {question_number} / {options.question_count}
          </span>
        </div>
        <div className="score-item">
          <span className="score-label">Score:</span>
          <span className="score-value">
            {score.correct} / {question_number - 1}
          </span>
        </div>
        <button className="quit-button" onClick={on_quit}>
          Quit Game
        </button>
      </div>

      {/* Main Content Area */}
      <div className="guessing-game-play__content">
        {/* Hints Column */}
        <div className="guessing-game-play__hints-column">
          <h2 className="hints-title">
            Hints (
            {current_question.category === "movie" ? "Movie" : "Character"})
          </h2>

          <AnimatePresence>
            {revealed_hints.map((hint, index) => (
              <motion.div
                key={`hint-${index}`}
                className="hint-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <span className="hint-type-badge">{hint.hint_type}</span>
                <p className="hint-content">{hint.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Answers Column */}
        <div className="guessing-game-play__answers-column">
          <h2 className="answers-title">Select Your Answer</h2>

          <div
            className={`answer-choices ${
              current_question.all_answers.length >= 6
                ? "answer-choices--two-columns"
                : ""
            }`}
          >
            {current_question.all_answers.map((answer, index) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D...
              return (
                <motion.button
                  key={answer.id}
                  className={`answer-choice ${
                    selected_answer?.id === answer.id
                      ? "answer-choice--selected"
                      : ""
                  } ${
                    answer.is_eliminated ? "answer-choice--eliminated" : ""
                  } ${
                    is_answered && answer.is_correct
                      ? "answer-choice--correct"
                      : ""
                  } ${
                    is_answered &&
                    selected_answer?.id === answer.id &&
                    !answer.is_correct
                      ? "answer-choice--incorrect"
                      : ""
                  }`}
                  onClick={() => handle_answer_select(answer)}
                  disabled={is_answered || answer.is_eliminated}
                  whileHover={
                    !is_answered && !answer.is_eliminated ? { scale: 1.02 } : {}
                  }
                  whileTap={
                    !is_answered && !answer.is_eliminated ? { scale: 0.98 } : {}
                  }
                >
                  {answer.is_eliminated && (
                    <span className="eliminated-badge">❌</span>
                  )}
                  <span className="answer-letter">{letter})</span> {answer.name}
                </motion.button>
              );
            })}
          </div>

          {/* Game Action Buttons */}
          {!is_answered && (
            <div className="game-actions">
              {options.difficulty !== 3 && (
                <>
                  <button
                    className="hint-action-button hint-action-button--eliminate"
                    onClick={use_hint_button}
                    disabled={is_answered}
                  >
                    💡 Hint
                  </button>

                  <button
                    className="hint-action-button hint-action-button--show"
                    onClick={use_show_answer}
                    disabled={show_answer_used || is_answered}
                  >
                    👁️ Show Answer {show_answer_used ? "(Used)" : ""}
                  </button>
                </>
              )}

              <button
                className="submit-answer-button"
                onClick={submit_answer}
                disabled={!selected_answer}
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* Next Question Button */}
          {is_answered && (
            <div className="game-actions">
              <button className="next-question-button" onClick={next_question}>
                {question_number >= options.question_count
                  ? "View Results"
                  : "Next Question →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
