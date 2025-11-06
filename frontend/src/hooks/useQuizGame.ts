import { useCallback } from "react";
import { useAppSelector, useAppDispatch } from "./redux";
import {
  initializeQuizGame,
  generateQuizQuestion,
  toggleQuizVisibility,
  setQuestionsCount,
  setDifficulty,
  loadPreferences,
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
    (questionsCount?: number) =>
      dispatch(
        initializeQuizGame(questionsCount || quizState.selectedQuestionsCount)
      ),
    [dispatch, quizState.selectedQuestionsCount]
  );
  const generateQuestion = useCallback(
    (characterId: string) =>
      dispatch(
        generateQuizQuestion({
          correctCharacterId: characterId,
          difficulty: quizState.selectedDifficulty,
        })
      ),
    [dispatch, quizState.selectedDifficulty]
  );
  const startGame = useCallback(async () => {
    dispatch(startNewGame());
    const result = await dispatch(
      initializeQuizGame(quizState.selectedQuestionsCount)
    );
    // If initialization was successful, generate first question
    if (initializeQuizGame.fulfilled.match(result)) {
      const firstCharacterId = result.payload.characterQueue[0];
      if (firstCharacterId) {
        dispatch(
          generateQuizQuestion({
            correctCharacterId: firstCharacterId.toString(),
            difficulty: quizState.selectedDifficulty,
          })
        );
      }
    }
  }, [
    dispatch,
    quizState.selectedQuestionsCount,
    quizState.selectedDifficulty,
  ]);
  const setQuestionCountAction = useCallback(
    (count: number) => dispatch(setQuestionsCount(count)),
    [dispatch]
  );
  const setDifficultyAction = useCallback(
    (difficulty: "easy" | "medium" | "hard") =>
      dispatch(setDifficulty(difficulty)),
    [dispatch]
  );
  const loadPreferencesAction = useCallback(
    () => dispatch(loadPreferences()),
    [dispatch]
  );
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

    // Game preferences
    setQuestionsCount: setQuestionCountAction,
    setDifficulty: setDifficultyAction,
    loadPreferences: loadPreferencesAction, // Question actions
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
    selectedQuestionsCount: quizState.selectedQuestionsCount,
    selectedDifficulty: quizState.selectedDifficulty,
    score: quizState.score,
    streak: quizState.streak,
    hintsUsed: quizState.hintsUsed,
    answersRevealed: quizState.answersRevealed,
    currentQuestion: quizState.currentQuestion,
    gameHistory: quizState.gameHistory,
    hasCharacters: quizState.characterQueue.length > 0,
    questionsRemaining:
      quizState.selectedQuestionsCount - quizState.currentQuestionIndex - 1,
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
