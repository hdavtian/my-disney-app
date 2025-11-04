import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { QuizGameState, QuizQuestion, QuizAnswer } from "../../types";
import {
  fetchCharacterIds,
  fetchRandomCharacterIds,
  fetchCharactersByIds,
} from "../../utils/quizApi";
import {
  saveGameState,
  loadGameState,
  clearGameState,
  updatePersistentData,
  generateSessionId,
  shuffleArray,
} from "../../utils/quizStorage";

// Async thunks for API calls
export const initializeQuizGame = createAsyncThunk(
  "quiz/initializeGame",
  async (_, { rejectWithValue }) => {
    try {
      const characterIds = await fetchCharacterIds();
      const shuffledIds = shuffleArray(characterIds);
      return shuffledIds;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to initialize game"
      );
    }
  }
);

export const generateQuizQuestion = createAsyncThunk(
  "quiz/generateQuestion",
  async (correctCharacterId: string, { rejectWithValue }) => {
    try {
      // Fetch the correct character and 3 random wrong answers
      const [wrongAnswerIds, characters] = await Promise.all([
        fetchRandomCharacterIds(correctCharacterId, 3),
        fetchCharactersByIds([correctCharacterId]),
      ]);

      const correctCharacter = characters[0];
      const wrongCharacters = await fetchCharactersByIds(wrongAnswerIds);

      // Create the quiz answers
      const allCharacters = [correctCharacter, ...wrongCharacters];
      const shuffledCharacters = shuffleArray(allCharacters);

      const answers: QuizAnswer[] = shuffledCharacters.map(
        (character, index) => ({
          id: `answer-${index}`,
          characterId: character.id,
          characterName: character.name,
          label: ["A", "B", "C", "D"][index] as "A" | "B" | "C" | "D",
          isCorrect: character.id === correctCharacterId,
        })
      );

      const question: QuizQuestion = {
        id: `question-${Date.now()}`,
        correctCharacterId: correctCharacter.id,
        correctCharacterName: correctCharacter.name,
        wrongAnswerIds: wrongCharacters.map((c) => c.id),
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
  streak: { current: 0, best: 0 },
  isGameActive: false,
  isVisible: true,
  isLoading: false,
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

    // Game control
    startNewGame: (state) => {
      state.isGameActive = true;
      state.currentQuestionIndex = 0;
      state.gameHistory = [];
      state.score = { correct: 0, total: 0, percentage: 0 };
      state.streak = { current: 0, best: 0 };
      state.gameStartTime = Date.now();
      state.sessionId = generateSessionId();
      clearGameState();
    },

    restartGame: (state) => {
      // Save final results to persistent storage before restart
      updatePersistentData(state.score, state.streak.best);

      // Reset to initial game state
      Object.assign(state, {
        ...initialState,
        isVisible: state.isVisible, // Preserve visibility setting
        sessionId: generateSessionId(),
      });
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

      if (!selectedAnswer) return;

      // Update current question with user answer
      state.currentQuestion.userAnswer = action.payload;
      state.currentQuestion.isCorrect = selectedAnswer.isCorrect;
      state.questionAnswered = true;

      // Update score
      state.score.total += 1;
      if (selectedAnswer.isCorrect) {
        state.score.correct += 1;
        state.streak.current += 1;
        state.streak.best = Math.max(state.streak.best, state.streak.current);
      } else {
        state.streak.current = 0;
      }

      // Calculate percentage
      state.score.percentage = Math.round(
        (state.score.correct / state.score.total) * 100
      );

      // Add to game history
      state.gameHistory.unshift(state.currentQuestion);
    },

    // Hint system
    useHint: (state) => {
      if (!state.currentQuestion || state.showHint || state.questionAnswered)
        return;

      state.showHint = true;
      state.currentQuestion.hintUsed = true;
    },

    // Show answer
    revealAnswer: (state) => {
      if (!state.currentQuestion || state.questionAnswered) return;

      state.showAnswer = true;
      state.currentQuestion.answerRevealed = true;
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
        state.characterQueue = action.payload;
        state.isGameActive = true;
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
