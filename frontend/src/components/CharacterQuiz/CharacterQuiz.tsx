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

  // Load character for current question
  useEffect(() => {
    if (quiz.currentQuestion) {
      fetchCharacterById(quiz.currentQuestion.correctCharacterId)
        .then(setCurrentCharacter)
        .catch(console.error);
    }
  }, [quiz.currentQuestion]);

  // Initialize game if not started
  useEffect(() => {
    if (!quiz.hasCharacters && !quiz.isLoading) {
      quiz.initializeGame();
    }
  }, [quiz.hasCharacters, quiz.isLoading, quiz.initializeGame]);

  const handleAnswerSelect = (characterId: string) => {
    if (quiz.questionAnswered) return;
    setSelectedAnswer(characterId);
    // Don't submit immediately - let user see their selection
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || quiz.questionAnswered) return;
    quiz.submitAnswer(selectedAnswer);
  };

  const handleNextQuestion = () => {
    quiz.nextQuestion();
    setSelectedAnswer(null);
    // Generate next question if we have more characters
    if (quiz.characterQueue.length > quiz.currentQuestionIndex + 1) {
      const nextCharacterId =
        quiz.characterQueue[quiz.currentQuestionIndex + 1];
      quiz.generateQuestion(nextCharacterId);
    }
  };

  const handleUseHint = () => {
    quiz.useHint();
  };

  const handleShowAnswer = () => {
    quiz.revealAnswer();
  };

  const handleRestartGame = () => {
    quiz.restartGame();
    setCurrentCharacter(null);
    setSelectedAnswer(null);
  };

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
          <div className="character-quiz__section character-quiz__character-section">
            <AnimatePresence mode="wait">
              {currentCharacter && (
                <motion.div
                  key={currentCharacter.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CharacterCard
                    character={currentCharacter}
                    showTitle={false}
                    disableNavigation={true}
                    onClick={handleAnswerSelect}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 2: Quiz Interface */}
          <div className="character-quiz__section character-quiz__interface-section">
            <h3 className="character-quiz__interface-title">
              Test your toon knowledge!
            </h3>

            {quiz.currentQuestion && (
              <div className="character-quiz__answers">
                {quiz.currentQuestion.allAnswers.map((answer, index) => {
                  const isSelected = selectedAnswer === answer.characterId;
                  const isCorrect = answer.isCorrect;
                  const showResult = quiz.questionAnswered || quiz.showAnswer;
                  const isHintAnswer =
                    quiz.showHint && !isCorrect && index === 0; // Highlight first wrong answer as hint

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
                      `}
                      onClick={() => handleAnswerSelect(answer.characterId)}
                      disabled={quiz.questionAnswered}
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
              {!quiz.questionAnswered && (
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

                  {selectedAnswer && (
                    <button
                      className="character-quiz__submit-button"
                      onClick={handleSubmitAnswer}
                    >
                      Submit Answer
                    </button>
                  )}
                </>
              )}

              {quiz.questionAnswered && quiz.questionsRemaining > 0 && (
                <button
                  className="character-quiz__next-button"
                  onClick={handleNextQuestion}
                >
                  Next Question →
                </button>
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
                      </div>
                      <div className="character-quiz__history-correct">
                        {question.isCorrect ? "✅" : ""}
                      </div>
                      <div className="character-quiz__history-wrong">
                        {!question.isCorrect ? "❌" : ""}
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
