import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type {
  game_category,
  difficulty_level,
  question_count,
  guessing_game_options,
} from "../../../types/guessingGame";
import { fetch_random_movies_except } from "../../../api/guessingGameApi";
import type { movie_response } from "../../../types/guessingGame";
import { getImageUrl } from "../../../config/assets";
import "./GuessingGameStart.scss";

interface GuessingGameStartProps {
  on_start_game: (options: guessing_game_options) => void;
}

export const GuessingGameStart = ({
  on_start_game,
}: GuessingGameStartProps) => {
  // Game options state
  const [selected_category, set_selected_category] =
    useState<game_category>("movies");
  const [selected_difficulty, set_selected_difficulty] =
    useState<difficulty_level>(1);
  const [selected_question_count, set_selected_question_count] =
    useState<question_count>(10);
  const [show_info_modal, set_show_info_modal] = useState(false);

  // Background grid state
  const [background_movies, set_background_movies] = useState<movie_response[]>(
    []
  );
  const [is_loading_background, set_is_loading_background] = useState(true);

  // Fetch 64 random movies for 8x8 background grid
  useEffect(() => {
    const load_background_movies = async () => {
      try {
        set_is_loading_background(true);
        const movies = await fetch_random_movies_except([], 64);
        set_background_movies(movies);
      } catch (error) {
        console.error("Failed to load background movies:", error);
      } finally {
        set_is_loading_background(false);
      }
    };

    load_background_movies();
  }, []);

  // Handle start game button click
  const handle_start_game = () => {
    const options: guessing_game_options = {
      category: selected_category,
      difficulty: selected_difficulty,
      question_count: selected_question_count,
    };
    on_start_game(options);
  };

  return (
    <div className="guessing-game-start">
      {/* Left Column: Background Grid - 8x8 movie posters */}
      <div className="guessing-game-start__left-column">
        <div className="background-grid">
          {is_loading_background ? (
            <div className="loading-placeholder">Loading...</div>
          ) : (
            <>
              {background_movies.map((movie) => (
                <div key={movie.id} className="background-grid-item">
                  <img
                    src={getImageUrl("movies", movie.image_1)}
                    alt={movie.title}
                    loading="lazy"
                  />
                </div>
              ))}
            </>
          )}
        </div>

        {/* Title Overlay on Grid */}
        <div className="guessing-game-start__title-overlay">
          <h1 className="guessing-game-start__grid-title">The Guessing Game</h1>
        </div>
      </div>

      {/* Right Column: Game Options */}
      <div className="guessing-game-start__right-column">
        <motion.div
          className="start-screen-container"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Title with Info Icon */}
          <div className="guessing-game-start__header">
            <h2 className="guessing-game-start__question">
              Ready to test your Disney knowledge?
            </h2>
            <button
              className="guessing-game-start__info-icon"
              onClick={() => set_show_info_modal(true)}
              title="How to Play"
            >
              ℹ️
            </button>
          </div>

          {/* Game Options */}
          <div className="game-options">
            {/* Question Count Selector */}
            <div className="option-group">
              <label className="option-label">
                Choose number of questions:
              </label>
              <div className="game-selector-options">
                {[10, 20, 50].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={`game-selector-option ${
                      selected_question_count === count
                        ? "game-selector-option--selected"
                        : ""
                    }`}
                    onClick={() =>
                      set_selected_question_count(count as question_count)
                    }
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="option-group option-group--difficulty">
              <label className="option-label">Choose difficulty level:</label>
              <div className="game-selector-options">
                {[1, 2, 3].map((level, index) => (
                  <button
                    key={level}
                    type="button"
                    className={`game-selector-option game-selector-option--difficulty ${
                      selected_difficulty === level
                        ? "game-selector-option--selected"
                        : ""
                    }`}
                    onClick={() =>
                      set_selected_difficulty(level as difficulty_level)
                    }
                  >
                    {["Easy", "Medium", "Hard"][index]}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div className="option-group">
              <label className="option-label">Choose category:</label>
              <div className="game-selector-options">
                {(["movies", "characters", "mixed"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`game-selector-option ${
                      selected_category === cat
                        ? "game-selector-option--selected"
                        : ""
                    }`}
                    onClick={() => set_selected_category(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            className="guessing-game-start__start-button"
            onClick={handle_start_game}
          >
            🎮 Start {selected_question_count} Question Quiz (
            {["Easy", "Medium", "Hard"][selected_difficulty - 1]} mode)
          </button>
        </motion.div>
      </div>

      {/* Info Modal */}
      {show_info_modal && (
        <div
          className="modal-overlay"
          onClick={() => set_show_info_modal(false)}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>How to Play</h2>
            <div className="modal-body">
              <section>
                <h3>Game Modes</h3>
                <ul>
                  <li>
                    <strong>Movies:</strong> Guess Disney movie titles based on
                    hints
                  </li>
                  <li>
                    <strong>Characters:</strong> Guess Disney character names
                    based on hints
                  </li>
                  <li>
                    <strong>Mixed:</strong> A combination of both movies and
                    characters
                  </li>
                </ul>
              </section>

              <section>
                <h3>Difficulty Levels</h3>
                <ul>
                  <li>
                    <strong>Easy:</strong> 4 answer choices, simpler hints
                  </li>
                  <li>
                    <strong>Medium:</strong> 6 answer choices, moderate hints
                  </li>
                  <li>
                    <strong>Hard:</strong> 8 answer choices, challenging hints
                  </li>
                </ul>
              </section>

              <section>
                <h3>How Hints Work</h3>
                <ul>
                  <li>Hints reveal progressively as you play</li>
                  <li>
                    Use the <strong>"Hint"</strong> button to eliminate 2 wrong
                    answers
                  </li>
                  <li>
                    Use the <strong>"Show Answer"</strong> button if you're
                    stuck (counts as wrong)
                  </li>
                  <li>Each question starts with 1 hint visible</li>
                </ul>
              </section>

              <section>
                <h3>Scoring</h3>
                <ul>
                  <li>+1 point for each correct answer</li>
                  <li>Track your hints used and show answers clicked</li>
                  <li>Try to get the highest score with minimal help!</li>
                </ul>
              </section>
            </div>
            <button
              className="modal-close-button"
              onClick={() => set_show_info_modal(false)}
            >
              Got It!
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
