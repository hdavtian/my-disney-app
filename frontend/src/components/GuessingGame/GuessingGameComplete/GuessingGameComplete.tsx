/**
 * GuessingGameComplete.tsx
 * Completion screen displaying game statistics and results
 */

import { useState, useEffect } from "react";
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
 * Custom hook for counting animation
 */
const useCountingAnimation = (end: number, duration: number = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16); // 60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return count;
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

  // Animated counts
  const animated_correct = useCountingAnimation(score.correct, 800);
  const animated_accuracy = useCountingAnimation(accuracy, 1200);

  return (
    <motion.div
      className="guessing-game-complete"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="main"
      aria-label="Game completion screen"
    >
      {/* Screen reader announcement */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Game complete! You scored {score.correct} out of {total_questions}{" "}
        correct answers, {accuracy}% accuracy.
      </div>

      <div className="guessing-game-complete__container">
        {/* Header */}
        <motion.div
          className="guessing-game-complete__header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          role="heading"
          aria-level={1}
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
          role="region"
          aria-label="Final score"
        >
          <div
            className="guessing-game-complete__score-main"
            aria-label={`${score.correct} correct out of ${total_questions} questions`}
          >
            <span
              className="guessing-game-complete__score-value"
              aria-hidden="true"
            >
              {animated_correct}
            </span>
            <span
              className="guessing-game-complete__score-divider"
              aria-hidden="true"
            >
              /
            </span>
            <span
              className="guessing-game-complete__score-total"
              aria-hidden="true"
            >
              {total_questions}
            </span>
          </div>
          <div
            className="guessing-game-complete__accuracy"
            aria-label={`${accuracy} percent accuracy`}
          >
            <span aria-hidden="true">{animated_accuracy}% Accuracy</span>
          </div>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div
          className="guessing-game-complete__stats-grid"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          role="region"
          aria-label="Game statistics"
        >
          <div
            className="guessing-game-complete__stat-card"
            role="article"
            aria-label={`${score.correct} correct answers`}
          >
            <div
              className="guessing-game-complete__stat-icon"
              aria-hidden="true"
            >
              ✅
            </div>
            <div className="guessing-game-complete__stat-value">
              {score.correct}
            </div>
            <div className="guessing-game-complete__stat-label">Correct</div>
          </div>

          <div
            className="guessing-game-complete__stat-card"
            role="article"
            aria-label={`${score.incorrect} incorrect answers`}
          >
            <div
              className="guessing-game-complete__stat-icon"
              aria-hidden="true"
            >
              ❌
            </div>
            <div className="guessing-game-complete__stat-value">
              {score.incorrect}
            </div>
            <div className="guessing-game-complete__stat-label">Incorrect</div>
          </div>

          <div
            className="guessing-game-complete__stat-card"
            role="article"
            aria-label={`${hints_used} hints used`}
          >
            <div
              className="guessing-game-complete__stat-icon"
              aria-hidden="true"
            >
              💡
            </div>
            <div className="guessing-game-complete__stat-value">
              {hints_used}
            </div>
            <div className="guessing-game-complete__stat-label">Hints Used</div>
          </div>

          <div
            className="guessing-game-complete__stat-card"
            role="article"
            aria-label={`${score.show_answers_used} answers revealed`}
          >
            <div
              className="guessing-game-complete__stat-icon"
              aria-hidden="true"
            >
              👁️
            </div>
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
          role="group"
          aria-label="Game completion actions"
        >
          <button
            className="guessing-game-complete__button guessing-game-complete__button--primary"
            onClick={on_play_again}
            aria-label="Play again with the same settings"
          >
            🔄 Play Again
          </button>
          <button
            className="guessing-game-complete__button guessing-game-complete__button--secondary"
            onClick={on_return_to_start}
            aria-label="Return to game start screen"
          >
            ← Back to Start
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
