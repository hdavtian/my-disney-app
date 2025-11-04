import { useAppSelector, useAppDispatch } from "./redux";
import {
  initializeQuizGame,
  toggleQuizVisibility,
  startNewGame,
  restartGame,
} from "../store/slices/quizSlice";

/**
 * Custom hook for quiz game state management
 * Provides easy access to quiz state and actions
 */
export const useQuizGame = () => {
  const dispatch = useAppDispatch();
  const quizState = useAppSelector((state) => state.quiz);

  const actions = {
    // Game initialization
    initializeGame: () => dispatch(initializeQuizGame()),

    // Game control
    startGame: () => dispatch(startNewGame()),
    restartGame: () => dispatch(restartGame()),

    // Visibility
    toggleVisibility: () => dispatch(toggleQuizVisibility()),

    // Quiz state selectors
    isGameActive: quizState.isGameActive,
    isVisible: quizState.isVisible,
    isLoading: quizState.isLoading,
    error: quizState.error,
    score: quizState.score,
    streak: quizState.streak,
    currentQuestion: quizState.currentQuestion,
    gameHistory: quizState.gameHistory,
    hasCharacters: quizState.characterQueue.length > 0,
    questionsRemaining:
      quizState.characterQueue.length - quizState.currentQuestionIndex - 1,
  };

  return {
    ...quizState,
    ...actions,
  };
};
