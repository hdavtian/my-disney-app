# AI Coursework Generation Guidelines

## Purpose

This document provides instructions for AI assistants to generate high-quality, contextual React learning materials based on the Disney App codebase. The goal is to create practical, real-world tutorials that leverage existing code to teach React concepts.

---

## Core Principles

### 1. **Context Over Theory**

- Always use actual components from the Disney App codebase
- Reference real implementations, not hypothetical examples
- Connect theory to practical application in the student's own project

### 2. **Progressive Complexity**

- Start with fundamental concepts before advanced topics
- Build on previously covered material
- Use simpler components for basic concepts, complex components for advanced topics

### 3. **Multi-Level Learning**

Each tutorial should include:

- **Official Definition**: Brief explanation from React documentation
- **Simple Analogy**: Real-world metaphor to explain the concept
- **Code Implementation**: Actual code from the Disney App
- **Line-by-Line Breakdown**: Detailed explanation of what each part does
- **Common Pitfalls**: Mistakes to avoid
- **Practice Exercises**: Hands-on tasks to reinforce learning

---

## Tutorial Structure Template

````markdown
# Component Name: [Component Name]

## Overview

Brief description of what this component does in the Disney App.

---

## React Concepts Covered

- [ ] Props
- [ ] State (useState)
- [ ] Effects (useEffect)
- [ ] Custom Hooks
- [ ] Event Handling
- [ ] Conditional Rendering
- [ ] Lists & Keys
- [ ] Refs (useRef)
- [ ] Context/Redux
- [ ] TypeScript with React
- [ ] Performance (useMemo/useCallback)
- [ ] Animations (Framer Motion)
- [ ] Accessibility
- [ ] Routing

---

## Concept 1: [Name of Concept]

### Official Definition

[1-2 sentences from React docs or authoritative source]

### Simple Explanation

[Real-world analogy or simple language explanation]

### In Our Code

```tsx
[Relevant code snippet from the component]
```
````

### How It Works

[Detailed line-by-line breakdown with explanations]

### Why We Use It This Way

[Explain design decisions and best practices]

### Common Mistakes

[List typical errors and how to avoid them]

---

## Concept 2: [Name of Concept]

[Repeat structure above]

---

## Full Component Walkthrough

[Complete component code with comprehensive annotations]

---

## Key Takeaways

- Bullet point summary of main lessons
- Best practices demonstrated
- Patterns to remember

---

## Practice Exercises

### Exercise 1: Beginner

[Simple task using concepts learned]

### Exercise 2: Intermediate

[Moderate task requiring multiple concepts]

### Exercise 3: Advanced

[Challenge task extending the component]

---

## Related Components

- [Component A] - demonstrates [concept]
- [Component B] - shows alternative approach to [concept]

---

## Further Reading

- React Documentation: [relevant links]
- Related Disney App documentation

```

---

## Component Selection Criteria

### Beginner-Friendly Components
Components with basic concepts, minimal complexity:
- **MovieCard**: Props, state, event handling, conditional rendering
- **FavoriteButton**: Props, custom hooks, event handlers
- **Footer**: Static component, basic JSX, styling
- **VersionInfo**: Simple component, props, basic rendering

### Intermediate Components
Components with multiple concepts, moderate complexity:
- **SearchInput**: Generic types, controlled inputs, debouncing, refs
- **MovieCarousel**: Lists, mapping, animations, performance
- **Navigation**: Routing, active states, event handling
- **AlphabetFilter**: State management, filtering, event delegation

### Advanced Components
Components with complex patterns, performance optimization:
- **CharacterQuiz**: Complex state, side effects, game logic, Redux
- **GuessingGame**: Multi-step flows, timers, complex state management
- **HeroCarousel**: Third-party integration (Swiper), responsive design
- **ParksPage**: Multiple components, data fetching, composition

---

## Topic Coverage Checklist

### React Fundamentals
- [ ] JSX syntax and expressions
- [ ] Components (functional components)
- [ ] Props (passing data)
- [ ] Props destructuring
- [ ] Props with TypeScript interfaces
- [ ] Default props
- [ ] Optional props
- [ ] Children prop

### State Management
- [ ] useState hook
- [ ] State updates (immutability)
- [ ] Derived state
- [ ] Lifting state up
- [ ] Redux/useSelector
- [ ] Redux/useDispatch
- [ ] Custom hooks for state logic

### Effects & Lifecycle
- [ ] useEffect basics
- [ ] Dependency arrays
- [ ] Cleanup functions
- [ ] Effect timing
- [ ] Multiple effects
- [ ] Custom hooks with effects

### Performance
- [ ] useMemo
- [ ] useCallback
- [ ] React.memo
- [ ] Lazy loading
- [ ] Code splitting
- [ ] Virtual scrolling considerations

### Advanced Patterns
- [ ] Generic components (TypeScript)
- [ ] Render props
- [ ] Compound components
- [ ] Custom hooks
- [ ] Higher-order components (if used)
- [ ] Context API (if used)

### Refs & DOM
- [ ] useRef for DOM elements
- [ ] useRef for mutable values
- [ ] Forward refs (if used)
- [ ] Focus management

### Forms & Inputs
- [ ] Controlled components
- [ ] Event handling
- [ ] Form validation
- [ ] Debouncing
- [ ] Input masking

### Routing
- [ ] React Router setup
- [ ] Route definition
- [ ] Link components
- [ ] Dynamic routes
- [ ] Navigation programmatically
- [ ] Route parameters

### TypeScript Integration
- [ ] Component props types
- [ ] Event types
- [ ] Generic components
- [ ] Type inference
- [ ] Union types
- [ ] Interface vs Type

### Styling
- [ ] SCSS modules
- [ ] CSS variables
- [ ] Conditional classes
- [ ] Dynamic styles
- [ ] Responsive design

### Animations
- [ ] Framer Motion basics
- [ ] Animation variants
- [ ] AnimatePresence
- [ ] Stagger animations
- [ ] Transition timing

### Accessibility
- [ ] ARIA attributes
- [ ] Semantic HTML
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Screen reader support

### Third-Party Libraries
- [ ] Redux Toolkit
- [ ] Framer Motion
- [ ] React Router
- [ ] Swiper (if covered)

---

## Writing Style Guidelines

### Tone
- Conversational but professional
- Encouraging and supportive
- Assumes basic programming knowledge but not React expertise

### Explanations
- Start with "what" before "why"
- Use analogies from everyday life
- Avoid jargon unless you define it first
- Show code before explaining it

### Code Examples
- Always use actual code from the Disney App
- Include imports when relevant
- Show context (surrounding code)
- Use comments sparingly but effectively
- Highlight the specific concept being taught

### Formatting
- Use emojis sparingly for section markers (📖 🔍 💡 ⚠️ ✨)
- Use code blocks with language specification
- Use bold for emphasis on key terms
- Use lists for step-by-step processes

---

## Tutorial Naming Convention

Format: `[##]_[component-name]_[primary-concept].md`

Examples:
- `01_movie-card_props-and-state.md`
- `02_favorite-button_custom-hooks.md`
- `03_search-input_refs-and-effects.md`
- `04_character-quiz_redux-integration.md`

---

## Quality Checklist

Before finalizing a tutorial, verify:
- [ ] All code snippets are copied directly from the codebase
- [ ] Every React concept is explained with official definition + analogy + implementation
- [ ] At least 3 practice exercises are included
- [ ] Common mistakes section is present and helpful
- [ ] Related components are referenced
- [ ] TypeScript types are explained when relevant
- [ ] Accessibility considerations are mentioned
- [ ] Code is properly formatted and indented
- [ ] All sections from template are present
- [ ] Tutorial flows logically from simple to complex

---

## Example Learning Path

### Week 1: Fundamentals
1. MovieCard (Props, State, Events)
2. FavoriteButton (Custom Hooks)
3. Footer (Basic Component Structure)

### Week 2: Intermediate Concepts
4. SearchInput (Refs, Effects, Generic Types)
5. Navigation (React Router, Active States)
6. MovieCarousel (Lists, Animations)

### Week 3: Advanced Patterns
7. CharacterQuiz (Redux, Complex State)
8. GuessingGame (Advanced State Management)
9. ParksPage (Component Composition)

---

## Adaptation Notes

When generating coursework:
1. **Check the current state** of components - they may have evolved
2. **Use file_search** to find the latest version of components
3. **Read the full component** before writing the tutorial
4. **Reference related files** (hooks, types, Redux slices) when relevant
5. **Test concepts** by explaining them as if to a beginner
6. **Cross-reference** with React documentation for accuracy

---

## Success Metrics

A successful tutorial should enable the student to:
- ✅ Understand WHY the code is written a certain way
- ✅ Identify the React concepts being used
- ✅ Modify the component with confidence
- ✅ Apply the patterns to new components
- ✅ Debug common issues independently
- ✅ Explain the code to others

---

## Updates and Maintenance

This guide should be updated when:
- New React patterns are introduced to the codebase
- Major component refactors occur
- New libraries are integrated
- Student feedback suggests improvements
- React best practices evolve

---

*Last Updated: November 30, 2025*
```
