import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizGame } from "../../hooks/useQuizGame";
import { CharacterCard } from "../CharacterCard/CharacterCard";
import { Character } from "../../types";
import { fetchCharacterById } from "../../utils/quizApi";
import { DIFFICULTY_CONFIGS } from "../../store/slices/quizSlice";
import "./CharacterQuiz.scss";

export const CharacterQuiz = React.memo(() => {
  const quiz = useQuizGame();
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(
    null
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [characterAnimationState, setCharacterAnimationState] = useState<
    "normal" | "correct" | "wrong"
  >("normal");
  const [sectionBackgroundState, setSectionBackgroundState] = useState<
    "normal" | "correct" | "wrong"
  >("normal");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Timer state for "harder" difficulty
  const [timeRemaining, setTimeRemaining] = useState(3000); // 3000ms = 3 seconds
  const [isImageVisible, setIsImageVisible] = useState(true);
  const [timerIntervalId, setTimerIntervalId] = useState<number | null>(null);

  // Debug: Log re-renders to identify flash cause
  console.log("CharacterQuiz re-render:", {
    currentQuestionId: quiz.currentQuestion?.id,
    questionAnswered: quiz.questionAnswered,
    showAnswer: quiz.showAnswer,
    currentCharacter: currentCharacter?.id,
    isLoading: quiz.isLoading,
  });

  // Load preferences on component mount
  useEffect(() => {
    quiz.loadPreferences();
  }, []);

  // ESC key support for modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showInstructions) {
        setShowInstructions(false);
      }
    };

    if (showInstructions) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showInstructions]);

  // Timer logic for "harder" difficulty mode
  useEffect(() => {
    // Reset timer when new question starts
    if (
      quiz.currentQuestion &&
      quiz.selectedDifficulty === "harder" &&
      !quiz.questionAnswered &&
      !quiz.showAnswer
    ) {
      setTimeRemaining(3000);
      setIsImageVisible(true);

      // Clear any existing timer
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }

      // Start countdown timer (updates every 10ms for smooth display)
      const intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 0) {
            setIsImageVisible(false);
            clearInterval(intervalId);
            setTimerIntervalId(null);
            return 0;
          }
          return prevTime - 10;
        });
      }, 10);

      setTimerIntervalId(intervalId);
    } else if (quiz.selectedDifficulty !== "harder") {
      // For non-harder modes, always show image
      setIsImageVisible(true);
      setTimeRemaining(3000);
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
        setTimerIntervalId(null);
      }
    }

    // Cleanup timer on unmount or when question changes
    return () => {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
    };
  }, [
    quiz.currentQuestion?.id,
    quiz.selectedDifficulty,
    quiz.questionAnswered,
    quiz.showAnswer,
  ]);

  // Load character for current question (only if not already set)
  useEffect(() => {
    if (quiz.currentQuestion) {
      // Only fetch if we don't have the character or it's different
      if (
        !currentCharacter ||
        currentCharacter.id !== quiz.currentQuestion.correctCharacterId
      ) {
        console.log(
          "Fetching character in useEffect for ID:",
          quiz.currentQuestion.correctCharacterId
        );
        fetchCharacterById(quiz.currentQuestion.correctCharacterId)
          .then(setCurrentCharacter)
          .catch((error) => {
            console.error("Failed to load character:", error);
            setCurrentCharacter(null);
          });
      }
    } else {
      setCurrentCharacter(null);
    }
  }, [quiz.currentQuestion?.correctCharacterId]);

  // Generate first question when game is initialized
  useEffect(() => {
    if (
      quiz.hasCharacters &&
      quiz.isGameActive &&
      !quiz.currentQuestion &&
      !quiz.isLoading
    ) {
      // Generate first question
      const firstCharacterId = quiz.characterQueue[0];
      if (firstCharacterId) {
        quiz.generateQuestion(firstCharacterId.toString());
      }
    }
  }, [
    quiz.hasCharacters,
    quiz.isGameActive,
    quiz.currentQuestion,
    quiz.isLoading,
    quiz.characterQueue,
  ]);

  const handleAnswerSelect = (characterId: string) => {
    if (quiz.questionAnswered || quiz.showAnswer) return;
    setSelectedAnswer(characterId);
    // Don't submit immediately - let user see their selection
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || quiz.questionAnswered) return;

    // Debug logging
    console.log("=== SUBMIT ANSWER DEBUG ===");
    console.log("Selected answer ID:", selectedAnswer);
    console.log("Current question:", quiz.currentQuestion);
    console.log("All answers:", quiz.currentQuestion?.allAnswers);
    console.log(
      "Correct character ID:",
      quiz.currentQuestion?.correctCharacterId
    );

    // Check if answer is correct
    const selectedAnswerObj = quiz.currentQuestion?.allAnswers.find(
      (answer) => answer.characterId === selectedAnswer
    );

    console.log("Selected answer object:", selectedAnswerObj);
    console.log("Is correct:", selectedAnswerObj?.isCorrect);

    // Set animation states based on correctness
    if (selectedAnswerObj?.isCorrect) {
      setCharacterAnimationState("correct");
      setSectionBackgroundState("correct");
    } else {
      setCharacterAnimationState("wrong");
      setSectionBackgroundState("wrong");
    }

    quiz.submitAnswer(selectedAnswer);

    // Reset animation states after animation
    setTimeout(() => {
      setCharacterAnimationState("normal");
      setSectionBackgroundState("normal");
    }, 1000);
  };

  const handleNextQuestion = async () => {
    console.log("=== NEXT QUESTION CLICKED ===");

    // Set transitioning flag to prevent flashing
    setIsTransitioning(true);

    // Reset UI state immediately
    setSelectedAnswer(null);
    setCharacterAnimationState("normal");
    setSectionBackgroundState("normal");

    // Get next character info BEFORE moving to next question
    const nextIndex = quiz.currentQuestionIndex + 1;
    if (quiz.characterQueue.length > nextIndex) {
      const nextCharacterId = quiz.characterQueue[nextIndex];
      if (nextCharacterId) {
        // Pre-fetch the next character to avoid loading flash
        try {
          const nextCharacter = await fetchCharacterById(
            nextCharacterId.toString()
          );

          // Generate the question first
          await quiz.generateQuestion(nextCharacterId.toString());

          // Set the character immediately to avoid flash
          setCurrentCharacter(nextCharacter);

          // Now move to next question (this won't trigger character loading)
          quiz.nextQuestion();
        } catch (error) {
          console.error("Failed to pre-load next character:", error);
          // Fallback to original behavior
          quiz.nextQuestion();
          quiz.generateQuestion(nextCharacterId.toString());
        }
      }
    } else {
      // No more questions, just move to next
      quiz.nextQuestion();
    }

    // Clear transition flag
    setIsTransitioning(false);
  };

  const handleUseHint = () => {
    quiz.useHint();
  };

  const handleShowAnswer = () => {
    console.log("=== SHOW ANSWER DEBUG ===");
    console.log("Current showAnswer state:", quiz.showAnswer);
    console.log("Question answered:", quiz.questionAnswered);
    quiz.revealAnswer();
    console.log("After reveal - showAnswer state:", quiz.showAnswer);
  };

  const handleRestartGame = () => {
    setCurrentCharacter(null);
    setSelectedAnswer(null);
    setCharacterAnimationState("normal");
    setSectionBackgroundState("normal");
    // Use restart action to return to game setup screen
    quiz.restartGame();
    // No longer auto-starting game - user can choose new options
  };

  // Keyboard support for quiz
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!quiz.currentQuestion || quiz.questionAnswered || quiz.showAnswer)
        return;

      const key = event.key.toUpperCase();
      if (["A", "B", "C", "D"].includes(key)) {
        const answer = quiz.currentQuestion.allAnswers.find(
          (a) => a.label === key
        );
        if (answer) {
          handleAnswerSelect(answer.characterId);
        }
      } else if (event.key === "Enter" && selectedAnswer && !quiz.showAnswer) {
        handleSubmitAnswer();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    quiz.currentQuestion,
    quiz.questionAnswered,
    quiz.showAnswer,
    selectedAnswer,
  ]);

  if (!quiz.isVisible) {
    return (
      <div className="character-quiz character-quiz--hidden">
        <button
          type="button"
          className="character-quiz__show-button"
          onClick={quiz.toggleVisibility}
          aria-label="Show Character Quiz"
        >
          🎮 Show Quiz
        </button>
      </div>
    );
  }

  return (
    <motion.div
      key="character-quiz-main"
      className="character-quiz"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with toggle button */}
      <div className="character-quiz__header">
        <h2 className="character-quiz__title">Character Quiz</h2>
        <button
          type="button"
          className="character-quiz__hide-button"
          onClick={quiz.toggleVisibility}
          aria-label="Hide Character Quiz"
        >
          ✕
        </button>
      </div>

      {/* Loading State */}
      {quiz.isLoading && (
        <div className="character-quiz__loading">
          <div className="character-quiz__spinner"></div>
          <p>Loading quiz...</p>
        </div>
      )}

      {/* Error State */}
      {quiz.error && (
        <div className="character-quiz__error">
          <p>❌ {quiz.error}</p>
          <button
            type="button"
            onClick={() => quiz.initializeGame()}
            className="character-quiz__retry-button"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Quiz Content */}
      {!quiz.isLoading && !quiz.error && quiz.isGameActive && (
        <div className="character-quiz__content">
          {/* Section 1: Character Display */}
          <div
            className={`
              character-quiz__section 
              character-quiz__character-section
              ${
                sectionBackgroundState === "correct"
                  ? "character-quiz__character-section--correct"
                  : ""
              }
              ${
                sectionBackgroundState === "wrong"
                  ? "character-quiz__character-section--wrong"
                  : ""
              }
            `}
          >
            <AnimatePresence mode="wait">
              {currentCharacter && !isTransitioning && (
                <motion.div
                  key={currentCharacter.id}
                  className={`
                    character-quiz__character-wrapper
                    ${
                      characterAnimationState === "correct"
                        ? "character-quiz__character-wrapper--correct"
                        : ""
                    }
                    ${
                      characterAnimationState === "wrong"
                        ? "character-quiz__character-wrapper--wrong"
                        : ""
                    }
                  `}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="character-quiz__character-container">
                    <div
                      className={`character-quiz__character-wrapper ${
                        quiz.selectedDifficulty === "harder" &&
                        !isImageVisible &&
                        !quiz.questionAnswered &&
                        !quiz.showAnswer
                          ? "character-quiz__character-wrapper--hidden"
                          : ""
                      }`}
                    >
                      <CharacterCard
                        character={currentCharacter}
                        showTitle={false}
                        disableNavigation={true}
                        size="large"
                      />
                    </div>

                    {/* Timer for "harder" difficulty */}
                    {quiz.selectedDifficulty === "harder" && (
                      <div className="character-quiz__timer">
                        <div
                          className={`character-quiz__timer-display ${
                            timeRemaining < 1000
                              ? "character-quiz__timer-display--danger"
                              : timeRemaining < 2000
                              ? "character-quiz__timer-display--warning"
                              : ""
                          }`}
                        >
                          {(timeRemaining / 1000).toFixed(2)}s
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 2: Quiz Interface */}
          <div className="character-quiz__section character-quiz__interface-section">
            <div className="character-quiz__progress">
              <h3 className="character-quiz__interface-title">
                Test your toon knowledge!
              </h3>
              <div className="character-quiz__progress-details">
                <div className="character-quiz__progress-info">
                  Question {quiz.currentQuestionIndex + 1} of{" "}
                  {quiz.selectedQuestionsCount}
                </div>
                <div
                  className={`character-quiz__difficulty-indicator character-quiz__difficulty-indicator--${quiz.selectedDifficulty}`}
                >
                  <span className="character-quiz__difficulty-icon">
                    {quiz.selectedDifficulty === "easy" && "🌟"}
                    {quiz.selectedDifficulty === "medium" && "⚡"}
                    {quiz.selectedDifficulty === "hard" && "🔥"}
                    {quiz.selectedDifficulty === "harder" && "✨"}
                  </span>
                  <span className="character-quiz__difficulty-text">
                    {quiz.selectedDifficulty.charAt(0).toUpperCase() +
                      quiz.selectedDifficulty.slice(1)}{" "}
                    Mode
                  </span>
                </div>
              </div>
            </div>

            {quiz.currentQuestion && (
              <div
                className={`character-quiz__answers ${
                  quiz.currentQuestion.allAnswers.length === 10
                    ? "character-quiz__answers--two-columns"
                    : ""
                }`}
              >
                {quiz.currentQuestion.allAnswers.map((answer) => {
                  const isSelected = selectedAnswer === answer.characterId;
                  const isCorrect = answer.isCorrect;
                  const showResult = quiz.questionAnswered || quiz.showAnswer;
                  // For hint, highlight the first wrong answer that appears in the list
                  const wrongAnswers = quiz.currentQuestion!.allAnswers.filter(
                    (a) => !a.isCorrect
                  );
                  const isHintAnswer =
                    quiz.showHint &&
                    !isCorrect &&
                    wrongAnswers[0]?.id === answer.id;
                  // When answer is revealed, highlight the correct answer
                  const isRevealedCorrect = quiz.showAnswer && isCorrect;

                  return (
                    <button
                      type="button"
                      key={answer.id}
                      className={`
                        character-quiz__answer
                        ${isSelected ? "character-quiz__answer--selected" : ""}
                        ${
                          showResult && isCorrect
                            ? "character-quiz__answer--correct"
                            : ""
                        }
                        ${
                          showResult && isSelected && !isCorrect
                            ? "character-quiz__answer--wrong"
                            : ""
                        }
                        ${isHintAnswer ? "character-quiz__answer--hint" : ""}
                        ${
                          isRevealedCorrect
                            ? "character-quiz__answer--revealed"
                            : ""
                        }
                      `}
                      onClick={() => handleAnswerSelect(answer.characterId)}
                      disabled={quiz.questionAnswered || quiz.showAnswer}
                    >
                      <span className="character-quiz__answer-label">
                        {answer.label})
                      </span>
                      <span className="character-quiz__answer-text">
                        {answer.characterName}
                      </span>
                      {isHintAnswer && (
                        <span className="character-quiz__hint-text">
                          not this!
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="character-quiz__actions">
              {!quiz.questionAnswered && !quiz.showAnswer && (
                <>
                  {DIFFICULTY_CONFIGS[quiz.selectedDifficulty].showHints && (
                    <button
                      type="button"
                      className="character-quiz__hint-button"
                      onClick={handleUseHint}
                      disabled={quiz.showHint || !quiz.currentQuestion}
                    >
                      💡 Hint {quiz.showHint ? "(Used)" : ""}
                    </button>
                  )}

                  {DIFFICULTY_CONFIGS[quiz.selectedDifficulty]
                    .showRevealAnswer && (
                    <button
                      type="button"
                      className="character-quiz__reveal-button"
                      onClick={handleShowAnswer}
                      disabled={quiz.showAnswer || !quiz.currentQuestion}
                    >
                      👁️ Show Answer
                    </button>
                  )}

                  {selectedAnswer && !quiz.showAnswer && (
                    <button
                      type="button"
                      className="character-quiz__submit-button"
                      onClick={handleSubmitAnswer}
                    >
                      Submit Answer
                    </button>
                  )}
                </>
              )}

              {(quiz.questionAnswered || quiz.showAnswer) && (
                <>
                  {quiz.questionsRemaining > 0 ? (
                    <button
                      type="button"
                      className="character-quiz__next-button"
                      onClick={handleNextQuestion}
                    >
                      Next Question →
                    </button>
                  ) : (
                    <div className="character-quiz__game-complete">
                      <h4>🎉 Quiz Complete!</h4>
                      <p>
                        Final Score: {quiz.score.correct} of {quiz.score.total}{" "}
                        ({quiz.score.percentage}%)
                      </p>
                      {quiz.streak.longest > 0 && (
                        <p>🔥 Longest Streak: {quiz.streak.longest}</p>
                      )}
                      <div className="character-quiz__final-stats">
                        <span>💡 Hints Used: {quiz.hintsUsed}</span>
                        <span>👁️ Answers Revealed: {quiz.answersRevealed}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Section 3: Score Tracking */}
          <div className="character-quiz__section character-quiz__score-section">
            <button
              type="button"
              className="character-quiz__restart-button"
              onClick={handleRestartGame}
            >
              🔄 Restart Game
            </button>

            <div className="character-quiz__statistics">
              <div className="character-quiz__stat">
                <span className="character-quiz__stat-label">Score:</span>
                <span className="character-quiz__stat-value">
                  {quiz.score.correct}/{quiz.score.total}
                  {quiz.score.total > 0 && (
                    <span className="character-quiz__stat-percentage">
                      ({quiz.score.percentage}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="character-quiz__stat">
                <span className="character-quiz__stat-label">Current:</span>
                <span className="character-quiz__stat-value">
                  {quiz.streak.current}
                </span>
              </div>
              <div className="character-quiz__stat">
                <span className="character-quiz__stat-label">Longest:</span>
                <span className="character-quiz__stat-value">
                  {quiz.streak.longest}
                </span>
              </div>
              <div className="character-quiz__stat">
                <span className="character-quiz__stat-label">Hints:</span>
                <span className="character-quiz__stat-value">
                  {quiz.hintsUsed}
                </span>
              </div>
              <div className="character-quiz__stat">
                <span className="character-quiz__stat-label">Revealed:</span>
                <span className="character-quiz__stat-value">
                  {quiz.answersRevealed}
                </span>
              </div>
            </div>

            <div className="character-quiz__history">
              <h4 className="character-quiz__history-title">Game History</h4>
              <div className="character-quiz__history-table">
                <div className="character-quiz__history-header">
                  <div>Character</div>
                  <div>Right!</div>
                  <div>Wrong!</div>
                </div>

                <div className="character-quiz__history-body">
                  {quiz.gameHistory.map((question) => (
                    <div
                      key={question.id}
                      className="character-quiz__history-row"
                    >
                      <div className="character-quiz__history-character">
                        {question.correctCharacterName}
                        {question.answerRevealed && (
                          <span className="character-quiz__history-revealed">
                            {" "}
                            (answer shown)
                          </span>
                        )}
                      </div>
                      <div className="character-quiz__history-correct">
                        {question.isCorrect && !question.answerRevealed
                          ? "✅"
                          : ""}
                      </div>
                      <div className="character-quiz__history-wrong">
                        {!question.isCorrect && !question.answerRevealed
                          ? "❌"
                          : ""}
                      </div>
                    </div>
                  ))}

                  {quiz.gameHistory.length === 0 && (
                    <div className="character-quiz__history-empty">
                      No questions answered yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Not Started */}
      {!quiz.isGameActive && !quiz.isLoading && !quiz.error && (
        <div className="character-quiz__start">
          <div className="character-quiz__start-header">
            <h3>Ready to test your Disney knowledge?</h3>
            <button
              type="button"
              className="character-quiz__info-button"
              onClick={() => setShowInstructions(true)}
              title="View difficulty information"
            >
              ℹ️
            </button>
          </div>

          <div className="character-quiz__game-setup">
            <div className="character-quiz__questions-selector">
              <label className="character-quiz__selector-label">
                Choose number of questions:
              </label>
              <div className="character-quiz__selector-options">
                {[10, 20, 50].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={`
                      character-quiz__selector-option
                      ${
                        quiz.selectedQuestionsCount === count
                          ? "character-quiz__selector-option--selected"
                          : ""
                      }
                    `}
                    onClick={() => quiz.setQuestionsCount(count)}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            <div className="character-quiz__difficulty-selector">
              <label className="character-quiz__selector-label">
                Choose difficulty level:
              </label>
              <div className="character-quiz__selector-options">
                {["easy", "medium", "hard", "harder"].map((difficulty) => (
                  <button
                    key={difficulty}
                    type="button"
                    className={`
                      character-quiz__selector-option
                      character-quiz__selector-option--difficulty
                      ${
                        quiz.selectedDifficulty === difficulty
                          ? "character-quiz__selector-option--selected"
                          : ""
                      }
                    `}
                    onClick={() =>
                      quiz.setDifficulty(
                        difficulty as "easy" | "medium" | "hard"
                      )
                    }
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="character-quiz__start-button"
              onClick={quiz.startGame}
            >
              🎮 Start {quiz.selectedQuestionsCount} Question Quiz (
              {quiz.selectedDifficulty} mode)
            </button>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            className="character-quiz__modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInstructions(false)}
          >
            <motion.div
              className="character-quiz__modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="character-quiz__modal-header">
                <h3>Difficulty Levels</h3>
                <button
                  type="button"
                  className="character-quiz__modal-close"
                  onClick={() => setShowInstructions(false)}
                >
                  ×
                </button>
              </div>

              <div className="character-quiz__modal-content">
                <table className="character-quiz__difficulty-table">
                  <thead>
                    <tr>
                      <th>Difficulty</th>
                      <th>Answer Choices</th>
                      <th>Image Timer</th>
                      <th>Hints Available</th>
                      <th>Show Answer Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(DIFFICULTY_CONFIGS).map((config) => (
                      <tr key={config.mode}>
                        <td
                          className={`character-quiz__difficulty-${config.mode}`}
                        >
                          {config.mode.charAt(0).toUpperCase() +
                            config.mode.slice(1)}
                        </td>
                        <td>{config.answerChoices} choices</td>
                        <td>
                          {config.mode === "harder"
                            ? "⏱️ 3 seconds"
                            : "♾️ Unlimited"}
                        </td>
                        <td>{config.showHints ? "✅ Yes" : "❌ No"}</td>
                        <td>{config.showRevealAnswer ? "✅ Yes" : "❌ No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="character-quiz__difficulty-descriptions">
                  <h4>Details:</h4>
                  <ul>
                    <li>
                      <strong>Easy (50% chance):</strong> Only 2 answer choices
                      - perfect for beginners
                    </li>
                    <li>
                      <strong>Medium (20% chance):</strong> 5 answer choices
                      with helpful hints available
                    </li>
                    <li>
                      <strong>Hard (10% chance):</strong> 10 answer choices, no
                      assistance - for true Disney experts!
                    </li>
                    <li>
                      <strong>Harder (10% chance):</strong> 10 answer choices,
                      image disappears after 3 seconds, no assistance - ultimate
                      challenge!
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
