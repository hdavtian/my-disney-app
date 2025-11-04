import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizGame } from "../../hooks/useQuizGame";
import { CharacterCard } from "../CharacterCard/CharacterCard";
import { Character } from "../../types";
import { fetchCharacterById } from "../../utils/quizApi";
import "./CharacterQuiz.scss";

export const CharacterQuiz = () => {
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

  // Load character for current question
  useEffect(() => {
    if (quiz.currentQuestion) {
      fetchCharacterById(quiz.currentQuestion.correctCharacterId)
        .then(setCurrentCharacter)
        .catch((error) => {
          console.error("Failed to load character:", error);
          setCurrentCharacter(null);
        });
    } else {
      setCurrentCharacter(null);
    }
  }, [quiz.currentQuestion]);

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
    quiz.generateQuestion,
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

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setCharacterAnimationState("normal");
    setSectionBackgroundState("normal");
    quiz.nextQuestion();

    // Generate next question if we have more characters
    const nextIndex = quiz.currentQuestionIndex + 1;
    if (quiz.characterQueue.length > nextIndex) {
      const nextCharacterId = quiz.characterQueue[nextIndex];
      if (nextCharacterId) {
        quiz.generateQuestion(nextCharacterId.toString());
      }
    }
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
    // Use restart action specifically designed for this
    quiz.restartGame();
    // Then start a new game
    setTimeout(() => {
      quiz.startGame();
    }, 100);
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
            onClick={quiz.initializeGame}
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
              {currentCharacter && (
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
                  <CharacterCard
                    character={currentCharacter}
                    showTitle={false}
                    disableNavigation={true}
                    size="large"
                  />
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
              <div className="character-quiz__progress-info">
                Question {quiz.currentQuestionIndex + 1} of{" "}
                {quiz.characterQueue.length}
              </div>
            </div>

            {quiz.currentQuestion && (
              <div className="character-quiz__answers">
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
                  <button
                    className="character-quiz__hint-button"
                    onClick={handleUseHint}
                    disabled={quiz.showHint || !quiz.currentQuestion}
                  >
                    💡 Hint {quiz.showHint ? "(Used)" : ""}
                  </button>

                  <button
                    className="character-quiz__reveal-button"
                    onClick={handleShowAnswer}
                    disabled={quiz.showAnswer || !quiz.currentQuestion}
                  >
                    👁️ Show Answer
                  </button>

                  {selectedAnswer && !quiz.showAnswer && (
                    <button
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
                      {quiz.streak.current > 0 && (
                        <p>🔥 Final Streak: {quiz.streak.current}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Section 3: Score Tracking */}
          <div className="character-quiz__section character-quiz__score-section">
            <button
              className="character-quiz__restart-button"
              onClick={handleRestartGame}
            >
              🔄 Restart
            </button>

            <div className="character-quiz__score-display">
              <div className="character-quiz__overall-score">
                {quiz.score.correct} of {quiz.score.total}
                {quiz.score.total > 0 && (
                  <span className="character-quiz__percentage">
                    ({quiz.score.percentage}%)
                  </span>
                )}
              </div>

              <div className="character-quiz__streak">
                Streak: {quiz.streak.current}
                {quiz.streak.best > 0 && (
                  <span className="character-quiz__best-streak">
                    (Best: {quiz.streak.best})
                  </span>
                )}
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
          <h3>Ready to test your Disney knowledge?</h3>
          <button
            className="character-quiz__start-button"
            onClick={quiz.startGame}
          >
            🎮 Start Quiz
          </button>
        </div>
      )}
    </motion.div>
  );
};
