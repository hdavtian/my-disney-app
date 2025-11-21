# Filtering & Sorting System Implementation Plan

## 📋 Overview

This document outlines the design and implementation strategy for a unified, reusable filtering and sorting system for the Movies, Characters, and Favorites pages in the Disney App.

---

## 🎯 Goals

1. **Consistency**: Unified visual and interaction patterns across all three pages
2. **Reusability**: Single component that can be configured for different data types
3. **Performance**: Efficient filtering that respects pagination and data loading states
4. **User Experience**: Clear, intuitive controls with professional UX patterns
5. **State Management**: Proper preservation of filter/sort selections per page

---

## 🔍 Current State Analysis

### Existing Implementation (Favorites Page)

**What we have:**

- Filter buttons (All, Movies, Characters, Attractions) using `FilterType`
- Search functionality via `SearchInput` component
- Card size control via `CardSizeControl` component
- State management in Redux (`uiPreferencesSlice`)
- Visual style: pill-shaped buttons in a horizontal group with active state

**Styling Pattern:**

```scss
.favorites-page__filter-buttons {
  display: flex;
  gap: var(--space-2);
  background: var(--bg-secondary);
  padding: var(--space-1);
  border-radius: var(--radius-lg);
  border: 1px solid var(--card-border);
}

.favorites-page__filter-button {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  color: var(--text-secondary);
  &.active {
    background: var(--btn-contrast-bg);
    color: var(--btn-contrast-text);
    box-shadow: 0 2px 4px var(--shadow-color);
  }
}
```

---

## 🎨 Design Decisions

### 1. **Data Loading Strategy: Load All Before Filtering**

**Decision: RECOMMENDED APPROACH**

✅ **Pros:**

- Accurate filter counts and results
- No confusion about "what am I filtering?"
- Standard industry pattern (Netflix, Disney+, Hulu all load full catalogs)
- Enables advanced features like multi-criteria filtering
- Better user experience - users see the full dataset

❌ **Cons:**

- Initial load time for large datasets
- More memory usage on client

**Implementation:**

```
┌─────────────────────────────────────────────────────┐
│  Page loads → Show loading state                   │
│  ↓                                                  │
│  Fetch ALL items (movies/characters)               │
│  ↓                                                  │
│  Display full dataset with filtering controls      │
│  ↓                                                  │
│  User applies filters → Client-side filtering      │
└─────────────────────────────────────────────────────┘
```

**For this app:**

- **Movies**: ~200 items (reasonable to load all)
- **Characters**: ~180 items (reasonable to load all)
- **Favorites**: Already loads all favorited items

**Alternative Considered: "Load All" Button**

- Adds friction to user experience
- Creates two-tier UX (before/after loading)
- Not recommended for datasets under 500 items

---

### 2. **Filter Combination Strategy: Independent Multi-Select**

**Decision: Filters work independently and can be combined**

**Example Scenarios:**

```
Sort: A-Z ↓ + Category: Marvel → Shows Marvel characters alphabetically
Sort: Year ↓ + Search: "Frozen" → Shows Frozen movies by year
```

**Benefits:**

- Maximum flexibility for users
- Standard pattern (e.g., Amazon, eBay filters)
- Progressive refinement of results
- Each filter is independent and additive

**Filter Priority Order:**

```
1. Category/Type filters (reduce dataset)
2. Search query (further reduce)
3. Sort order (organize results)
```

---

### 3. **Filter Types Per Page**

#### **Movies Page**

| Filter Type | Control  | Values                                               | State Key   |
| ----------- | -------- | ---------------------------------------------------- | ----------- |
| Sort Order  | Dropdown | Name (A-Z), Name (Z-A), Year (Oldest), Year (Newest) | `sortOrder` |

#### **Characters Page**

| Filter Type | Control               | Values                           | State Key    |
| ----------- | --------------------- | -------------------------------- | ------------ |
| Category    | Multi-select Dropdown | Disney, Marvel, Pixar, Star Wars | `categories` |
| Sort Order  | Dropdown              | Name (A-Z), Name (Z-A)           | `sortOrder`  |

#### **Favorites Page** (Keep Existing + Add Sort)

| Filter Type | Control      | Values                               | State Key    |
| ----------- | ------------ | ------------------------------------ | ------------ |
| Item Type   | Pill Buttons | All, Movies, Characters, Attractions | `filterType` |
| Sort Order  | Dropdown     | Name (A-Z), Name (Z-A)               | `sortOrder`  |

---

## 🏗️ Technical Architecture

### Component Structure

```
FilterSortPanel (New Reusable Component)
├── FilterGroup (wrapper for related filters)
│   ├── PillButtonFilter (for mutually exclusive options)
│   └── DropdownFilter (for single/multi-select)
├── SortDropdown (dedicated sort control)
└── AlphabetFilter (NEW - alphabetical index)
    ├── Letter Row (Desktop/Tablet)
    └── Dropdown (Mobile)
```

### Component API Design

```typescript
interface FilterSortPanelProps<T> {
  // Filter configurations
  filters?: FilterConfig[];

  // Sort configuration
  sortOptions?: SortOption<T>[];
  currentSort?: string;
  onSortChange?: (sortKey: string) => void;

  // Current filter state
  activeFilters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;

  // Optional result count
  resultCount?: number;
  totalCount?: number;

  // Visual variant
  variant?: "compact" | "expanded";
}

interface FilterConfig {
  key: string;
  label: string;
  type: "pill-group" | "dropdown" | "multi-dropdown";
  options: FilterOption[];
  defaultValue?: any;
}

interface FilterOption {
  value: string;
  label: string;
  icon?: string;
}

interface SortOption<T> {
  key: string;
  label: string;
  compareFn: (a: T, b: T) => number;
  icon?: string;
}
```

### Example Usage

```tsx
// Movies Page
<FilterSortPanel
  sortOptions={[
    { key: 'title-asc', label: 'Title (A-Z)', compareFn: sortByTitleAsc },
    { key: 'title-desc', label: 'Title (Z-A)', compareFn: sortByTitleDesc },
    { key: 'year-asc', label: 'Year (Oldest)', compareFn: sortByYearAsc },
    { key: 'year-desc', label: 'Year (Newest)', compareFn: sortByYearDesc },
  ]}
  currentSort={sortOrder}
  onSortChange={handleSortChange}
  activeFilters={{}}
  onFiltersChange={() => {}}
  resultCount={displayedMovies.length}
  totalCount={movies.length}
/>

// Characters Page
<FilterSortPanel
  filters={[
    {
      key: 'categories',
      label: 'Category',
      type: 'multi-dropdown',
      options: [
        { value: 'Disney', label: 'Disney' },
        { value: 'Marvel', label: 'Marvel' },
        { value: 'Pixar', label: 'Pixar' },
        { value: 'Star Wars', label: 'Star Wars' },
      ],
    },
  ]}
  sortOptions={[
    { key: 'name-asc', label: 'Name (A-Z)', compareFn: sortByNameAsc },
    { key: 'name-desc', label: 'Name (Z-A)', compareFn: sortByNameDesc },
  ]}
  activeFilters={{ categories: ['Disney', 'Marvel'] }}
  onFiltersChange={handleFiltersChange}
  currentSort={sortOrder}
  onSortChange={handleSortChange}
  resultCount={displayedCharacters.length}
  totalCount={characters.length}
/>

// Favorites Page
<FilterSortPanel
  filters={[
    {
      key: 'filterType',
      label: 'Show',
      type: 'pill-group',
      options: [
        { value: 'all', label: 'All' },
        { value: 'movies', label: 'Movies' },
        { value: 'characters', label: 'Characters' },
        { value: 'attractions', label: 'Attractions' },
      ],
    },
  ]}
  sortOptions={[
    { key: 'name-asc', label: 'Name (A-Z)', compareFn: sortByNameAsc },
    { key: 'name-desc', label: 'Name (Z-A)', compareFn: sortByNameDesc },
  ]}
  activeFilters={{ filterType: 'all' }}
  onFiltersChange={handleFiltersChange}
  currentSort={sortOrder}
  onSortChange={handleSortChange}
/>
```

### AlphabetFilter Component API

```typescript
interface AlphabetFilterProps {
  // Data source
  items: Movie[] | Character[];
  nameKey: "title" | "name";

  // Current state
  selectedLetter?: string | null; // 'A', 'B', ..., 'Z', '#', or null
  onLetterSelect: (letter: string | null) => void;

  // Optional customization
  className?: string;
  showCounts?: boolean; // Show count per letter (future)
}

// Usage Example
<AlphabetFilter
  items={movies}
  nameKey="title"
  selectedLetter={selectedLetter}
  onLetterSelect={handleLetterSelect}
/>;
```

**Key Features:**

- Automatically calculates which letters have data
- Strips articles ("The", "A", "An") when indexing
- Groups numbers/special chars under "#"
- Desktop: Interactive letter row
- Mobile: Dropdown with available letters
- Click selected letter to deselect (returns to "All")

---

## 📦 Redux State Updates

### Update `uiPreferencesSlice.ts`

Add sorting, filtering, and alphabetical index state to page preferences:

```typescript
interface PagePreferences {
  viewMode: ViewMode;
  gridItemsToShow: number;
  searchQuery: string;
  gridColumns: number;

  // NEW: Alphabetical Index
  selectedLetter?: string | null; // 'A', 'B', ..., 'Z', '#', or null for all

  // NEW: Sorting
  sortOrder?: string; // e.g., 'title-asc', 'year-desc'

  // NEW: Category filters (for characters)
  selectedCategories?: string[]; // e.g., ['Disney', 'Marvel']

  // EXISTING: For favorites
  filterType?: FilterType;

  lastUpdated: number;
}
```

**New Actions:**

```typescript
// Movies
setMoviesSortOrder(state, action: PayloadAction<string>)
setMoviesSelectedLetter(state, action: PayloadAction<string | null>)

// Characters
setCharactersSortOrder(state, action: PayloadAction<string>)
setCharactersCategories(state, action: PayloadAction<string[]>)
setCharactersSelectedLetter(state, action: PayloadAction<string | null>)

// Favorites
setFavoritesSortOrder(state, action: PayloadAction<string>)
setFavoritesSelectedLetter(state, action: PayloadAction<string | null>)
```

---

## 🎨 Visual Design Specifications

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  [Filter Pills or Dropdowns]          [Sort Dropdown] [🔢 Size] │
├──────────────────────────────────────────────────────────────────┤
│  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z  #  [All] │
│  └─┘ └─┘   └─┘ └─┘ └─┘     └─┘   └─┘ └─┘ └─┘   └─┘  └─┘  └──┘ │
│  Active  Muted  Selected                                        │
└──────────────────────────────────────────────────────────────────┘
```

**Responsive Behavior:**

- **Desktop (1280px+)**: Horizontal row, all controls visible, letter row below
- **Tablet (768-1279px)**: Wrap to two rows if needed, letter row below
- **Mobile (<768px)**: Stack vertically, full-width controls, dropdown for letters

### Filter Pill Group (for type selection)

```scss
.filter-sort-panel__pill-group {
  display: flex;
  gap: var(--space-2);
  background: var(--bg-secondary);
  padding: var(--space-1);
  border-radius: var(--radius-lg);
  border: 1px solid var(--card-border);
}

.filter-sort-panel__pill-button {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  color: var(--text-secondary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--btn-secondary-hover-bg);
    color: var(--text-primary);
  }

  &.active {
    background: var(--btn-contrast-bg);
    color: var(--btn-contrast-text);
    box-shadow: 0 2px 4px var(--shadow-color);
  }
}
```

### Dropdown Control (for sort and category)

```scss
.filter-sort-panel__dropdown {
  position: relative;
  min-width: 200px;
}

.filter-sort-panel__dropdown-button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;

  &:hover {
    border-color: var(--btn-contrast-bg);
  }
}

.filter-sort-panel__dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px var(--shadow-color);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
}

.filter-sort-panel__dropdown-item {
  padding: var(--space-3) var(--space-4);
  cursor: pointer;

  &:hover {
    background: var(--bg-secondary);
  }

  &.selected {
    background: var(--btn-contrast-bg);
    color: var(--btn-contrast-text);
  }
}
```

### Multi-Select Dropdown (for categories)

Add checkboxes to dropdown items:

```scss
.filter-sort-panel__dropdown-item--multi {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
}
```

### Alphabetical Index Control

Desktop/Tablet letter row and mobile dropdown:

```scss
.alphabet-filter {
  margin-bottom: var(--space-4);

  &__letters {
    display: flex;
    gap: var(--space-1);
    justify-content: center;
    flex-wrap: wrap;
    padding: var(--space-3);
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);

    @media (max-width: 768px) {
      display: none; // Hide on mobile
    }
  }

  &__letter {
    min-width: 32px;
    height: 32px;
    padding: 0;
    background: transparent;
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(.disabled) {
      background: var(--btn-secondary-hover-bg);
      border-color: var(--btn-contrast-bg);
    }

    &.selected {
      background: var(--btn-contrast-bg);
      color: var(--btn-contrast-text);
      border-color: var(--btn-contrast-bg);
      font-weight: var(--font-bold);
    }

    &.disabled {
      color: var(--text-disabled);
      opacity: 0.4;
      cursor: not-allowed;
    }

    &--all {
      min-width: 48px;
      margin-right: var(--space-2);
    }
  }

  &__dropdown {
    display: none;

    @media (max-width: 768px) {
      display: block; // Show on mobile
    }

    select {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background: var(--bg-secondary);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: var(--text-base);
    }
  }
}
```

---## 🔄 Data Flow

### Alphabetical Index Utilities

```typescript
// Helper to strip articles and get first character
const getIndexCharacter = (name: string): string => {
  // Strip common articles ("The", "A", "An")
  const cleanName = name.replace(/^(The|A|An)\s+/i, "");
  const firstChar = cleanName.charAt(0).toUpperCase();

  // Return '#' for numbers, otherwise the letter
  return /[0-9]/.test(firstChar) ? "#" : firstChar;
};

// Generate letter index with counts (for determining active/disabled state)
const getLetterIndex = (
  items: Movie[] | Character[],
  nameKey: "title" | "name"
): Record<string, number> => {
  const index: Record<string, number> = {};

  items.forEach((item) => {
    const char = getIndexCharacter(item[nameKey]);
    if (/[A-Z#]/.test(char)) {
      index[char] = (index[char] || 0) + 1;
    }
  });

  return index;
};

// Usage:
// { A: 45, B: 23, C: 12, D: 0, ..., Z: 5, #: 3 }
// Letters with count > 0 are active, others are disabled
```

### Sorting Implementation

```typescript
// Sort functions library
const sortFunctions = {
  // Movies
  "title-asc": (a: Movie, b: Movie) => a.title.localeCompare(b.title),
  "title-desc": (a: Movie, b: Movie) => b.title.localeCompare(a.title),
  "year-asc": (a: Movie, b: Movie) =>
    (a.releaseYear || 0) - (b.releaseYear || 0),
  "year-desc": (a: Movie, b: Movie) =>
    (b.releaseYear || 0) - (a.releaseYear || 0),

  // Characters
  "name-asc": (a: Character, b: Character) => a.name.localeCompare(b.name),
  "name-desc": (a: Character, b: Character) => b.name.localeCompare(a.name),
};

// In component
const sortedItems = useMemo(() => {
  if (!sortOrder) return items;
  const sortFn = sortFunctions[sortOrder];
  return sortFn ? [...items].sort(sortFn) : items;
}, [items, sortOrder]);
```

### Filtering Implementation

```typescript
const filteredItems = useMemo(() => {
  let result = items;

  // 1. Apply alphabetical filter FIRST (most restrictive)
  if (selectedLetter) {
    result = result.filter((item) => {
      const char = getIndexCharacter(item[nameKey]);
      return char === selectedLetter;
    });
  }

  // 2. Apply category filter (characters only)
  if (selectedCategories?.length > 0) {
    result = result.filter((item) =>
      selectedCategories.includes(item.category)
    );
  }

  // 3. Apply search filter
  if (searchQuery) {
    result = result.filter((item) =>
      item[nameKey].toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // 4. Apply sort (always last)
  if (sortOrder) {
    result = [...result].sort(sortFunctions[sortOrder]);
  }

  return result;
}, [
  items,
  selectedLetter,
  selectedCategories,
  searchQuery,
  sortOrder,
  nameKey,
]);
```

**Filter Priority:**

```
Alphabetical → Category → Search → Sort
(Most restrictive)        (Organize results)
```

---

## 📝 Implementation Steps

### Phase 1: Core Components (3-4 hours)

1. ✅ Create `FilterSortPanel` component
2. ✅ Create `DropdownFilter` subcomponent
3. ✅ Create `PillButtonFilter` subcomponent
4. ✅ Create `AlphabetFilter` component (NEW)
   - Desktop letter row with active/disabled/selected states
   - Mobile dropdown
   - Letter index generation utility (`getIndexCharacter`, `getLetterIndex`)
5. ✅ Create `FilterSortPanel.scss` and `AlphabetFilter.scss`
6. ✅ Add TypeScript interfaces and types

### Phase 2: Redux Integration (1 hour)

1. ✅ Update `uiPreferencesSlice` with new state fields
2. ✅ Add actions for sort, filter, and letter selection updates
3. ✅ Update state persistence logic

### Phase 3: Movies Page Integration (1.5 hours)

1. ✅ Add alphabetical index control
2. ✅ Add sort dropdown to Movies page
3. ✅ Implement letter filtering + sort logic with `useMemo`
4. ✅ Connect to Redux state
5. ✅ Test all combinations (letter + sort)

### Phase 4: Characters Page Integration (2 hours)

1. ✅ Add alphabetical index control
2. ✅ Add category filter dropdown
3. ✅ Add sort dropdown
4. ✅ Implement letter + category filtering + sorting logic
5. ✅ Connect to Redux state
6. ✅ Test all combinations (letter + category + sort)

### Phase 5: Favorites Page Integration (1.5 hours)

1. ✅ Keep existing pill buttons
2. ✅ Add alphabetical index control
3. ✅ Add sort dropdown
4. ✅ Refactor to use `FilterSortPanel` component
5. ✅ Implement mixed-type letter filtering (movies/characters/attractions)
6. ✅ Ensure backward compatibility

### Phase 6: Testing & Polish (1.5 hours)

1. ✅ Test all filter/sort/letter combinations
2. ✅ Verify state persistence across navigation
3. ✅ Test responsive behavior (letter row → dropdown)
4. ✅ Test article stripping ("The", "A", "An")
5. ✅ Test "#" for numbers
6. ✅ Accessibility audit (keyboard nav, ARIA labels)
7. ✅ Performance check with large datasets
8. ✅ Test click-to-deselect letter behavior

**Total Estimated Time: 10.5-12 hours**

---

## ✅ Acceptance Criteria

### Functional Requirements

- [ ] **Alphabetical Index** on all three pages (Movies, Characters, Favorites)
  - [ ] Desktop/Tablet: Letter row (A-Z, #, All) with active/disabled/selected states
  - [ ] Mobile: Dropdown with only available letters
  - [ ] Strips articles ("The", "A", "An") when indexing
  - [ ] "#" groups numbers and special characters
  - [ ] Click selected letter to deselect (returns to "All")
  - [ ] Disabled letters are muted and non-clickable
- [ ] Movies page has 4 sort options (Title A-Z, Title Z-A, Year Oldest, Year Newest)
- [ ] Characters page has category filter (Disney, Marvel, Pixar, Star Wars) + 2 sort options
- [ ] Favorites page keeps existing type filter + adds 2 sort options
- [ ] All filter/sort/letter selections persist in Redux state
- [ ] State is preserved when navigating away and returning
- [ ] Filters work independently and can be combined (Scenario A)
- [ ] Search + filters + sort + letter all work together seamlessly
- [ ] Result count updates correctly

### Visual Requirements

- [ ] Consistent styling across all three pages
- [ ] Matches existing Favorites page design language
- [ ] Smooth transitions and hover states
- [ ] Responsive on mobile, tablet, desktop
- [ ] Proper spacing and alignment

### Performance Requirements

- [ ] All data loaded before filters are shown
- [ ] Filtering/sorting happens client-side (no API calls)
- [ ] No noticeable lag when changing filters
- [ ] Efficient re-renders (proper `useMemo` usage)

### Accessibility Requirements

- [ ] Keyboard navigation works for all controls
- [ ] ARIA labels on all interactive elements
- [ ] Focus indicators visible
- [ ] Screen reader friendly

---

## 🚀 Future Enhancements (Out of Scope)

1. **Advanced Filters**

   - Filter by decade (movies)
   - Filter by franchise (characters)
   - Filter by rating (movies)

2. **Filter Presets**

   - "Most Popular"
   - "Recent Releases"
   - "Classic Disney"

3. **URL State**

   - Store filters in URL query params
   - Shareable filtered views

4. **Filter Analytics**
   - Track most-used filter combinations
   - Suggest popular filters

---

## 📚 References

### Similar Patterns in Industry

- **Netflix**: Category pills + sort dropdown
- **Disney+**: Category filter + alphabetical sort
- **Amazon**: Multi-select filters in sidebar
- **Spotify**: Pill buttons for quick filters

### Design System

- Component follows existing Disney App design tokens
- Reuses CSS variables from `styles/variables.scss`
- Consistent with `CardSizeControl` and `ViewModeToggle` patterns

---

## 🤔 Open Questions (Resolved)

~~1. Should we add a "Reset Filters" button?~~

- **Answer**: Yes, only if 2+ filters are active (similar to Reset Search)

~~2. Should filter counts be shown? (e.g., "Marvel (45)")~~

- **Answer**: Future enhancement, not in MVP

~~3. Should we show active filter chips/badges?~~

- **Answer**: Not in MVP, dropdown shows selection state

---

## 📄 Conclusion

This implementation plan provides a professional, scalable filtering and sorting system that:

- ✅ Follows industry best practices
- ✅ Maintains visual consistency
- ✅ Provides excellent UX
- ✅ Is performant and maintainable
- ✅ Can be extended in the future

The approach of **loading all data before filtering** is the recommended pattern for this dataset size and aligns with user expectations from similar streaming platforms.
