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

### 🔑 API Response Type Naming (CRITICAL)

**Types representing API responses MUST use snake_case property names** to match backend JSON format.

- **Backend API**: Returns snake_case JSON (e.g., `url_id`, `short_description`, `image_1`)
- **TypeScript types**: MUST match API response format exactly
- **Internal variables**: Can use camelCase locally after data is fetched

**Example**:

```typescript
// ✅ CORRECT - API response type
type Character = {
  id: number;
  url_id: string; // matches API snake_case
  name: string;
  short_description?: string;
  long_description?: string;
};

// ✅ CORRECT - internal helper can use camelCase
const processCharacter = (char: Character) => {
  const urlId = char.url_id; // local variable can be camelCase
  const shortDesc = char.short_description;
  // ...
};

// ❌ WRONG - type doesn't match API
type Character = {
  id: number;
  urlId: string; // API returns url_id, not urlId
  shortDescription?: string; // will be undefined at runtime
};
```

**Verification steps before defining types**:

1. Test API endpoint with cURL to see actual JSON response format
2. Check Java entity `@JsonProperty` annotations in backend code
3. Define TypeScript type matching JSON property names exactly
4. Never assume API uses camelCase without verification

---

## ✅ Safety & Guards

- Narrow unknown inputs with **type guards**:
  ```ts
  const isNonEmpty = (s: unknown): s is string =>
    typeof s === "string" && s.length > 0;
  ```
