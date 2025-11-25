import React, { useState } from "react";
import { motion } from "framer-motion";
import { GuessingGameStart } from "../../components/GuessingGame/GuessingGameStart/GuessingGameStart";
import { GuessingGamePlay } from "../../components/GuessingGame/GuessingGamePlay/GuessingGamePlay";
import type { guessing_game_options } from "../../types/guessingGame";
import "./GamesPage.scss";

export const GamesPage = React.memo(() => {
  // Game state management
  const [is_guessing_game_active, set_is_guessing_game_active] =
    useState(false);
  const [guessing_game_options, set_guessing_game_options] =
    useState<guessing_game_options | null>(null);

  // Handler for starting The Guessing Game
  const handle_start_guessing_game = (options: guessing_game_options) => {
    set_guessing_game_options(options);
    set_is_guessing_game_active(true);
  };

  // Handler for completing the game
  const handle_game_complete = (stats: any) => {
    console.log("Game completed with stats:", stats);
    // TODO: Phase 5 - Navigate to completion screen
    set_is_guessing_game_active(false);
    set_guessing_game_options(null);
  };

  // Handler for quitting the game
  const handle_quit_game = () => {
    set_is_guessing_game_active(false);
    set_guessing_game_options(null);
  };

  return (
    <motion.div
      className="games-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <header className="games-page__header">
        <motion.h1
          className="games-page__title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          🎮 Games
        </motion.h1>
        <motion.p
          className="games-page__subtitle"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Test Your Disney Knowledge!
        </motion.p>
      </header>

      {/* Games Container */}
      <div className="games-page__container">
        {/* Row 1: Toon Quiz Placeholder */}
        <motion.section
          className="games-page__game-row games-page__game-row--placeholder"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="games-page__placeholder">
            <div className="games-page__placeholder-icon">🎯</div>
            <h3 className="games-page__placeholder-title">Toon Quiz</h3>
            <p className="games-page__placeholder-text">
              Character identification game - Coming soon to this page!
            </p>
          </div>
        </motion.section>

        {/* Row 2: The Guessing Game */}
        <motion.section
          className="games-page__game-row games-page__game-row--guessing-game"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          {is_guessing_game_active && guessing_game_options ? (
            <GuessingGamePlay
              options={guessing_game_options}
              on_game_complete={handle_game_complete}
              on_quit={handle_quit_game}
            />
          ) : (
            <GuessingGameStart on_start_game={handle_start_guessing_game} />
          )}
        </motion.section>

        {/* Row 3: Future Game Placeholder */}
        <motion.section
          className="games-page__game-row games-page__game-row--future"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="games-page__placeholder">
            <div className="games-page__placeholder-icon">🎲</div>
            <h3 className="games-page__placeholder-title">More Games Coming</h3>
            <p className="games-page__placeholder-text">
              Stay tuned for more exciting Disney games!
            </p>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
});

GamesPage.displayName = "GamesPage";
