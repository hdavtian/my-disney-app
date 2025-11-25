# The Guessing Game - Implementation Plan

## 📋 Executive Summary

This document outlines the complete implementation plan for **"The Guessing Game"** - a hint-based Disney trivia game where users guess movie or character names based on progressive hints. The game leverages our existing database tables, hint systems, and relationship data.

### 🎮 New Games Page Architecture

**Important Change:** We're creating a new **"Games"** page to house all interactive games:

- **Location in Menu:** After "Parks", before "About"
- **Layout:** Each game displayed in its own dedicated row
- **Final Games Order:**
  1. **Toon Quiz** (existing) - will be moved from Characters page in Phase 8
  2. **The Guessing Game** (new) - will be implemented first in row 2
  3. **Future games** - placeholder for additional games

**Phased Approach:**

1. **Phase 0:** Create Games page with proper routing and navigation
2. **Phases 1-7:** Build and integrate The Guessing Game
3. **Phase 8:** Move Toon Quiz from Characters page to Games page

This approach keeps us focused on the new game without having to test the old game during migration.

---

## 🎯 Game Overview

**Title:** The Guessing Game

**Concept:** Players receive hints about a Disney movie or character and must guess the correct answer from multiple choices. The difficulty level determines the number of hints shown and the number of answer choices.

**Location:** New dedicated "Games" page (menu position: after Parks, before About)

**Page Structure:** Each game displayed in its own row on the Games page. The Guessing Game will be built and added to row 2 first. The Toon Quiz will remain on the Characters page until Phase 8, when it will be moved to row 1 of the Games page.

---

## 📊 Data Analysis

### Existing Database Tables ✅

We have all the necessary data in place:

1. **`disney_characters.json`** - Character data with IDs, names, images
2. **`disney_movies.json`** - Movie data with IDs, titles, images
3. **`character_hints.json`** - Hints for characters with difficulty levels (1-4) and types (BIO, RELATIONSHIP, PLOT, etc.)
4. **`movie_hints.json`** - Hints for movies with difficulty levels (1-4) and types (TRIVIA, PLOT, BIO, etc.)
5. **`movie_characters_relationships.json`** - Relationships between movies and characters

### Hint Structure Analysis

**Character Hints Sample:**

```json
{
  "character_url_id": "aladdin",
  "hints": [
    {
      "content": "He is a 'diamond in the rough'.",
      "difficulty": 1,
      "hint_type": "BIO"
    },
    {
      "content": "He discovers a magical object in the Cave of Wonders.",
      "difficulty": 2,
      "hint_type": "PLOT"
    }
  ]
}
```

**Movie Hints Sample:**

```json
{
  "movie_url_id": "snow_white_and_the_seven_dwarfs",
  "hints": [
    {
      "content": "It was the first full-length cel-animated feature in motion picture history.",
      "difficulty": 1,
      "hint_type": "TRIVIA"
    },
    {
      "content": "The main character bites a poisoned apple.",
      "difficulty": 1,
      "hint_type": "PLOT"
    }
  ]
}
```

### Difficulty Distribution

- **Difficulty 1:** Easy hints (general info, obvious clues)
- **Difficulty 2:** Medium hints (more specific details)
- **Difficulty 3:** Hard hints (obscure details)
- **Difficulty 4:** Harder hints (very specific trivia)

---

## 🔌 API Analysis

### Existing Endpoints We Can Use ✅

**Character Endpoints:**

- `GET /api/characters/ids` - Get all character IDs for game initialization
- `GET /api/characters/random-except/{excludeId}?count={n}` - Get random wrong answers (already exists!)
- `GET /api/characters/batch?ids={comma-separated}` - Batch fetch characters
- `GET /api/character-hints/{urlId}` - Get all hints for a character
- `GET /api/character-hints/{urlId}/limited?count={n}` - Get limited hints

**Movie Endpoints:**

- `GET /api/movies` - Get all movies
- `GET /api/movies/{id}` - Get single movie
- `GET /api/movies/batch?ids={comma-separated}` - Batch fetch movies
- `GET /api/movie-hints/{urlId}` - Get all hints for a movie
- `GET /api/movie-hints/{urlId}/limited?count={n}` - Get limited hints

### New Endpoints Needed ❌

We need to add the following endpoints to support the game:

#### 1. Movie Random-Except Endpoint

```java
GET /api/movies/random-except/{excludeId}?count={n}
```

Returns random movie IDs excluding the specified ID (same pattern as characters).

#### 2. Movie IDs Endpoint

```java
GET /api/movies/ids
```

Returns all movie IDs for game initialization.

#### 3. Character Hints Random by Difficulty

```java
GET /api/character-hints/{urlId}/random?difficulty={level}&count={n}
```

Returns random hints filtered by difficulty level.

#### 4. Movie Hints Random by Difficulty

```java
GET /api/movie-hints/{urlId}/random?difficulty={level}&count={n}
```

Returns random hints filtered by difficulty level.

#### 5. Game Data Orchestrator Endpoint (Optional but Recommended)

```java
POST /api/guessing-game/initialize
Body: {
  "category": "movies" | "characters" | "mixed",
  "difficulty": "easy" | "medium" | "hard",
  "questions_count": 10 | 20 | 50
}
Response: {
  "session_id": "uuid",
  "questions": [
    {
      "question_id": "uuid",
      "category": "movie" | "character",
      "correct_answer": {
        "id": "snow_white_and_the_seven_dwarfs",
        "name": "Snow White and the Seven Dwarfs",
        "image": "snow_white_1"
      },
      "hints": [
        {
          "content": "It was the first full-length cel-animated feature...",
          "difficulty": 1
        }
      ],
      "wrong_answers": [
        {
          "id": "pinocchio_1940",
          "name": "Pinocchio"
        }
      ]
    }
  ]
}
```

This orchestrator would:

- Generate all questions upfront
- Select correct answers (movies/characters)
- Fetch appropriate hints based on difficulty
- Generate wrong answers
- Return complete game data in one call
- Minimize API calls during gameplay

---

## 🎮 Game Difficulty Modes

### Easy Mode

- **Hints Shown:** 3 random hints with difficulty = 1
- **Answer Choices:** 3 total (2 wrong, 1 correct)
- **Hint Animation:** Gentle fade-in, one at a time, vertically centered
- **Help Options:** Hint button ✅, Show Answer button ✅

### Medium Mode

- **Hints Shown:** 2 random hints with difficulty = 2
- **Answer Choices:** 5 total (4 wrong, 1 correct)
- **Hint Animation:** Gentle fade-in, one at a time, vertically centered
- **Help Options:** Hint button ✅, Show Answer button ✅

### Hard Mode

- **Hints Shown:** 1 random hint with difficulty >= 3 (3 or 4)
- **Answer Choices:** 10 total (9 wrong, 1 correct)
- **Hint Animation:** Single hint, centered
- **Help Options:** No hints ❌, No show answer ❌

---

## 🖥️ Frontend Implementation

### Component Structure

```
frontend/src/
├── pages/
│   └── GamesPage/
│       ├── GamesPage.tsx             # Main games page container
│       ├── GamesPage.scss            # Games page styles
│       └── index.ts                  # Export barrel
├── components/
│   └── GuessingGame/
│       ├── GuessingGame.tsx          # Main game component
│       ├── GuessingGame.scss         # Game styles
│       ├── GuessingGameStart.tsx     # Start screen component
│       ├── GuessingGamePlay.tsx      # Playing screen component
│       ├── GuessingGameComplete.tsx  # Completion screen component
│       └── index.ts                  # Export barrel
├── store/slices/
│   └── guessingGameSlice.ts          # Redux state management
├── hooks/
│   └── useGuessingGame.ts            # Custom hook for game logic
├── types/
│   └── guessingGame.ts               # TypeScript types
└── api/
    └── guessingGameApi.ts            # API client functions
```

### State Management

```typescript
// types/guessingGame.ts
export type GameCategory = "movies" | "characters" | "mixed";
export type GameDifficulty = "easy" | "medium" | "hard";

export interface GuessingGameHint {
  content: string;
  difficulty: number;
  hint_type: string;
}

export interface GuessingGameAnswer {
  id: string;
  url_id: string;
  name: string;
  image?: string;
  is_correct: boolean;
  label: string; // A, B, C, D...
}

export interface GuessingGameQuestion {
  question_id: string;
  category: "movie" | "character";
  correct_answer: GuessingGameAnswer;
  wrong_answers: GuessingGameAnswer[];
  all_answers: GuessingGameAnswer[]; // Shuffled
  hints: GuessingGameHint[];
  hints_shown: number; // Track how many hints displayed
  user_answer?: string;
  is_correct?: boolean;
  hint_used: boolean;
  answer_revealed: boolean;
}

export interface GuessingGameState {
  // Game configuration
  selected_category: GameCategory;
  selected_difficulty: GameDifficulty;
  selected_questions_count: number;

  // Game state
  is_game_active: boolean;
  is_visible: boolean;
  is_loading: boolean;
  error?: string;

  // Game data
  questions: GuessingGameQuestion[];
  current_question_index: number;
  current_question?: GuessingGameQuestion;

  // Progress tracking
  question_answered: boolean;
  show_hint: boolean;
  show_answer: boolean;

  // Statistics
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
  streak: {
    current: number;
    longest: number;
  };
  hints_used: number;
  answers_revealed: number;
  game_history: GuessingGameQuestion[];

  // Session
  session_id?: string;
  game_start_time: number;
}
```

### Redux Slice

```typescript
// store/slices/guessingGameSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  GuessingGameState,
  GameCategory,
  GameDifficulty,
} from "../../types/guessingGame";
import { initializeGame, fetchQuestionData } from "../../api/guessingGameApi";

const initialState: GuessingGameState = {
  selected_category: "mixed",
  selected_difficulty: "medium",
  selected_questions_count: 10,
  is_game_active: false,
  is_visible: true,
  is_loading: false,
  questions: [],
  current_question_index: 0,
  question_answered: false,
  show_hint: false,
  show_answer: false,
  score: { correct: 0, total: 0, percentage: 0 },
  streak: { current: 0, longest: 0 },
  hints_used: 0,
  answers_revealed: 0,
  game_history: [],
  game_start_time: Date.now(),
};

// Async thunks
export const initializeGuessingGame = createAsyncThunk(
  "guessingGame/initialize",
  async (params: {
    category: GameCategory;
    difficulty: GameDifficulty;
    questions_count: number;
  }) => {
    // Call orchestrator endpoint or build questions manually
    const gameData = await initializeGame(params);
    return gameData;
  }
);

const guessingGameSlice = createSlice({
  name: "guessingGame",
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<GameCategory>) => {
      state.selected_category = action.payload;
    },
    setDifficulty: (state, action: PayloadAction<GameDifficulty>) => {
      state.selected_difficulty = action.payload;
    },
    setQuestionsCount: (state, action: PayloadAction<number>) => {
      state.selected_questions_count = action.payload;
    },
    startGame: (state) => {
      state.is_game_active = true;
      state.is_loading = true;
    },
    submitAnswer: (state, action: PayloadAction<string>) => {
      // Handle answer submission
    },
    useHint: (state) => {
      // Reveal one more hint
    },
    revealAnswer: (state) => {
      // Show correct answer
    },
    nextQuestion: (state) => {
      // Move to next question
    },
    restartGame: (state) => {
      // Reset to initial state
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeGuessingGame.pending, (state) => {
        state.is_loading = true;
      })
      .addCase(initializeGuessingGame.fulfilled, (state, action) => {
        state.is_loading = false;
        state.questions = action.payload.questions;
        state.session_id = action.payload.session_id;
        state.current_question = state.questions[0];
      })
      .addCase(initializeGuessingGame.rejected, (state, action) => {
        state.is_loading = false;
        state.error = action.error.message;
      });
  },
});
```

---

## 🎨 UI Design Specifications

### Start Screen Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌──────────────────┬───────────────────────────────────┐   │
│  │                  │                                   │   │
│  │   35x35 Grid     │  Ready to test your Disney        │   │
│  │   of Random      │  knowledge? ℹ️                     │   │
│  │   Movie Images   │                                   │   │
│  │                  │  Choose your questions:           │   │
│  │  "The Guessing   │  [10] [20] [50]                   │   │
│  │      Game"       │                                   │   │
│  │   (overlayed)    │  Difficulty level:                │   │
│  │                  │  [Easy] [Medium] [Hard]           │   │
│  │                  │                                   │   │
│  │                  │  Category:                        │   │
│  │                  │  [Movies] [Characters] [Mixed]    │   │
│  │                  │                                   │   │
│  │                  │  [🎮 Start Game]                  │   │
│  └──────────────────┴───────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Left Column:**

- Tight 35x35 grid of random movie background images
- No gaps or spacing between images
- Title "The Guessing Game" overlayed on top (similar to Toon Quiz)
- Images slightly dimmed for title readability

**Right Column:**

- Title: "Ready to test your Disney knowledge?" with info icon (ℹ️)
- Info icon opens modal explaining game modes (similar to Character Quiz)
- Question count selector: 10, 20, 50 (same button styling as Toon Quiz)
- Difficulty selector: Easy, Medium, Hard
- Category selector: Movies, Characters, Mixed
- Start button

### Game Screen Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ✓ ✓ ✗ ✓                              Question 5 of 10     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┬───────────────────────────────────┐   │
│  │                  │                                   │   │
│  │   HINTS          │   ANSWER CHOICES                  │   │
│  │   COLUMN         │   & BUTTONS                       │   │
│  │                  │                                   │   │
│  │  "Hint 1..."     │   A) Snow White                   │   │
│  │                  │   B) Cinderella                   │   │
│  │  "Hint 2..."     │   C) Aurora                       │   │
│  │                  │                                   │   │
│  │  "Hint 3..."     │   💡 Hint  👁️ Show Answer         │   │
│  │                  │   [Submit Answer]                 │   │
│  │                  │                                   │   │
│  └──────────────────┴───────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Top Row (Score Keeper):**

- Left side: Check marks (✓) for correct answers, X marks (✗) for wrong answers
- Right side: "Question X of Y" - padded from edge

**Left Column (Hints):**

- Displays hints based on difficulty mode
- Hints animate in gently one at a time
- Centered horizontally and vertically as a group
- Each hint on its own line

**Right Column (Answers & Controls):**

- Answer buttons labeled A), B), C), etc.
- For easy mode: 3 answers
- For medium mode: 5 answers
- For hard mode: 10 answers (in two columns on desktop)
- Hint button (if available for difficulty)
- Show Answer button (if available for difficulty)
- Submit Answer button (appears after selection)

---

## 🔨 Implementation Phases

### Phase 0: Games Page Setup 🎮

**Tasks:**

1. ✅ Create new `GamesPage` component (`frontend/src/pages/GamesPage/`)
2. ✅ Create `GamesPage.tsx` with thematic styling matching the rest of the site
3. ✅ Create `GamesPage.scss` with responsive design
4. ✅ Add route for `/games` page
5. ✅ Add "Games" to navigation menu (after Parks, before About)
6. ✅ Create row-based layout for games (each game in its own row)
7. ✅ Add page header and introduction
8. ✅ Test routing and navigation
9. ⚠️ Leave row 1 placeholder for Toon Quiz (to be moved in Phase 8)
10. ✅ Add Guessing Game to row 2

**Files to Create:**

- `frontend/src/pages/GamesPage/GamesPage.tsx`
- `frontend/src/pages/GamesPage/GamesPage.scss`
- `frontend/src/pages/GamesPage/index.ts`

**Files to Modify:**

- `frontend/src/App.tsx` - Add route
- Navigation component - Add Games menu item

**Games Page Layout:**

```
┌────────────────────────────────────────────────────────┐
│                    Games Page Header                   │
│              Test Your Disney Knowledge!               │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │         The Guessing Game (Row 1)                │ │
│  │  [Game component will be embedded here]          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │         Toon Quiz (Row 2)                        │ │
│  │  [Will be moved here in later phase]             │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │         Future Game (Row 3)                      │ │
│  │  [Placeholder for future games]                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Phase 1: Backend API Development ✅

**Tasks:**

1. ✅ Add `GET /api/movies/ids` endpoint
2. ✅ Add `GET /api/movies/random-except/{excludeId}?count={n}` endpoint
3. ✅ Add `GET /api/character-hints/{urlId}/random?difficulty={level}&count={n}` endpoint
4. ✅ Add `GET /api/movie-hints/{urlId}/random?difficulty={level}&count={n}` endpoint
5. ⚠️ (Optional) Add `POST /api/guessing-game/initialize` orchestrator endpoint
6. ✅ Test all endpoints with cURL
7. ✅ Verify snake_case responses

**Backend Files to Create/Modify:**

- `MovieController.java` - Add new movie endpoints
- `MovieService.java` - Add service methods
- `CharacterHintController.java` - Add random by difficulty endpoint
- `MovieHintController.java` - Add random by difficulty endpoint
- `CharacterHintService.java` - Add service methods
- `MovieHintService.java` - Add service methods
- (Optional) `GuessingGameController.java` - Orchestrator endpoint
- (Optional) `GuessingGameService.java` - Orchestrator service

### Phase 2: Frontend Types & API Client 📝

**Tasks:**

1. Create TypeScript types (`types/guessingGame.ts`)
2. Create API client functions (`api/guessingGameApi.ts`)
3. Create Redux slice (`store/slices/guessingGameSlice.ts`)
4. Create custom hook (`hooks/useGuessingGame.ts`)

### Phase 3: Start Screen Component 🎬

**Tasks:**

1. Create `GuessingGameStart.tsx` component
2. Create start screen styles in `GuessingGame.scss`
3. Implement 35x35 grid background with random movie images
4. Implement game options (questions, difficulty, category)
5. Implement info modal (similar to Toon Quiz)
6. Add responsive design

### Phase 4: Game Play Component 🎮

**Tasks:**

1. Create `GuessingGamePlay.tsx` component
2. Implement top score keeper row
3. Implement hints column with animations
4. Implement answers column with button labeling
5. Implement hint/show answer/submit logic
6. Add answer selection and submission
7. Add keyboard support (A, B, C, D keys)
8. Add responsive design (two-column layout for 10 answers on desktop)

### Phase 5: Game Completion & Statistics 📊

**Tasks:**

1. Create `GuessingGameComplete.tsx` component
2. Implement final score display
3. Implement game history/stats
4. Add restart functionality
5. Add share/results options (optional)

### Phase 6: Integration & Testing 🧪

**Tasks:**

1. ✅ Integrate game into GamesPage (already done in Phase 0)
2. ✅ Test game displays correctly in Games page row
3. ✅ Test all difficulty modes
4. ✅ Test all categories (movies, characters, mixed)
5. ✅ Test different question counts
6. ✅ Test responsive design on all screen sizes
7. ✅ Fix any bugs

### Phase 7: Polish & Optimization ✨

**Tasks:**

1. ✅ Refine animations and transitions
2. ✅ Optimize API calls
3. ✅ Add loading states
4. ✅ Add error handling
5. ✅ Add accessibility features (ARIA labels)
6. ✅ Performance testing
7. ✅ Final bug fixes

### Phase 8: Move Toon Quiz to Games Page 🎯

**Tasks:**

1. ⚠️ Remove Toon Quiz from CharactersPage component
2. ⚠️ Add Toon Quiz to GamesPage as FIRST row (row 1)
3. ⚠️ Update any imports/references
4. ⚠️ Test Toon Quiz works correctly in new location
5. ⚠️ Verify Characters page still works without Toon Quiz
6. ⚠️ Update any documentation mentioning Toon Quiz location
7. ⚠️ Clean up unused code/imports from CharactersPage

**Files to Modify:**

- `frontend/src/pages/CharactersPage/CharactersPage.tsx` - Remove Toon Quiz
- `frontend/src/pages/GamesPage/GamesPage.tsx` - Add Toon Quiz
- Any other files referencing Toon Quiz location

**Note:** This phase happens AFTER The Guessing Game is complete and tested. This keeps us focused and avoids testing the old game while it's being moved.

---

## 📝 Testing Checklist

### Backend Testing

- [ ] Movie IDs endpoint returns correct data
- [ ] Movie random-except endpoint excludes correct ID
- [ ] Character hints random by difficulty filters correctly
- [ ] Movie hints random by difficulty filters correctly
- [ ] Orchestrator endpoint (if implemented) returns complete game data
- [ ] All responses use snake_case
- [ ] Error handling works correctly

### Frontend Testing

- [ ] Start screen displays correctly on all screen sizes
- [ ] Game options work correctly
- [ ] Info modal displays and closes properly
- [ ] Game initializes with correct data
- [ ] Hints display correctly for each difficulty
- [ ] Hints animate in properly
- [ ] Answer choices display correctly
- [ ] Answer selection works
- [ ] Submit answer validates correctly
- [ ] Score tracking works
- [ ] Hint button works (when available)
- [ ] Show answer button works (when available)
- [ ] Next question navigation works
- [ ] Game completion displays correctly
- [ ] Restart game works
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Keyboard shortcuts work
- [ ] Accessibility features work

### Game Logic Testing

- [ ] Easy mode: 3 hints (difficulty 1), 3 answer choices
- [ ] Medium mode: 2 hints (difficulty 2), 5 answer choices
- [ ] Hard mode: 1 hint (difficulty 3+), 10 answer choices
- [ ] Categories: movies, characters, mixed work correctly
- [ ] Question counts: 10, 20, 50 work correctly
- [ ] Score calculation is accurate
- [ ] Streak tracking works
- [ ] Game history records correctly

---

## 🚀 Launch Checklist

- [ ] All phases completed
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Responsive design verified
- [ ] Accessibility verified
- [ ] Cross-browser testing completed
- [ ] Documentation updated
- [ ] User testing completed
- [ ] Final code review
- [ ] Ready for production!

---

## 📌 Important Notes

### Snake Case Convention

**CRITICAL:** All API responses MUST use snake_case (not camelCase). The frontend should also use snake_case for consistency. This avoids bugs from case conversion.

Examples:

```typescript
// ✅ CORRECT
interface GuessingGameQuestion {
  question_id: string;
  correct_answer: Answer;
  wrong_answers: Answer[];
}

// ❌ WRONG
interface GuessingGameQuestion {
  questionId: string;
  correctAnswer: Answer;
  wrongAnswers: Answer[];
}
```

### Reusing Toon Quiz Patterns

We should analyze and reuse patterns from the existing Character Quiz (`CharacterQuiz.tsx`):

- Button styling and interactions
- Modal implementation for info/instructions
- Animation patterns
- Score tracking UI
- Game state management patterns
- Responsive design patterns

### Build & Restart Commands

- Backend compilation: `mvn compile` (you run in IntelliJ)
- Frontend dev server: `npm run dev` (Vite)
- When to restart: After any Java file changes

---

## 🎯 Success Criteria

The game is considered complete when:

1. All three difficulty modes work correctly
2. All three categories (movies, characters, mixed) work correctly
3. All question counts (10, 20, 50) work correctly
4. Hints display and animate correctly
5. Answer selection and submission work flawlessly
6. Score tracking is accurate
7. Game is fully responsive
8. No bugs in normal gameplay
9. Performance is smooth
10. User experience is polished and enjoyable

---

**Document Status:** ✅ APPROVED & READY FOR IMPLEMENTATION

## 🎯 All Clarifications Confirmed

### Hint Button

- Eliminates/highlights one wrong answer (like Toon Quiz)
- Available in Easy & Medium only

### Show Answer

- Highlights correct answer
- Counts as wrong in score
- Tracks in `answers_revealed` stat

### Mixed Mode Distribution

- Equal 50/50 split
- Alternating pattern: Movie, Character, Movie, Character...
- First question is always a movie

### Hint Animations

- Fast fade-in, one at a time (0.5s delay)
- No skip button needed

### Game Visibility

- Yes, has show/hide button like Toon Quiz
- Uses `is_visible` state property

### Navigation

- Located at: `frontend/src/components/Navigation/Navigation.tsx`
- Add "Games" after "Parks & Attractions"

### Grid Background

- 6x6 grid (36 random movie images)
- Can repeat images
- No gaps, title overlayed

### Error Handling

- Insufficient hints → Use random hints (any difficulty)
- API failures → Generic error message
- Graceful degradation throughout

**Next Steps:**

1. ✅ Document reviewed and approved
2. **Phase 0:** Create Games Page with navigation →
3. **Phase 1:** Implement Backend APIs →
4. Test endpoints →
5. **Phases 2-7:** Build The Guessing Game →
6. **Phase 8:** Move Toon Quiz to Games page

---

## 📊 Implementation Timeline

```
Phase 0: Games Page Setup (NEW)
   ↓
Phase 1: Backend API Development
   ↓
Phase 2: Frontend Types & API Client
   ↓
Phase 3: Start Screen Component
   ↓
Phase 4: Game Play Component
   ↓
Phase 5: Game Completion & Statistics
   ↓
Phase 6: Integration & Testing
   ↓
Phase 7: Polish & Optimization
   ↓
Phase 8: Move Toon Quiz to Games Page
   ↓
🎉 LAUNCH!
```

---

## 🎯 Games Page Structure (Final)

```
Navigation: Home | Characters | Movies | Parks | ✨ GAMES ✨ | About

┌─────────────────────────────────────────────────────────────┐
│                     🎮 Games Page 🎮                        │
│              Test Your Disney Knowledge!                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Row 1: Toon Quiz (Character Quiz)                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [Existing Toon Quiz - moved from Characters in Phase 8]│ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Row 2: The Guessing Game                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [Complete Guessing Game Component - built in Phases 1-7]│ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Row 3: Future Game Placeholder                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [Coming Soon...]                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
