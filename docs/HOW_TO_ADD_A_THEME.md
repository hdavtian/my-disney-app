# How to Add a New Theme

This guide explains the complete process for adding a new theme to the Disney App. Follow these steps in order to ensure full theme integration.

---

## Overview

The theming system uses CSS variables scoped to body classes (e.g., `body.theme-{name}`). Each theme defines:

- Color palette (backgrounds, text, accents)
- Typography (display, body, and accent fonts)
- Component styling (cards, buttons, modals, forms, shadows)

---

## Step-by-Step Process

### 1. Create Theme SCSS File

**Location:** `frontend/src/styles/themes/_theme-{name}.scss`

**Template:**

```scss
// {Theme Name} Theme
body.theme-{name} {
    // === TYPOGRAPHY ===
    --font-display: '{Display Font}', '{Fallback}', {generic-family};
    --font-body: '{Body Font}', -apple-system, sans-serif;
    --font-accent: '{Accent Font}', '{Fallback}', {generic-family};

    // === BACKGROUNDS ===
    --bg-primary: #{primary-bg-color};
    --bg-secondary: #{secondary-bg-color};
    --bg-tertiary: #{tertiary-bg-color};
    --bg-overlay: rgba(...);

    // === TEXT COLORS ===
    --text-primary: #{main-text-color};
    --text-secondary: #{secondary-text-color};
    --text-tertiary: #{tertiary-text-color};
    --text-disabled: #{disabled-text-color};

    // === ACCENT COLORS ===
    --accent-primary: #{primary-accent};
    --accent-primary-hover: #{primary-accent-hover};
    --accent-secondary: #{secondary-accent};
    --accent-secondary-hover: #{secondary-accent-hover};

    // === NAVIGATION ===
    --nav-bg: #{nav-background};
    --nav-text: #{nav-text-color};
    --nav-text-hover: #{nav-hover-color};
    --nav-text-active: #{nav-active-color};
    --nav-shadow: 0 1px 3px rgba(...);

    // === CARDS ===
    --card-bg: #{card-background};
    --card-bg-hover: #{card-hover-bg};
    --card-border: #{card-border-color};
    --card-shadow: 0 4px 6px rgba(...);

    // === BUTTONS ===
    --btn-primary-bg: linear-gradient(135deg, #{start} 0%, #{end} 100%);
    --btn-primary-bg-hover: linear-gradient(135deg, #{start} 0%, #{end} 100%);
    --btn-primary-text: #{button-text-color};
    --btn-contrast-bg: #{high-contrast-button-bg};
    --btn-contrast-text: #{high-contrast-button-text};

    // === MODALS ===
    --modal-bg: linear-gradient(135deg, #{start} 0%, #{end} 100%);
    --modal-border: #{modal-border-color};
    --modal-backdrop: rgba(...);
    --modal-shadow: 0 25px 50px -12px rgba(...);

    // === FORMS ===
    --input-bg: #{input-background};
    --input-border: #{input-border-color};
    --input-border-focus: #{input-focus-color};
    --input-text: #{input-text-color};

    // === SHADOWS ===
    --shadow-color: rgba(...);
    --shadow-sm: 0 1px 2px var(--shadow-color);
    --shadow-md: 0 4px 6px var(--shadow-color);
    --shadow-lg: 0 10px 15px var(--shadow-color);
}
```

**Example:** See `_theme-matrix.scss` or `_theme-military.scss` for real implementations.

---

### 2. Import Theme in Main Themes File

**File:** `frontend/src/styles/themes/_themes.scss`

Add the import at the bottom:

```scss
@import "theme-{name}";
```

---

### 3. Add Google Fonts (if using custom fonts)

**File:** `frontend/index.html`

**Find the Google Fonts link tag** and add your fonts to the URL:

```html
<!-- Add comment describing the new theme fonts -->
<!-- {Theme Name}: {Font1}, {Font2}, {Font3} -->
<link
  href="https://fonts.googleapis.com/css2?family={Font1}:wght@400;600;700;900&family={Font2}:wght@400;600;700&display=swap"
  rel="stylesheet"
/>
```

**Note:** Append to existing URL to keep single consolidated request for performance.

---

### 4. Update TypeScript Type Definition

**File:** `frontend/src/store/slices/themeSlice.ts`

**Add to `ThemeOption` type:**

```typescript
export type ThemeOption =
  | "auto"
  | "theme-dark"
  | "theme-light"
  | "theme-star-wars"
  | "theme-marvel"
  | "theme-walt-disney"
  | "theme-pixar"
  | "theme-matrix"
  | "theme-military"
  | "theme-{name}"; // ← Add this
```

---

### 5. Add Theme Metadata to Available Themes

**File:** `frontend/src/store/slices/themeSlice.ts`

**Add theme object to `AVAILABLE_THEMES` array:**

```typescript
{
  id: "theme-{name}",
  name: "{Display Name}",
  description: "{Brief description for UI}",
  preview: {
    background: "#{primary-bg-color}",
    text: "#{text-color}",
    accent: "#{accent-color}",
  },
  swatches: [
    "#{color1}",  // Background
    "#{color2}",  // Primary accent
    "#{color3}",  // Secondary accent
    "#{color4}",  // Text primary
    "#{color5}",  // Text secondary
  ],
},
```

**Swatches:** Choose 5 representative colors that visually define the theme.

---

### 6. Update Theme Hook

**File:** `frontend/src/hooks/useTheme.ts`

**Add to classList.remove() array:**

```typescript
document.body.classList.remove(
  "theme-dark",
  "theme-light",
  "theme-star-wars",
  "theme-marvel",
  "theme-walt-disney",
  "theme-pixar",
  "theme-matrix",
  "theme-military",
  "theme-{name}" // ← Add this
);
```

---

### 7. Add Font Preview to Settings

**File:** `frontend/src/components/SiteSettings/SiteSettings.scss`

**Add theme-specific font rule:**

```scss
&[data-theme="{name}"] &__preview-text {
    font-family: '{Display Font}', '{Fallback}', {generic-family};
}
```

**Insert before the `auto` theme rule** to maintain proper cascade.

---

## Checklist

Use this checklist when adding a new theme:

- [ ] Create `_theme-{name}.scss` with all CSS variables
- [ ] Import theme in `_themes.scss`
- [ ] Add fonts to `index.html` (if needed)
- [ ] Add to `ThemeOption` type in `themeSlice.ts`
- [ ] Add metadata object to `AVAILABLE_THEMES` in `themeSlice.ts`
- [ ] Add to `classList.remove()` in `useTheme.ts`
- [ ] Add font preview rule in `SiteSettings.scss`
- [ ] **Verify contrast button variables** (`--btn-contrast-bg` and `--btn-contrast-text`)
- [ ] Test theme switching in Settings modal
- [ ] Verify fonts load correctly
- [ ] Check all pages (Home, Characters, Movies, Details, Favorites)
- [ ] Verify color swatches display correctly
- [ ] **Test Load More buttons** on Characters and Movies pages for visibility

---

## Design Guidelines

### Color Selection

- **Backgrounds:** Use 3 levels (primary, secondary, tertiary) for depth
- **Text:** Ensure proper contrast (WCAG AA minimum)
- **Accents:** Choose 2 complementary colors for primary/secondary actions
- **Hover states:** 10-15% lighter/brighter than base color
- **Contrast buttons:** Use inverse of page background for guaranteed visibility
  - Dark page backgrounds → light button backgrounds (white, yellow, bright accent)
  - Light page backgrounds → dark button backgrounds (dark blue, black)
  - Button text must contrast with button background (light bg → dark text, dark bg → light text)

### Typography

- **Display font:** Bold, distinctive - used for headings, titles, logos
- **Body font:** Readable, neutral - used for paragraphs and content
- **Accent font:** Stylistic - used sparingly for special elements
- Always include fallback fonts and generic family

### Theme Personality

Each theme should have a distinct visual identity:

- **Dark:** Elegant, classic Disney
- **Light:** Clean, modern
- **Star Wars:** Futuristic, iconic yellow on black
- **Marvel:** Bold, comic-book red
- **Walt Disney:** Classic blue and gold
- **Pixar:** Bright, playful
- **Matrix:** Digital green, cyberpunk
- **Military:** Tactical, camouflage-inspired

---

## Testing

After adding a theme:

1. **Visual Test:**

   - Open Settings → Theme tab
   - Click on new theme card
   - Verify "Aa" displays in correct font
   - Check color swatches are accurate

2. **Navigation Test:**

   - Browse all pages with new theme active
   - Check navigation logo font
   - Verify page titles use theme font

3. **Component Test:**

   - Hero sections (font display)
   - Cards (backgrounds, borders, hover)
   - Buttons (colors, hover states)
   - **Load More buttons** (visibility and text legibility on Characters/Movies pages)
   - Modals (Settings dialog)
   - Forms (inputs, borders, focus states)

4. **Accessibility Test:**
   - Text contrast (use browser DevTools)
   - Focus indicators visible
   - Hover states clear

---

## File Structure Reference

```
frontend/
├── index.html                              # Google Fonts import
├── src/
│   ├── components/
│   │   └── SiteSettings/
│   │       └── SiteSettings.scss           # Font preview rules
│   ├── hooks/
│   │   └── useTheme.ts                     # Theme switching logic
│   ├── store/
│   │   └── slices/
│   │       └── themeSlice.ts               # Theme metadata & types
│   └── styles/
│       └── themes/
│           ├── _themes.scss                # Import all themes
│           ├── _theme-dark.scss
│           ├── _theme-light.scss
│           ├── _theme-star-wars.scss
│           ├── _theme-marvel.scss
│           ├── _theme-walt-disney.scss
│           ├── _theme-pixar.scss
│           ├── _theme-matrix.scss
│           ├── _theme-military.scss
│           └── _theme-{name}.scss          # ← New theme here
```

---

## Tips & Best Practices

1. **Name themes consistently:** Use `theme-{name}` format (lowercase, hyphenated)
2. **Start from existing theme:** Copy a similar theme file as starting point
3. **Test incrementally:** Add theme, test, then proceed to next step
4. **Use color tools:** Use contrast checkers for accessibility
5. **Consider context:** Think about where/when theme might be used
6. **Document inspiration:** Add comment at top of SCSS with theme concept
7. **Keep swatches representative:** Choose colors that capture theme essence
8. **Match font personality:** Font should complement color palette

---

## Common Issues

**Theme not appearing in Settings:**

- Check `AVAILABLE_THEMES` array in `themeSlice.ts`
- Verify import in `_themes.scss`

**Fonts not loading:**

- Check Google Fonts URL in `index.html`
- Verify font family names match exactly (case-sensitive)
- Check browser console for font load errors

**Theme not switching:**

- Verify class name in `useTheme.ts` classList.remove()
- Check theme ID matches everywhere (TypeScript type, metadata, SCSS)

**Colors not applying:**

- Ensure CSS variable names match exactly
- Check SCSS file has no syntax errors
- Verify theme is imported in `_themes.scss`

**Load More buttons invisible or illegible:**

- Verify `--btn-contrast-bg` and `--btn-contrast-text` are defined in theme
- Ensure contrast variables use inverse of page background color
- Dark themes should have light contrast buttons, light themes should have dark contrast buttons
- Test on Characters and Movies pages by scrolling to Load More section

---

## Resources

- [Google Fonts](https://fonts.google.com/) - Find fonts
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Test accessibility
- [Coolors](https://coolors.co/) - Generate color palettes
- Existing themes in `frontend/src/styles/themes/` - Reference implementations

---

**Last Updated:** November 14, 2025  
**Version:** 2.1 (added contrast button guidance)
