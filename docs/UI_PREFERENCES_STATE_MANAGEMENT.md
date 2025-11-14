# UI Preferences & State Management Implementation

**Date:** November 13, 2025  
**Branch:** feature/storybook  
**Status:** In Progress

---

## 🎯 Overview

Implement site-wide state management for pagination, search, view modes, and user preferences with persistence across sessions. Add site settings functionality for cache/state management and theme switching.

---

## 📋 Requirements

### Core Features

- [x] Persist pagination state per page (Movies, Characters)
- [x] Persist search queries per page
- [x] Persist view mode per page (grid/list)
- [x] Cache integration with persisted state
- [x] Site settings modal for cache/state/cookie management
- [x] Theme management (Light/Dark modes)

### Behavior

- **Default:** Load 20 cards on first visit or when no saved state exists
- **Grid View:** Paginated loading (20, 40, 60... based on "Load More" clicks)
- **List View:** Load ALL data with DevExtreme virtual scrolling
- **Cache Strategy:** Respect existing cache TTL, load from cache with persisted item count
- **Fallback:** If cache invalid, load default 20 items from database

---

## 🏗️ Implementation Phases

### Phase 1: Create `uiPreferencesSlice`

- [ ] Create `frontend/src/store/uiPreferencesSlice.ts`
  - [ ] Define state schema for movies/characters preferences
  - [ ] Add actions: `setViewMode`, `setGridItemsToShow`, `setSearchQuery`, `resetPagePreferences`, `resetAllPreferences`
  - [ ] Add selectors for accessing state
- [ ] Create `frontend/src/store/middleware/localStorageSyncMiddleware.ts`
  - [ ] Sync Redux state to localStorage on changes (debounced)
  - [ ] Rehydrate state from localStorage on app init
- [ ] Update `frontend/src/store/index.ts` to include new slice and middleware

**State Schema:**

```typescript
{
  uiPreferences: {
    movies: {
      viewMode: 'grid' | 'list',
      gridItemsToShow: 20,
      searchQuery: '',
      lastUpdated: timestamp
    },
    characters: {
      viewMode: 'grid' | 'list',
      gridItemsToShow: 20,
      searchQuery: '',
      lastUpdated: timestamp
    },
    theme: 'light' | 'dark'
  }
}
```

---

### Phase 2: Create Storage Utilities

- [ ] Create `frontend/src/utils/storage.ts`
  - [ ] `clearCache()` - Clear all cached API data
  - [ ] `clearCookies()` - Clear all site cookies
  - [ ] `clearLocalStorage()` - Clear localStorage (except essential data)
  - [ ] `resetAllSiteData()` - Clear cache + cookies + localStorage
  - [ ] `getCacheSize()` - Get approximate cache size for display

---

### Phase 3: Update Movies Page

- [ ] Update `frontend/src/pages/MoviesPage/MoviesPage.tsx`
  - [ ] Connect to `uiPreferencesSlice` for movies state
  - [ ] On mount: restore `gridItemsToShow` and `searchQuery` from Redux
  - [ ] On "Load More": increment `gridItemsToShow` and dispatch to Redux
  - [ ] On search: update `searchQuery` in Redux
  - [ ] Grid view: Load items based on `gridItemsToShow` from cache/API
  - [ ] List view: Load ALL movies for DevExtreme DataGrid
- [ ] Update `frontend/src/components/MoviesGridView/MoviesGridView.tsx`
  - [ ] Respect `gridItemsToShow` from Redux
- [ ] Update `frontend/src/components/MoviesListView/MoviesListView.tsx`
  - [ ] Configure DevExtreme virtual scrolling
  - [ ] Load all data when in list view

---

### Phase 4: Update Characters Page

- [ ] Update `frontend/src/pages/CharactersPage/CharactersPage.tsx`
  - [ ] Connect to `uiPreferencesSlice` for characters state
  - [ ] On mount: restore `gridItemsToShow` and `searchQuery` from Redux
  - [ ] On "Load More": increment `gridItemsToShow` and dispatch to Redux
  - [ ] On search: update `searchQuery` in Redux
  - [ ] Grid view: Load items based on `gridItemsToShow` from cache/API
  - [ ] List view: Load ALL characters for DevExtreme DataGrid
- [ ] Update `frontend/src/components/CharactersGridView/CharactersGridView.tsx`
  - [ ] Respect `gridItemsToShow` from Redux
- [ ] Update `frontend/src/components/CharactersListView/CharactersListView.tsx`
  - [ ] Configure DevExtreme virtual scrolling
  - [ ] Load all data when in list view

---

### Phase 5: Cache Integration

- [ ] Update cache strategy to work with persisted state
  - [ ] Ensure cached data respects `gridItemsToShow`
  - [ ] Handle cache invalidation (fallback to 20 items)
  - [ ] Update cache keys if needed to include item count
- [ ] Test cache behavior:
  - [ ] With valid cache
  - [ ] With expired cache
  - [ ] With cleared cache

---

### Phase 6: Create Site Settings Component

- [ ] Create `frontend/src/components/SiteSettings/SiteSettings.tsx`
  - [ ] Gear icon button
  - [ ] Opens SettingsModal on click
- [ ] Create `frontend/src/components/SiteSettings/SiteSettings.module.scss`
  - [ ] Style gear icon (Disney theme)
  - [ ] Position in navigation bar
- [ ] Create `frontend/src/components/SiteSettings/SettingsModal/SettingsModal.tsx`
  - [ ] Modal UI with sections:
    - [ ] **Data Management**
      - [ ] Clear Cache button
      - [ ] Clear Cookies button
      - [ ] Reset Site State button
      - [ ] Reset All Data button (destructive)
    - [ ] **Appearance**
      - [ ] Theme selector (Light/Dark radio buttons)
      - [ ] Preview of current theme
    - [ ] **Info**
      - [ ] Cache size display
      - [ ] Last cache clear date
  - [ ] Confirmation dialogs for destructive actions
  - [ ] Success/error notifications
- [ ] Create `frontend/src/components/SiteSettings/SettingsModal/SettingsModal.module.scss`
  - [ ] Modal styling (cinematic Disney theme)
  - [ ] Responsive design
  - [ ] Button states and hover effects

---

### Phase 7: Theme Management

- [ ] Add theme state to `uiPreferencesSlice`
- [ ] Create `frontend/src/styles/themes/`
  - [ ] `light.scss` - Light theme variables
  - [ ] `dark.scss` - Dark theme variables
- [ ] Update root CSS to apply theme classes
- [ ] Connect theme selector in SettingsModal to Redux
- [ ] Apply theme globally on state change
- [ ] Test theme persistence across sessions

---

### Phase 8: Navigation Integration

- [ ] Update `frontend/src/components/Navigation/Navigation.tsx`
  - [ ] Add SiteSettings component (gear icon)
  - [ ] Position gear icon (top-right corner)
- [ ] Update `frontend/src/components/Navigation/Navigation.module.scss`
  - [ ] Style positioning for gear icon

---

### Phase 9: Testing & Validation

- [ ] **Pagination Persistence**
  - [ ] Test Movies page: load more, navigate away, return
  - [ ] Test Characters page: load more, navigate away, return
  - [ ] Test browser close/reopen with persisted state
- [ ] **Search Persistence**
  - [ ] Search on Movies page, navigate away, return
  - [ ] Search on Characters page, navigate away, return
- [ ] **View Mode Persistence**
  - [ ] Switch to list view, navigate away, return
  - [ ] Switch to grid view, verify item count
- [ ] **Cache Integration**
  - [ ] Verify cache respects item count
  - [ ] Test cache invalidation fallback
  - [ ] Test manual cache clear from settings
- [ ] **Site Settings**
  - [ ] Test clear cache functionality
  - [ ] Test clear cookies functionality
  - [ ] Test reset site state functionality
  - [ ] Test reset all data functionality
- [ ] **Theme Management**
  - [ ] Switch themes in settings
  - [ ] Verify persistence across sessions
  - [ ] Test theme application globally

---

## 📁 File Structure

```
frontend/src/
  store/
    uiPreferencesSlice.ts          ← NEW
    middleware/
      localStorageSyncMiddleware.ts ← NEW
  components/
    SiteSettings/                   ← NEW
      SiteSettings.tsx
      SiteSettings.module.scss
      SettingsModal/
        SettingsModal.tsx
        SettingsModal.module.scss
  utils/
    storage.ts                      ← NEW
  styles/
    themes/                         ← NEW
      light.scss
      dark.scss
  pages/
    MoviesPage/
      MoviesPage.tsx                ← UPDATED
    CharactersPage/
      CharactersPage.tsx            ← UPDATED
```

---

## 🔑 Key Technical Decisions

1. **Separate Slice:** `uiPreferencesSlice` keeps UI state separate from data slices
2. **localStorage Key:** `disney-app-ui-preferences`
3. **Debouncing:** localStorage writes debounced to avoid excessive I/O
4. **List View:** Loads ALL data, DevExtreme handles virtual scrolling
5. **Grid View:** Respects `gridItemsToShow` (default: 20)
6. **Cache TTL:** Respect existing cache TTL strategy
7. **Fallback:** Invalid cache → load 20 items from API

---

## 🚀 Progress Tracking

- **Started:** November 13, 2025
- **Current Phase:** Phase 1
- **Completion:** 0%

---

## 📝 Notes

- All localStorage operations should be wrapped in try/catch for quota errors
- Theme changes should have smooth CSS transitions
- Confirmation dialogs should be accessible (keyboard navigation)
- Gear icon should have tooltip: "Site Settings"
- Future expandability: More themes, language preferences, accessibility settings
