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
  fetch_batch_movie_hints,
  fetch_batch_character_hints,
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
  const [pre_loaded_questions, set_pre_loaded_questions] = useState<
    game_question[]
  >([]);
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
   * Pre-load all questions at game start for instant transitions
   * Reduces API calls from 30 to 2-3 total
   */
  const pre_load_all_questions = async () => {
    try {
      set_loading(true);

      const questions: game_question[] = [];
      const movie_url_ids: string[] = [];
      const character_url_ids: string[] = [];

      // Determine how many of each category we need
      let movies_needed = 0;
      let characters_needed = 0;

      if (options.category === "movies") {
        movies_needed = options.question_count;
      } else if (options.category === "characters") {
        characters_needed = options.question_count;
      } else {
        // Mixed mode - roughly 50/50 split
        for (let i = 0; i < options.question_count; i++) {
          if (Math.random() > 0.5) {
            movies_needed++;
          } else {
            characters_needed++;
          }
        }
      }

      const answer_count = get_answer_count(options.difficulty);
      const wrong_count = answer_count - 1;

      // Fetch all movies if needed
      let movie_items: any[] = [];
      if (movies_needed > 0) {
        const total_movies_needed = movies_needed * answer_count;
        movie_items = await fetch_random_movies_except([], total_movies_needed);
      }

      // Fetch all characters if needed
      let character_items: any[] = [];
      if (characters_needed > 0) {
        const total_characters_needed = characters_needed * answer_count;
        character_items = await fetch_random_characters_except(
          [],
          total_characters_needed
        );
      }

      // Split into batches for correct answers and wrong answers
      let movie_index = 0;
      let character_index = 0;

      // Build questions based on category order
      const categories_sequence: ("movies" | "characters")[] = [];
      if (options.category === "movies") {
        categories_sequence.push(...Array(movies_needed).fill("movies"));
      } else if (options.category === "characters") {
        categories_sequence.push(
          ...Array(characters_needed).fill("characters")
        );
      } else {
        // Mixed: randomize
        for (let i = 0; i < movies_needed; i++)
          categories_sequence.push("movies");
        for (let i = 0; i < characters_needed; i++)
          categories_sequence.push("characters");
        categories_sequence.sort(() => Math.random() - 0.5);
      }

      // Create questions from fetched items
      for (let i = 0; i < categories_sequence.length; i++) {
        const category = categories_sequence[i];
        const q_num = i + 1;

        if (category === "movies" && movie_index < movie_items.length) {
          const correct_movie = movie_items[movie_index];
          movie_url_ids.push(correct_movie.url_id);
          movie_index++;

          const wrong_movies = movie_items.slice(
            movie_index,
            movie_index + wrong_count
          );
          movie_index += wrong_count;

          const correct_answer: answer_choice = {
            id: correct_movie.id,
            url_id: correct_movie.url_id,
            name: correct_movie.title,
            title: correct_movie.title,
            image_1: correct_movie.image_1,
            is_correct: true,
            is_eliminated: false,
          };

          const wrong_answers: answer_choice[] = wrong_movies.map(
            (movie: any) => ({
              id: movie.id,
              url_id: movie.url_id,
              name: movie.title,
              title: movie.title,
              image_1: movie.image_1,
              is_correct: false,
              is_eliminated: false,
            })
          );

          const all_answers = [...wrong_answers, correct_answer].sort(
            () => Math.random() - 0.5
          );

          questions.push({
            question_number: q_num,
            category: "movie",
            correct_answer,
            wrong_answers,
            all_answers,
            revealed_hints: [], // Will be populated after batch fetch
            hint_button_used: false,
            show_answer_used: false,
            is_answered: false,
          });
        } else if (
          category === "characters" &&
          character_index < character_items.length
        ) {
          const correct_character = character_items[character_index];
          character_url_ids.push(correct_character.url_id);
          character_index++;

          const wrong_characters = character_items.slice(
            character_index,
            character_index + wrong_count
          );
          character_index += wrong_count;

          const correct_answer: answer_choice = {
            id: correct_character.id,
            url_id: correct_character.url_id,
            name: correct_character.name,
            profile_image_1: correct_character.profile_image_1,
            is_correct: true,
            is_eliminated: false,
          };

          const wrong_answers: answer_choice[] = wrong_characters.map(
            (character: any) => ({
              id: character.id,
              url_id: character.url_id,
              name: character.name,
              profile_image_1: character.profile_image_1,
              is_correct: false,
              is_eliminated: false,
            })
          );

          const all_answers = [...wrong_answers, correct_answer].sort(
            () => Math.random() - 0.5
          );

          questions.push({
            question_number: q_num,
            category: "character",
            correct_answer,
            wrong_answers,
            all_answers,
            revealed_hints: [], // Will be populated after batch fetch
            hint_button_used: false,
            show_answer_used: false,
            is_answered: false,
          });
        }
      }

      // Batch fetch all hints
      let movie_hints_map: Record<string, game_hint[]> = {};
      let character_hints_map: Record<string, game_hint[]> = {};

      if (movie_url_ids.length > 0) {
        movie_hints_map = await fetch_batch_movie_hints(movie_url_ids);
      }

      if (character_url_ids.length > 0) {
        character_hints_map = await fetch_batch_character_hints(
          character_url_ids
        );
      }

      // Populate hints into questions
      const initial_hints_count = get_initial_hints_count(options.difficulty);
      for (const question of questions) {
        const url_id = question.correct_answer.url_id;
        const hints_map =
          question.category === "movie" ? movie_hints_map : character_hints_map;
        const all_hints = hints_map[url_id] || [];
        const initial_hints = all_hints.slice(0, initial_hints_count);
        question.revealed_hints = initial_hints;
      }

      set_pre_loaded_questions(questions);
      set_current_question(questions[0]);
      set_revealed_hints(questions[0].revealed_hints);
      set_loading(false);
    } catch (error) {
      console.error("Error pre-loading questions:", error);
      set_loading(false);
    }
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

    // Update current question with answer info
    set_current_question({
      ...current_question,
      selected_answer: correct,
      is_correct: true,
      is_answered: true,
      show_answer_used: true,
    });
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

    // Update current question with answer info
    set_current_question({
      ...current_question,
      selected_answer: selected_answer,
      is_correct: correct,
      is_answered: true,
    });

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
      // Load next question from pre-loaded array
      const next_index = question_number; // Current question_number is 1-indexed, array is 0-indexed
      const next = pre_loaded_questions[next_index];

      if (next) {
        set_current_question(next);
        set_revealed_hints(next.revealed_hints);
        set_selected_answer(null);
        set_is_answered(false);
        set_show_answer_used(false);
        set_question_number((prev) => prev + 1);
      }
    }
  };

  // Pre-load all questions on mount (only once - not dependent on options changes)
  useEffect(() => {
    pre_load_all_questions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading state during pre-loading
  if (loading || !current_question) {
    return (
      <div
        className="guessing-game-play guessing-game-play--loading"
        role="status"
        aria-live="polite"
      >
        <div className="loading-spinner">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="guessing-game-play" role="main" aria-label="Game play area">
      {/* Screen reader announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {is_answered
          ? `Question ${question_number} answered ${
              selected_answer?.is_correct ? "correctly" : "incorrectly"
            }. Score: ${score.correct} out of ${question_number}.`
          : `Question ${question_number} of ${options.question_count}. ${
              revealed_hints.length
            } hint${revealed_hints.length !== 1 ? "s" : ""} revealed.`}
      </div>

      {/* Score Row */}
      <div
        className="guessing-game-play__score-row"
        role="status"
        aria-label="Game progress"
      >
        <div className="score-item">
          <span className="score-label">Question:</span>
          <span
            className="score-value"
            aria-label={`Question ${question_number} of ${options.question_count}`}
          >
            {question_number} / {options.question_count}
          </span>
        </div>
        <div className="score-item">
          <span className="score-label">Score:</span>
          <span
            className="score-value"
            aria-label={`Score: ${score.correct} correct out of ${
              question_number - 1
            } answered`}
          >
            {score.correct} / {question_number - 1}
          </span>
        </div>
        <button
          className="quit-button"
          onClick={on_quit}
          aria-label="Quit game and return to start"
        >
          Quit Game
        </button>
      </div>

      {/* Main Content Area */}
      <div className="guessing-game-play__content">
        {/* Hints Column */}
        <div
          className="guessing-game-play__hints-column"
          role="region"
          aria-label="Game hints"
        >
          <h2 className="hints-title" id="hints-heading">
            Hints (
            {current_question.category === "movie" ? "Movie" : "Character"})
          </h2>

          <AnimatePresence>
            {revealed_hints.map((hint, index) => (
              <motion.div
                key={`hint-${index}`}
                className="hint-card"
                role="article"
                aria-label={`Hint ${index + 1}: ${hint.hint_type}`}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  duration: 0.4,
                }}
              >
                <span
                  className="hint-type-badge"
                  aria-label={`Hint type: ${hint.hint_type}`}
                >
                  {hint.hint_type}
                </span>
                <p className="hint-content">{hint.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Answers Column */}
        <div
          className="guessing-game-play__answers-column"
          role="region"
          aria-labelledby="answers-heading"
        >
          <h2 className="answers-title" id="answers-heading">
            Select Your Answer
          </h2>

          <div
            className={`answer-choices ${
              current_question.all_answers.length >= 6
                ? "answer-choices--two-columns"
                : ""
            }`}
            role="group"
            aria-label="Answer choices"
          >
            {current_question.all_answers.map((answer, index) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D...
              const answer_name =
                current_question.category === "movie"
                  ? answer.title
                  : answer.name;

              let aria_label = `${letter}) ${answer_name}`;
              if (answer.is_eliminated) {
                aria_label += " (eliminated)";
              } else if (is_answered && answer.is_correct) {
                aria_label += " (correct answer)";
              } else if (
                is_answered &&
                selected_answer?.id === answer.id &&
                !answer.is_correct
              ) {
                aria_label += " (your incorrect answer)";
              }

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
                  aria-label={aria_label}
                  aria-pressed={selected_answer?.id === answer.id}
                  aria-disabled={is_answered || answer.is_eliminated}
                  whileHover={
                    !is_answered && !answer.is_eliminated
                      ? { scale: 1.03, y: -2 }
                      : {}
                  }
                  whileTap={
                    !is_answered && !answer.is_eliminated ? { scale: 0.97 } : {}
                  }
                  initial={false}
                  animate={
                    selected_answer?.id === answer.id && !is_answered
                      ? {
                          scale: 1.02,
                        }
                      : {
                          scale: 1,
                        }
                  }
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
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
            <div
              className="game-actions"
              role="group"
              aria-label="Game actions"
            >
              {options.difficulty !== 3 && (
                <>
                  <button
                    className="hint-action-button hint-action-button--eliminate"
                    onClick={use_hint_button}
                    disabled={is_answered}
                    aria-label="Use hint to eliminate one wrong answer"
                  >
                    💡 Hint
                  </button>

                  <button
                    className="hint-action-button hint-action-button--show"
                    onClick={use_show_answer}
                    disabled={show_answer_used || is_answered}
                    aria-label={
                      show_answer_used
                        ? "Show answer already used"
                        : "Show the correct answer"
                    }
                    aria-disabled={show_answer_used}
                  >
                    👁️ Show Answer {show_answer_used ? "(Used)" : ""}
                  </button>
                </>
              )}

              <button
                className="submit-answer-button"
                onClick={submit_answer}
                disabled={!selected_answer}
                aria-label={
                  selected_answer
                    ? "Submit your selected answer"
                    : "Select an answer first"
                }
                aria-disabled={!selected_answer}
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* Next Question Button */}
          {is_answered && (
            <div className="game-actions" role="group" aria-label="Next action">
              <button
                className="next-question-button"
                onClick={next_question}
                aria-label={
                  question_number >= options.question_count
                    ? "View your game results"
                    : `Continue to question ${question_number + 1}`
                }
              >
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
