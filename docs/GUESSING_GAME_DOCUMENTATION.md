# The Guessing Game - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [User Guide](#user-guide)
3. [Technical Architecture](#technical-architecture)
4. [API Documentation](#api-documentation)
5. [State Management](#state-management)
6. [Performance Optimization](#performance-optimization)
7. [Developer Guide](#developer-guide)
8. [Testing](#testing)
9. [Future Enhancements](#future-enhancements)

---

## Overview

**The Guessing Game** is a hint-based trivia game where players identify Disney movies or characters based on progressive clues. The game features three difficulty levels, customizable question counts, and supports both movies and characters (or a mixed mode).

### Key Features

- ✅ **Hint-based gameplay** - Progressive clues reveal information about the answer
- ✅ **Three difficulty levels** - Easy (4 choices, 3 hints), Medium (6 choices, 2 hints), Hard (8 choices, 1 hint)
- ✅ **Three categories** - Movies, Characters, or Mixed
- ✅ **Customizable question count** - 5, 10, or 15 questions
- ✅ **State persistence** - Game progress saved across browser sessions (7-day expiration)
- ✅ **Performance optimized** - Batch API calls reduce requests from 30 to 2-3 per game
- ✅ **Responsive design** - Works seamlessly on mobile, tablet, and desktop
- ✅ **Accessibility** - Full ARIA support, keyboard navigation, screen reader friendly
- ✅ **Animations** - Smooth transitions using Framer Motion
- ✅ **Perfect score celebration** - Confetti animation for 100% accuracy

---

## User Guide

### How to Play

1. **Start the Game**

   - Navigate to the Games page
   - Click "Start Game" on The Guessing Game card
   - Configure your settings:
     - **Category**: Movies, Characters, or Mixed
     - **Difficulty**: Easy, Medium, or Hard
     - **Questions**: 5, 10, or 15
   - Click "Start Game"

2. **During Gameplay**

   - Read the hints provided (number varies by difficulty)
   - Click on an answer choice to select it
   - Click "Submit Answer" to lock in your selection
   - Use the "Hint" button to eliminate one wrong answer (optional)
   - Use the "Show Answer" button to reveal the correct answer (counts as correct but tracked separately)
   - Click "Next Question" to proceed

3. **Game Completion**
   - View your final score and accuracy percentage
   - Review all questions with correct/incorrect indicators
   - See statistics: hints used, answers revealed
   - Choose to "Play Again" or "Return to Start"

### Scoring System

- **Correct answer** (manual selection): +1 point
- **Show answer** (revealed): +1 point (tracked separately in statistics)
- **Incorrect answer**: 0 points
- **Accuracy**: Calculated as (correct answers / total questions) × 100%
- **Perfect score**: 100% accuracy triggers confetti celebration

### Difficulty Breakdown

| Difficulty | Answer Choices | Initial Hints | Hint Button Effect        |
| ---------- | -------------- | ------------- | ------------------------- |
| Easy       | 4              | 3             | Eliminates 1 wrong answer |
| Medium     | 6              | 2             | Eliminates 1 wrong answer |
| Hard       | 8              | 1             | Eliminates 1 wrong answer |

---

## Technical Architecture

### Component Structure

```
GuessingGame/
├── GuessingGameStart/          # Game setup screen
│   ├── GuessingGameStart.tsx
│   └── GuessingGameStart.scss
├── GuessingGamePlay/           # Main gameplay component
│   ├── GuessingGamePlay.tsx
│   └── GuessingGamePlay.scss
├── GuessingGameComplete/       # Results screen
│   ├── GuessingGameComplete.tsx
│   └── GuessingGameComplete.scss
└── Confetti/                   # Perfect score animation
    ├── Confetti.tsx
    └── Confetti.scss
```

### Container Component

**GamesPage.tsx** - Parent container that manages both games:

- Handles game state transitions (start → play → complete)
- Manages localStorage persistence
- Coordinates between Guessing Game and Toon Quiz
- Debounced auto-save (100ms) prevents performance issues

### Data Flow

```
User Action → GuessingGamePlay → API Call (batch) → Pre-load Questions
           ↓
    Update State (React)
           ↓
    Auto-save (localStorage, debounced)
           ↓
    Update UI (Framer Motion animations)
```

---

## API Documentation

### Movie Hints Endpoints

#### Get All Hints for a Movie

```http
GET /api/movie-hints/{urlId}
```

**Parameters:**

- `urlId` (path) - Movie URL identifier (e.g., `snow_white_and_the_seven_dwarfs`)

**Response:**

```json
[
  {
    "id": 66121,
    "movie_url_id": "the_lion_king",
    "content": "A lion cub is exiled and returns to claim his throne.",
    "difficulty": 1,
    "hint_type": "PLOT"
  }
]
```

#### Get Batch Movie Hints (Optimized) ⚡

```http
GET /api/movie-hints/batch?urlIds={comma-separated-ids}
```

**Parameters:**

- `urlIds` (query) - Comma-separated list of movie URL identifiers

**Example:**

```bash
curl "http://localhost:8080/api/movie-hints/batch?urlIds=snow_white_and_the_seven_dwarfs,the_lion_king"
```

**Response:**

```json
{
  "snow_white_and_the_seven_dwarfs": [
    {
      "id": 1,
      "movie_url_id": "snow_white_and_the_seven_dwarfs",
      "content": "It was the first full-length cel-animated feature in motion picture history.",
      "difficulty": 1,
      "hint_type": "TRIVIA"
    }
  ],
  "the_lion_king": [
    {
      "id": 66121,
      "movie_url_id": "the_lion_king",
      "content": "A lion cub is exiled and returns to claim his throne.",
      "difficulty": 1,
      "hint_type": "PLOT"
    }
  ]
}
```

### Character Hints Endpoints

#### Get All Hints for a Character

```http
GET /api/character-hints/{urlId}
```

**Parameters:**

- `urlId` (path) - Character URL identifier (e.g., `elsa`)

**Response:**

```json
[
  {
    "id": 12882,
    "character_url_id": "elsa",
    "content": "She is the Snow Queen.",
    "difficulty": 1,
    "hint_type": "BIO"
  }
]
```

#### Get Batch Character Hints (Optimized) ⚡

```http
GET /api/character-hints/batch?urlIds={comma-separated-ids}
```

**Parameters:**

- `urlIds` (query) - Comma-separated list of character URL identifiers

**Example:**

```bash
curl "http://localhost:8080/api/character-hints/batch?urlIds=aladdin,elsa,anna"
```

**Response:**

```json
{
  "aladdin": [
    {
      "id": 12302,
      "character_url_id": "aladdin",
      "content": "He is a 'diamond in the rough'.",
      "difficulty": 1,
      "hint_type": "BIO"
    }
  ],
  "elsa": [
    {
      "id": 12882,
      "character_url_id": "elsa",
      "content": "She is the Snow Queen.",
      "difficulty": 1,
      "hint_type": "BIO"
    }
  ]
}
```

### Movies/Characters with Hints

#### Get Movies with Hints

```http
GET /api/movies/ids-with-hints
```

**Response:**

```json
{
  "movie_ids": [2494, 2495, 2496],
  "count": 3
}
```

#### Get Characters with Hints

```http
GET /api/characters/ids-with-hints
```

**Response:**

```json
{
  "character_ids": [362, 363, 364],
  "count": 3
}
```

### Random Selection Endpoints

#### Get Random Movies (Excluding IDs)

```http
GET /api/movies/random-except?exclude_ids={ids}&count={number}
```

**Parameters:**

- `exclude_ids` (query) - Comma-separated movie IDs to exclude
- `count` (query) - Number of random movies to return

**Example:**

```bash
curl "http://localhost:8080/api/movies/random-except?exclude_ids=2494,2495&count=3"
```

#### Get Random Characters (Excluding IDs)

```http
GET /api/characters/random-except?exclude_ids={ids}&count={number}
```

**Parameters:**

- `exclude_ids` (query) - Comma-separated character IDs to exclude
- `count` (query) - Number of random characters to return

---

## State Management

### React State (GuessingGamePlay.tsx)

```typescript
// Game state
const [current_question, set_current_question] = useState<game_question | null>(
  null
);
const [all_questions, set_all_questions] = useState<game_question[]>([]);
const [pre_loaded_questions, set_pre_loaded_questions] = useState<
  game_question[]
>([]);
const [question_number, set_question_number] = useState(1);
const [score, set_score] = useState({ correct: 0, incorrect: 0 });
const [total_show_answers_used, set_total_show_answers_used] = useState(0);

// Question state
const [revealed_hints, set_revealed_hints] = useState<game_hint[]>([]);
const [selected_answer, set_selected_answer] = useState<answer_choice | null>(
  null
);
const [is_answered, set_is_answered] = useState(false);
const [loading, set_loading] = useState(true);
const [show_answer_used, set_show_answer_used] = useState(false);
```

### LocalStorage Persistence

**Storage Key:** `disney-guessing-game-state`

**Expiration:** 7 days (604,800,000 milliseconds)

**Saved State Structure:**

```typescript
interface guessing_game_saved_state {
  is_active: boolean;
  is_complete: boolean;
  options: guessing_game_options | null;
  results: {
    questions: game_question[];
    score: { correct: number; incorrect: number; show_answers_used: number };
  } | null;
  current_question_index?: number;
  current_question_state?: {
    selected_answer: string;
    has_used_hint: boolean;
    has_shown_answer: boolean;
    is_correct: boolean | null;
  } | null;
  last_updated: number;
}
```

**Storage Utilities:**

- `save_guessing_game_state()` - Saves current game state
- `load_guessing_game_state()` - Loads saved game state
- `clear_guessing_game_state()` - Clears saved state
- `has_saved_game_state()` - Checks if saved state exists and is valid

**Auto-save Implementation:**

```typescript
// Debounced save in GamesPage.tsx
useEffect(() => {
  if (guessing_game_state.is_active && !guessing_game_state.is_complete) {
    const timeout = setTimeout(() => {
      save_guessing_game_state(guessing_game_state);
    }, 100); // 100ms debounce

    return () => clearTimeout(timeout);
  }
}, [guessing_game_state]);
```

### Settings Integration

Game state can be cleared via Settings page:

- Navigate to Settings → Cache Management
- Check "Guessing Game Progress"
- Click "Clear Selected Data"

---

## Performance Optimization

### Before Optimization ❌

**Problem:** Sequential API calls during gameplay

- 10 questions × 3 API calls per question = **30 total API calls**
- Calls per question:
  1. Fetch correct answer (1 random movie/character)
  2. Fetch wrong answers (N random movies/characters)
  3. Fetch all hints for correct answer

**Impact:**

- Slow question transitions
- Visible loading states
- Flash/flicker between questions
- Poor user experience

### After Optimization ✅

**Solution:** Batch pre-loading at game start

**API Calls:**

- Game start: **2-3 total API calls** (reduced by 90%)
  1. Fetch ALL random movies/characters at once
  2. Batch fetch ALL hints for movies (if movies/mixed mode)
  3. Batch fetch ALL hints for characters (if characters/mixed mode)

**Benefits:**

- ⚡ **Instant question transitions** (0 API calls during gameplay)
- ✨ **No loading states** between questions
- 🎯 **No flash/flicker** - smooth animations only
- 📉 **90% reduction** in API calls
- 🚀 **Improved backend performance** - batch queries are more efficient

### Implementation Details

#### Backend: Batch Endpoints

**MovieHintService.java**

```java
public Map<String, List<MovieHintDto>> getBatchHints(List<String> movieUrlIds) {
    log.debug("Fetching hints for {} movies", movieUrlIds.size());
    Map<String, List<MovieHintDto>> result = new HashMap<>();

    for (String urlId : movieUrlIds) {
        List<MovieHintDto> hints = getAllHintsByMovieUrlId(urlId);
        result.put(urlId, hints);
    }

    return result;
}
```

**MovieHintController.java**

```java
@GetMapping("/batch")
public ResponseEntity<Map<String, List<MovieHintDto>>> getBatchHints(
    @RequestParam String urlIds) {

    List<String> urlIdList = Arrays.stream(urlIds.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();

    if (urlIdList.isEmpty()) {
        return ResponseEntity.badRequest().build();
    }

    Map<String, List<MovieHintDto>> hintsMap = movieHintService.getBatchHints(urlIdList);
    return ResponseEntity.ok(hintsMap);
}
```

#### Frontend: Pre-loading Logic

**guessingGameApi.ts**

```typescript
export const fetch_batch_movie_hints = async (
  movie_url_ids: string[]
): Promise<Record<string, game_hint[]>> => {
  const url_ids_param = movie_url_ids.join(",");
  const url = `${API_BASE_URL}/movie-hints/batch?urlIds=${url_ids_param}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch batch movie hints: ${response.statusText}`
    );
  }
  return response.json();
};
```

**GuessingGamePlay.tsx - Pre-loading**

```typescript
const pre_load_all_questions = async () => {
  // 1. Calculate how many movies/characters needed
  const answer_count = get_answer_count(options.difficulty);
  const total_movies_needed = movies_needed * answer_count;

  // 2. Fetch ALL movies/characters at once
  const movie_items = await fetch_random_movies_except([], total_movies_needed);

  // 3. Build question objects
  const questions = /* build from movie_items */;
  const movie_url_ids = /* extract url_ids from questions */;

  // 4. Batch fetch ALL hints
  const movie_hints_map = await fetch_batch_movie_hints(movie_url_ids);

  // 5. Populate hints into questions
  for (const question of questions) {
    const hints = movie_hints_map[question.correct_answer.url_id];
    question.revealed_hints = hints.slice(0, initial_hints_count);
  }

  // 6. Save to state
  set_pre_loaded_questions(questions);
  set_current_question(questions[0]);
};
```

---

## Developer Guide

### Adding New Hints

#### Movie Hints

Edit: `backend/src/main/resources/database/movie_hints.json`

```json
{
  "movie_url_id": "frozen",
  "hints": [
    {
      "content": "Let it go!",
      "difficulty": 1,
      "hint_type": "QUOTE"
    },
    {
      "content": "Released in 2013",
      "difficulty": 3,
      "hint_type": "TRIVIA"
    }
  ]
}
```

**Hint Types:**

- `PLOT` - Story-based clues
- `BIO` - Character information
- `QUOTE` - Famous lines
- `TRIVIA` - Facts and behind-the-scenes
- `RELATIONSHIP` - Character connections

**Difficulty Levels:**

- `1` - Easy (revealed in easy mode)
- `2` - Medium (revealed in medium mode or lower)
- `3` - Hard (revealed in hard mode or lower)
- `4` - Expert (never auto-revealed, bonus hints)

#### Character Hints

Edit: `backend/src/main/resources/database/character_hints.json`

```json
{
  "character_url_id": "elsa",
  "hints": [
    {
      "content": "She is the Snow Queen.",
      "difficulty": 1,
      "hint_type": "BIO"
    },
    {
      "content": "Voiced by Idina Menzel.",
      "difficulty": 3,
      "hint_type": "TRIVIA"
    }
  ]
}
```

### Modifying Difficulty Settings

Edit: `GuessingGamePlay.tsx`

```typescript
// Answer count mapping
const get_answer_count = (difficulty: number): number => {
  const counts: Record<number, number> = {
    1: 4, // Easy: 4 choices
    2: 6, // Medium: 6 choices
    3: 8, // Hard: 8 choices
  };
  return counts[difficulty] || 4;
};

// Initial hints mapping
const get_initial_hints_count = (difficulty: number): number => {
  const counts: Record<number, number> = {
    1: 3, // Easy: 3 hints
    2: 2, // Medium: 2 hints
    3: 1, // Hard: 1 hint
  };
  return counts[difficulty] || 2;
};
```

### Adding New Categories

1. **Update Type Definition** (`types/guessingGame.ts`)

```typescript
export type guessing_game_category =
  | "movies"
  | "characters"
  | "parks"
  | "mixed";
```

2. **Add API Endpoints** (e.g., for parks)

```typescript
export const fetch_random_parks_except = async (
  exclude_ids: number[],
  count: number = 3
): Promise<park_response[]> => {
  // Implementation
};
```

3. **Update Pre-loading Logic** (`GuessingGamePlay.tsx`)

```typescript
if (options.category === "parks") {
  parks_needed = options.question_count;
}
```

4. **Update UI Labels** (`GuessingGameStart.tsx`)

```typescript
const categories = [
  { value: "movies", label: "Movies" },
  { value: "characters", label: "Characters" },
  { value: "parks", label: "Parks" },
  { value: "mixed", label: "Mixed" },
];
```

### Extending Animations

Animations use **Framer Motion**. Example custom animation:

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
  {/* Content */}
</motion.div>
```

### Customizing Confetti

Edit: `Confetti.tsx`

```typescript
const CONFETTI_COUNT = 50; // Number of pieces
const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#95E1D3",
  "#F38181",
  "#AA96DA",
  "#FCBAD3",
  "#A8D8EA",
];
const FALL_DURATION = 3000; // Duration in ms
```

---

## Testing

### Manual Testing Checklist

**Game Setup:**

- [ ] Can select Movies category
- [ ] Can select Characters category
- [ ] Can select Mixed category
- [ ] Can select Easy difficulty
- [ ] Can select Medium difficulty
- [ ] Can select Hard difficulty
- [ ] Can select 5 questions
- [ ] Can select 10 questions
- [ ] Can select 15 questions
- [ ] "Start Game" button is enabled after selection
- [ ] Game starts with correct settings

**Gameplay:**

- [ ] Initial hints are displayed (count matches difficulty)
- [ ] Can select an answer choice
- [ ] Selected answer is highlighted
- [ ] "Submit Answer" button is enabled after selection
- [ ] Answer is locked after submission
- [ ] Score updates correctly (correct answer)
- [ ] Score updates correctly (incorrect answer)
- [ ] "Next Question" button appears after submission
- [ ] Question transitions smoothly (no flash)
- [ ] Question number increments correctly
- [ ] Hint button eliminates one wrong answer
- [ ] Show Answer reveals correct answer
- [ ] Show Answer counts as correct
- [ ] Game completes after all questions

**Game Completion:**

- [ ] Final score is accurate
- [ ] Accuracy percentage is correct
- [ ] Statistics are displayed correctly
- [ ] Question review shows all questions
- [ ] Correct answers marked with ✅
- [ ] Incorrect answers marked with ❌
- [ ] Scrollbar is visible and functional
- [ ] Confetti appears for 100% accuracy
- [ ] "Play Again" restarts with same settings
- [ ] "Return to Start" goes back to setup

**State Persistence:**

- [ ] Game state saves automatically
- [ ] Can close browser and resume game
- [ ] Game state expires after 7 days
- [ ] Can clear game state from Settings
- [ ] State cleared on game completion

**Responsive Design:**

- [ ] Works on mobile (320px - 480px)
- [ ] Works on tablet (481px - 768px)
- [ ] Works on desktop (769px+)
- [ ] Touch interactions work on mobile
- [ ] Scrolling works on mobile

**Accessibility:**

- [ ] Screen reader announces game state
- [ ] Keyboard navigation works (Tab, Enter, Arrow keys)
- [ ] Focus indicators are visible
- [ ] ARIA labels are present
- [ ] Color contrast meets WCAG AA standards

### API Testing (cURL)

**Test Movie Hints Batch:**

```bash
curl "http://localhost:8080/api/movie-hints/batch?urlIds=snow_white_and_the_seven_dwarfs,the_lion_king"
```

**Test Character Hints Batch:**

```bash
curl "http://localhost:8080/api/character-hints/batch?urlIds=aladdin,elsa,anna"
```

**Test Random Movies:**

```bash
curl "http://localhost:8080/api/movies/random-except?exclude_ids=&count=10"
```

**Test Random Characters:**

```bash
curl "http://localhost:8080/api/characters/random-except?exclude_ids=&count=10"
```

---

## Future Enhancements

### Planned Features

1. **Multiplayer Mode**

   - Real-time competition between players
   - WebSocket integration
   - Leaderboard system

2. **Achievements System**

   - Unlock badges for milestones
   - Track lifetime stats
   - Special rewards for perfect scores

3. **Custom Game Modes**

   - Time attack mode
   - Survival mode (wrong answer = game over)
   - Expert mode (harder hints only)

4. **Hint Progression**

   - Gradually reveal more hints over time
   - Penalty for using hints early
   - Bonus points for answering with fewer hints

5. **Social Features**

   - Share results on social media
   - Challenge friends
   - Weekly tournaments

6. **Enhanced Analytics**

   - Track question difficulty performance
   - Identify knowledge gaps
   - Personalized recommendations

7. **Audio Integration**

   - Sound effects for correct/incorrect
   - Background music themes
   - Voice hints option

8. **Image Hints**
   - Show partial images as hints
   - Progressive image reveal
   - Silhouette mode

### Technical Debt

1. **Testing Coverage**

   - Add unit tests for game logic
   - Add integration tests for API endpoints
   - Add E2E tests for complete game flow

2. **Performance Monitoring**

   - Add analytics tracking
   - Monitor API response times
   - Track error rates

3. **Code Splitting**

   - Lazy load game components
   - Reduce initial bundle size
   - Improve first load time

4. **TypeScript Improvements**
   - Stricter type checking
   - Remove any types
   - Add JSDoc comments

---

## Changelog

### v2.0.0 - Performance Optimization (November 2025)

- ✅ Added batch hints endpoints (`/api/movie-hints/batch`, `/api/character-hints/batch`)
- ✅ Implemented pre-loading strategy (reduced API calls from 30 to 2-3)
- ✅ Eliminated loading flash between questions
- ✅ Added game state clearing to Settings page
- ✅ Fixed question review showing incorrect icons
- ✅ Made scrollbar thicker and more visible

### v1.5.0 - Bug Fixes (November 2025)

- ✅ Fixed Toon Quiz restart alert loop
- ✅ Fixed next question not loading
- ✅ Fixed question tracking (selected_answer and is_correct)

### v1.4.0 - Animation Enhancements (November 2025)

- ✅ Added hint reveal animations (spring, x-axis slide)
- ✅ Added answer selection animations (scale)
- ✅ Added score counting animation
- ✅ Added confetti for perfect scores

### v1.3.0 - State Persistence (November 2025)

- ✅ Implemented localStorage persistence (7-day expiration)
- ✅ Added debounced auto-save (100ms)
- ✅ Fixed Toon Quiz persistence

### v1.0.0 - Initial Release (November 2025)

- ✅ Complete game implementation (Phases 0-5)
- ✅ Three categories (Movies, Characters, Mixed)
- ✅ Three difficulty levels
- ✅ Customizable question count
- ✅ Hint system
- ✅ Show Answer feature
- ✅ Responsive design
- ✅ Accessibility features

---

## Credits

**Development Team:**

- Full-stack implementation
- UI/UX design
- Performance optimization

**Technologies:**

- React 19+
- TypeScript
- Framer Motion
- SCSS
- Java 21
- Spring Boot 3.x
- PostgreSQL

**Special Thanks:**

- Disney for the inspiration
- Open source community

---

## License

© 2025 Disney App. All rights reserved.

This game is a fan project and is not affiliated with or endorsed by The Walt Disney Company.
