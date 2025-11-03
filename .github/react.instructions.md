---
applyTo: "**/*.{tsx,jsx}"
---

# Copilot React Rules (.tsx / .jsx)

## 🎯 Purpose

Generate **functional, typed (prefer .tsx)** React components with clean structure, accessibility, and modular styles. Use modern patterns (hooks, composition, co-located tests/styles).

---

## ⚙️ Component Basics

- Use **functional components** and **hooks** only.
- **TypeScript preferred**: define `Props` via `type` or `interface`. (If `.jsx`, keep prop JSDoc.)
- **Named exports** (`export const Component`) — avoid default exports.
- Co-locate files: `Component.tsx`, `Component.module.scss`, optional `Component.test.tsx`.
- File names: **PascalCase** for components.

---

## 🎛️ Props & Types

- Define a `Props` type; avoid `any`. Use optional props consciously.
- Prefer **union types** and **discriminated unions** for variants.
- Derive event handler types from React types (e.g., `React.MouseEvent<HTMLButtonElement>`).

---

## 🎨 Styling

- Use **SCSS modules** (e.g., `Component.module.scss`).
- Top wrapper class should match the component name (`.Component`).
- No inline styles except truly dynamic one-offs (e.g., computed CSS vars).
- Keep classNames composable; prefer small, purposeful selectors.

---

## ♿ Accessibility

- Provide **alt** for images, labels for controls, keyboard operability.
- Use semantic elements (`button`, `nav`, `header`, `main`, `section`, `ul/li`).
- Announce async states to screen readers where appropriate (e.g., `aria-live`).

---

## 🔁 State & Data

- Local UI state: `useState`, `useReducer`.
- Shared state: **Redux Toolkit** or React Context (when minimal).
- Async data:
  - **Next.js**: use `getServerSideProps`/`getStaticProps` or **Route Handlers**; hydrate via props.
  - Or use **React Query** for client fetching (loading/error states + caching).

---

## 🧭 Next.js Conventions

- Use the **App Router** (if applicable).
- Server components by default; **client components** only when needed (`"use client"`).
- Prefer route handlers for lightweight APIs under `/app/api/*`.
- Optimize images with `next/image` where available.

---

## 🎬 Motion & UX

- Animations: prefer **Framer Motion**; keep transitions subtle and performant.
- Respect reduced motion (`@media (prefers-reduced-motion)`).

---

## 🧪 Testing

- Favor **React Testing Library** style tests; test behavior, not implementation details.
- Keep tests near components: `Component.test.tsx`.

---

## 📝 Patterns & Hygiene

- Keep components small; extract subcomponents for clarity.
- Lift state only when necessary. Pass handlers and data explicitly.
- Avoid prop drilling across many levels — use context or composition.
- Handle edge states: loading, empty, error.
- Logically order component sections: imports → types → component → helpers → export.

---

## 🚫 Do Not

- Don’t use class components.
- Don’t use `any` or untyped props (in `.tsx`).
- Don’t inline large CSS blocks; avoid global styles leakage.
- Don’t fetch in render paths that cause waterfalls; prefer server data or React Query.

---

## ✨ Example (TSX)

```tsx
import React from "react";
import styles from "./CharacterCard.module.scss";

type Props = {
  name: string;
  imageUrl: string;
  onSelect?: (name: string) => void;
  highlight?: boolean;
};

export const CharacterCard: React.FC<Props> = ({
  name,
  imageUrl,
  onSelect,
  highlight,
}) => {
  const handleClick = () => onSelect?.(name);

  return (
    <button
      className={`${styles.CharacterCard} ${highlight ? styles.Highlight : ""}`}
      onClick={handleClick}
      aria-label={`View ${name}`}
    >
      <img src={imageUrl} alt={name} className={styles.Image} />
      <span className={styles.Name}>{name}</span>
    </button>
  );
};
```
