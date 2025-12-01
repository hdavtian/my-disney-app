# React Quick Reference - Disney App Patterns

A handy cheat sheet of common patterns used throughout the Disney App. Keep this open while coding!

---

## 🔧 Component Structure Template

```tsx
import { useState, useEffect } from "react";
import "./ComponentName.scss";

// 1. TypeScript Interface
export interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: number;
  onEvent?: (data: string) => void;
}

// 2. Component Definition
export const ComponentName = ({
  requiredProp,
  optionalProp = 42,
  onEvent,
}: ComponentNameProps) => {
  // 3. State
  const [count, setCount] = useState(0);

  // 4. Effects
  useEffect(
    () => {
      // Side effect logic
      return () => {
        // Cleanup
      };
    },
    [
      /* dependencies */
    ]
  );

  // 5. Event Handlers
  const handleClick = () => {
    setCount((prev) => prev + 1);
    if (onEvent) {
      onEvent("clicked");
    }
  };

  // 6. Render
  return (
    <div className="component-name">
      <button onClick={handleClick}>Count: {count}</button>
    </div>
  );
};
```

---

## 📦 Common Props Patterns

### Optional Props with Defaults

```tsx
interface Props {
  size?: "small" | "medium" | "large";
  onClick?: () => void;
}

const Component = ({ size = "medium", onClick }: Props) => {
  // size is guaranteed to have a value
};
```

### Function Props (Callbacks)

```tsx
interface Props {
  onSubmit?: (data: FormData) => void;
  onError?: (error: Error) => void;
}

const handleSubmit = () => {
  if (onSubmit) {
    // Check before calling!
    onSubmit(formData);
  }
};
```

### Children Prop

```tsx
interface Props {
  children: React.ReactNode;
}

const Container = ({ children }: Props) => (
  <div className="container">{children}</div>
);
```

---

## 🎨 State Patterns

### Simple Boolean State

```tsx
const [isOpen, setIsOpen] = useState(false);

// Toggle
setIsOpen(!isOpen);
// or
setIsOpen((prev) => !prev);
```

### Object State

```tsx
const [user, setUser] = useState({ name: "", age: 0 });

// Update single field
setUser((prev) => ({ ...prev, name: "Alice" }));

// Update multiple fields
setUser((prev) => ({ ...prev, name: "Alice", age: 30 }));
```

### Array State

```tsx
const [items, setItems] = useState<string[]>([]);

// Add item
setItems((prev) => [...prev, newItem]);

// Remove item
setItems((prev) => prev.filter((item) => item.id !== idToRemove));

// Update item
setItems((prev) =>
  prev.map((item) => (item.id === targetId ? { ...item, ...updates } : item))
);
```

### Derived State (No useState needed!)

```tsx
const [items, setItems] = useState([...]);
const [filter, setFilter] = useState("");

// Don't do this:
// const [filteredItems, setFilteredItems] = useState([]);

// Do this instead:
const filteredItems = items.filter(item =>
  item.name.includes(filter)
);
```

---

## ⚡ useEffect Patterns

### Run Once on Mount

```tsx
useEffect(() => {
  console.log("Component mounted");
  fetchData();
}, []); // Empty deps = run once
```

### Run on Dependency Change

```tsx
useEffect(() => {
  console.log("User changed:", userId);
  fetchUserData(userId);
}, [userId]); // Run when userId changes
```

### Cleanup Function

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log("Tick");
  }, 1000);

  return () => {
    clearInterval(timer); // Cleanup on unmount
  };
}, []);
```

### Skip Effect on Mount

```tsx
const isFirstRender = useRef(true);

useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }

  // This runs on updates, not on mount
  console.log("Data changed");
}, [data]);
```

---

## 🎯 Event Handling

### Click Events

```tsx
const handleClick = (e: React.MouseEvent) => {
  e.preventDefault(); // Stop default action
  e.stopPropagation(); // Stop bubbling
  console.log(e.target); // Element clicked
};

<button onClick={handleClick}>Click</button>;
```

### Input Events

```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

<input type="text" value={value} onChange={handleChange} />;
```

### Form Events

```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // Process form
};

<form onSubmit={handleSubmit}>
```

### Keyboard Events

```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    handleSubmit();
  }
  if (e.key === "Escape") {
    handleClose();
  }
};

<input onKeyDown={handleKeyDown} />;
```

### Event with Parameters

```tsx
// Method 1: Arrow function
<button onClick={() => handleDelete(item.id)}>

// Method 2: Curry function
const handleDelete = (id: string) => (e: React.MouseEvent) => {
  e.stopPropagation();
  deleteItem(id);
};

<button onClick={handleDelete(item.id)}>
```

---

## 🔀 Conditional Rendering

### Show/Hide with &&

```tsx
{
  isLoading && <Spinner />;
}
{
  error && <ErrorMessage error={error} />;
}
{
  !data && <EmptyState />;
}
```

### Either/Or with Ternary

```tsx
{
  isLoggedIn ? <Dashboard /> : <Login />;
}
{
  count > 0 ? <ItemList items={items} /> : <EmptyState />;
}
```

### Multiple Conditions

```tsx
// Extract to function for readability
const renderContent = () => {
  if (isLoading) return <Spinner />;
  if (error) return <Error />;
  if (!data) return <Empty />;
  return <Content data={data} />;
};

return <div>{renderContent()}</div>;
```

### Conditional Props

```tsx
<Button
  className={isActive ? "active" : ""}
  disabled={isLoading}
  {...(hasError && { "aria-invalid": true })}
/>
```

### Conditional Styles

```tsx
<div
  className={`card ${isSelected ? "card--selected" : ""}`}
  style={{ opacity: isVisible ? 1 : 0 }}
/>
```

---

## 🔁 Lists & Keys

### Basic List Rendering

```tsx
{
  movies.map((movie) => <MovieCard key={movie.id} movie={movie} />);
}
```

### List with Index

```tsx
{
  movies.map((movie, index) => (
    <MovieCard key={movie.id} movie={movie} index={index} />
  ));
}
```

### Conditional List Items

```tsx
{
  movies
    .filter((movie) => movie.releaseYear > 2000)
    .map((movie) => <MovieCard key={movie.id} movie={movie} />);
}
```

### Empty List Handling

```tsx
{
  movies.length > 0 ? (
    movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
  ) : (
    <EmptyState message="No movies found" />
  );
}
```

---

## 🪝 Custom Hooks

### Basic Custom Hook

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage
const [name, setName] = useLocalStorage("name", "");
```

### Hook with Cleanup

```tsx
function useEventListener(eventName: string, handler: (e: Event) => void) {
  useEffect(() => {
    window.addEventListener(eventName, handler);
    return () => {
      window.removeEventListener(eventName, handler);
    };
  }, [eventName, handler]);
}

// Usage
useEventListener("resize", handleResize);
```

---

## 🎭 Framer Motion Patterns

### Basic Animation

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
/>
```

### Hover Animation

```tsx
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} />
```

### Conditional Animation

```tsx
<motion.div
  animate={{ x: isOpen ? 0 : -300 }}
  transition={{ type: "spring" }}
/>
```

### Stagger Children

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    />
  ))}
</motion.div>
```

### Exit Animation

```tsx
import { AnimatePresence } from "framer-motion";

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>;
```

---

## 🗂️ Redux Patterns (Disney App)

### Using Selector

```tsx
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const favorites = useSelector((state: RootState) => state.favorites.items);
const theme = useSelector((state: RootState) => state.theme.current);
```

### Using Dispatch

```tsx
import { useDispatch } from "react-redux";
import { addFavorite } from "../store/slices/favoritesSlice";

const dispatch = useDispatch();

const handleAdd = () => {
  dispatch(addFavorite({ id, type, addedAt: Date.now() }));
};
```

### Typed Hooks (Best Practice)

```tsx
// In hooks/redux.ts (already done in Disney App!)
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Usage in components
import { useAppDispatch, useAppSelector } from "../hooks/redux";

const favorites = useAppSelector((state) => state.favorites.items);
const dispatch = useAppDispatch();
```

---

## 🎨 TypeScript Patterns

### Component Props

```tsx
interface ButtonProps {
  variant: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### Generic Components

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <>{items.map(renderItem)}</>;
}
```

### Event Types

```tsx
React.MouseEvent<HTMLButtonElement>;
React.ChangeEvent<HTMLInputElement>;
React.FormEvent<HTMLFormElement>;
React.KeyboardEvent<HTMLInputElement>;
React.FocusEvent<HTMLInputElement>;
```

### Ref Types

```tsx
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);
const timerRef = useRef<NodeJS.Timeout | null>(null);
```

---

## 🎯 Common Gotchas

### ❌ DON'T: Mutate State

```tsx
// WRONG
items.push(newItem);
setItems(items);

// RIGHT
setItems([...items, newItem]);
```

### ❌ DON'T: Call Hooks Conditionally

```tsx
// WRONG
if (condition) {
  useState(0);
}

// RIGHT
const [count, setCount] = useState(0);
if (condition) {
  setCount(1);
}
```

### ❌ DON'T: Forget Dependency Arrays

```tsx
// WRONG - infinite loop!
useEffect(() => {
  setCount(count + 1);
}); // No deps array!

// RIGHT
useEffect(() => {
  setCount(count + 1);
}, [someDependency]);
```

### ❌ DON'T: Use Index as Key

```tsx
// WRONG - can cause bugs
{
  items.map((item, index) => <Item key={index} item={item} />);
}

// RIGHT - use unique ID
{
  items.map((item) => <Item key={item.id} item={item} />);
}
```

---

## 📚 Quick Lookup

### When to Use Which Hook?

| Need                  | Hook          | Example                        |
| --------------------- | ------------- | ------------------------------ |
| Component memory      | `useState`    | Toggle, counter, form input    |
| Side effects          | `useEffect`   | API calls, subscriptions       |
| DOM reference         | `useRef`      | Focus input, scroll to element |
| Expensive calculation | `useMemo`     | Filter/sort large lists        |
| Stable function       | `useCallback` | Pass to child components       |
| Redux state           | `useSelector` | Get global state               |
| Redux actions         | `useDispatch` | Update global state            |
| Reusable logic        | Custom Hook   | `useFavorites`, `useTheme`     |

### When to Use Which Pattern?

| Need                | Pattern       | Example                            |
| ------------------- | ------------- | ---------------------------------- |
| Show/hide one thing | `&&`          | `{loading && <Spinner />}`         |
| Choose between two  | `? :`         | `{loggedIn ? <App /> : <Login />}` |
| Multiple conditions | Function      | `renderContent()`                  |
| List of items       | `map()`       | `{items.map(...)}`                 |
| Smooth transition   | Framer Motion | `<motion.div>`                     |
| Global state        | Redux         | `useSelector`, `useDispatch`       |
| Local state         | `useState`    | `const [open, setOpen] = ...`      |

---

## 🔗 Quick Links

### Official Docs

- [React Docs](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Framer Motion](https://www.framer.com/motion/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

### Disney App Specific

- `/frontend/src/components` - All components
- `/frontend/src/hooks` - Custom hooks
- `/frontend/src/store` - Redux setup
- `/frontend/src/types` - TypeScript types

---

_Keep this handy while coding! 🚀_  
_Last Updated: November 30, 2025_
