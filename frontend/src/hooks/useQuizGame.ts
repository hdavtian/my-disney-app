import { useAppSelector, useAppDispatch } from "./redux";
import {
  initializeQuizGame,
  generateQuizQuestion,
  toggleQuizVisibility,
  startNewGame,
  restartGame,
  submitAnswer,
  useHint,
  revealAnswer,
  nextQuestion,
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
    generateQuestion: (characterId: string) =>
      dispatch(generateQuizQuestion(characterId)),

    // Game control
    startGame: () => {
      dispatch(startNewGame());
      dispatch(initializeQuizGame());
    },
    restartGame: () => dispatch(restartGame()),

    // Question actions
    submitAnswer: (characterId: string) => dispatch(submitAnswer(characterId)),
    useHint: () => dispatch(useHint()),
    revealAnswer: () => dispatch(revealAnswer()),
    nextQuestion: () => dispatch(nextQuestion()),

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
    showHint: quizState.showHint,
    showAnswer: quizState.showAnswer,
    questionAnswered: quizState.questionAnswered,
    currentQuestionIndex: quizState.currentQuestionIndex,
    characterQueue: quizState.characterQueue,
  };

  return {
    ...quizState,
    ...actions,
  };
};
