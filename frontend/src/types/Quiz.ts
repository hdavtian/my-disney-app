export interface QuizQuestion {
  id: string;
  correctCharacterId: string;
  correctCharacterName: string;
  wrongAnswerIds: string[];
  wrongAnswerNames: string[];
  allAnswers: QuizAnswer[];
  userAnswer?: string;
  isCorrect?: boolean;
  hintUsed: boolean;
  answerRevealed: boolean;
  timestamp: number;
}

export interface QuizAnswer {
  id: string;
  characterId: string;
  characterName: string;
  label: "A" | "B" | "C" | "D";
  isCorrect: boolean;
}

export interface QuizScore {
  correct: number;
  total: number;
  percentage: number;
}

export interface QuizStreak {
  current: number;
  longest: number;
}

export interface QuizGameState {
  // Game session data
  characterQueue: string[]; // Shuffled character IDs for questions
  currentQuestionIndex: number; // Current position in queue
  currentQuestion?: QuizQuestion; // Current active question
  gameHistory: QuizQuestion[]; // Past questions with user answers

  // Scoring
  score: QuizScore;
  streak: QuizStreak;

  // Game statistics
  hintsUsed: number;
  answersRevealed: number;

  // Game state
  isGameActive: boolean;
  isVisible: boolean; // Show/hide toggle state
  isLoading: boolean;
  error?: string;

  // Current question state
  showHint: boolean; // Per-question hint usage
  showAnswer: boolean; // Answer revealed state
  questionAnswered: boolean; // Current question completed

  // Persistence
  gameStartTime: number;
  lastPlayedTime: number;
  sessionId: string;
}

export interface QuizPersistentData {
  // Historical data to persist across sessions
  allTimeScore: QuizScore;
  longestStreak: number;
  gamesPlayed: number;
  lastSessionId?: string;
  preferences: {
    isVisible: boolean;
  };
}

export interface QuizApiResponse {
  characterIds?: string[];
  randomIds?: string[];
  character?: {
    id: string;
    name: string;
    profile_image1?: string;
  };
}
