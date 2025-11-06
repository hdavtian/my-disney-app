import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  QuizGameState,
  QuizQuestion,
  QuizAnswer,
  DifficultyMode,
  DifficultyConfig,
} from "../../types";
import {
  fetchCharacterIds,
  fetchRandomCharacterIds,
  fetchCharactersByIds,
  fetchCharacterById,
} from "../../utils/quizApiCached";
import {
  saveGameState,
  loadGameState,
  clearGameState,
  updatePersistentData,
  loadPersistentData,
  saveQuestionsCount,
  saveDifficulty,
  generateSessionId,
  shuffleArray,
} from "../../utils/quizStorage";

// Difficulty configurations
export const DIFFICULTY_CONFIGS: Record<DifficultyMode, DifficultyConfig> = {
  easy: {
    mode: "easy",
    answerChoices: 2,
    showHints: true,
    showRevealAnswer: true,
    description: "2 choices, hints and show answer available",
  },
  medium: {
    mode: "medium",
    answerChoices: 5,
    showHints: true,
    showRevealAnswer: true,
    description: "5 choices, hints and show answer available",
  },
  hard: {
    mode: "hard",
    answerChoices: 10,
    showHints: false,
    showRevealAnswer: false,
    description: "10 choices, no hints or show answer",
  },
  harder: {
    mode: "harder",
    answerChoices: 10,
    showHints: false,
    showRevealAnswer: false,
    description: "10 choices, 3-second timed image, no hints or show answer",
  },
};

// Helper function to get answer choice labels
function getAnswerLabels(count: number): string[] {
  const labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  return labels.slice(0, count);
}

// Async thunks for API calls
export const initializeQuizGame = createAsyncThunk(
  "quiz/initializeGame",
  async (questionsCount: number = 10, { rejectWithValue }) => {
    try {
      const characterIds = await fetchCharacterIds();
      const shuffledIds = shuffleArray(characterIds);
      const selectedIds = shuffledIds.slice(0, questionsCount);

      // Validate that all selected character IDs actually exist
      const validatedIds = [];
      for (const id of selectedIds) {
        try {
          await fetchCharacterById(id);
          validatedIds.push(id);
        } catch (error) {
          console.warn(`Skipping invalid character ID: ${id}`);
        }
      }

      if (validatedIds.length < questionsCount) {
        console.warn(
          `Only found ${validatedIds.length} valid characters out of ${questionsCount} requested`
        );
      }

      return {
        characterQueue: validatedIds,
        questionsCount: validatedIds.length,
      };
    } catch (error) {
      console.error(`❌ Quiz initialization failed:`, error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to initialize game"
      );
    }
  }
);

export const generateQuizQuestion = createAsyncThunk(
  "quiz/generateQuestion",
  async (
    params: { correctCharacterId: string; difficulty: DifficultyMode },
    { rejectWithValue }
  ) => {
    try {
      const { correctCharacterId, difficulty } = params;
      const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
      const wrongAnswersCount = difficultyConfig.answerChoices - 1; // Subtract 1 for correct answer

      // Fetch the correct character and wrong answers based on difficulty
      const [wrongAnswerIds, characters] = await Promise.all([
        fetchRandomCharacterIds(correctCharacterId, wrongAnswersCount),
        fetchCharactersByIds([correctCharacterId]),
      ]);

      const correctCharacter = characters[0];
      if (!correctCharacter) {
        throw new Error(
          `Correct character with ID ${correctCharacterId} not found`
        );
      }

      const wrongCharacters = await fetchCharactersByIds(wrongAnswerIds);
      if (wrongCharacters.length !== wrongAnswersCount) {
        throw new Error(
          `Expected ${wrongAnswersCount} wrong characters, got ${wrongCharacters.length}`
        );
      }

      // Create the quiz answers
      const allCharacters = [correctCharacter, ...wrongCharacters];
      const shuffledCharacters = shuffleArray(allCharacters);
      const answerLabels = getAnswerLabels(difficultyConfig.answerChoices);

      const answers: QuizAnswer[] = shuffledCharacters.map(
        (character, index) => ({
          id: `answer-${index}`,
          characterId: String(character.id), // Ensure string conversion
          characterName: character.name,
          label: answerLabels[index],
          isCorrect: String(character.id) === String(correctCharacterId), // Ensure both are strings
        })
      );

      console.log("=== GENERATE QUESTION DEBUG ===");
      console.log(
        "Correct character ID:",
        correctCharacterId,
        "type:",
        typeof correctCharacterId
      );
      console.log("Generated answers:", answers);
      console.log(
        "Correct answers:",
        answers.filter((a) => a.isCorrect)
      );

      const question: QuizQuestion = {
        id: `question-${Date.now()}`,
        correctCharacterId: String(correctCharacter.id), // Ensure string conversion
        correctCharacterName: correctCharacter.name,
        wrongAnswerIds: wrongCharacters.map((c) => String(c.id)), // Ensure string conversion
        wrongAnswerNames: wrongCharacters.map((c) => c.name),
        allAnswers: answers,
        hintUsed: false,
        answerRevealed: false,
        timestamp: Date.now(),
      };

      return { question, correctCharacter };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to generate question"
      );
    }
  }
);

// Initial state
const initialState: QuizGameState = {
  characterQueue: [],
  currentQuestionIndex: 0,
  gameHistory: [],
  score: { correct: 0, total: 0, percentage: 0 },
  streak: { current: 0, longest: 0 },
  hintsUsed: 0,
  answersRevealed: 0,
  isGameActive: false,
  isVisible: true,
  isLoading: false,
  selectedQuestionsCount: 10,
  selectedDifficulty: "medium",
  showHint: false,
  showAnswer: false,
  questionAnswered: false,
  gameStartTime: Date.now(),
  lastPlayedTime: Date.now(),
  sessionId: generateSessionId(),
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    // Game visibility
    toggleQuizVisibility: (state) => {
      state.isVisible = !state.isVisible;
    },
    setQuizVisibility: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },

    // Game preferences
    setQuestionsCount: (state, action: PayloadAction<number>) => {
      state.selectedQuestionsCount = action.payload;
      saveQuestionsCount(action.payload);
    },

    setDifficulty: (state, action: PayloadAction<DifficultyMode>) => {
      state.selectedDifficulty = action.payload;
      saveDifficulty(action.payload);
    },

    loadPreferences: (state) => {
      const persistentData = loadPersistentData();
      state.selectedQuestionsCount = persistentData.preferences.questionsCount;
      state.selectedDifficulty = persistentData.preferences.difficulty;
      state.isVisible = persistentData.preferences.isVisible;
    },

    // Game control
    startNewGame: (state) => {
      state.isGameActive = true;
      state.currentQuestionIndex = 0;
      state.gameHistory = [];
      state.score = { correct: 0, total: 0, percentage: 0 };
      state.streak = { current: 0, longest: 0 };
      state.hintsUsed = 0;
      state.answersRevealed = 0;
      state.gameStartTime = Date.now();
      state.sessionId = generateSessionId();
      state.isLoading = true; // Will be handled by initializeQuizGame
      clearGameState();
    },

    restartGame: (state) => {
      // Save final results to persistent storage before restart
      updatePersistentData(state.score, state.streak.longest);

      // Reset to initial game state but keep visibility
      const currentVisibility = state.isVisible;
      Object.assign(state, {
        ...initialState,
        isVisible: currentVisibility,
        sessionId: generateSessionId(),
        isGameActive: false, // Will be set to true by startNewGame
        characterQueue: [], // Clear the queue
        currentQuestion: undefined, // Clear current question
        currentQuestionIndex: 0,
      });
      clearGameState();
    },

    // Question management
    setCurrentQuestion: (state, action: PayloadAction<QuizQuestion>) => {
      state.currentQuestion = action.payload;
      state.questionAnswered = false;
      state.showHint = false;
      state.showAnswer = false;
    },

    // Answer handling
    submitAnswer: (state, action: PayloadAction<string>) => {
      if (!state.currentQuestion || state.questionAnswered) return;

      const selectedAnswer = state.currentQuestion.allAnswers.find(
        (answer) => answer.characterId === action.payload
      );

      if (!selectedAnswer) {
        console.error(
          "Selected answer not found:",
          action.payload,
          state.currentQuestion.allAnswers
        );
        return;
      }

      // Update current question with user answer
      state.currentQuestion.userAnswer = action.payload;
      state.currentQuestion.isCorrect = selectedAnswer.isCorrect;
      state.questionAnswered = true;

      // Update score
      state.score.total += 1;
      if (selectedAnswer.isCorrect) {
        state.score.correct += 1;
        state.streak.current += 1;
        state.streak.longest = Math.max(
          state.streak.longest,
          state.streak.current
        );
      } else {
        state.streak.current = 0;
      }

      // Calculate percentage
      state.score.percentage = Math.round(
        (state.score.correct / state.score.total) * 100
      );

      // Add to game history (create copy to avoid reference issues)
      state.gameHistory.unshift({ ...state.currentQuestion });
    },

    // Hint system
    useHint: (state) => {
      if (!state.currentQuestion || state.showHint || state.questionAnswered)
        return;

      state.showHint = true;
      state.currentQuestion.hintUsed = true;

      // Track hint usage statistic
      state.hintsUsed += 1;
    },

    // Show answer
    revealAnswer: (state) => {
      if (!state.currentQuestion || state.questionAnswered) return;

      state.showAnswer = true;
      state.currentQuestion.answerRevealed = true;
      state.questionAnswered = true;

      // Track revealed answer statistic
      state.answersRevealed += 1;

      // Add to history with no score change (answer revealed, not answered)
      state.gameHistory.unshift({ ...state.currentQuestion });

      // Keep the total score same since this wasn't answered
      state.score.total += 1;
      state.score.percentage =
        state.score.total > 0
          ? Math.round((state.score.correct / state.score.total) * 100)
          : 0;

      // Reset streak when answer is revealed without answering (breaks streak)
      state.streak.current = 0;
    },

    // Navigation
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.characterQueue.length - 1) {
        state.currentQuestionIndex += 1;
      }
      state.questionAnswered = false;
      state.showHint = false;
      state.showAnswer = false;
    },

    // Load saved state
    loadSavedState: (state) => {
      const savedState = loadGameState();
      if (savedState) {
        Object.assign(state, savedState);
      }
    },

    // Persistence
    saveCurrentState: (state) => {
      state.lastPlayedTime = Date.now();
      saveGameState(state);
    },
  },

  extraReducers: (builder) => {
    // Initialize game
    builder
      .addCase(initializeQuizGame.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(initializeQuizGame.fulfilled, (state, action) => {
        state.isLoading = false;
        state.characterQueue = action.payload.characterQueue;
        state.selectedQuestionsCount = action.payload.questionsCount;
        state.isGameActive = true;
        state.currentQuestionIndex = 0;
        // First question will be generated by the component effect
      })
      .addCase(initializeQuizGame.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isGameActive = false;
      });

    // Generate question
    builder
      .addCase(generateQuizQuestion.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(generateQuizQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuestion = action.payload.question;
        state.questionAnswered = false;
        state.showHint = false;
        state.showAnswer = false;
      })
      .addCase(generateQuizQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  toggleQuizVisibility,
  setQuizVisibility,
  setQuestionsCount,
  setDifficulty,
  loadPreferences,
  startNewGame,
  restartGame,
  setCurrentQuestion,
  submitAnswer,
  useHint,
  revealAnswer,
  nextQuestion,
  loadSavedState,
  saveCurrentState,
} = quizSlice.actions;

export default quizSlice.reducer;
