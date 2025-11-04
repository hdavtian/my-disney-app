# Disney Character Quiz Game

## 🎯 Project Overview

A Disney character quiz game integrated into the Characters page that tests users' knowledge of Disney characters through multiple-choice questions. The game features a responsive design, persistent scoring, and engaging user interactions.

---

## 📋 Requirements

### 🎮 Core Game Features

#### **Game Structure**

- **3-section responsive layout**:
  - Mobile: vertical stacking
  - Tablet+: horizontal layout
- **Dynamic question generation**: No additional database tables needed
- **Multiple choice answers**: A, B, C, D format with 1 correct + 3 wrong answers
- **Persistent progress**: Game state saved across browser sessions
- **Historical scoring**: Track best scores over time

#### **Section 1: Character Display**

- Reuse existing `CharacterCard` component
- **Hide character name/title** during quiz
- **Disable navigation** to character detail page
- **Keep favorite functionality** (heart icon)
- Display random character for current question

#### **Section 2: Quiz Interface**

- **Static title**: "Test your toon knowledge!"
- **4 multiple choice answers**: A, B, C, D format
- **Hint system**:
  - One hint per question
  - Highlights random wrong answer with "not this!" note
  - Button disabled after use
- **Show answer button**: Highlights correct answer
- **Next button**: Right arrow, appears after answer selection
- **Answer validation**: Unique answers only (no duplicates)

#### **Section 3: Score Tracking**

- **Restart button**: Top of section, restarts entire game
- **Score table**: 3 columns (Character, Right!, Wrong!)
- **Row management**: Most recent on top, older questions below
- **Overflow scrolling**: Y-axis scroll for question history
- **Visual indicators**:
  - Green checkmark for correct answers
  - Red X for wrong answers
- **Overall score display**: "18 of 24" format at top of table
- **Streak counter**: Shows consecutive correct answers

#### **Game Controls**

- **Show/Hide toggle**: Small button in top-right corner of component
- **Responsive positioning**: Adapts to mobile/tablet/desktop layouts

---

## 🗄️ Data Strategy

### **Dynamic Question Generation**

- **No additional database tables required**
- **Real-time question building** using existing character data

### **Backend Endpoints Required**

```
GET /api/characters/ids
- Returns: Array of all character IDs [1, 2, 3, ..., 180]
- Purpose: Initialize game with complete character list

POST /api/characters/random-except
- Request: { "excludeId": number }
- Returns: Array of 3 unique random character IDs (excluding submitted ID)
- Purpose: Generate wrong answers for each question
```

### **Frontend Game State**

```typescript
interface QuizGameState {
  characterQueue: number[]; // Shuffled character IDs for questions
  currentQuestionIndex: number; // Current position in queue
  gameHistory: QuizQuestion[]; // Past questions with user answers
  currentStreak: number; // Current correct streak
  bestStreak: number; // Historical best streak
  score: { correct: number; total: number };
  allTimeScore: { correct: number; total: number };
  isGameActive: boolean;
  isVisible: boolean; // Show/hide toggle state
  showHint: boolean; // Per-question hint usage
  questionAnswered: boolean; // Current question state
}
```

---

## 🎨 User Experience

### **Component Enhancement: CharacterCard**

**New Props Added**:

- `showTitle: boolean` (default: `true`) - Controls name display
- `enableFavoriting: boolean` (default: `true`) - Controls heart icon
- `disableNavigation: boolean` (default: `false`) - Prevents navigation clicks

### **Responsive Design**

- **Mobile (0-768px)**: Vertical stacking of all 3 sections
- **Tablet+ (769px+)**: Horizontal layout with equal-width sections
- **Touch-friendly**: All interactive elements optimized for mobile

### **Accessibility Features**

- **ARIA labels** on all interactive elements
- **Keyboard navigation** support
- **Screen reader announcements** for score changes
- **Semantic HTML** structure

### **Animations (Framer Motion)**

- **Question transitions**: Smooth character card changes
- **Answer feedback**: Celebration for correct, subtle shake for wrong
- **Score updates**: Animated counter changes
- **Component toggle**: Smooth show/hide transitions

---

## 🏗️ Technical Architecture

### **Frontend Structure**

```
src/components/CharacterQuiz/
├── CharacterQuiz.tsx           # Main game component
├── CharacterQuiz.scss          # Game-specific styles
├── components/
│   ├── QuizQuestion.tsx        # Question and answers section
│   ├── ScoreBoard.tsx          # Score tracking section
│   └── GameControls.tsx        # Restart and toggle controls
└── index.ts                    # Export barrel
```

### **Redux Integration**

```
src/store/slices/quizSlice.ts   # Quiz state management
```

### **Persistence Strategy**

- **localStorage keys**:
  - `disney-quiz-current-game`: Active game state
  - `disney-quiz-best-scores`: Historical performance data
  - `disney-quiz-settings`: User preferences (show/hide state)

---

## 📍 Integration Points

### **CharactersPage Integration**

- **Placement**: First child in `div.characters-page__content`
- **Siblings**: Before `CharactersGridView` and `CharactersListView`
- **Conditional rendering**: Based on toggle state

### **Backend Integration**

- **Character service enhancement**: Add ID-only and random-except endpoints
- **Controller updates**: New endpoints in `CharacterController`
- **Repository methods**: Efficient ID queries and random selection

---

## 🚀 Implementation Phases

### **Phase 1: Backend API Development** ⏳

- [ ] Add `GET /api/characters/ids` endpoint
- [ ] Add `POST /api/characters/random-except` endpoint
- [ ] Test endpoints with existing data
- [ ] Update CharacterService and CharacterController

### **Phase 2: Frontend State Management** ⏳

- [ ] Create Redux quiz slice with full state management
- [ ] Implement localStorage persistence utilities
- [ ] Add quiz-related TypeScript interfaces
- [ ] Test state management logic

### **Phase 3: Character Card Enhancement** ⏳

- [ ] Add new props to CharacterCard component
- [ ] Maintain backward compatibility
- [ ] Test all prop combinations
- [ ] Update component documentation

### **Phase 4: Core Quiz Component** ⏳

- [ ] Build main CharacterQuiz component structure
- [ ] Implement 3-section responsive layout
- [ ] Add show/hide toggle functionality
- [ ] Create quiz question logic

### **Phase 5: Game Logic Implementation** ⏳

- [ ] Build question generation system
- [ ] Implement hint and show-answer features
- [ ] Add answer validation and scoring
- [ ] Create streak calculation logic

### **Phase 6: Score Tracking System** ⏳

- [ ] Build interactive score table
- [ ] Implement game history tracking
- [ ] Add persistent best score features
- [ ] Create restart functionality

### **Phase 7: Integration & Polish** ⏳

- [ ] Integrate into CharactersPage
- [ ] Add Framer Motion animations
- [ ] Implement accessibility features
- [ ] Responsive design testing

### **Phase 8: Testing & Optimization** ⏳

- [ ] Cross-browser compatibility testing
- [ ] Mobile device testing
- [ ] Performance optimization
- [ ] User experience refinements

---

## 🎯 Success Criteria

### **Functional Requirements**

- ✅ **Game loads** with random character questions
- ✅ **Multiple choice** answers work correctly
- ✅ **Hint system** functions once per question
- ✅ **Scoring system** tracks correct/incorrect answers
- ✅ **Streak counter** calculates consecutive correct answers
- ✅ **Persistence** maintains game across browser sessions
- ✅ **Responsive design** works on all device sizes

### **Technical Requirements**

- ✅ **No performance impact** on existing Characters page
- ✅ **Backward compatibility** with existing CharacterCard usage
- ✅ **Clean code** following project conventions
- ✅ **Accessibility compliance** with ARIA standards
- ✅ **Error handling** for API failures and edge cases

### **User Experience Requirements**

- ✅ **Intuitive interface** that requires no instructions
- ✅ **Smooth animations** that enhance engagement
- ✅ **Mobile-optimized** touch interactions
- ✅ **Quick load times** for seamless gameplay

---

## 📝 Notes & Decisions

### **Design Decisions**

- **Dynamic generation over pre-built data**: Eliminates database complexity
- **Component reuse over recreation**: Leverages existing CharacterCard investment
- **Progressive enhancement**: Game doesn't interfere with core browsing experience
- **localStorage over backend**: Keeps user data private and reduces server load

### **Future Enhancement Ideas**

- **Difficulty levels**: Easy (same franchise), Medium (same category), Hard (random)
- **Sound effects**: Disney-themed audio feedback
- **Leaderboards**: Social scoring features
- **Time challenges**: Speed-based gameplay modes
- **Character categories**: Genre-specific quizzes
- **Achievement system**: Unlock badges and rewards

---

## 🔄 Change Log

### Version 1.0 - Initial Planning

- **Date**: November 4, 2025
- **Changes**: Complete requirements documentation and implementation planning
- **Next**: Begin Phase 1 - Backend API Development

---

_Last Updated: November 4, 2025_
_Status: Planning Complete - Ready for Implementation_
