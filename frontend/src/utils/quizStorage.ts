import { QuizGameState, QuizPersistentData, QuizScore } from "../types/Quiz";

// Storage keys for localStorage
const STORAGE_KEYS = {
  CURRENT_GAME: "disney-quiz-current-game",
  PERSISTENT_DATA: "disney-quiz-persistent-data",
  SETTINGS: "disney-quiz-settings",
} as const;

/**
 * Save current game state to localStorage
 */
export const saveGameState = (gameState: QuizGameState): void => {
  try {
    const dataToSave = {
      ...gameState,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(dataToSave));
  } catch (error) {
    console.warn("Failed to save quiz game state to localStorage:", error);
  }
};

/**
 * Load current game state from localStorage
 */
export const loadGameState = (): Partial<QuizGameState> | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    if (!saved) return null;

    const data = JSON.parse(saved);

    // Check if the saved game is too old (older than 24 hours)
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (data.timestamp && Date.now() - data.timestamp > twentyFourHours) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Failed to load quiz game state from localStorage:", error);
    return null;
  }
};

/**
 * Clear current game state (for restart)
 */
export const clearGameState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
  } catch (error) {
    console.warn("Failed to clear quiz game state:", error);
  }
};

/**
 * Save persistent data (scores, preferences) to localStorage
 */
export const savePersistentData = (data: QuizPersistentData): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PERSISTENT_DATA, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save quiz persistent data to localStorage:", error);
  }
};

/**
 * Load persistent data from localStorage
 */
export const loadPersistentData = (): QuizPersistentData => {
  const defaultData: QuizPersistentData = {
    allTimeScore: { correct: 0, total: 0, percentage: 0 },
    longestStreak: 0,
    gamesPlayed: 0,
    preferences: {
      isVisible: true,
    },
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PERSISTENT_DATA);
    if (!saved) return defaultData;

    const data = JSON.parse(saved);
    return { ...defaultData, ...data };
  } catch (error) {
    console.warn(
      "Failed to load quiz persistent data from localStorage:",
      error
    );
    return defaultData;
  }
};

/**
 * Update persistent data with new game results
 */
export const updatePersistentData = (
  currentScore: QuizScore,
  currentLongestStreak: number
): QuizPersistentData => {
  const existing = loadPersistentData();

  const updatedData: QuizPersistentData = {
    ...existing,
    allTimeScore: {
      correct: existing.allTimeScore.correct + currentScore.correct,
      total: existing.allTimeScore.total + currentScore.total,
      percentage: 0, // Will be calculated below
    },
    longestStreak: Math.max(existing.longestStreak, currentLongestStreak),
    gamesPlayed: existing.gamesPlayed + 1,
  };

  // Calculate all-time percentage
  updatedData.allTimeScore.percentage =
    updatedData.allTimeScore.total > 0
      ? Math.round(
          (updatedData.allTimeScore.correct / updatedData.allTimeScore.total) *
            100
        )
      : 0;

  savePersistentData(updatedData);
  return updatedData;
};

/**
 * Save user preferences
 */
export const saveQuizSettings = (isVisible: boolean): void => {
  try {
    const settings = { isVisible };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.warn("Failed to save quiz settings:", error);
  }
};

/**
 * Load user preferences
 */
export const loadQuizSettings = (): { isVisible: boolean } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!saved) return { isVisible: true };

    return JSON.parse(saved);
  } catch (error) {
    console.warn("Failed to load quiz settings:", error);
    return { isVisible: true };
  }
};

/**
 * Generate a unique session ID for the game
 */
export const generateSessionId = (): string => {
  return `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
