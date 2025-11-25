import React from "react";
import { motion } from "framer-motion";
import "./GamesPage.scss";

export const GamesPage = React.memo(() => {
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

        {/* Row 2: The Guessing Game Placeholder */}
        <motion.section
          className="games-page__game-row games-page__game-row--guessing-game"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="games-page__placeholder">
            <div className="games-page__placeholder-icon">💡</div>
            <h3 className="games-page__placeholder-title">The Guessing Game</h3>
            <p className="games-page__placeholder-text">
              Guess movies and characters from hints - Coming soon!
            </p>
          </div>
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
