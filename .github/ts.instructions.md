---
applyTo: "**/*.ts"
---

# Copilot TypeScript Rules (non-React)

## 🎯 Purpose

Applies to **plain `.ts` files** (utilities, services, Node scripts, backend helpers).  
Use modern, strongly-typed, readable TS that’s easy to test and maintain.

---

## ⚙️ Syntax & Style

- Use **ES modules** with explicit imports/exports.
- Prefer **`const`** and **`let`** (never `var`).
- 2-space indentation, include **semicolons**.
- Use **single quotes**; template literals for interpolation.
- Keep functions small; prefer early returns over deep nesting.

---

## 🧠 Types First

- **No `any`** (unless unavoidable). Prefer `unknown` + type-narrowing.
- Use **interfaces for object shapes**, **types** for unions/intersections/aliases.
- Prefer **`type`** + `satisfies` when constraining constants.
- Favor **literal types**, **union/discriminated unions**, and **enums** → use **`const enum`** only when build setup inlines them; otherwise plain `enum` or `"union"` is fine.
- Add **explicit return types** for exported functions and public APIs.
- Use **generics** for reusable utilities; add sensible constraints (`<T extends Record<string, unknown>>`).

---

## ✅ Safety & Guards

- Narrow unknown inputs with **type guards**:
  ```ts
  const isNonEmpty = (s: unknown): s is string =>
    typeof s === "string" && s.length > 0;
  ```
