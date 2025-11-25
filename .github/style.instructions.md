---
applyTo: "**/*.{scss,css}"
---

# Copilot Style Rules

## 🎨 General Guidelines

- Use **SCSS** for styles whenever possible.
- Do **not** use inline styles or style definitions inside JavaScript/TypeScript files.
- Keep styles modular and component-scoped.
- **CRITICAL**: Use `@use` and `@forward` instead of deprecated `@import` statements
  - Example: `@use "../../../styles/variables.scss" as *;`
  - Example: `@use "../../../styles/mixins.scss" as *;`
  - The `as *` syntax allows using variables/mixins without a namespace prefix
  - **NEVER use `@import`** - it causes deprecation warnings during build and will be removed in Dart Sass 3.0.0

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
