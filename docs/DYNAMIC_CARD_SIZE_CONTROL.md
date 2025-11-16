# Dynamic Card Size Control - Design Document

**Created:** November 15, 2025  
**Feature:** User-adjustable card size control for Movies and Characters grid views  
**Status:** Planning & Discussion

---

## 📋 Overview

Add a dynamic card size control to Movies and Characters pages, allowing users to adjust card size via a slider control. This setting should persist across sessions and be independent for each page.

---

## 🎯 Requirements

### Functional Requirements

1. **Slider Control**: Visual slider UI to adjust card size (left = smaller, right = larger)
2. **Real-time Preview**: Cards resize immediately as user drags slider
3. **Persistent State**: Size preference saved to Redux + localStorage
4. **Independent Settings**: Movies and Characters maintain separate size preferences
5. **Responsive Behavior**: Only active on tablet+ breakpoints (mobile uses fixed layout)
6. **Accessibility**: Keyboard accessible with ARIA labels

### Technical Constraints

- Current grid uses fixed column counts per breakpoint (e.g., 4 columns on desktop)
- Cards have aspect ratios that must be maintained
- Layout must remain responsive and not break on different screen sizes
- Performance: no layout thrashing or janky animations

---

## 🔍 Current Implementation Analysis

### Grid Structure

**Characters Grid** (`CharactersGridView.scss`):

- 6 columns @ desktop (1280px+)
- 5 columns @ 1024-1280px
- 4 columns @ 768-1024px
- 3 columns @ 481-768px
- 2 columns @ mobile

**Movies Grid** (`MoviesGridView.scss`):

- 6 columns @ 1920px+
- 4 columns @ 1280-1919px
- 3 columns @ 769-1279px
- 2 columns @ 481-768px
- 1 column @ mobile

### Card Sizing

- Cards use `grid-template-columns: repeat(N, 1fr)` - equal-width columns
- Cards fill their grid cell completely
- Aspect ratios defined in card SCSS (characters are circular, movies are poster-shaped)

### State Management

- Redux `uiPreferencesSlice` already stores per-page preferences
- Current structure: `viewMode`, `gridItemsToShow`, `searchQuery`, `lastUpdated`
- Preferences synced to localStorage via middleware

---

## 💡 Implementation Options

### **Option 1: Dynamic Column Count (Recommended)**

**Approach**: Slider controls number of columns in CSS Grid, transitioning between predefined column counts.

#### How It Works

- Slider has 3-5 steps representing column counts
- User moves slider, React updates a CSS class or inline style
- Grid transitions smoothly using `transition: grid-template-columns 0.3s ease`
- Column counts respect breakpoint minimums

#### Implementation Details

**Redux State Addition**:

```typescript
interface PagePreferences {
  viewMode: ViewMode;
  gridItemsToShow: number;
  searchQuery: string;
  gridColumns: number; // NEW: 3, 4, 5, 6, etc.
  lastUpdated: number;
}
```

**Slider Configuration**:

```typescript
const COLUMN_PRESETS = {
  movies: {
    min: 3, // Larger cards, fewer columns
    max: 6, // Smaller cards, more columns
    default: 4,
  },
  characters: {
    min: 4, // Characters are smaller (circular)
    max: 8, // Can show more
    default: 6,
  },
};
```

**CSS Implementation**:

```scss
.movies-grid-view__grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns, 4), minmax(0, 1fr));
  gap: var(--space-6);
  transition: grid-template-columns 0.3s ease;

  @media (max-width: 1280px) {
    --grid-columns: min(
      var(--grid-columns),
      4
    ); // Cap at 4 columns on smaller screens
  }

  @media (max-width: 1024px) {
    --grid-columns: min(var(--grid-columns), 3); // Cap at 3 columns
  }
}
```

**React Component**:

```tsx
<div
  className="movies-grid-view__grid"
  style={{ "--grid-columns": gridColumns } as React.CSSProperties}
>
  {/* cards */}
</div>
```

#### Pros

✅ **Simple**: Leverages existing CSS Grid structure  
✅ **Performant**: Only changes grid columns, cards naturally resize  
✅ **Predictable**: Discrete steps (3, 4, 5, 6 columns) = predictable layouts  
✅ **Responsive**: Easy to cap max columns per breakpoint  
✅ **Smooth**: CSS transitions handle animation  
✅ **Accessible**: Clear slider steps with labels

#### Cons

⚠️ **Discrete Steps**: Not truly "continuous" sizing (but this is actually better UX)  
⚠️ **Resolution Dependent**: Same column count looks different on 1920px vs 1280px screen

---

### **Option 2: Fixed Card Width with Auto-Fill**

**Approach**: Slider controls fixed card width, grid uses `auto-fill` to determine column count.

#### How It Works

```scss
.movies-grid-view__grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(var(--card-width, 300px), 1fr)
  );
  gap: var(--space-6);
}
```

- Slider range: 200px - 400px (or larger)
- Grid automatically calculates how many cards fit per row
- Cards have minimum width but can grow to fill space

#### Pros

✅ **Truly Dynamic**: Continuous size control  
✅ **Resolution Agnostic**: Same card width across screen sizes  
✅ **Natural Layout**: Browser calculates optimal column count

#### Cons

❌ **Unpredictable**: User doesn't know how many columns they'll get  
❌ **Janky Transitions**: Layout reflows can be jarring  
❌ **Aspect Ratio Issues**: Cards may not maintain perfect proportions  
❌ **Breakpoint Conflicts**: Harder to enforce responsive rules  
❌ **Gap Inconsistency**: Last row may have uneven gaps

---

### **Option 3: Transform Scale (NOT Recommended)**

**Approach**: Keep grid structure, apply CSS `transform: scale()` to cards.

#### Why Not

❌ Cards overlap or leave gaps  
❌ Breaks layout flow  
❌ Accessibility issues (scaled text)  
❌ Poor UX (zoomed-in cards look awkward)

---

## 🏆 Recommendation: **Option 1 - Dynamic Column Count**

### Why This Works Best

1. **Predictable UX**: Users understand "show more/fewer items per row"
2. **Performance**: Minimal DOM changes, CSS handles animation
3. **Maintainable**: Works with existing responsive grid system
4. **Professional Feel**: Similar to Spotify, Netflix "grid density" controls
5. **Accessibility**: Clear increments, easy to label ("Cozy", "Normal", "Compact", "Dense")

### Suggested Slider Labels

**Movies**:

- **Cozy** (3 columns) - Large posters, great for browsing
- **Normal** (4 columns) - Default, balanced view ⭐ DEFAULT
- **Compact** (5 columns) - More content, smaller cards
- **Dense** (6 columns) - Maximum density

**Characters**:

- **Normal** (4 columns) - Spacious layout
- **Comfortable** (5 columns) - Balanced view
- **Compact** (6 columns) - Default, efficient ⭐ DEFAULT
- **Dense** (7 columns) - More characters visible
- **Maximum** (8 columns) - Ultra-compact view

---

## 🎨 UI Design

### Slider Component Location

Place in `movies-page__controls` / `characters-page__controls` section:

```tsx
<div className="movies-page__controls">
  <SearchInput ... />
  <ViewModeToggle ... />
  <CardSizeControl
    currentColumns={gridColumns}
    minColumns={3}
    maxColumns={6}
    onChange={handleGridColumnsChange}
  />
</div>
```

### Visual Design

```
┌──────────────────────────────────────┐
│  Card Size                     [Icon]│
│  ●━━━━━○━━━━━━━━━                    │
│  Cozy  Normal  Compact  Dense        │
└──────────────────────────────────────┘
```

- Icon: Grid icon showing density (e.g., `▦ ▧ ▨`)
- Slider: Range input with visible steps
- Labels: Show below slider at key positions
- Tooltip: Show current setting on hover

---

## 🔧 Implementation Plan

### Phase 1: Redux State (15 min)

- [ ] Add `gridColumns` to `PagePreferences` interface
- [ ] Add default values to `DEFAULT_PAGE_PREFERENCES`
- [ ] Create actions: `setMoviesGridColumns`, `setCharactersGridColumns`
- [ ] Update localStorage sync middleware

### Phase 2: Slider Component (30 min)

- [ ] Create `CardSizeControl.tsx` component
- [ ] Props: `currentColumns`, `minColumns`, `maxColumns`, `onChange`, `labels`
- [ ] Implement range input with step markers
- [ ] Add ARIA labels and keyboard support
- [ ] Style component to match design system

### Phase 3: Grid CSS Updates (20 min)

- [ ] Update `MoviesGridView.scss` to use CSS variable
- [ ] Update `CharactersGridView.scss` to use CSS variable
- [ ] Add transition effects
- [ ] Test responsive breakpoint behavior

### Phase 4: React Integration (25 min)

- [ ] Add slider to `MoviesPage.tsx` header
- [ ] Add slider to `CharactersPage.tsx` header
- [ ] Wire up Redux actions
- [ ] Pass `gridColumns` prop to grid views
- [ ] Apply CSS variable inline style

### Phase 5: Testing & Polish (20 min)

- [ ] Test all slider positions
- [ ] Test breakpoint responsiveness
- [ ] Test persistence (localStorage)
- [ ] Test independent settings (movies vs characters)
- [ ] Verify accessibility (keyboard, screen reader)
- [ ] Cross-browser testing

**Total Estimated Time: ~2 hours**

---

## 📦 Files to Create/Modify

### New Files

- `frontend/src/components/CardSizeControl/CardSizeControl.tsx`
- `frontend/src/components/CardSizeControl/CardSizeControl.scss`
- `frontend/src/components/CardSizeControl/index.ts`

### Modified Files

- `frontend/src/store/slices/uiPreferencesSlice.ts` - Add gridColumns state
- `frontend/src/pages/MoviesPage/MoviesPage.tsx` - Add slider, wire up state
- `frontend/src/pages/CharactersPage/CharactersPage.tsx` - Add slider, wire up state
- `frontend/src/components/MoviesGridView/MoviesGridView.tsx` - Accept gridColumns prop
- `frontend/src/components/MoviesGridView/MoviesGridView.scss` - Use CSS variable
- `frontend/src/components/CharactersGridView/CharactersGridView.tsx` - Accept gridColumns prop
- `frontend/src/components/CharactersGridView/CharactersGridView.scss` - Use CSS variable

---

## 🚀 Future Enhancements

### Phase 2 (Future)

- [ ] Add tooltip showing preview of grid density
- [ ] Add "Reset to default" button
- [ ] Add preset buttons instead of/alongside slider
- [ ] Sync card size across pages (optional toggle)
- [ ] Remember last-used size as new default

### Phase 3 (Advanced)

- [ ] Smart column count based on screen width
- [ ] A/B test optimal default column counts
- [ ] Analytics: track which densities users prefer
- [ ] Export/import user layout preferences

---

## 🎯 Success Metrics

- Users can adjust card size in 3-5 steps
- Setting persists across sessions
- Movies and Characters have independent settings
- No layout issues across breakpoints
- Smooth transitions (no jank)
- Accessibility score maintained (Lighthouse)

---

## 🤔 Open Questions for Discussion

1. **Column Count Ranges**: Are 3-6 for movies and 4-8 for characters the right ranges?
2. **Default Position**: Should default be middle of range or current hardcoded value?
3. **Mobile Behavior**: Show slider on mobile or hide completely?
4. **Slider Label Style**: Text labels vs. icon indicators vs. both?
5. **Tooltip Content**: Show column count ("4 columns") or label ("Normal")?
6. **Animation Duration**: 0.3s transition feel right or too slow?
7. **Breakpoint Caps**: Should we auto-reduce columns on smaller screens or let user choose?

---

## 🗳️ Decision Log

| Date | Decision              | Rationale                      |
| ---- | --------------------- | ------------------------------ |
| TBD  | Pending user feedback | Awaiting discussion on options |

---

## 📝 Next Steps

1. **Review this document** - Does this approach align with your vision?
2. **Answer open questions** - Help refine the design
3. **Approve Option 1** or suggest modifications
4. **Begin implementation** following the plan above

---

**Ready to discuss and refine!** 🎬✨
