# Theme Refactoring Audit Report

**Date:** Generated during theme integration phase  
**Purpose:** Complete inventory of all color usage across the codebase to enable systematic refactoring from OLD to NEW theme variable system

---

## Executive Summary

### Problem Statement

Two parallel color variable systems exist in the codebase:

1. **OLD System** (variables.scss): `--disney-blue`, `--black`, `--white`, `--gray-XXX`
2. **NEW System** (theme files): `--bg-primary`, `--text-primary`, `--accent-primary`, `--nav-bg`, `--card-bg`

**Current Status:** Theme infrastructure is complete and functional (Redux, hooks, UI), but existing SCSS files still reference OLD variables. Switching themes changes body class and testing border, but site appearance remains unchanged because nothing uses the NEW theme variables.

**Goal:** Systematically map all color usage from OLD → NEW variables, refactor all SCSS files, and ensure dark theme appearance is preserved as baseline.

---

## 1. OLD Variable System Inventory

### File: `frontend/src/styles/variables.scss` (143 lines)

#### Brand Colors

```scss
--disney-blue: #006bb3
--disney-blue-light: #4f9fd1
--disney-blue-dark: #003d6b

--disney-purple: #8a2be2
--disney-purple-light: #ba55d3
--disney-purple-dark: #663399

--disney-gold: #fdd017
--disney-gold-light: #ffed4e
--disney-gold-dark: #c4a500
```

#### Character Theme Colors

```scss
--princess-pink: #ff69b4
--villain-purple: #8a2be2
--hero-blue: #1e90ff
--sidekick-orange: #ff8c00
```

#### Neutrals

```scss
--white: #ffffff
--gray-50: #f8fafc
--gray-100: #f1f5f9
--gray-200: #e2e8f0
--gray-300: #cbd5e1
--gray-400: #94a3b8
--gray-500: #64748b
--gray-600: #475569
--gray-700: #334155
--gray-800: #1e293b
--gray-900: #0f172a
--black: #000000
```

#### Semantic Colors

```scss
--success: #10b981
--success-green: #10b981
--warning: #f59e0b
--error: #ef4444
--danger-red: #ef4444
--info: (not explicitly defined)
--dark-blue: #0f172a
```

#### Other Systems

- Typography scales
- Spacing scales (--space-1 through --space-32)
- Border radius (--radius, --radius-sm, --radius-lg, --radius-full)
- Shadows (--shadow-sm through --shadow-2xl)
- Z-index scales
- Transition durations
- Breakpoints

---

## 2. NEW Theme Variable System Inventory

### Theme Files (All 6 Themes)

#### Core Variable Structure (Consistent Across All Themes)

Each theme defines the following variables:

**Backgrounds:**

- `--bg-primary`: Main page background
- `--bg-secondary`: Secondary surfaces
- `--bg-tertiary`: Tertiary surfaces
- `--bg-overlay`: Modal/overlay backgrounds

**Text Colors:**

- `--text-primary`: Primary text
- `--text-secondary`: Secondary text
- `--text-tertiary`: Tertiary/muted text
- `--text-disabled`: Disabled state text

**Accent Colors:**

- `--accent-primary`: Primary brand accent
- `--accent-primary-hover`: Hover state
- `--accent-secondary`: Secondary accent
- `--accent-secondary-hover`: Hover state

**Navigation:**

- `--nav-bg`: Navigation background
- `--nav-text`: Navigation text
- `--nav-text-hover`: Hover state
- `--nav-text-active`: Active link
- `--nav-shadow`: Navigation shadow

**Cards:**

- `--card-bg`: Card background
- `--card-bg-hover`: Hover state
- `--card-border`: Card border
- `--card-shadow`: Card shadow

**Buttons:**

- `--btn-primary-bg`: Primary button background (gradient)
- `--btn-primary-bg-hover`: Hover state
- `--btn-primary-text`: Button text

**Modals:**

- `--modal-bg`: Modal background (gradient)
- `--modal-border`: Modal border
- `--modal-backdrop`: Backdrop overlay
- `--modal-shadow`: Modal shadow

**Inputs:**

- `--input-bg`: Input background
- `--input-border`: Input border
- `--input-border-focus`: Focus state
- `--input-text`: Input text color

**Effects:**

- `--shadow-color`: Global shadow color

#### Theme-Specific Values

**Dark Theme** (Current baseline):

- Body border: 10px solid #4a90e2
- --bg-primary: #000000
- --accent-primary: #4a90e2
- --nav-bg: #ffffff (white nav on dark background)

**Light Theme:**

- Body border: 10px solid #006bb3
- --bg-primary: #ffffff
- --accent-primary: #006bb3

**Star Wars Theme:**

- Body border: 10px solid #ffe81f
- --bg-primary: #000000
- --accent-primary: #ffe81f (iconic yellow)

**Marvel Theme:**

- Body border: 10px solid #ed1d24
- --bg-primary: #1a0a0e (dark red-tinted)
- --accent-primary: #ed1d24 (Marvel red)

**Walt Disney Theme:**

- Body border: 10px solid #fdd017
- --bg-primary: #003d6b (deep blue)
- --accent-primary: #fdd017 (gold)

**Pixar Theme:**

- Body border: 10px solid #00a8e8
- --bg-primary: #f0f8ff (light blue)
- --accent-primary: #00a8e8 (bright cyan)

---

## 3. Color Usage Patterns Found

### A. Hard-Coded RGBA Values

**Extremely Common Pattern:** `rgba(255, 255, 255, X)` and `rgba(0, 0, 0, X)`

Found extensively in:

- `SiteSettings.scss` (50+ instances)
- All page SCSS files
- Component SCSS files

**Examples:**

```scss
background: rgba(0, 0, 0, 0.85); // Dark overlay
border: 1px solid rgba(255, 255, 255, 0.1); // Semi-transparent border
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
background: rgba(255, 255, 255, 0.05); // Very subtle card bg
background: rgba(74, 144, 226, 0.05); // Tinted backgrounds
```

**Problem:** Hard-coded values can't adapt to theme changes. Need theme-aware alternatives.

---

### B. OLD Variable Usage in Base Styles

**File: `base.scss`**

```scss
body {
    background-color: var(--black);  → Should be var(--bg-primary)
    color: var(--white);             → Should be var(--text-primary)
}

h1, h2, h3, h4, h5, h6 {
    color: var(--gray-900);          → Should be var(--text-primary) or heading variant
}

a {
    color: var(--disney-blue);       → Should be var(--accent-primary)
    &:hover {
        color: var(--disney-blue-dark);  → Should be var(--accent-primary-hover)
    }
}

input {
    border: 1px solid var(--gray-300);   → Should be var(--input-border)
    &:focus {
        border-color: var(--disney-blue);  → Should be var(--input-border-focus)
    }
}
```

---

### C. OLD Variable Usage in Navigation

**File: `Navigation.scss`**

```scss
.navigation {
    background: var(--white);        → Should be var(--nav-bg)
}

&__logo {
    color: var(--disney-blue);       → Should be var(--accent-primary)
    &:hover {
        color: var(--disney-blue-dark);  → Should be var(--accent-primary-hover)
    }
}

&__logo-text {
    background: linear-gradient(135deg, var(--disney-blue), var(--disney-gold));
    // → Should use var(--accent-primary), var(--accent-secondary)
}

&__link {
    color: var(--gray-700);          → Should be var(--nav-text)
    &:hover {
        color: var(--disney-blue);   → Should be var(--nav-text-hover)
    }
    &--active {
        color: var(--disney-blue);   → Should be var(--nav-text-active)
        &::after {
            background: var(--disney-gold);  → Should be var(--accent-secondary)
        }
    }
}

&__favorites-chip {
    background: var(--disney-gold);  → Should be var(--accent-secondary)
    color: var(--white);             → Should be var(--btn-primary-text) or var(--text-primary)
}

&__hamburger span {
    background: var(--gray-700);     → Should be var(--nav-text)
}

&__mobile {
    background: var(--white);        → Should be var(--nav-bg)
}

&__mobile-link {
    color: var(--gray-700);          → Should be var(--nav-text)
    &:hover {
        background: var(--gray-50);  → Should be var(--card-bg) or rgba variant
        color: var(--disney-blue);   → Should be var(--nav-text-hover)
    }
    &--active {
        color: var(--disney-blue);   → Should be var(--nav-text-active)
        background: var(--gray-50);  → Should be var(--card-bg)
        border-left-color: var(--disney-gold);  → Should be var(--accent-secondary)
    }
}
```

---

### D. OLD Variable Usage in Page Layouts

**Files: `CharactersPage.scss`, `MoviesPage.scss`**

Both follow identical pattern:

```scss
.characters-page,
.movies-page {
    background: var(--black);        → Should be var(--bg-primary)
}

&__header {
    background: var(--black);        → Should be var(--bg-primary)
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);  → Should be var(--card-border) or theme-aware
}

h1 {
    color: var(--white);             → Should be var(--text-primary)
}

p {
    color: var(--gray-300);          → Should be var(--text-secondary) or var(--text-tertiary)
}

&__loading, &__error {
    color: var(--white);             → Should be var(--text-primary)
    background: var(--black);        → Should be var(--bg-primary)
}

&__error {
    color: var(--error);             → Keep as semantic color (or add to themes)
}

&__content {
    background: var(--black);        → Should be var(--bg-primary)
}

.view-mode-toggle {
    border: 1px solid rgba(255, 255, 255, 0.06);  → Should be var(--card-border) with opacity
}

.view-mode-toggle__button {
    color: var(--gray-300);          → Should be var(--text-tertiary)
}
```

---

### E. OLD Variable Usage in Mixins

**File: `mixins.scss`**

```scss
@mixin card-base {
    background: var(--white);        → Should be var(--card-bg)
}

@mixin btn-primary {
    background-color: var(--disney-blue);  → Should be var(--btn-primary-bg) or var(--accent-primary)
    color: var(--white);                   → Should be var(--btn-primary-text)
    &:hover:not(:disabled) {
        background-color: var(--disney-blue-dark);  → Should be var(--accent-primary-hover)
    }
}

@mixin btn-secondary {
    background-color: var(--white);        → Should be var(--card-bg) or var(--bg-primary)
    color: var(--disney-blue);             → Should be var(--accent-primary)
    border: 1px solid var(--disney-blue);  → Should be var(--accent-primary)
    &:hover:not(:disabled) {
        background-color: var(--disney-blue);  → Should be var(--accent-primary)
        color: var(--white);                   → Should be var(--btn-primary-text)
    }
}
```

---

### F. OLD Variable Usage in Main.scss

**File: `main.scss`**

```scss
.color-disney-gold {
    color: var(--disney-gold);       → Should be var(--accent-secondary)
}

.loading-spinner::after {
    border: 2px solid var(--gray-200);     → Should be var(--card-border) or theme variant
    border-top: 2px solid var(--disney-blue);  → Should be var(--accent-primary)
}

.error-message {
    background-color: #fef2f2;       → Hard-coded error bg
    border: 1px solid #fecaca;       → Hard-coded error border
    color: #991b1b;                  → Hard-coded error text
}

.empty-state {
    color: var(--gray-500);          → Should be var(--text-tertiary)
    h3 {
        color: var(--gray-700);      → Should be var(--text-secondary)
    }
}
```

---

### G. SiteSettings.scss (Most Complex)

**92 Color Property Matches** - Heavily uses hard-coded `rgba()` values

Patterns:

- Modal backdrop: `rgba(0, 0, 0, 0.85)` → `var(--modal-backdrop)`
- Borders: `rgba(255, 255, 255, 0.1)` → `var(--modal-border)` or `var(--card-border)`
- Shadows: `rgba(0, 0, 0, 0.5)` → `var(--modal-shadow)`
- Card backgrounds: `rgba(255, 255, 255, 0.05)` → `var(--card-bg)`
- Hover states: `rgba(255, 255, 255, 0.1)`, `rgba(255, 255, 255, 0.2)` → Need theme-aware hover variants
- Status indicators: Uses hard-coded warning/info/error colors with rgba transparency

---

## 4. Mapping Strategy: OLD → NEW Variables

### Core Mappings

| OLD Variable          | NEW Variable                          | Notes                  |
| --------------------- | ------------------------------------- | ---------------------- |
| `--black`             | `--bg-primary`                        | Main background color  |
| `--white` (for text)  | `--text-primary`                      | Primary text color     |
| `--white` (for bg)    | `--card-bg` or `--nav-bg`             | Context-dependent      |
| `--gray-900`          | `--text-primary` (in light themes)    | Dark text              |
| `--gray-800`          | `--bg-secondary`                      | Secondary surfaces     |
| `--gray-700`          | `--text-secondary` or `--nav-text`    | Context-dependent      |
| `--gray-600`          | `--text-secondary`                    | Secondary text         |
| `--gray-500`          | `--text-tertiary`                     | Muted text             |
| `--gray-400`          | `--text-tertiary`                     | Very muted text        |
| `--gray-300`          | `--text-tertiary` or `--input-border` | Context-dependent      |
| `--gray-200`          | `--card-border`                       | Subtle borders         |
| `--gray-100`          | `--bg-secondary`                      | Very light surfaces    |
| `--gray-50`           | `--bg-tertiary`                       | Ultra-light surfaces   |
| `--disney-blue`       | `--accent-primary`                    | Primary brand accent   |
| `--disney-blue-light` | `--accent-primary-hover`              | Hover/active states    |
| `--disney-blue-dark`  | `--accent-primary-hover`              | Alternative hover      |
| `--disney-gold`       | `--accent-secondary`                  | Secondary brand accent |
| `--disney-gold-light` | `--accent-secondary-hover`            | Gold hover state       |

### RGBA Pattern Mappings

| Hard-Coded RGBA             | NEW Variable/Pattern                           | Context                      |
| --------------------------- | ---------------------------------------------- | ---------------------------- |
| `rgba(0, 0, 0, 0.85)`       | `var(--modal-backdrop)` or `var(--bg-overlay)` | Modal overlays               |
| `rgba(255, 255, 255, 0.1)`  | `var(--card-border)`                           | Semi-transparent borders     |
| `rgba(255, 255, 255, 0.05)` | `var(--card-bg)`                               | Very subtle card backgrounds |
| `rgba(255, 255, 255, 0.08)` | `var(--card-bg-hover)`                         | Card hover states            |
| `rgba(0, 0, 0, 0.5)`        | `var(--shadow-color)` or `var(--modal-shadow)` | Shadows                      |
| `rgba(0, 0, 0, 0.3)`        | Box shadows (context-dependent)                | Less intense shadows         |
| Hard-coded gradient colors  | Theme-aware gradients using accent variables   | Buttons, modals, etc.        |

### Special Cases

**Error/Warning/Success States:**
Keep semantic colors (`--error`, `--warning`, `--success`) but consider adding to theme system:

```scss
// Could add to each theme:
--status-error: themed red
--status-warning: themed amber/orange
--status-success: themed green
--status-info: themed blue
```

**Character Theme Colors:**
These are likely content-specific (`--princess-pink`, `--villain-purple`, etc.). May need to remain as fixed colors or be theme-adapted versions.

**Testing Borders:**
The 10px colored borders are temporary testing aids and should be removed after theme integration is complete.

---

## 5. Files Requiring Refactoring

### Priority 1: Foundation Files (Must refactor first)

1. ✅ `variables.scss` - Already documented, bridge strategy needed
2. ✅ `base.scss` - 9 color properties → Refactor to theme variables
3. ✅ `mixins.scss` - 12 color properties → Refactor mixin internals

### Priority 2: Layout Components

4. ✅ `Navigation.scss` - Heavy usage (30+ instances) → Complete refactor
5. ✅ `Footer.scss` - Likely similar to Navigation
6. ✅ `main.scss` - 5+ instances → Utility classes and global styles

### Priority 3: Page Layouts

7. ✅ `CharactersPage.scss` - 10+ instances → Page-level refactor
8. ✅ `MoviesPage.scss` - 10+ instances → Page-level refactor
9. ✅ Other page SCSS files (detail pages, favorites, etc.)

### Priority 4: Complex Components

10. ✅ `SiteSettings.scss` - **92 color properties** → Most complex refactor
11. ✅ `HeroCarousel.scss` - Likely has gradients and overlays
12. ✅ `MovieCarousel.scss` - Similar to above
13. ✅ `CharacterCarousel.scss` - Similar to above
14. ✅ `HomePage.scss` - Landing page with heavy visual design

### Priority 5: Card Components

15. ✅ `CharacterCard.scss` - Card styling with hover states
16. ✅ `MovieCard.scss` - Similar to CharacterCard
17. ✅ List view components (CharactersListView, MoviesListView)
18. ✅ Grid view components

### Priority 6: Utility Components

19. ✅ `SearchInput.scss`
20. ✅ `ViewModeToggle.scss`
21. ✅ `FavoriteButton.scss`
22. ✅ Any other utility components

### Priority 7: Special Features

23. ✅ `CharacterQuiz.scss` - Game UI with potentially unique colors
24. ✅ `AccessGate.scss` - If exists
25. ✅ Any other feature-specific SCSS

---

## 6. Refactoring Execution Plan

### Phase 1: Foundation Refactoring

**Goal:** Update core styling infrastructure

**Steps:**

1. **Refactor `base.scss`:**

   - Replace `var(--black)` → `var(--bg-primary)`
   - Replace `var(--white)` → `var(--text-primary)` (text contexts)
   - Replace `var(--gray-XXX)` → Appropriate semantic theme variables
   - Replace `var(--disney-blue)` → `var(--accent-primary)`
   - Test: Dark theme should look identical after changes

2. **Refactor `mixins.scss`:**

   - Update `@mixin card-base` to use `var(--card-bg)`
   - Update `@mixin btn-primary` to use theme button variables
   - Update `@mixin btn-secondary` similarly
   - Test: Verify mixins work in dark theme

3. **Bridge Strategy for `variables.scss`:**
   - **Option A:** Keep variables.scss as-is temporarily, refactor component by component
   - **Option B:** Add temporary aliases in variables.scss:
     ```scss
     // Temporary bridges to theme variables (remove after refactor complete)
     --disney-blue: var(--accent-primary);
     --black: var(--bg-primary);
     --white: var(--text-primary);
     // etc.
     ```
   - **Recommended:** Option A (clean separation, less confusing)

### Phase 2: Layout Components

**Goal:** Refactor high-visibility navigation and layout

**Steps:**

1. **Refactor `Navigation.scss`:**

   - Background: `var(--nav-bg)`
   - Text: `var(--nav-text)`, `var(--nav-text-hover)`, `var(--nav-text-active)`
   - Logo: `var(--accent-primary)`, `var(--accent-secondary)`
   - Favorites chip: `var(--accent-secondary)`
   - Mobile menu: Use nav variables consistently
   - Test dark theme, then test all other themes

2. **Refactor `Footer.scss`:**

   - Similar pattern to Navigation
   - Test all themes

3. **Refactor `main.scss`:**
   - Update utility classes (`.color-disney-gold`)
   - Update loading spinner colors
   - Update error/empty state colors
   - Consider whether error states need theme variants

### Phase 3: Page Layouts

**Goal:** Update page-level styling

**Steps:**

1. **Refactor `CharactersPage.scss`:**

   - Page background: `var(--bg-primary)`
   - Headers: `var(--text-primary)`, `var(--text-secondary)`
   - Borders: `var(--card-border)`
   - Test: Verify grid/list views work in all themes

2. **Refactor `MoviesPage.scss`:**

   - Same pattern as CharactersPage
   - Test all themes

3. **Refactor other page SCSS files:**
   - Detail pages
   - Favorites page
   - Behind the Magic page
   - Test all themes on each page

### Phase 4: Complex Components

**Goal:** Tackle components with heavy color usage

**Steps:**

1. **Refactor `SiteSettings.scss`:**

   - **Most complex** (92 color properties)
   - Modal backdrop: `var(--modal-backdrop)`
   - Modal container: `var(--modal-bg)`, `var(--modal-border)`, `var(--modal-shadow)`
   - Cards: `var(--card-bg)`, `var(--card-border)`, `var(--card-bg-hover)`
   - Borders: All `rgba(255, 255, 255, X)` → Theme variables
   - Theme preview cards: Keep specific colors for visual representation
   - Test: Settings modal in all themes

2. **Refactor Carousel Components:**

   - `HeroCarousel.scss`
   - `MovieCarousel.scss`
   - `CharacterCarousel.scss`
   - Focus on overlays, gradients, navigation controls
   - Test all themes

3. **Refactor `HomePage.scss`:**
   - Hero section backgrounds
   - Section dividers
   - Any homepage-specific styling
   - Test all themes

### Phase 5: Card Components

**Goal:** Update individual card styling

**Steps:**

1. **Refactor Card Components:**

   - `CharacterCard.scss`: `var(--card-bg)`, `var(--card-border)`, `var(--card-bg-hover)`, `var(--card-shadow)`
   - `MovieCard.scss`: Same pattern
   - Test hover states in all themes

2. **Refactor List/Grid Views:**
   - `CharactersListView.scss`
   - `CharactersGridView.scss`
   - `MoviesListView.scss`
   - `MoviesGridView.scss`
   - Test layout and colors in all themes

### Phase 6: Utility Components

**Goal:** Update smaller utility components

**Steps:**

1. **Refactor Utility Components:**
   - `SearchInput.scss`: `var(--input-bg)`, `var(--input-border)`, `var(--input-border-focus)`, `var(--input-text)`
   - `ViewModeToggle.scss`: Button and toggle colors
   - `FavoriteButton.scss`: Icon and state colors
   - Test interactions in all themes

### Phase 7: Special Features

**Goal:** Update feature-specific components

**Steps:**

1. **Refactor Feature Components:**
   - `CharacterQuiz.scss`: Game UI elements
   - `AccessGate.scss`: If exists
   - Any other feature SCSS
   - Test functionality and appearance in all themes

### Phase 8: Cleanup & Testing

**Goal:** Remove old variables, test everything

**Steps:**

1. **Verify All Refactoring Complete:**

   - Search codebase for `var(--disney-blue)`, `var(--black)`, `var(--white)`, `var(--gray-XXX)` usage
   - Ensure no OLD variables remain in component files

2. **Remove Testing Borders:**

   - Remove 10px colored borders from all theme files

3. **Clean Up variables.scss:**

   - **Option A:** Remove OLD color variables entirely (aggressive)
   - **Option B:** Keep typography, spacing, shadows (non-color utilities)
   - **Option C:** Mark OLD colors as deprecated with comments
   - **Recommended:** Option B - Keep utilities, remove unused color variables

4. **Comprehensive Testing:**

   - Test EVERY page in EVERY theme (6 themes × ~8 pages = 48 combinations)
   - Test responsive breakpoints (mobile, tablet, desktop) × themes
   - Test interactive states (hover, focus, active) × themes
   - Test dark theme specifically: Should look **identical** to pre-refactor

5. **Visual Regression Testing:**
   - Take screenshots of dark theme before refactoring
   - Take screenshots of dark theme after refactoring
   - Compare: Should be pixel-perfect identical

---

## 7. Risk Mitigation

### Risks:

1. **Breaking Dark Theme Appearance:** Site currently works with dark theme → Refactor must preserve this exactly
2. **RGBA Transparency Issues:** Hard-coded rgba values need careful theme-aware replacements
3. **Gradient Complexity:** Linear gradients in buttons/modals use OLD variables
4. **Semantic Color Confusion:** Error/warning/success states need clear strategy
5. **Component Interdependencies:** Components import each other's SCSS
6. **Scope Creep:** 92 color properties in SiteSettings alone

### Mitigation Strategies:

1. **Git Safety:**

   - User already committed (✅)
   - Create new branch for refactoring work
   - Commit after each priority phase
   - Can roll back individual phases if needed

2. **Incremental Testing:**

   - Test dark theme after EVERY file change
   - Use browser DevTools to verify computed CSS variables
   - Check for console warnings about undefined variables

3. **Variable Fallbacks:**

   - Use CSS variable fallbacks during transition:
     ```scss
     color: var(--text-primary, var(--white));
     ```

4. **Documentation:**

   - Keep this audit report updated
   - Comment complex mappings in code
   - Document any deviations from mapping strategy

5. **Peer Review:**
   - Review each phase before moving to next
   - Test in multiple browsers
   - Test with different screen sizes

---

## 8. Success Criteria

### Phase Completion Checklist:

- [ ] All base styles use NEW theme variables
- [ ] All component SCSS files use NEW theme variables
- [ ] No references to `--disney-blue`, `--disney-gold`, `--gray-XXX` in components
- [ ] Minimal hard-coded rgba values (only where semantically necessary)
- [ ] Dark theme appearance unchanged from original
- [ ] All 6 themes render correctly on all pages
- [ ] No console errors about undefined CSS variables
- [ ] No visual regressions in responsive breakpoints
- [ ] Testing borders removed from theme files
- [ ] variables.scss cleaned up (keep utilities, remove unused colors)

### Visual Validation:

- [ ] Dark theme: Identical to pre-refactor screenshots
- [ ] Light theme: Professional light mode appearance
- [ ] Star Wars theme: Distinctive yellow accent visible
- [ ] Marvel theme: Red accent and dark tint visible
- [ ] Walt Disney theme: Gold accent on blue background visible
- [ ] Pixar theme: Bright cyan accent on light background visible

### Functional Validation:

- [ ] Theme switching works instantly (no flicker)
- [ ] Theme persists across page reloads
- [ ] Theme selector UI shows correct previews
- [ ] All interactive states (hover, focus) work correctly
- [ ] Forms and inputs styled correctly in all themes
- [ ] Modals and overlays display correctly in all themes
- [ ] Cards and carousels display correctly in all themes

---

## 9. Next Immediate Actions

1. **Read this audit report completely**
2. **Confirm understanding of mapping strategy**
3. **Choose bridge strategy for variables.scss** (Option A or B)
4. **Begin Phase 1: Foundation Refactoring**
   - Start with base.scss
   - Test dark theme meticulously
   - Only proceed when dark theme is perfect
5. **Work through phases sequentially**
6. **Test continuously**
7. **Commit after each phase**

---

## 10. Appendices

### Appendix A: Complete File List for Refactoring

**Confirmed Files Requiring Changes:**

- `/frontend/src/styles/base.scss` (9 properties)
- `/frontend/src/styles/mixins.scss` (12 properties)
- `/frontend/src/styles/main.scss` (5+ properties)
- `/frontend/src/components/Navigation/Navigation.scss` (30+ properties)
- `/frontend/src/components/SiteSettings/SiteSettings.scss` (92 properties)
- `/frontend/src/pages/CharactersPage/CharactersPage.scss` (10+ properties)
- `/frontend/src/pages/MoviesPage/MoviesPage.scss` (10+ properties)

**Likely Files Requiring Changes (Not Yet Analyzed):**

- `/frontend/src/components/Footer/Footer.scss`
- `/frontend/src/components/HomePage/HomePage.scss`
- `/frontend/src/components/HeroCarousel/HeroCarousel.scss`
- `/frontend/src/components/MovieCarousel/MovieCarousel.scss`
- `/frontend/src/components/CharacterCarousel/CharacterCarousel.scss`
- `/frontend/src/components/CharacterCard/CharacterCard.scss`
- `/frontend/src/components/MovieCard/MovieCard.scss`
- `/frontend/src/components/CharactersListView/CharactersListView.scss`
- `/frontend/src/components/CharactersGridView/CharactersGridView.scss`
- `/frontend/src/components/MoviesListView/MoviesListView.scss`
- `/frontend/src/components/MoviesGridView/MoviesGridView.scss`
- `/frontend/src/components/SearchInput/SearchInput.scss`
- `/frontend/src/components/ViewModeToggle/ViewModeToggle.scss`
- `/frontend/src/components/FavoriteButton/FavoriteButton.scss`
- `/frontend/src/components/CharacterQuiz/CharacterQuiz.scss`
- All detail page SCSS files

### Appendix B: Search Queries for Verification

**After Refactoring, Run These Searches:**

```bash
# Should return ZERO results in component files:
grep -r "var(--disney-blue)" src/components/
grep -r "var(--disney-gold)" src/components/
grep -r "var(--black)" src/components/
grep -r "var(--white)" src/components/
grep -r "var(--gray-" src/components/

# Check for hard-coded rgba (should be minimal):
grep -r "rgba(255, 255, 255," src/components/ | wc -l
grep -r "rgba(0, 0, 0," src/components/ | wc -l
```

### Appendix C: Theme Variable Reference Card

**Quick Reference for Developers:**

```scss
/* Backgrounds */
--bg-primary         // Main page background
--bg-secondary       // Secondary surfaces
--bg-tertiary        // Tertiary surfaces
--bg-overlay         // Modal/overlay backgrounds

/* Text */
--text-primary       // Primary text
--text-secondary     // Secondary text
--text-tertiary      // Muted text
--text-disabled      // Disabled state

/* Accents */
--accent-primary           // Primary brand color
--accent-primary-hover     // Hover state
--accent-secondary         // Secondary brand color
--accent-secondary-hover   // Hover state

/* Navigation */
--nav-bg, --nav-text, --nav-text-hover, --nav-text-active, --nav-shadow

/* Cards */
--card-bg, --card-bg-hover, --card-border, --card-shadow

/* Buttons */
--btn-primary-bg, --btn-primary-bg-hover, --btn-primary-text

/* Modals */
--modal-bg, --modal-border, --modal-backdrop, --modal-shadow

/* Inputs */
--input-bg, --input-border, --input-border-focus, --input-text

/* Effects */
--shadow-color       // Global shadow tinting
```

---

**End of Audit Report**

**Status:** Ready for Phase 1 execution  
**Recommendation:** Begin with base.scss refactoring and test dark theme appearance before proceeding to Phase 2.
