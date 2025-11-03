---
applyTo: "**/*.js"
---

# Copilot JavaScript Rules

## 🎯 Purpose

These instructions apply to **plain JavaScript files** (non-React).  
The focus is on clean, modern ES6+ code that’s consistent, readable, and production-friendly.

---

## ⚙️ Syntax and Style

- Use **ES6+ features** wherever possible:
  - `const` and `let` instead of `var`
  - Arrow functions instead of function expressions
  - Destructuring for objects and arrays
  - Template literals for string concatenation
  - Default parameters for functions
- Use **strict mode** implicitly (`'use strict'` not required in modules).
- Follow consistent spacing:
  - 2-space indentation
  - One space after commas and colons
- Always include **semicolons**.
- Use **single quotes** for strings unless interpolation requires backticks.
- Use **camelCase** for variables and functions, **PascalCase** for classes.
- Avoid deeply nested code; extract helpers or early-return when possible.

---

## 🧠 Best Practices

- Keep functions small and focused (1 purpose per function).
- Always handle potential errors with try/catch for async/await.
- Prefer **named exports** over default exports for clarity.
- Avoid polluting the global namespace — wrap logic in modules or IIFEs if needed.
- Document complex logic with short, clear comments.
- Write side-effect-free utility functions where possible.

---

## 📦 Modules and Imports

- Use ES modules:
  ```js
  import { calculateTotal } from './math.js';
  export function doSomething() { ... }
  ```
