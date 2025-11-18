# Parks & Attractions Search Integration Recommendations

**Date:** November 18, 2025  
**Author:** GitHub Copilot  
**Status:** Discussion / Planning Phase

---

## 📋 Executive Summary

This document provides recommendations for integrating search functionality into the Parks & Attractions page, following the patterns established in the Movies, Characters, and Favorites pages.

---

## 🔍 Current Search Implementation Analysis

### ✅ Findings: You Are Correct!

**Yes, we do have a reusable search component** that is consistently used across:

- **Movies Page** (`MoviesPage.tsx`)
- **Characters Page** (`CharactersPage.tsx`)
- **Favorites Page** (`FavoritesPage.tsx`)

### 🧩 SearchInput Component

**Location:** `frontend/src/components/SearchInput/SearchInput.tsx`

**Key Features:**

- **Generic/Reusable:** Uses TypeScript generics `<T>` to work with any data type
- **Flexible Search:** Configurable search fields via `searchFields` prop
- **Autocomplete Dropdown:** Shows up to 8 results with "more results" indicator
- **Keyboard Navigation:** Arrow keys, Enter, Escape support
- **Debounced Search:** 300ms delay to optimize performance
- **Visual Feedback:** Shows result count, clear button, focused states
- **Item Selection:** Optional `onSelectItem` callback for direct navigation
- **Accessible:** ARIA labels, semantic HTML

**Current Props Interface:**

```typescript
{
  items: T[];                          // All items to search through
  onSearch: (results: T[], query: string) => void;
  searchFields: (keyof T)[];           // Which fields to search
  placeholder?: string;
  minCharacters?: number;              // Default: 3
  getDisplayText: (item: T) => string;
  getSecondaryText?: (item: T) => string;
  onSelectItem?: (item: T) => void;
  initialValue?: string;
}
```

### 📊 Current Search Patterns Across Pages

| Page           | Search Fields                            | Display Text     | Secondary Text                | Initial Value Source                          |
| -------------- | ---------------------------------------- | ---------------- | ----------------------------- | --------------------------------------------- |
| **Movies**     | `title`, `short_description`, `director` | `movie.title`    | `{year} • {director}`         | Redux: `uiPreferences.movies.searchQuery`     |
| **Characters** | `name`, `short_description`              | `character.name` | `{films_appeared_in}`         | Redux: `uiPreferences.characters.searchQuery` |
| **Favorites**  | `name`, `type`, `year`, `description`    | `item.name`      | `{type} • {year/description}` | Redux: `uiPreferences.favorites.searchQuery`  |

### 🗄️ Redux State Management Pattern

All pages follow this Redux pattern:

1. **UI Preferences Slice:** Stores `searchQuery` per page for persistence
2. **Data Slice:** Manages search filtering (e.g., `setSearchFilter`)
3. **Restoration:** Search query restored from Redux on page mount
4. **Reset Functionality:** Dedicated reset button when search is active

---

## 🎢 Parks & Attractions Page Current State

### 📐 Unique Layout

**Three-Column Immersive Design (PROPOSED NEW ORDER):**

- **Column 1 (40%):** Park Chooser - vertical scrolling park selector
- **Column 2 (40%):** Attraction Details - full details of selected attraction (with search at top)
- **Column 3 (20%):** Attractions List - scrollable picker list for selected park

**Current Layout (before reorganization):**

- Column 1 (40%): Parks → Column 2 (20%): Attractions List → Column 3 (40%): Details

**Proposed Layout (after Task 0 reorganization):**

- Column 1 (40%): Parks → Column 2 (40%): Details → Column 3 (20%): Attractions List

### 🔄 Current Data Flow

1. User selects a **Park** → dispatches park selection
2. System fetches **Attractions** for that park → stores in `attractionsByPark[parkUrlId]`
3. Auto-selects first attraction → shows in details panel
4. User clicks attraction → updates `selectedAttraction`

### 🏗️ Redux State Structure

**`attractionsSlice.ts`:**

```typescript
{
  attractionsByPark: Record<string, Attraction[]>,  // Keyed by park URL ID
  selectedAttraction: Attraction | null,
  loading: boolean,
  error: string | null
}
```

**`parksSlice.ts`:**

```typescript
{
  parks: Park[],
  selectedPark: Park | null,
  loading: boolean,
  error: string | null
}
```

### 🚫 No UI Preferences Yet

Currently, Parks & Attractions has **NO entry** in `uiPreferencesSlice.ts`:

- No search query persistence
- No view mode settings
- No grid/list preferences

---

## 💡 Recommendations: Search Integration

### 🎯 Option 1: Search in Details Column (CENTER - RECOMMENDED)

**Implementation Overview:**

- Place ONE search box at the **top of the Attraction Details column (Column 2)**
- Default mode: Search **current park only**
- Toggle button: Switch to "All Parks" mode
- Search fields: `name`, `attraction_type`, `land_area`, `theme`
- **Why here:** Column 2 is 40% width AND center position after layout reorganization (Task 0)

**Visual Placement (AFTER Task 0 reorganization):**

```
┌─────────────────────┃──────────────────────────────────┬───────────┐
│ Column 1: Parks     ┃ Column 2: Details (40%)          │ Col 3:    │
│ (40%)               ┃ ┌──────────────────────────────┐ │ Attr.     │
│                     ┃ │ 🔍 Search attractions...     │ │ (20%)     │
│ [Disney Parks...]   ┃ │ [🌍 All Parks] [📍 Current]  │ │           │ ← SEARCH HERE
│                     ┃ └──────────────────────────────┘ │           │
│                     ┃                                  │ [List]    │
│                     ┃ [Selected Attraction Details...] │           │
│                     ┃                                  │           │
└─────────────────────┺──────────────────────────────────┴───────────┘
                      ↑ Thick accent border
```

**Benefits:**

- ✅ **Plenty of space** - 40% column width accommodates search box + toggle comfortably
- ✅ **Center stage position** - most prominent location after park selection
- ✅ **Natural flow** - Parks (left) → Search/Details (center) → Quick picker (right)
- ✅ **Visual hierarchy** - Thick accent border separates selection from content
- ✅ **Works with existing layout** - just reorders columns, no major changes needed

**User Experience Flow:**

1. **Default: Current Park Search**

   - User types "Space" → filters current park's attractions in Column 3 (Attractions List)
   - Shows count: "3 results in Magic Kingdom"
   - Dropdown shows matching attractions from current park only
   - Clicking result updates Column 3 highlight and shows details in Column 2

2. **"All Parks" Mode**
   - User clicks toggle "🌍 All Parks"
   - Search becomes global across all attractions
   - Shows count: "12 results across 4 parks"
   - Dropdown shows: `{Attraction Name} - {Park Name}`
   - Clicking result:
     - Switches to that park (Column 1 updates)
     - Fetches attractions for that park (Column 3 updates)
     - Selects the clicked attraction (Column 2 shows details)

**Props for SearchInput:**

```typescript
<SearchInput
  items={searchMode === "current" ? currentAttractions : allAttractions}
  onSearch={handleSearch}
  searchFields={["name", "attraction_type", "land_area", "theme"]}
  placeholder={
    searchMode === "current"
      ? `Search ${selectedPark?.name} attractions...`
      : "Search all park attractions..."
  }
  minCharacters={2}
  initialValue={searchQuery}
  getDisplayText={(attraction) => attraction.name}
  getSecondaryText={(attraction) =>
    searchMode === "all"
      ? `${getParkName(attraction.park_url_id)} • ${attraction.attraction_type}`
      : attraction.attraction_type || ""
  }
  onSelectItem={handleSelectAttraction}
/>
```

**Benefits:**

- ✅ **Spacious placement** - 40% column width, no cramping
- ✅ **Center position** - most natural location after Task 0 reorganization
- ✅ Context-aware (searches current park by default)
- ✅ Powerful "All Parks" mode for cross-park discovery
- ✅ Reuses existing SearchInput component
- ✅ Natural visual flow - search at top, results display below
- ✅ Thick accent border on left creates clear visual separation

**Considerations:**

- Need to fetch/cache attractions for all parks when "All Parks" mode is active
- Toggle button needs clear visual distinction
- Need to handle park switching when selecting cross-park results
- Search results update Column 3 (attractions list) to show filtered items---

### 🎯 Option 2: Search Above All Columns (TOP BAR)

**Implementation Overview:**

- Place ONE search box in a **horizontal bar above all three columns**
- Full-width, prominent position
- Single unified search with mode toggle
- Search fields: `name`, `attraction_type`, `land_area`, `theme`, `park_name` (when All Parks mode)

**Visual Placement (AFTER Task 0 reorganization):**

```
┌───────────────────────────────────────────────────────────────────┐
│ 🎢 Disney Parks & Attractions                                     │
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ 🔍 Search attractions...    [📍 Current Park] [🌍 All Parks]  │ │ ← SEARCH BAR
│ └───────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
┌─────────────────────┃────────────────────────────┬────────────┐
│ Column 1: Parks     ┃ Column 2: Details          │ Column 3:  │
│ (40%)               ┃ (40%)                      │ Attr (20%) │
│                     ┃                            │            │
│ [Disney Parks...]   ┃ [Attraction Details...]    │ [List]     │
│                     ┃                            │            │
└─────────────────────┺────────────────────────────┴────────────┘
                      ↑ Thick accent border
```

**Benefits:**

- ✅ **Very prominent** - impossible to miss
- ✅ **Full width** - plenty of space for search + toggles + filters
- ✅ **Clean separation** - search UI separate from browsing UI
- ✅ **Future expansion** - room to add filters (thrill level, operational, etc.)
- ✅ **Consistent with page title** - forms a complete header section

**Drawbacks:**

- ❌ Requires layout modification (add header section)
- ❌ Takes vertical space from columns
- ❌ Different from Movies/Characters pattern (those have search in controls area)

---

### 🎯 Option 3: Unified Search Bar (Above Columns)

**Implementation Overview:**

- ONE search box above all three columns
- Intelligent search: searches both parks AND attractions
- Results show mixed: "Parks" section + "Attractions" section
- Selecting park → shows in Column 1 and loads attractions
- Selecting attraction → switches to park, loads attraction

**Visual Placement:**

```
┌─────────────────────────────────────────────────────────────┐
│ Disney Parks & Attractions                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔍 Search parks or attractions...                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌──────────┬─────────────────┬──────────────────────────────┐
│ Parks    │ Attractions     │ Details                      │
│ (40%)    │ (20%)           │ (40%)                        │
└──────────┴─────────────────┴──────────────────────────────┘
```

**Benefits:**

- ✅ Single, prominent search location
- ✅ Searches everything at once
- ✅ Most flexible for user discovery

**Drawbacks:**

- ❌ Requires significant layout changes
- ❌ Complex dropdown UI (mixed results)
- ❌ May not fit the immersive three-column design aesthetic

---

## 🏆 Final Recommendation: Option 1 (Details Column - Center Position)

**I recommend Option 1: Search in Details Column (Center, 40% width) AFTER completing Task 0 layout reorganization**

### Why This Works Best:

1. **Optimal Space:** 40% column width provides ample room for search UI without cramping
2. **Center Stage:** After reorganization, details column becomes the main content area
3. **Natural Visual Flow:** Parks (left) → Search/Details (center) → Quick picker (right)
4. **Context-Aware:** Defaults to current park (most common use case)
5. **Powerful When Needed:** "All Parks" mode for cross-park exploration
6. **Component Reuse:** Uses existing SearchInput component with minimal modifications
7. **Visual Hierarchy:** Thick accent border on parks column creates clear separation

### 📋 Implementation Checklist

#### **TASK 0: Layout Reorganization (PREREQUISITE)** ⭐

**Before implementing search, reorganize the three-column layout:**

**Current Layout:**

```
┌─────────────────────┬────────────┬──────────────────────────────┐
│ Column 1: Parks     │ Column 2:  │ Column 3: Details            │
│ (40%)               │ Attr (20%) │ (40%)                        │
│ Park Chooser        │ List       │ Attraction Details           │
└─────────────────────┴────────────┴──────────────────────────────┘
```

**New Layout:**

```
┌─────────────────────┃────────────────────────────┬────────────┐
│ Column 1: Parks     ┃ Column 2: Details          │ Column 3:  │
│ (40%)               ┃ (40%)                      │ Attr (20%) │
│ Park Chooser        ┃ Attraction Details         │ List       │
│                     ┃ (with search at top)       │            │
└─────────────────────┺────────────────────────────┴────────────┘
                      ↑
              Thicker accent border
```

**Changes Required:**

1. **Reorder Columns in ParksPage.tsx:**

   - Column 1: Park Chooser (40%) - stays first
   - Column 2: Attraction Details (40%) - **moved from third to second position**
   - Column 3: Attractions List (20%) - **moved from second to third position**
   - Widths remain the same, just reordering

2. **Add Visual Separator in ParksPage.scss:**

   ```scss
   &__column--parks {
     width: 40%;
     border-right: 3px solid var(--accent-primary); // Thicker accent border
     border-left: none;
   }

   &__column--details {
     width: 40%;
     border-left: none;
     border-right: 1px solid rgba(255, 255, 255, 0.1); // Standard border
   }

   &__column--attractions {
     width: 20%;
     border-left: none;
     border-right: none;
   }
   ```

3. **Update JSX Order in ParksPage.tsx:**

   ```tsx
   <div className="parks-page__container">
     {/* Column 1: Park Chooser (40%) */}
     <div className="parks-page__column parks-page__column--parks">
       <ParkChooser parks={parks} selectedPark={selectedPark} />
     </div>

     {/* Column 2: Attraction Details (40%) - MOVED HERE */}
     <div className="parks-page__column parks-page__column--details">
       <AttractionDetails
         attraction={selectedAttraction}
         loading={attractionsLoading}
       />
     </div>

     {/* Column 3: Attractions List (20%) - MOVED HERE */}
     <div className="parks-page__column parks-page__column--attractions">
       <AttractionsList
         attractions={currentAttractions}
         loading={attractionsLoading}
         parkName={selectedPark?.name}
         selectedAttraction={selectedAttraction}
       />
     </div>
   </div>
   ```

**Benefits of New Layout:**

- ✅ **Visual Hierarchy:** Thick accent border creates clear separation between park selection and content area
- ✅ **Better Flow:** Park → Details (with search) → Picker makes more sense
- ✅ **Search Placement:** Details column (now center) is perfect for search at the top
- ✅ **Attractions List:** Rightmost position works well as a quick picker/navigator
- ✅ **Theme Integration:** Accent border ties into overall Disney theme aesthetic

**Files to Modify:**

- `frontend/src/pages/ParksPage/ParksPage.tsx` (reorder JSX)
- `frontend/src/pages/ParksPage/ParksPage.scss` (update borders, ensure column order classes)

---

#### 1. Redux State Updates

**Add to `uiPreferencesSlice.ts`:**

```typescript
interface UiPreferencesState {
  movies: PagePreferences;
  characters: PagePreferences;
  favorites: PagePreferences;
  parks: {
    // NEW
    searchQuery: string;
    searchMode: "current" | "all";
    lastUpdated: number;
  };
  theme: ThemeMode;
}
```

**Add actions:**

- `setParksSearchQuery(query: string)`
- `setParksSearchMode(mode: 'current' | 'all')`
- `resetParksPreferences()`

**Add to `attractionsSlice.ts`:**

```typescript
// Add reducer for filtering
setAttractionSearchFilter: (state, action: PayloadAction<string>) => {
  state.searchFilter = action.payload;
  // Apply filter to current attractions
};
```

#### 2. Fetch All Attractions for "All Parks" Mode

**Add to `attractionsSlice.ts`:**

```typescript
export const fetchAllAttractions = createAsyncThunk(
  "attractions/fetchAllAttractions",
  async (_, { rejectWithValue }) => {
    try {
      const cacheKey = "all_attractions";
      const cachedData = CacheService.get<Attraction[]>(cacheKey);
      if (cachedData) return cachedData;

      const data = await attractionsApi.getAllAttractions();
      CacheService.set(cacheKey, data);
      return data;
    } catch (error) {
      return rejectWithValue("Failed to fetch all attractions");
    }
  }
);
```

#### 3. Update AttractionDetails Component

**Add search UI at the top:**

```tsx
// In AttractionDetails.tsx, add search section above attraction details
<div className="attraction-details">
  {/* NEW: Search Section */}
  <div className="attraction-details__search-section">
    <SearchInput
      items={searchMode === "current" ? currentAttractions : allAttractions}
      onSearch={handleSearch}
      searchFields={["name", "attraction_type", "land_area", "theme"]}
      placeholder={
        searchMode === "current"
          ? `Search ${parkName}...`
          : "Search all parks..."
      }
      minCharacters={2}
      initialValue={searchQuery}
      getDisplayText={(attraction) => attraction.name}
      getSecondaryText={(attraction) =>
        searchMode === "all"
          ? `${getParkName(attraction.park_url_id)} • ${
              attraction.attraction_type
            }`
          : attraction.attraction_type || ""
      }
      onSelectItem={handleSelectAttraction}
    />

    <div className="attraction-details__search-toggles">
      <button
        className={`attraction-details__search-toggle ${
          searchMode === "current" ? "active" : ""
        }`}
        onClick={() => dispatch(setParksSearchMode("current"))}
        aria-label="Search current park"
      >
        📍 Current Park
      </button>
      <button
        className={`attraction-details__search-toggle ${
          searchMode === "all" ? "active" : ""
        }`}
        onClick={() => dispatch(setParksSearchMode("all"))}
        aria-label="Search all parks"
      >
        🌍 All Parks
      </button>
    </div>
  </div>

  {/* Existing attraction details below */}
  {attraction ? (
    // ... existing details rendering
  ) : (
    // ... empty state
  )}
</div>
```

#### 4. Backend API Addition

**Add to `AttractionsApi.java` (Spring Boot):**

```java
@GetMapping("/api/attractions")
public ResponseEntity<List<DisneyParkAttraction>> getAllAttractions() {
    List<DisneyParkAttraction> attractions = attractionService.findAll();
    return ResponseEntity.ok(attractions);
}
```

**Add to `attractionsApi.ts` (Frontend):**

```typescript
export const attractionsApi = {
  getAttractionsByPark: async (parkUrlId: string): Promise<Attraction[]> => {
    const response = await fetch(
      `${API_BASE_URL}/attractions/by-park/${parkUrlId}`
    );
    return response.json();
  },

  getAllAttractions: async (): Promise<Attraction[]> => {
    // NEW
    const response = await fetch(`${API_BASE_URL}/attractions`);
    return response.json();
  },
};
```

#### 5. SCSS Updates

**Add to `AttractionDetails.scss`:**

```scss
.attraction-details {
  &__search-section {
    padding: var(--space-5);
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }

  &__search-toggles {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-3);
  }

  &__search-toggle {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: center;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    &.active {
      background: var(--accent-primary);
      color: var(--white);
      border-color: var(--accent-primary);
      font-weight: var(--font-semibold);
    }
  }
}
```

---

## 🎨 Design Considerations

### Visual Treatment

- **Search Box:** Full-width within 40% column - plenty of room for comfortable input
- **Toggle Buttons:** Side-by-side pills, clearly showing active state
- **Result Count:** Shows directly in SearchInput component
- **Clear Visual Hierarchy:** Search section at top with subtle background, attraction details below
- **Mode Indication:** Active toggle button highlighted with accent color

### Accessibility

- **ARIA Labels:** All buttons properly labeled
- **Keyboard Navigation:** Tab order, arrow keys in dropdown
- **Screen Reader:** Announce mode changes ("Now searching all parks")
- **Focus Management:** Return focus to input after selection

### Performance

- **Debouncing:** Already handled by SearchInput (300ms)
- **Caching:** Use CacheService for all attractions fetch
- **Lazy Loading:** Only fetch all attractions when user switches to "All Parks" mode
- **Memoization:** Use `useMemo` for filtered results

---

## 📱 Mobile Responsiveness

On mobile (< 1024px), the layout already stacks columns vertically:

- Search box maintains same position in Attractions column
- Toggle button may need to be icon-only to save space
- Consider making search full-width on mobile

---

## 🚀 Phased Rollout

### Phase 1: Current Park Search Only

- Implement search within selected park
- No "All Parks" mode yet
- Persist search query in Redux
- Test and refine UX

### Phase 2: Add "All Parks" Mode

- Add toggle button
- Implement fetch all attractions
- Handle cross-park navigation
- Test performance with ~150+ attractions

### Phase 3: Polish

- Add animations/transitions
- Optimize performance
- Add keyboard shortcuts
- User preference persistence

---

## ❓ Open Questions for Discussion

1. **Should park switching when selecting cross-park attraction be animated?**

   - Smooth transition vs instant switch

2. **Should we show attraction images in search dropdown?**

   - More visual but takes more space

3. **Should search include `short_description` field?**

   - More comprehensive but may return too many results

4. **Should there be a "Recent Searches" feature?**

   - Similar to Movies/Characters pages with recently viewed

5. **Should we add filters alongside search (e.g., Thrill Level, Operational Status)?**
   - More powerful but more complex UI

---

## 📊 Success Metrics

After implementation, measure:

- **Search Usage Rate:** % of users who use search vs browse
- **Search Mode Usage:** Current park vs All parks ratio
- **Search Success Rate:** Clicks on search results vs empty searches
- **Time to Find:** Average time to locate an attraction
- **Cross-Park Discovery:** How often users discover attractions in other parks

---

## 🔗 Related Files

### Files to Modify:

- `frontend/src/pages/ParksPage/components/AttractionDetails/AttractionDetails.tsx` ⭐ (main change)
- `frontend/src/pages/ParksPage/components/AttractionDetails/AttractionDetails.scss` ⭐ (main change)
- `frontend/src/pages/ParksPage/components/AttractionsList/AttractionsList.tsx` (minor - handle filtered list)
- `frontend/src/store/slices/attractionsSlice.ts`
- `frontend/src/store/slices/uiPreferencesSlice.ts`
- `frontend/src/api/attractionsApi.ts`
- `backend/src/main/java/com/harmadavtian/disneyapp/controller/AttractionsController.java`
- `backend/src/main/java/com/harmadavtian/disneyapp/service/AttractionsService.java`

### Reference Files:

- `frontend/src/components/SearchInput/SearchInput.tsx` (reusable component)
- `frontend/src/pages/MoviesPage/MoviesPage.tsx` (pattern reference)
- `frontend/src/pages/CharactersPage/CharactersPage.tsx` (pattern reference)

---

## 🎬 Next Steps

1. **Review this document** and discuss recommendations
2. **Choose final approach** (Option 1, 2, or 3)
3. **Refine design details** (placement, styling, behavior)
4. **Create implementation tasks** in todo list or issue tracker
5. **Begin Phase 1 implementation** (current park search only)

---

**End of Recommendations Document**
