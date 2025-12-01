# Tutorial 01: MovieCard Component

## Props, State, Event Handling, and Conditional Rendering

---

## Overview

The `MovieCard` component is one of the core UI elements in the Disney App. It displays a movie poster, title, release year, and a favorite button. You'll see this component used throughout the app - on the Movies page, in carousels, in search results, and more.

**What makes it a great learning component:**

- It's visual and interactive, so you can immediately see the results of your learning
- It demonstrates fundamental React concepts you'll use in every component
- It's real production code with practical patterns
- It balances simplicity with real-world complexity

---

## React Concepts Covered in This Tutorial

- ✅ **Props** - Passing data to components
- ✅ **TypeScript Interfaces** - Type-safe props
- ✅ **State (useState)** - Managing component data
- ✅ **Event Handling** - Responding to user interactions
- ✅ **Conditional Rendering** - Showing/hiding elements
- ✅ **JSX** - Writing HTML-like syntax in JavaScript
- ✅ **Framer Motion** - Basic animations
- ✅ **Component Composition** - Using child components
- ✅ **Accessibility** - ARIA labels and semantic HTML

---

## Concept 1: Props (Component Inputs)

### 📖 Official Definition

> Props (short for "properties") are read-only inputs passed from a parent component to a child component. They allow you to customize components and make them reusable.

### 💡 Simple Explanation

Think of props like the settings on a TV remote. The remote (parent component) sends signals (props) to the TV (child component) to change the channel, volume, etc. The TV receives these signals and responds accordingly, but it doesn't change the remote itself.

**Key Rules:**

1. Props flow **one way** - from parent → child (never backwards)
2. Props are **read-only** - a component cannot modify its own props
3. Props can be **any data type** - strings, numbers, objects, arrays, functions

### 🔍 In Our Code

```tsx
export interface MovieCardProps {
  movie: Movie;
  onClick?: (movieId: string) => void;
  index?: number;
  skipAnimation?: boolean;
}

export const MovieCard = ({
  movie,
  onClick,
  index = 0,
  skipAnimation = false,
}: MovieCardProps) => {
  // Component logic here...
};
```

### How It Works

Let's break this down line by line:

**1. TypeScript Interface Definition:**

```tsx
export interface MovieCardProps {
```

- `export` means other files can use this interface
- `interface` defines the "shape" of the props object
- `MovieCardProps` is the name we give to this type

**2. Required Props:**

```tsx
movie: Movie;
```

- `movie` is **required** (no `?` after the name)
- Type is `Movie` (another interface defined in `/types/Movie.ts`)
- Contains data like: `id`, `title`, `releaseYear`, `image_1`, etc.

**3. Optional Props:**

```tsx
  onClick?: (movieId: string) => void;
  index?: number;
  skipAnimation?: boolean;
```

- The `?` makes these props **optional**
- `onClick` is a function that takes a `movieId` and returns nothing (`void`)
- `index` is a number (used for stagger animations)
- `skipAnimation` is a boolean to disable entry animations

**4. Destructuring Props:**

```tsx
export const MovieCard = ({
  movie,
  onClick,
  index = 0,
  skipAnimation = false,
}: MovieCardProps) => {
```

This destructuring syntax is equivalent to:

```tsx
export const MovieCard = (props: MovieCardProps) => {
  const movie = props.movie;
  const onClick = props.onClick;
  const index = props.index ?? 0; // default value
  const skipAnimation = props.skipAnimation ?? false; // default value
};
```

**Why destructure?** It's cleaner! Instead of writing `props.movie` everywhere, you just write `movie`.

**Default values:** `index = 0` means "if no index is provided, use 0"

### Why We Use It This Way

**TypeScript interfaces for props:**

- Catches errors at development time (before running code)
- Provides autocomplete in VS Code
- Self-documenting - you can see what props are available

**Optional props with `?`:**

- Makes components flexible
- Not every use case needs `onClick` or custom `index`
- Allows progressive enhancement

**Default values:**

- Prevents `undefined` errors
- Provides sensible fallbacks
- Simplifies parent component code (don't need to always specify every prop)

### ⚠️ Common Mistakes

**❌ Modifying props directly:**

```tsx
// WRONG - props are read-only!
const MovieCard = ({ movie }: MovieCardProps) => {
  movie.title = "New Title"; // ERROR!
};
```

**❌ Forgetting TypeScript types:**

```tsx
// WRONG - no type safety
export const MovieCard = ({ movie, onClick }) => {
  // What fields does movie have? What parameters does onClick take?
  // No autocomplete, no error checking!
};
```

**❌ Not providing default values for optional props:**

```tsx
// RISKY - index could be undefined
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3, delay: index * 0.05 }}
//                                     ^^^^^ Could be undefined!
```

**✅ Correct approach:**

```tsx
transition={{ duration: 0.3, delay: (index ?? 0) * 0.05 }}
// Or use default in destructuring: index = 0
```

---

## Concept 2: State (Component Memory)

### 📖 Official Definition

> State is a component's internal data that can change over time. When state changes, React automatically re-renders the component to reflect the new data.

### 💡 Simple Explanation

State is like a component's **memory**. Imagine you have a light switch - it "remembers" whether it's ON or OFF. When you flip it, it updates its memory and changes its appearance (light on/off).

**Props vs State:**

- **Props** = Data from parent (like instructions given to you)
- **State** = Data owned by component (like notes you take yourself)

### 🔍 In Our Code

```tsx
import { useState } from "react";

export const MovieCard = ({
  movie,
  onClick,
  index = 0,
  skipAnimation = false,
}: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    // JSX that uses imageLoaded state...
    <img onLoad={handleImageLoad} style={{ opacity: imageLoaded ? 1 : 0 }} />
  );
};
```

### How It Works

**1. Import the Hook:**

```tsx
import { useState } from "react";
```

Hooks are special functions from React that give components superpowers. `useState` is the hook for managing state.

**2. Declare State Variable:**

```tsx
const [imageLoaded, setImageLoaded] = useState(false);
```

This one line does a lot! Let's unpack it:

```tsx
const [imageLoaded, setImageLoaded] = useState(false);
//     ^^^^^^^^^^^  ^^^^^^^^^^^^^^         ^^^^^
//     current      function to             initial
//     value        update value            value
```

- **`imageLoaded`** - The current state value (starts as `false`)
- **`setImageLoaded`** - Function to update the state
- **`useState(false)`** - Initialize state to `false`

**Why is it an array?** This is called "array destructuring":

```tsx
// What useState actually returns:
// [currentValue, updateFunction]

// We destructure it to give them meaningful names:
const stateArray = useState(false);
const imageLoaded = stateArray[0]; // current value
const setImageLoaded = stateArray[1]; // update function

// Shorthand (what we actually write):
const [imageLoaded, setImageLoaded] = useState(false);
```

**3. Update State:**

```tsx
const handleImageLoad = () => {
  setImageLoaded(true);
};
```

When the image finishes loading, we call `setImageLoaded(true)`. This:

1. Updates the state from `false` → `true`
2. Triggers React to re-render the component
3. On re-render, `imageLoaded` will now be `true`

**4. Use State in JSX:**

```tsx
style={{ opacity: imageLoaded ? 1 : 0 }}
```

This is a **ternary operator** (inline if-else):

```tsx
condition ? valueIfTrue : valueIfFalse;

imageLoaded ? 1 : 0;
// If imageLoaded is true, use 1 (fully visible)
// If imageLoaded is false, use 0 (invisible)
```

### Why We Use State Here

**Problem:** Images take time to load. While loading, we don't want to show:

- A broken image icon
- A sudden "pop" when the image appears
- Skeleton loaders that disappear too early

**Solution:** Track when the image has loaded:

1. Start with `imageLoaded = false`
2. Show skeleton loader
3. Start loading the image (with `opacity: 0` so it's invisible)
4. When image loads, `onLoad` event fires → `handleImageLoad()` → `setImageLoaded(true)`
5. Component re-renders with `imageLoaded = true`
6. Skeleton disappears, image fades in with `opacity: 1`

Result: Smooth, professional loading experience! ✨

### ⚠️ Common Mistakes

**❌ Mutating state directly:**

```tsx
// WRONG - doesn't trigger re-render!
imageLoaded = true;
```

**❌ Forgetting state is asynchronous:**

```tsx
// WRONG - logging immediately after setting state
setImageLoaded(true);
console.log(imageLoaded); // Still false! State hasn't updated yet
```

**❌ Not using functional updates for derived state:**

```tsx
// If new state depends on old state, use function form:
const [count, setCount] = useState(0);

// RISKY (can cause issues with rapid updates):
setCount(count + 1);

// BETTER:
setCount((prevCount) => prevCount + 1);
```

**✅ Correct patterns in MovieCard:**

```tsx
// Simple boolean state
const [imageLoaded, setImageLoaded] = useState(false);

// Update state in response to event
const handleImageLoad = () => {
  setImageLoaded(true);
};

// Use state to conditionally render
{
  !imageLoaded && <div className="skeleton">Loading...</div>;
}
<img style={{ opacity: imageLoaded ? 1 : 0 }} />;
```

---

## Concept 3: Event Handling

### 📖 Official Definition

> Event handling in React allows components to respond to user interactions like clicks, keyboard input, mouse movements, etc. Event handlers are functions that run when specific events occur.

### 💡 Simple Explanation

Event handlers are like **automatic doors at a supermarket**. When you approach (trigger event), the door opens (handler function runs). Different triggers → different actions.

### 🔍 In Our Code

```tsx
const MovieCard = ({
  movie,
  onClick,
  index = 0,
  skipAnimation = false,
}: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Event Handler #1: Handle card click
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(movie.id);
    }
  };

  // Event Handler #2: Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Event Handler #3: Handle image error
  const handleImageError = () => {
    setImageLoaded(true);
  };

  return (
    <motion.div className="movie-card">
      <a
        href={`/movie/${movie.id}`}
        onClick={handleClick} // ← Attach handler
      >
        <img
          src={movie.posterUrl}
          onLoad={handleImageLoad} // ← Attach handler
          onError={handleImageError} // ← Attach handler
        />
      </a>
    </motion.div>
  );
};
```

### How It Works

**1. Defining Event Handlers:**

```tsx
const handleClick = (e: React.MouseEvent) => {
  // e is the event object (contains info about the click)
  if (onClick) {
    e.preventDefault(); // Stop default link behavior
    onClick(movie.id); // Call parent's onClick handler
  }
};
```

**Naming Convention:**

- Start with `handle` + event name: `handleClick`, `handleImageLoad`, `handleSubmit`
- Makes it clear this is an event handler
- Distinguishes from the prop (`onClick` prop vs `handleClick` handler)

**Event Parameter:**

- `e: React.MouseEvent` - TypeScript type for mouse events
- Contains info: which button clicked, mouse position, target element, etc.
- Other event types: `React.KeyboardEvent`, `React.ChangeEvent`, `React.FormEvent`

**2. Event Methods:**

```tsx
e.preventDefault();
```

- Prevents default browser behavior
- For links: stops navigation
- For forms: stops page refresh
- For buttons: stops form submission

```tsx
e.stopPropagation();
```

- Stops event from bubbling up to parent elements
- Example: Clicking favorite button shouldn't also trigger card click
- (We use this in FavoriteButton, which you'll see in the next tutorial!)

**3. Conditional Logic in Handlers:**

```tsx
if (onClick) {
  e.preventDefault();
  onClick(movie.id);
}
```

Why check `if (onClick)`?

- `onClick` prop is **optional** (has `?` in the interface)
- If parent didn't provide it, `onClick` is `undefined`
- Calling `undefined()` would crash! 💥
- So we check: "Do we have a function? If yes, call it."

**4. Multiple Handlers for Same Event:**

```tsx
// Image loaded successfully
const handleImageLoad = () => {
  setImageLoaded(true);
};

// Image failed to load
const handleImageError = () => {
  setImageLoaded(true); // Still hide skeleton, show fallback
};
```

Same end result (hide skeleton), different reasons. This makes the UI resilient!

**5. Attaching Handlers to Elements:**

```tsx
// Inline (passing reference to function):
<a onClick={handleClick}>

// With inline arrow function (for passing parameters):
<button onClick={() => handleDelete(movie.id)}>

// In MovieCard, we use direct reference:
onLoad={handleImageLoad}    // ← No parentheses! Passing the function, not calling it
onError={handleImageError}
```

**⚠️ Critical Difference:**

```tsx
// ✅ CORRECT - Pass function reference
onClick={handleClick}

// ❌ WRONG - Calls function immediately during render!
onClick={handleClick()}

// ✅ CORRECT - If you need to pass parameters, use arrow function
onClick={() => handleClick(someParameter)}
```

### Why We Use Event Handlers This Way

**1. Flexibility with Optional onClick:**

```tsx
// Parent Component A - wants custom click behavior:
<MovieCard movie={movie} onClick={(id) => navigate(`/movie/${id}`)} />

// Parent Component B - uses default link behavior:
<MovieCard movie={movie} />
```

One component, two behaviors! The parent decides.

**2. Image Loading Resilience:**

```tsx
onLoad = { handleImageLoad }; // Success: hide skeleton
onError = { handleImageError }; // Error: also hide skeleton (show fallback image)
```

Whether image loads or fails, the skeleton disappears. User always sees something!

**3. Type Safety with TypeScript:**

```tsx
const handleClick = (e: React.MouseEvent) => {
  e.preventDefault(); // TypeScript knows this method exists
  e.currentTarget; // Autocomplete suggests available properties
};
```

### ⚠️ Common Mistakes

**❌ Calling handler instead of passing it:**

```tsx
// WRONG - calls immediately!
<button onClick={handleClick()}>
```

**❌ Forgetting to check optional props:**

```tsx
// WRONG - crashes if onClick is undefined!
const handleClick = () => {
  onClick(movie.id); // 💥 Cannot call undefined
};

// CORRECT
const handleClick = () => {
  if (onClick) {
    onClick(movie.id);
  }
};
```

**❌ Not preventing default on links when needed:**

```tsx
// If you have custom onClick logic but forget preventDefault:
<a href="/movie/123" onClick={handleClick}>
// Browser navigates to /movie/123 AND runs handleClick
// Can cause double navigation or unexpected behavior
```

**❌ Incorrect event type:**

```tsx
// WRONG type
const handleClick = (e: React.KeyboardEvent) => {
  e.preventDefault(); // TypeScript error - wrong event type for onClick
};

// CORRECT
const handleClick = (e: React.MouseEvent) => {
  e.preventDefault(); // ✓
};
```

---

## Concept 4: Conditional Rendering

### 📖 Official Definition

> Conditional rendering in React works the same way conditions work in JavaScript. You can use JavaScript operators like `if`, ternary operator `? :`, or logical `&&` to create elements that represent the current state.

### 💡 Simple Explanation

Conditional rendering is like a **magic trick** - now you see it, now you don't! Based on certain conditions (state, props, etc.), you decide whether to show or hide elements.

Think of Netflix: If you're logged in, show your profile. If not, show a login button. Same page, different content based on condition.

### 🔍 In Our Code

The MovieCard uses **three different patterns** for conditional rendering. Let's explore each:

**Pattern 1: Logical AND (`&&`) Operator**

```tsx
{
  !imageLoaded && (
    <div className="movie-card__skeleton">
      <div className="skeleton skeleton--image"></div>
    </div>
  );
}
```

**How it works:**

```tsx
condition && <Component />;

// If condition is true → render <Component />
// If condition is false → render nothing
```

**In our case:**

```tsx
!imageLoaded && <skeleton>
// Translation: "If image NOT loaded, show skeleton"

// When imageLoaded = false: !false = true → show skeleton
// When imageLoaded = true:  !true = false → hide skeleton
```

**Why `&&`?**

- Clean and concise
- Perfect for "show or hide" scenarios
- No "else" case needed

**Pattern 2: Ternary Operator (`? :`)**

```tsx
<img
  src={
    movie.image_1
      ? getImageUrl("movies", movie.image_1)
      : movie.posterUrl ||
        `https://picsum.photos/seed/${movie.id}-movie/400/300`
  }
  style={{ opacity: imageLoaded ? 1 : 0 }}
/>
```

**How it works:**

```tsx
condition ? valueIfTrue : valueIfFalse;
```

**Example 1: Image source**

```tsx
movie.image_1
  ? getImageUrl("movies", movie.image_1) // ← Use custom image
  : movie.posterUrl || fallbackUrl; // ← Use poster or fallback
```

Breakdown:

1. Check: Does `movie.image_1` exist?
2. If yes → build URL with `getImageUrl()`
3. If no → check `movie.posterUrl`, or use placeholder

**Example 2: Opacity**

```tsx
opacity: imageLoaded ? 1 : 0;

// imageLoaded = true  → opacity: 1 (visible)
// imageLoaded = false → opacity: 0 (invisible)
```

**Why ternary?**

- Need to provide two different values
- More concise than if-else
- Works inline in JSX

**Pattern 3: Conditional Props/Styles**

```tsx
<motion.div
  initial={skipAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={
    skipAnimation
      ? { duration: 0 }
      : { duration: 0.3, delay: index * 0.05 }
  }
>
```

**How it works:**
Entire objects change based on condition:

```tsx
// If skipAnimation = true:
initial={{ opacity: 1, y: 0 }}     // ← Start fully visible
transition={{ duration: 0 }}        // ← Instant (no animation)

// If skipAnimation = false:
initial={{ opacity: 0, y: 20 }}    // ← Start invisible, below
transition={{ duration: 0.3, delay: index * 0.05 }}  // ← Animate in
```

**Why conditionally disable animation?**

- Performance: Don't animate 100s of cards
- UX: Instant load when coming from detail page
- Parent controls via prop: `<MovieCard skipAnimation={true} />`

### Comparing Conditional Rendering Patterns

| Pattern                 | Use Case                  | Example                                    |
| ----------------------- | ------------------------- | ------------------------------------------ |
| `&&`                    | Show/hide single element  | `{loading && <Spinner />}`                 |
| `? :`                   | Choose between two values | `{isLoggedIn ? <Profile /> : <Login />}`   |
| `condition && a \|\| b` | Fallback chain            | `{imageUrl \|\| fallbackUrl}`              |
| Object spread           | Conditional props         | `{...isActive && { className: 'active' }}` |

**In MovieCard, we use:**

- `&&` for showing skeleton while loading
- `? :` for choosing image source and opacity
- `? :` for animation config objects

### Why We Use Conditional Rendering

**1. Progressive Image Loading:**

```tsx
{
  !imageLoaded && <Skeleton />;
} // Show skeleton first
<img style={{ opacity: imageLoaded ? 1 : 0 }} />; // Fade in when ready
```

**Result:** Smooth loading experience, no jarring pop-ins

**2. Fallback Image Handling:**

```tsx
src={movie.image_1 ? customImage : movie.posterUrl || placeholderImage}
```

**Result:** Always show _something_, even if data is missing

**3. Performance Optimization:**

```tsx
initial={skipAnimation ? noAnimation : withAnimation}
```

**Result:** Skip animations when they'd hurt performance

### ⚠️ Common Mistakes

**❌ Using `&&` with numbers:**

```tsx
// WRONG - renders "0" on the page!
{
  items.length && <ItemList items={items} />;
}
// When items.length = 0, renders "0" instead of nothing

// CORRECT
{
  items.length > 0 && <ItemList items={items} />;
}
// Or:
{
  items.length !== 0 && <ItemList items={items} />;
}
```

**❌ Complex ternaries (hard to read):**

```tsx
// WRONG - too complex
{
  isLoading ? (
    <Spinner />
  ) : hasError ? (
    <Error />
  ) : hasData ? (
    <Data />
  ) : (
    <Empty />
  );
}

// BETTER - extract to variable or function
const renderContent = () => {
  if (isLoading) return <Spinner />;
  if (hasError) return <Error />;
  if (hasData) return <Data />;
  return <Empty />;
};

return <div>{renderContent()}</div>;
```

**❌ Forgetting null/undefined safety:**

```tsx
// RISKY
{
  movie.image_1 ? getImageUrl(movie.image_1) : placeholder;
}
// What if movie is undefined?

// BETTER
{
  movie?.image_1 ? getImageUrl(movie.image_1) : placeholder;
}
//       ↑ Optional chaining
```

**✅ Best Practices in MovieCard:**

```tsx
// Clean boolean with &&
{!imageLoaded && <Skeleton />}

// Ternary for two clear options
opacity: imageLoaded ? 1 : 0

// Fallback chain with ||
movie.posterUrl || `https://picsum.photos/...`

// Conditional entire objects
initial={skipAnimation ? {...} : {...}}
```

---

## Concept 5: Framer Motion (Animations)

### 📖 Official Definition

> Framer Motion is a production-ready motion library for React. It provides simple yet powerful APIs to create animations and gestures with declarative syntax.

### 💡 Simple Explanation

Framer Motion is like **CSS transitions on steroids**. Instead of writing complex CSS animations, you describe _what_ you want (start position, end position, timing) and Framer Motion handles the _how_.

Think of it like Google Maps directions: You say "I want to go from A to B," and it figures out the smoothest route.

### 🔍 In Our Code

```tsx
import { motion } from "framer-motion";

export const MovieCard = ({
  movie,
  onClick,
  index = 0,
  skipAnimation = false,
}) => {
  return (
    <motion.div
      className="movie-card"
      initial={skipAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        skipAnimation ? { duration: 0 } : { duration: 0.3, delay: index * 0.05 }
      }
    >
      {/* Card content */}
    </motion.div>
  );
};
```

### How It Works

**1. The `motion` Component:**

```tsx
<motion.div>  ← Instead of <div>
```

Framer Motion provides `motion.X` for any HTML element:

- `motion.div`
- `motion.button`
- `motion.img`
- `motion.section`
- etc.

These are just regular HTML elements with animation superpowers!

**2. The `initial` Prop (Starting State):**

```tsx
initial={{ opacity: 0, y: 20 }}
```

This defines where the animation **starts**:

- `opacity: 0` → Invisible
- `y: 20` → 20 pixels down from final position

**3. The `animate` Prop (Ending State):**

```tsx
animate={{ opacity: 1, y: 0 }}
```

This defines where the animation **ends**:

- `opacity: 1` → Fully visible
- `y: 0` → Final position (no vertical offset)

**Framer Motion automatically animates from `initial` → `animate`!**

**4. The `transition` Prop (How to Animate):**

```tsx
transition={{ duration: 0.3, delay: index * 0.05 }}
```

Controls the animation timing:

- `duration: 0.3` → Animation takes 300ms (0.3 seconds)
- `delay: index * 0.05` → Wait before starting

**Stagger Effect:**

```tsx
delay: index * 0.05;

// Card 0: delay = 0 * 0.05 = 0ms (starts immediately)
// Card 1: delay = 1 * 0.05 = 50ms (starts 50ms later)
// Card 2: delay = 2 * 0.05 = 100ms (starts 100ms later)
// etc.
```

Result: Cards animate in one after another, creating a **waterfall effect**! 🌊

**5. Conditional Animation:**

```tsx
skipAnimation
  ? { duration: 0 }              // ← Instant (no animation)
  : { duration: 0.3, delay: ... } // ← Smooth animation
```

When `skipAnimation={true}`:

- `initial={{ opacity: 1, y: 0 }}` → Start at final position
- `transition={{ duration: 0 }}` → Skip animation (instant)

Result: Cards appear instantly (better for large lists)

### Why We Use Framer Motion

**1. Smooth Entry Animation:**

```tsx
initial={{ opacity: 0, y: 20 }}  // Start below and invisible
animate={{ opacity: 1, y: 0 }}    // Float up and fade in
```

**Feel:** Professional, polished, Disney-quality! ✨

**2. Staggered Grid:**

```tsx
delay: index * 0.05;
```

Cards don't all pop in at once - they flow in smoothly. This:

- Looks more natural
- Draws eye across the grid
- Feels responsive and alive

**3. Performance Control:**

```tsx
skipAnimation={true}  // When performance matters
```

Rendering 100 animated cards can be slow. Parent decides when to animate.

**4. Declarative (Easy to Understand):**

```tsx
// CSS approach - imperative, complex:
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.card { animation: fadeInUp 0.3s ease-out; }

// Framer Motion - declarative, clear:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
/>
```

### ⚠️ Common Mistakes

**❌ Animating every property (performance issues):**

```tsx
// WRONG - animates everything, slow!
<motion.div
  animate={{
    boxShadow: "...",
    backgroundImage: "...",
    filter: "...",
  }}
/>

// BETTER - animate only opacity and transform (fast!)
<motion.div animate={{ opacity: 1, scale: 1 }} />
```

**❌ No conditional animation for long lists:**

```tsx
// WRONG - animates 500 cards = slow!
{movies.map((movie, index) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

// BETTER - allow parent to disable animation
{movies.map((movie, index) => (
  <MovieCard skipAnimation={movies.length > 50} />
```

**❌ Forgetting to use `motion.X`:**

```tsx
// WRONG - animation props don't work on regular div!
<div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

// CORRECT
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
```

**✅ Best Practices in MovieCard:**

- Only animate opacity and transforms (performant)
- Provide `skipAnimation` option
- Use stagger delays for visual interest
- Keep durations short (0.3s feels snappy)

---

## Full Component Walkthrough

Now let's look at the complete component with comprehensive annotations:

```tsx
// 1. IMPORTS
import { motion } from "framer-motion"; // Animation library
import { useState } from "react"; // State management hook
import { Movie } from "../../types/Movie"; // TypeScript type
import { FavoriteButton } from "../FavoriteButton/FavoriteButton"; // Child component
import { getImageUrl } from "../../config/assets"; // Helper function
import "./MovieCard.scss"; // Component styles

// 2. TYPESCRIPT INTERFACE (Props Contract)
export interface MovieCardProps {
  movie: Movie; // Required: Movie data
  onClick?: (movieId: string) => void; // Optional: Custom click handler
  index?: number; // Optional: Position in list (for animation)
  skipAnimation?: boolean; // Optional: Disable entry animation
}

// 3. COMPONENT DEFINITION
export const MovieCard = ({
  movie, // Destructure props
  onClick,
  index = 0, // Default to 0
  skipAnimation = false, // Default to false (animations enabled)
}: MovieCardProps) => {
  // 4. STATE
  const [imageLoaded, setImageLoaded] = useState(false);
  // Tracks whether image has finished loading
  // Starts as false, becomes true when <img onLoad> fires

  // 5. EVENT HANDLERS
  const handleClick = (e: React.MouseEvent) => {
    // Handles clicking on the card
    if (onClick) {
      // If parent provided onClick function...
      e.preventDefault(); // Stop default link navigation
      onClick(movie.id); // Call parent's function with movie ID
    }
    // If no onClick, browser follows the <a> href normally
  };

  const handleImageLoad = () => {
    // Called when image successfully loads
    setImageLoaded(true); // Update state → triggers re-render
  };

  const handleImageError = () => {
    // Called if image fails to load
    setImageLoaded(true); // Still hide skeleton (show fallback image)
  };

  // 6. RENDER (JSX)
  return (
    <motion.div
      className="movie-card"
      // Animation: Start state (where animation begins)
      initial={skipAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      //      ↑ If skipAnimation=true: start visible at final position
      //      ↑ If skipAnimation=false: start invisible and 20px down

      // Animation: End state (where animation finishes)
      animate={{ opacity: 1, y: 0 }}
      // All cards end up fully visible (opacity: 1) at their natural position (y: 0)

      // Animation: Timing config
      transition={
        skipAnimation
          ? { duration: 0 } // Instant (0ms)
          : { duration: 0.3, delay: index * 0.05 } // 300ms with stagger delay
      }
    >
      {/* Link wraps entire card - makes whole card clickable */}
      <a
        href={`/movie/${movie.id}`} // Fallback URL (works without JS)
        className="movie-card__link"
        aria-label={`View details for ${movie.title}`} // Accessibility
        onClick={handleClick} // Custom click handling
      >
        {/* IMAGE CONTAINER */}
        <div className="movie-card__image">
          {/* SKELETON LOADER - shown while image loading */}
          {!imageLoaded && ( // Conditional: only show if image NOT loaded
            <div className="movie-card__skeleton">
              <div className="skeleton skeleton--image"></div>
            </div>
          )}

          {/* ACTUAL IMAGE */}
          <img
            // Image source with fallback chain:
            src={
              movie.image_1
                ? getImageUrl("movies", movie.image_1) // Primary: custom image
                : movie.posterUrl || // Secondary: poster URL
                  `https://picsum.photos/seed/${movie.id}-movie/400/300` // Fallback: placeholder
            }
            alt={movie.title} // Alt text for accessibility
            loading="lazy" // Browser-native lazy loading
            onLoad={handleImageLoad} // Event: image loaded successfully
            onError={handleImageError} // Event: image failed to load
            style={{ opacity: imageLoaded ? 1 : 0 }} // Fade in when loaded
            // Start invisible (0), become visible (1) when imageLoaded=true
          />
        </div>

        {/* MOVIE INFO */}
        <div className="movie-card__info">
          {/* LOADING SKELETON for text */}
          {!imageLoaded && ( // Show while loading
            <>
              <div className="skeleton skeleton--title"></div>
              <div className="skeleton skeleton--meta"></div>
            </>
          )}

          {/* TITLE ROW (with favorite button) */}
          <div className="movie-card__title-row">
            {/* Child Component: Favorite Button */}
            <FavoriteButton
              id={movie.id} // Pass movie ID
              type="movie" // Specify type (movie vs character)
              ariaLabel={`Favorite ${movie.title}`} // Accessibility label
              size={20} // Icon size in pixels
            />

            {/* Movie Title */}
            <h3
              className="movie-card__title"
              style={{ opacity: imageLoaded ? 1 : 0 }} // Fade in with image
            >
              {movie.title}
            </h3>
          </div>

          {/* METADATA (release year) */}
          <div
            className="movie-card__meta"
            style={{ opacity: imageLoaded ? 1 : 0 }} // Fade in with image
          >
            <span className="movie-card__year">{movie.releaseYear}</span>
          </div>
        </div>
      </a>
    </motion.div>
  );
};
```

---

## Key Takeaways

### ✨ Big Picture Concepts

1. **Props = Configuration**

   - Props flow down from parent to child
   - Make components reusable and flexible
   - Always typed with TypeScript interfaces

2. **State = Memory**

   - Components remember things with `useState`
   - State changes trigger re-renders
   - Update with setter function, never mutate directly

3. **Events = Interactivity**

   - Functions that run when users interact
   - Pass function reference, not function call
   - Use TypeScript types for event objects

4. **Conditional Rendering = Dynamic UI**

   - `&&` for show/hide
   - `? :` for either/or
   - Makes UI responsive to data and state

5. **Animations = Polish**
   - Framer Motion makes animations declarative
   - Only animate opacity and transforms for performance
   - Provide escape hatches (`skipAnimation`) for long lists

### 🎯 Patterns You'll Use Everywhere

```tsx
// 1. Props with defaults
const Component = ({ required, optional = "default" }: Props) => {};

// 2. Boolean state for loading/visibility
const [isOpen, setIsOpen] = useState(false);

// 3. Event handlers that check optional props
const handleClick = () => {
  if (onClickProp) {
    onClickProp(data);
  }
};

// 4. Conditional rendering
{
  isLoading && <Spinner />;
}
{
  data ? <Content data={data} /> : <Empty />;
}

// 5. Basic animation
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />;
```

### 🔧 Best Practices Demonstrated

- ✅ TypeScript for type safety
- ✅ Destructuring props with defaults
- ✅ Named exports for better tree-shaking
- ✅ Accessibility (ARIA labels, semantic HTML)
- ✅ Performance (lazy loading, conditional animation)
- ✅ Fallback handling (image errors, missing data)
- ✅ Composition (using child components like FavoriteButton)

---

## Practice Exercises

### 🟢 Exercise 1: Add a "Watched" Badge (Beginner)

**Goal:** Add a prop called `isWatched` that displays a green checkmark badge when `true`.

**Requirements:**

1. Add `isWatched?: boolean` to the `MovieCardProps` interface
2. Create a badge element that only shows when `isWatched` is true
3. Position it in the top-right corner of the card

**Hints:**

- Use conditional rendering with `&&`
- Add CSS class `.movie-card__watched-badge`
- Use absolute positioning in SCSS

**Solution approach:**

```tsx
export interface MovieCardProps {
  movie: Movie;
  onClick?: (movieId: string) => void;
  index?: number;
  skipAnimation?: boolean;
  isWatched?: boolean; // ← Add this
}

export const MovieCard = ({
  movie,
  onClick,
  index = 0,
  skipAnimation = false,
  isWatched = false,
}) => {
  return (
    <motion.div className="movie-card">
      {/* Add this inside the card */}
      {isWatched && (
        <div className="movie-card__watched-badge">
          <svg>✓</svg>
        </div>
      )}
      {/* Rest of component... */}
    </motion.div>
  );
};
```

---

### 🟡 Exercise 2: Hover State with Scale Animation (Intermediate)

**Goal:** Add a scale animation when the user hovers over the card.

**Requirements:**

1. Add state to track hover status
2. Use `onMouseEnter` and `onMouseLeave` events
3. Use Framer Motion's `animate` prop to scale the card to 1.05 when hovered

**Hints:**

- Create `const [isHovered, setIsHovered] = useState(false)`
- The `animate` prop can be dynamic: `animate={{ scale: isHovered ? 1.05 : 1 }}`
- Don't forget to add event handlers to the `motion.div`

**Learning objectives:**

- Practice useState for UI state
- Learn to combine animations with state
- Understand mouse events

---

### 🔴 Exercise 3: Lazy Load with Intersection Observer (Advanced)

**Goal:** Replace the simple `loading="lazy"` with a custom Intersection Observer that only loads the image when it's near the viewport.

**Requirements:**

1. Create a custom hook `useIntersectionObserver`
2. Use `useRef` to reference the card element
3. Only set the image `src` when the card intersects the viewport
4. Show skeleton until intersection happens

**Hints:**

- Research `IntersectionObserver` API
- Use `useRef` to get the DOM element
- Use `useEffect` to set up the observer
- Create state like `const [shouldLoad, setShouldLoad] = useState(false)`

**Learning objectives:**

- Advanced hooks (`useRef`, `useEffect`)
- Browser APIs (Intersection Observer)
- Performance optimization techniques
- Custom hook creation

**Challenge:** Make the hook reusable for other components!

---

## Related Components to Study Next

Now that you understand **MovieCard**, you're ready for:

### Next: [FavoriteButton](./02_favorite-button_custom-hooks.md)

- **Why:** You saw `<FavoriteButton />` used in MovieCard - time to see how it works!
- **Concepts:** Custom hooks, Redux integration, event propagation
- **Difficulty:** Intermediate

### Alternative: [CharacterCard](./03_character-card_component-similarity.md)

- **Why:** Very similar to MovieCard - great for reinforcement
- **Concepts:** Same patterns, different data type
- **Difficulty:** Beginner (reinforcement)

### Later: [SearchInput](./04_search-input_refs-and-effects.md)

- **Why:** More advanced state management and effects
- **Concepts:** `useRef`, `useEffect`, debouncing, dropdown UX
- **Difficulty:** Intermediate-Advanced

---

## Further Reading

### Official React Documentation

- [Components and Props](https://react.dev/learn/passing-props-to-a-component)
- [State: A Component's Memory](https://react.dev/learn/state-a-components-memory)
- [Responding to Events](https://react.dev/learn/responding-to-events)
- [Conditional Rendering](https://react.dev/learn/conditional-rendering)

### Framer Motion

- [Introduction to Framer Motion](https://www.framer.com/motion/introduction/)
- [Animation Props](https://www.framer.com/motion/animation/)

### TypeScript with React

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### In the Disney App Codebase

- `/frontend/src/types/Movie.ts` - Movie type definition
- `/frontend/src/config/assets.ts` - Image URL helper
- `/frontend/src/components/FavoriteButton/` - Child component used in MovieCard
- `/frontend/src/pages/MoviesPage/` - See MovieCard in action

---

## Feedback & Questions

As you work through this tutorial:

- ✅ Try the exercises
- ✅ Experiment by modifying the actual MovieCard component
- ✅ Break things and fix them (best way to learn!)
- ✅ Ask questions about anything unclear

**Remember:** Every React developer started where you are now. The Disney App is _your_ codebase - you have real, working examples of every pattern. Use them!

---

_Tutorial by: GitHub Copilot_  
_Last Updated: November 30, 2025_  
_Component Version: MovieCard.tsx (current)_
