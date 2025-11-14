# Theme System Implementation Plan

## Overview

Implement a hybrid theme system with manual selection and system preference detection, using body class method for theme application.

---

## Theme Options (Initial Release)

### Core Themes

1. **theme-dark** (Current - Default)

   - Black/dark gray backgrounds
   - Light text
   - Disney blue accents

2. **theme-light**
   - White/light gray backgrounds
   - Dark text
   - Disney blue accents

### Branded Themes

3. **theme-star-wars**

   - Deep space black background
   - Yellow (#FFE81F) accents (iconic Star Wars yellow)
   - Gray/white text
   - Starfield subtle effects (optional)

4. **theme-marvel**

   - Dark red background (#1A0A0E with red tints)
   - Red (#ED1D24) accents (Marvel red)
   - Bold, comic-style feel

5. **theme-walt-disney**

   - Classic Disney blue (#006BB3) dominant
   - Gold accents (#FDD017)
   - Nostalgic, warm feel

6. **theme-pixar**
   - Bright, vibrant backgrounds
   - Playful accent colors
   - Light and cheerful

---

## Technical Architecture

### 1. Theme Selection Storage

**Location:** Redux store + localStorage

```typescript
interface ThemeState {
  selectedTheme: ThemeOption;
  availableThemes: Theme[];
}

type ThemeOption =
  | "auto" // Follow system preference
  | "theme-dark"
  | "theme-light"
  | "theme-star-wars"
  | "theme-marvel"
  | "theme-walt-disney"
  | "theme-pixar";

interface Theme {
  id: ThemeOption;
  name: string;
  description: string;
  preview: {
    background: string;
    text: string;
    accent: string;
  };
}
```

### 2. Body Class Application

**Method:** Apply theme class to `<body>` element

```html
<!-- Default -->
<body class="theme-dark">
  <!-- Star Wars -->
  <body class="theme-star-wars">
    <!-- System preference (auto) -->
    <body class="theme-light">
      <!-- or theme-dark based on system -->
    </body>
  </body>
</body>
```

### 3. CSS Variables Structure

**Location:** Create theme-specific SCSS files

```
frontend/src/styles/
├── themes/
│   ├── _theme-variables.scss    # Base variable definitions
│   ├── _theme-dark.scss          # Dark theme
│   ├── _theme-light.scss         # Light theme
│   ├── _theme-star-wars.scss     # Star Wars theme
│   ├── _theme-marvel.scss        # Marvel theme
│   ├── _theme-walt-disney.scss   # Walt Disney theme
│   ├── _theme-pixar.scss         # Pixar theme
│   └── _themes.scss              # Import all themes
└── variables.scss                # Update to include theme vars
```

### 4. Theme Variables (CSS Custom Properties)

**Core Variables to Define Per Theme:**

```scss
// Background colors
--bg-primary: #000000; // Main background
--bg-secondary: #1a1a1a; // Cards, sections
--bg-tertiary: #2a2a2a; // Elevated elements
--bg-overlay: rgba(0, 0, 0, 0.85); // Modals, overlays

// Text colors
--text-primary: #ffffff; // Main text
--text-secondary: #b0b0b0; // Muted text
--text-tertiary: #808080; // Disabled text

// Accent colors
--accent-primary: #4a90e2; // Main brand color
--accent-secondary: #fdd017; // Gold/secondary accent
--accent-hover: #5fa3f5; // Hover states

// Component-specific
--nav-bg: var(--white); // Navigation
--nav-text: var(--gray-700);
--card-bg: var(--bg-secondary);
--card-border: rgba(255, 255, 255, 0.1);

// Shadows (theme-aware)
--shadow-color: rgba(0, 0, 0, 0.5);
--shadow-sm: 0 1px 2px var(--shadow-color);
```

---

## Implementation Tasks

### Phase 1: Infrastructure Setup ✅ COMPLETED

#### Task 1.1: Create Theme Files Structure ✅

- [x] Create `frontend/src/styles/themes/` directory
- [x] Create individual theme files for each theme
  - [x] `_theme-dark.scss`
  - [x] `_theme-light.scss`
  - [x] `_theme-star-wars.scss`
  - [x] `_theme-marvel.scss`
  - [x] `_theme-walt-disney.scss`
  - [x] `_theme-pixar.scss`
- [x] Create `_themes.scss` to import all theme files
- [x] Update `main.scss` to import `_themes.scss`

#### Task 1.2: Define Theme Variables ✅

- [x] Extract current colors and map to CSS custom properties
- [x] Define complete variable set for `theme-dark` (baseline)
- [x] Create variable mappings for all 6 themes
- [x] Include all variable categories:
  - [x] Backgrounds (primary, secondary, tertiary, overlay)
  - [x] Text colors (primary, secondary, tertiary, disabled)
  - [x] Accent colors (primary, secondary, hover states)
  - [x] Navigation (bg, text, active, shadow)
  - [x] Cards (bg, hover, border, shadow)
  - [x] Buttons (bg, hover, text)
  - [x] Modals (bg, border, backdrop, shadow)
  - [x] Forms (bg, border, focus, text)
  - [x] Shadows (color, sm, md, lg)

#### Task 1.3: Refactor Existing Styles

- [ ] Update `base.scss` to use CSS variables
- [ ] Update component SCSS files to use variables:
  - [ ] Navigation
  - [ ] HomePage
  - [ ] CharacterCard
  - [ ] MovieCard
  - [ ] Footer
  - [ ] Other components
- [ ] Test that site looks identical with new variables

---

### Phase 2: Redux State Management ✅ COMPLETED

#### Task 2.1: Create Theme Slice ✅

- [x] Create `frontend/src/store/slices/themeSlice.ts`
- [x] Define theme state interface (ThemeState with selectedTheme, appliedTheme, availableThemes)
- [x] Define ThemeOption type (auto | theme-dark | theme-light | etc.)
- [x] Define Theme interface with id, name, description, preview
- [x] Create AVAILABLE_THEMES array with all 7 themes (including auto)
- [x] Create actions: `setTheme`, `setAppliedTheme`, `initializeTheme`, `resetTheme`
- [x] Create selectors: `selectTheme`, `selectSelectedTheme`, `selectAppliedTheme`, `selectAvailableThemes`

#### Task 2.2: Theme Persistence ✅

- [x] Add THEME_STORAGE_KEY constant to middleware
- [x] Update `localStorageSyncMiddleware.ts` to handle theme actions
- [x] Add debounced theme saving to localStorage
- [x] Create `loadThemeFromStorage()` function
- [x] Add theme to rehydration logic

#### Task 2.3: Integrate into Store ✅

- [x] Import themeReducer into store.ts
- [x] Add theme reducer to store configuration
- [x] Add theme rehydration on app initialization
- [x] Verify types export correctly (RootState includes theme)

---

### Phase 3: Theme Detection & Application ✅ COMPLETED

#### Task 3.1: System Preference Detection ✅

- [x] Create `frontend/src/utils/themeDetection.ts`
- [x] Implement `detectSystemTheme()` function
  - [x] Check for `prefers-color-scheme: dark`
  - [x] Check for `prefers-color-scheme: light`
  - [x] Default to dark if no preference
- [x] Implement `resolveTheme()` function to handle "auto" mode
- [x] Implement `watchSystemTheme()` listener
  - [x] Watch for media query changes
  - [x] Call callback when system preference changes
  - [x] Return cleanup function
- [x] Handle "auto" mode with real-time updates

#### Task 3.2: Theme Application Hook ✅

- [x] Create `frontend/src/hooks/useTheme.ts`
- [x] Implement body class manipulation (`applyThemeToBody`)
  - [x] Remove all existing theme classes
  - [x] Add new theme class to body
- [x] Handle theme switching logic (`changeTheme`)
  - [x] Dispatch setTheme action
  - [x] Resolve theme (handle "auto")
  - [x] Apply theme to body immediately
- [x] Export `useTheme()` hook with:
  - [x] `selectedTheme` (user's choice)
  - [x] `appliedTheme` (actual applied theme)
  - [x] `availableThemes` (all theme options)
  - [x] `changeTheme()` function

#### Task 3.3: App-Level Theme Integration ✅

- [x] Update `App.tsx` to use `useTheme()` hook
- [x] Apply theme class to body on mount
- [x] Handle theme changes reactively with useEffect
- [x] Add system theme watcher when in "auto" mode
- [x] Add cleanup on unmount (automatic via hook)

---

### Phase 4: Theme Settings UI ✅ COMPLETED

#### Task 4.1: Theme Selector Component ✅

- [x] Create theme preview cards in Settings modal
- [x] Design theme card layout:
  - [x] Theme name with icon (magic icon for "auto")
  - [x] Description text
  - [x] Color preview (background + text + accent bar)
  - [x] Selected indicator badge (check circle)
- [x] Add "Auto (System)" option as first theme
- [x] Display all 7 themes in grid layout

#### Task 4.2: Update SiteSettings Component ✅

- [x] Import useTheme hook and ThemeOption type
- [x] Replace "Coming Soon" in Theme tab with theme grid
- [x] Add theme grid display with responsive layout
- [x] Wire up theme selection to Redux via changeTheme()
- [x] Add visual feedback for active theme (border + badge)
- [x] Add section description for user guidance

#### Task 4.3: Theme Preview ✅

- [x] Show color swatches for each theme:
  - [x] Background color fill
  - [x] "Aa" text in theme's text color
  - [x] Accent color bar at bottom
- [x] Theme cards show live preview of colors
- [x] Hover effects on theme cards

---

### Phase 5: Testing & Polish ⏳ PENDING

#### Task 5.1: Theme Switching Tests

- [ ] Test all themes apply correctly
- [ ] Verify localStorage persistence
- [ ] Test "Auto" mode with system changes
- [ ] Test theme switching doesn't break layout

#### Task 5.2: Performance

- [ ] Ensure no FOUC (Flash of Unstyled Content)
- [ ] Optimize CSS variable inheritance
- [ ] Test theme switch performance

#### Task 5.3: Accessibility

- [ ] Ensure sufficient color contrast in all themes
- [ ] Test with screen readers
- [ ] Verify focus indicators visible in all themes

#### Task 5.4: Mobile Testing

- [ ] Test theme selector on mobile
- [ ] Verify all themes render correctly on small screens

---

## Example Theme Implementation

### File: `_theme-dark.scss` (Current)

```scss
body.theme-dark {
  // Backgrounds
  --bg-primary: #000000;
  --bg-secondary: #0f172a;
  --bg-tertiary: #1e293b;
  --bg-overlay: rgba(0, 0, 0, 0.85);

  // Text
  --text-primary: #ffffff;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;

  // Accents
  --accent-primary: #4a90e2;
  --accent-secondary: #fdd017;
  --accent-hover: #5fa3f5;

  // Components
  --nav-bg: #ffffff;
  --nav-text: #334155;
  --card-bg: rgba(255, 255, 255, 0.05);
  --card-border: rgba(255, 255, 255, 0.1);

  // Shadows
  --shadow-color: rgba(0, 0, 0, 0.5);
}
```

### File: `_theme-star-wars.scss`

```scss
body.theme-star-wars {
  // Backgrounds
  --bg-primary: #000000;
  --bg-secondary: #0a0a0a;
  --bg-tertiary: #1a1a1a;
  --bg-overlay: rgba(0, 0, 0, 0.9);

  // Text
  --text-primary: #e0e0e0;
  --text-secondary: #b0b0b0;
  --text-tertiary: #808080;

  // Accents (Star Wars Yellow)
  --accent-primary: #ffe81f;
  --accent-secondary: #ffd700;
  --accent-hover: #fff44f;

  // Components
  --nav-bg: #0f0f0f;
  --nav-text: #ffe81f;
  --card-bg: rgba(255, 232, 31, 0.05);
  --card-border: rgba(255, 232, 31, 0.2);

  // Shadows (slightly yellow tint)
  --shadow-color: rgba(255, 232, 31, 0.1);
}
```

### File: `_theme-light.scss`

```scss
body.theme-light {
  // Backgrounds
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-overlay: rgba(255, 255, 255, 0.95);

  // Text
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #94a3b8;

  // Accents
  --accent-primary: #006bb3;
  --accent-secondary: #fdd017;
  --accent-hover: #0088e0;

  // Components
  --nav-bg: #ffffff;
  --nav-text: #334155;
  --card-bg: #ffffff;
  --card-border: rgba(0, 0, 0, 0.1);

  // Shadows
  --shadow-color: rgba(0, 0, 0, 0.1);
}
```

---

## Usage in Components

### Before (Hardcoded):

```scss
.my-component {
  background: #000000;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### After (Theme-Aware):

```scss
.my-component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--card-border);
}
```

---

## Default Behavior

### First-Time Visitor

1. Check localStorage for saved theme → None found
2. Check system preference via `prefers-color-scheme`
3. Apply matching theme (dark or light)
4. Store "auto" in localStorage

### Returning Visitor

1. Check localStorage → "theme-star-wars" found
2. Apply Star Wars theme immediately (no system check)
3. Ignore system preference (manual override)

### "Auto" Mode Selected

1. User selects "Auto (System)" in settings
2. Store "auto" in localStorage
3. Detect current system preference
4. Apply matching theme
5. Listen for system preference changes
6. Update theme automatically when system changes

---

## Migration Strategy

### Step 1: Add variables alongside existing styles

- Don't break anything
- Components work with old and new approach

### Step 2: Gradually refactor components

- One component at a time
- Test after each refactor

### Step 3: Remove old hardcoded values

- After all components use variables
- Clean up unused SCSS

---

## Future Enhancements (Post-MVP)

- [ ] Custom theme creator (user-defined colors)
- [ ] Scheduled theme switching (auto-switch at sunset/sunrise)
- [ ] Per-page theme overrides
- [ ] Theme transition animations
- [ ] More branded themes (Disney Princesses, Villains, etc.)
- [ ] High contrast mode for accessibility

---

## Success Criteria

✅ User can select from 6 themes
✅ Theme persists across sessions
✅ "Auto" mode follows system preference
✅ All components render correctly in all themes
✅ No flash of unstyled content (FOUC)
✅ Theme changes are instant (no page reload)
✅ Settings UI is intuitive and visually appealing

---

## Timeline Estimate

- **Phase 1:** 3-4 hours (Infrastructure)
- **Phase 2:** 1-2 hours (Redux)
- **Phase 3:** 2-3 hours (Detection & Application)
- **Phase 4:** 2-3 hours (UI)
- **Phase 5:** 2-3 hours (Testing & Polish)

**Total:** ~10-15 hours

---

## Notes

- Start with `theme-dark` as the baseline (current state)
- Test each theme thoroughly before adding the next
- Consider creating a theme preview/demo page
- Document color choices for each branded theme
- Ensure brand consistency (Disney IP guidelines)
