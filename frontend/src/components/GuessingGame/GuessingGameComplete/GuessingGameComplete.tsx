/**
 * GuessingGameComplete.tsx
 * Completion screen displaying game statistics and results
 */

import { motion } from "framer-motion";
import {
  guessing_game_options,
  game_question,
} from "../../../types/guessingGame";
import { getImageUrl } from "../../../config/assets";
import "./GuessingGameComplete.scss";

/**
 * Props for completion screen
 */
interface guessing_game_complete_props {
  options: guessing_game_options;
  questions: game_question[];
  score: {
    correct: number;
    incorrect: number;
    show_answers_used: number;
  };
  on_play_again: () => void;
  on_return_to_start: () => void;
}

/**
 * Get difficulty label
 */
const get_difficulty_label = (difficulty: number): string => {
  switch (difficulty) {
    case 1:
      return "Easy";
    case 2:
      return "Medium";
    case 3:
      return "Hard";
    default:
      return "Unknown";
  }
};

/**
 * Get category label
 */
const get_category_label = (category: string): string => {
  switch (category) {
    case "movies":
      return "Movies";
    case "characters":
      return "Characters";
    case "mixed":
      return "Mixed";
    default:
      return category;
  }
};

/**
 * GuessingGameComplete Component
 */
export function GuessingGameComplete({
  options,
  questions,
  score,
  on_play_again,
  on_return_to_start,
}: guessing_game_complete_props) {
  const total_questions = questions.length;
  const accuracy =
    total_questions > 0
      ? Math.round((score.correct / total_questions) * 100)
      : 0;
  const hints_used = questions.filter((q) => q.hint_button_used).length;

  return (
    <motion.div
      className="guessing-game-complete"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="guessing-game-complete__container">
        {/* Header */}
        <motion.div
          className="guessing-game-complete__header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="guessing-game-complete__title">🎉 Game Complete!</h2>
          <p className="guessing-game-complete__subtitle">
            {get_category_label(options.category)} •{" "}
            {get_difficulty_label(options.difficulty)}
          </p>
        </motion.div>

        {/* Score Summary */}
        <motion.div
          className="guessing-game-complete__score-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="guessing-game-complete__score-main">
            <span className="guessing-game-complete__score-value">
              {score.correct}
            </span>
            <span className="guessing-game-complete__score-divider">/</span>
            <span className="guessing-game-complete__score-total">
              {total_questions}
            </span>
          </div>
          <div className="guessing-game-complete__accuracy">
            {accuracy}% Accuracy
          </div>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div
          className="guessing-game-complete__stats-grid"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="guessing-game-complete__stat-card">
            <div className="guessing-game-complete__stat-icon">✅</div>
            <div className="guessing-game-complete__stat-value">
              {score.correct}
            </div>
            <div className="guessing-game-complete__stat-label">Correct</div>
          </div>

          <div className="guessing-game-complete__stat-card">
            <div className="guessing-game-complete__stat-icon">❌</div>
            <div className="guessing-game-complete__stat-value">
              {score.incorrect}
            </div>
            <div className="guessing-game-complete__stat-label">Incorrect</div>
          </div>

          <div className="guessing-game-complete__stat-card">
            <div className="guessing-game-complete__stat-icon">💡</div>
            <div className="guessing-game-complete__stat-value">
              {hints_used}
            </div>
            <div className="guessing-game-complete__stat-label">Hints Used</div>
          </div>

          <div className="guessing-game-complete__stat-card">
            <div className="guessing-game-complete__stat-icon">👁️</div>
            <div className="guessing-game-complete__stat-value">
              {score.show_answers_used}
            </div>
            <div className="guessing-game-complete__stat-label">Revealed</div>
          </div>
        </motion.div>

        {/* Question Review */}
        <motion.div
          className="guessing-game-complete__review"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="guessing-game-complete__review-title">
            Question Review
          </h3>
          <div className="guessing-game-complete__review-list">
            {questions.map((question, index) => {
              const image_url =
                question.category === "movie"
                  ? getImageUrl("movies", question.correct_answer.image_1 || "")
                  : getImageUrl(
                      "characters",
                      question.correct_answer.profile_image_1 || ""
                    );

              const display_name =
                question.category === "movie"
                  ? question.correct_answer.title
                  : question.correct_answer.name;

              return (
                <div
                  key={index}
                  className={`guessing-game-complete__review-item ${
                    question.is_correct ? "correct" : "incorrect"
                  }`}
                >
                  <div className="guessing-game-complete__review-number">
                    #{index + 1}
                  </div>
                  <div className="guessing-game-complete__review-image">
                    <img src={image_url} alt={display_name} loading="lazy" />
                  </div>
                  <div className="guessing-game-complete__review-info">
                    <div className="guessing-game-complete__review-name">
                      {display_name}
                    </div>
                    {question.selected_answer && !question.is_correct && (
                      <div className="guessing-game-complete__review-wrong">
                        You selected:{" "}
                        {question.category === "movie"
                          ? question.selected_answer.title
                          : question.selected_answer.name}
                      </div>
                    )}
                  </div>
                  <div className="guessing-game-complete__review-result">
                    {question.is_correct ? "✅" : "❌"}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="guessing-game-complete__actions"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <button
            className="guessing-game-complete__button guessing-game-complete__button--primary"
            onClick={on_play_again}
          >
            🔄 Play Again
          </button>
          <button
            className="guessing-game-complete__button guessing-game-complete__button--secondary"
            onClick={on_return_to_start}
          >
            ← Back to Start
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
