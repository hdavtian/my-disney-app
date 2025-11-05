import { useCallback } from "react";
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

  // Memoized action functions to prevent unnecessary re-renders
  const initializeGame = useCallback(
    () => dispatch(initializeQuizGame()),
    [dispatch]
  );
  const generateQuestion = useCallback(
    (characterId: string) => dispatch(generateQuizQuestion(characterId)),
    [dispatch]
  );
  const startGame = useCallback(() => {
    dispatch(startNewGame());
    dispatch(initializeQuizGame());
  }, [dispatch]);
  const restartGameAction = useCallback(
    () => dispatch(restartGame()),
    [dispatch]
  );
  const submitAnswerAction = useCallback(
    (characterId: string) => dispatch(submitAnswer(characterId)),
    [dispatch]
  );
  const useHintAction = useCallback(() => dispatch(useHint()), [dispatch]);
  const revealAnswerAction = useCallback(
    () => dispatch(revealAnswer()),
    [dispatch]
  );
  const nextQuestionAction = useCallback(
    () => dispatch(nextQuestion()),
    [dispatch]
  );
  const toggleVisibilityAction = useCallback(
    () => dispatch(toggleQuizVisibility()),
    [dispatch]
  );

  const actions = {
    // Game initialization
    initializeGame,
    generateQuestion,

    // Game control
    startGame,
    restartGame: restartGameAction,

    // Question actions
    submitAnswer: submitAnswerAction,
    useHint: useHintAction,
    revealAnswer: revealAnswerAction,
    nextQuestion: nextQuestionAction,

    // Visibility
    toggleVisibility: toggleVisibilityAction,

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
