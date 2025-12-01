# React Learning Course - Disney App Edition

Welcome to your personalized React study course! This curriculum uses real components from the Disney App you've built, making concepts concrete and immediately applicable.

---

## 📚 Course Philosophy

**Learn by doing with code you already own.**

Instead of abstract tutorials with generic examples, you'll study actual production components from your Disney App. This means:

- ✅ Real-world patterns you can use immediately
- ✅ Context you understand (Disney movies, characters, favorites)
- ✅ Code you can modify and experiment with safely
- ✅ Concepts tied to features you've seen working

---

## 🎯 How to Use This Course

### 1. **Read the Guidelines**

Start with [`AI_COURSEWORK_GUIDELINES.md`](./AI_COURSEWORK_GUIDELINES.md) to understand how these tutorials are structured.

### 2. **Follow the Learning Path**

Work through tutorials in order - each builds on previous concepts.

### 3. **Complete Exercises**

Each tutorial has 3 levels of practice exercises. Do them!

### 4. **Experiment Freely**

- Modify the actual components
- Break things and fix them
- Try variations on the patterns
- Git will always let you revert!

### 5. **Ask Questions**

Use GitHub Copilot to:

- Generate more examples
- Explain confusing parts
- Create additional practice exercises
- Review your solutions

---

## 📖 Learning Path

### Week 1: React Fundamentals

#### Tutorial 01: MovieCard - Props & State ✅ COMPLETED

**File:** [`01_movie-card_props-and-state.md`](./01_movie-card_props-and-state.md)  
**Concepts:**

- Props (component inputs)
- TypeScript interfaces
- State (useState hook)
- Event handling
- Conditional rendering
- Basic Framer Motion animations

**Why start here:** MovieCard is visual, interactive, and uses fundamental concepts you'll need everywhere.

**Time:** 2-3 hours (including exercises)

---

#### Tutorial 02: FavoriteButton - Custom Hooks (COMING SOON)

**Concepts:**

- Custom hooks
- Redux integration (useSelector, useDispatch)
- Event propagation (stopPropagation)
- LocalStorage
- Icon animations

**Why this next:** You saw FavoriteButton used in MovieCard - now learn how it works internally.

---

#### Tutorial 03: Footer & VersionInfo - Simple Components (COMING SOON)

**Concepts:**

- Presentational components
- Static content
- Import/export patterns
- SCSS module patterns

**Why this:** Reinforces basics with simpler examples before advancing.

---

### Week 2: Intermediate Patterns

#### Tutorial 04: SearchInput - Refs, Effects & Generics (COMING SOON)

**Concepts:**

- useRef (DOM references & mutable values)
- useEffect (lifecycle & side effects)
- Dependency arrays
- Cleanup functions
- Generic TypeScript components
- Debouncing
- Keyboard navigation

**Why this:** SearchInput demonstrates advanced state management and UX patterns.

---

#### Tutorial 05: Navigation - React Router (COMING SOON)

**Concepts:**

- React Router setup
- Link components
- Active route styling
- Dynamic routes
- Programmatic navigation

**Why this:** Essential for multi-page apps.

---

#### Tutorial 06: MovieCarousel - Lists & Performance (COMING SOON)

**Concepts:**

- Mapping arrays to JSX
- Keys in lists
- Stagger animations
- Component composition
- Performance considerations

**Why this:** Learn to work with collections of data.

---

### Week 3: Advanced State Management

#### Tutorial 07: Redux Store Setup (COMING SOON)

**Concepts:**

- Redux Toolkit
- Store configuration
- Slices
- Reducers
- Actions
- Middleware

**Why this:** Understand the global state layer.

---

#### Tutorial 08: useFavorites Hook - Custom Hook Deep Dive (COMING SOON)

**Concepts:**

- Building custom hooks
- LocalStorage integration
- Data persistence
- Hook composition
- TypeScript with hooks

**Why this:** Master creating reusable logic.

---

#### Tutorial 09: CharacterQuiz - Complex State (COMING SOON)

**Concepts:**

- Multi-step state machines
- Game logic
- Timers and intervals
- Score tracking
- Redux integration

**Why this:** See how to manage complex, interactive features.

---

### Week 4: Advanced Patterns

#### Tutorial 10: HeroCarousel - Third-Party Integration (COMING SOON)

**Concepts:**

- Swiper.js integration
- Responsive breakpoints
- Autoplay & pagination
- Component lifecycle
- Touch gestures

**Why this:** Learn to integrate external libraries.

---

#### Tutorial 11: ParksPage - Composition & Architecture (COMING SOON)

**Concepts:**

- Component composition
- Container vs presentational components
- Data fetching
- Loading states
- Error handling

**Why this:** Understand how to structure larger features.

---

#### Tutorial 12: Performance Optimization (COMING SOON)

**Concepts:**

- useMemo
- useCallback
- React.memo
- Code splitting
- Lazy loading

**Why this:** Make apps fast and efficient.

---

## 🗂️ Component Reference

Quick reference for all components covered (or to be covered):

### Basic Components

- ✅ **MovieCard** - Grid card display
- **CharacterCard** - Similar to MovieCard
- **AttractionCard** - Another card variant
- **FavoriteButton** - Interactive icon button
- **Footer** - Static layout component
- **VersionInfo** - Simple info display

### Form & Input Components

- **SearchInput** - Generic search with dropdown
- **AlphabetFilter** - Letter-based filtering
- **SortDropdown** - Sorting UI
- **CardSizeControl** - Slider control

### Layout Components

- **Navigation** - Top nav bar
- **ViewModeToggle** - Grid/list toggle
- **ScrollToTop** - Utility component

### Complex Components

- **MovieCarousel** - Horizontal scrolling list
- **CharacterCarousel** - Character version
- **HeroCarousel** - Full-width hero slider
- **VideoSlider** - Video thumbnails

### Interactive Features

- **CharacterQuiz** - Quiz game
- **GuessingGame** - Guessing game
- **AccessGate** - Premium content gate

### Pages

- **MoviesPage** - Full page example
- **CharactersPage** - Another full page
- **ParksPage** - Complex page with multiple components

---

## 🎓 Skill Progression

As you complete tutorials, you'll progress through skill levels:

### Level 1: Beginner (Tutorials 1-3)

**You can:**

- ✅ Understand component structure
- ✅ Work with props and state
- ✅ Handle basic events
- ✅ Render conditionally
- ✅ Read and modify existing components

### Level 2: Intermediate (Tutorials 4-6)

**You can:**

- ⏳ Use refs for DOM access
- ⏳ Manage side effects with useEffect
- ⏳ Work with TypeScript generics
- ⏳ Implement routing
- ⏳ Optimize performance basics

### Level 3: Advanced (Tutorials 7-9)

**You can:**

- ⏳ Design custom hooks
- ⏳ Integrate Redux
- ⏳ Manage complex state
- ⏳ Build interactive features
- ⏳ Persist data

### Level 4: Expert (Tutorials 10-12)

**You can:**

- ⏳ Architect large features
- ⏳ Integrate third-party libraries
- ⏳ Optimize performance deeply
- ⏳ Make architectural decisions
- ⏳ Build complete applications

---

## 💡 Study Tips

### Do's ✅

- **Code along** - Don't just read, type the code yourself
- **Break things** - See what happens when you change things
- **Use console.log()** - Debug and understand flow
- **Complete exercises** - Practice is essential
- **Ask Copilot** - Generate more examples when needed

### Don'ts ❌

- **Don't skip exercises** - They're where real learning happens
- **Don't rush** - Take time to understand each concept
- **Don't just copy/paste** - Type code to build muscle memory
- **Don't study when tired** - Brain needs to be fresh for coding

### Best Practices

1. **One tutorial per session** - Don't overload
2. **30 min max without break** - Stand up, move around
3. **Review previous tutorial** before starting new one
4. **Keep notes** - Write down "aha!" moments
5. **Build something small** after each tutorial to practice

---

## 🛠️ Development Setup

To get the most from this course, make sure you have:

### Required

- ✅ Visual Studio Code
- ✅ Node.js & npm
- ✅ Disney App repository cloned
- ✅ Frontend dev server running (`npm run dev`)

### Recommended VS Code Extensions

- ✅ ES7+ React/Redux/React-Native snippets
- ✅ ESLint
- ✅ Prettier
- ✅ Auto Rename Tag
- ✅ Auto Close Tag
- ✅ Path Intellisense

### Browser DevTools

- React DevTools extension (Chrome/Firefox/Edge)
- Redux DevTools extension

---

## 📊 Progress Tracking

Use this checklist to track your progress:

- [ ] Read AI_COURSEWORK_GUIDELINES.md
- [ ] Tutorial 01: MovieCard (Props & State)
  - [ ] Read full tutorial
  - [ ] Exercise 1: Watched Badge
  - [ ] Exercise 2: Hover Animation
  - [ ] Exercise 3: Intersection Observer
- [ ] Tutorial 02: FavoriteButton (Custom Hooks)
- [ ] Tutorial 03: Footer & VersionInfo (Simple Components)
- [ ] Tutorial 04: SearchInput (Refs & Effects)
- [ ] Tutorial 05: Navigation (React Router)
- [ ] Tutorial 06: MovieCarousel (Lists)
- [ ] Tutorial 07: Redux Store
- [ ] Tutorial 08: useFavorites Hook
- [ ] Tutorial 09: CharacterQuiz (Complex State)
- [ ] Tutorial 10: HeroCarousel (Third-Party)
- [ ] Tutorial 11: ParksPage (Architecture)
- [ ] Tutorial 12: Performance

---

## 🎯 Learning Goals

By the end of this course, you'll be able to:

### Build Components

- ✅ Create functional components with TypeScript
- ✅ Define prop interfaces
- ✅ Manage local state
- ✅ Handle user events
- ✅ Render conditionally
- ✅ Style with SCSS modules

### Manage State

- ⏳ Use useState, useEffect, useRef
- ⏳ Create custom hooks
- ⏳ Integrate Redux
- ⏳ Persist data to localStorage
- ⏳ Handle async operations

### Build Features

- ⏳ Implement navigation
- ⏳ Create forms and inputs
- ⏳ Add animations
- ⏳ Optimize performance
- ⏳ Ensure accessibility
- ⏳ Handle errors gracefully

### Architect Apps

- ⏳ Organize component structure
- ⏳ Separate concerns
- ⏳ Design data flow
- ⏳ Choose state management strategies
- ⏳ Write maintainable code

---

## 🆘 Getting Help

### Stuck on a Concept?

1. **Re-read the section** - Often makes sense second time
2. **Check official React docs** - Links provided in each tutorial
3. **Ask GitHub Copilot** - "Explain [concept] in simpler terms"
4. **Look at related components** - See pattern in different context

### Code Not Working?

1. **Check console** for error messages
2. **Use React DevTools** to inspect props/state
3. **Add console.log()** to understand flow
4. **Compare with working code** in the repo
5. **Ask Copilot to debug** - Share the error message

### Want More Practice?

Ask GitHub Copilot:

- "Create 3 more exercises for [concept]"
- "Show me variations of [pattern] in the Disney App"
- "Generate a mini-project using [concepts from tutorial]"

---

## 🔄 Course Updates

This is a living curriculum. As the Disney App evolves, tutorials will be updated.

### How to Request New Tutorials

Ask GitHub Copilot:

```
"Create a tutorial for [ComponentName] covering [concepts]"
```

Copilot will use the guidelines in `AI_COURSEWORK_GUIDELINES.md` to generate a consistent, high-quality tutorial.

---

## 🎉 Final Thoughts

**You're learning React with a HUGE advantage** - you have a real, working codebase built with modern patterns. Most tutorials teach with tiny, abstract examples. You're learning with production-quality code that you can see, touch, modify, and ship.

This isn't just a course - it's **your** code becoming **your** education.

**Let's get started!** 🚀

Begin with [Tutorial 01: MovieCard](./01_movie-card_props-and-state.md)

---

_Course created: November 30, 2025_  
_Last updated: November 30, 2025_  
_Total tutorials: 12 (planned)_  
_Status: In Progress_
