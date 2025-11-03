---
applyTo: "**/*.{scss,css}"
---

# Copilot Style Rules

## 🎨 General Guidelines

- Use **SCSS** for styles whenever possible.
- Do **not** use inline styles or style definitions inside JavaScript/TypeScript files.
- Keep styles modular and component-scoped.
- @impoprts are being deprecated, use @use and @forward instead, if running into unresolvable errors, only then you can use @import

---

## 🧱 Structure & Organization

- Organize SCSS into **partials** (e.g., `_variables.scss`, `_mixins.scss`, `_buttons.scss`) and import them into a main stylesheet.
- Each page or component must have a **unique top-level class name** for scoping (e.g., `.character-page`).
- Use **BEM (Block Element Modifier)** naming conventions:
  - `block__element--modifier`
- Add **section comments only**, not per-line comments.
- Avoid `//` inline comments — use `/* ... */` if needed.
- Group related rules logically (layout, typography, colors, spacing).

---

## 🧮 Variables & Theming

- Define all theme colors and typography in **CSS variables** at the root level.  
  Example:
  ```scss
  :root {
    --primary-color: #00aaff;
    --secondary-color: #ffaa00;
    --accent-color: #ffffff;
    --font-family: "Poppins", sans-serif;
  }
  ```
