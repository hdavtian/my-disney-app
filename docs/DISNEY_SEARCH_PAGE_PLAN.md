# Disney Search Experience Plan

**Date:** November 23, 2025  
**Branch:** `feature/ux-improvements`

---

## 🎯 Objective

Design and implement a dedicated "Disney Search" page that performs a multi-vertical search (Movies, Characters, Parks) with configurable scopes, consolidated results, and persistent search history. The experience should feel cinematic, leverage our theme tokens, and reuse existing services where possible while introducing a single, purpose-built search aggregation pipeline.

---

## 🔍 Current Landscape

- **Search usage today:** Each vertical exposes its own `SearchInput` instance backed by per-page Redux state (see `uiPreferencesSlice`). There is no unified search endpoint or UI.
- **APIs:** `/api/movies`, `/api/characters`, and `/api/attractions` already support keyword filtering (via client-side filtering today). Batch endpoints exist for detail drill-ins.
- **Persistence:** Search queries per page persist via Redux + localStorage middleware. Site settings already clear cache/state (see `docs/UI_PREFERENCES_STATE_MANAGEMENT.md`).
- **Image strategy:** Each domain already exposes canonical image URLs; rendering should reuse the existing helpers used on detail/list components.

Gaps: no multi-entity query orchestration, no server-side highlighting/snippets, no shared DTOs, no UX to view cross-category results or history.

---

## ✅ Core Requirements (with Enhancements)

1. **Navigation**
   - Add "Disney Search" item after "Parks & Attractions" in the top nav; route path `/search`.
2. **Hero Search Section**
   - Large centered input styled like a Google hero bar, title "Disney Search" above it. Use existing typography tokens.
   - Include Search button + optional keyboard submit (Enter).
   - Consider `useDebounce` for auto-search after pause, but keep explicit button for accessibility.
3. **Search Options Panel**
   - Primary checkboxes: Movies, Characters, Parks (at least one required; default all checked).
   - Scope selector with two presets per category: **Basic** (title + short/long descriptions) and **Extended** (all searchable columns exposed by backend metadata). UI reads the available fields from a capabilities payload so we can expand without redeploying the frontend.
   - Provide "Select All" and "Clear" micro-actions per category plus an optional "Advanced" drawer that reveals the field list from metadata for future fine-grained control.
4. **Results Layout**
   - Dynamic column grid (1–3 columns) depending on selected categories. Each column header shows category name + total result count badge.
   - Columns stack vertically on ≤768px with sticky headers for clarity.
5. **Result Card Component**
   - Three-column internal layout: image thumbnail (left), metadata bullets (middle), CTA button (right) linking to detail route (`/movies/:id`, `/characters/:id`, `/parks/:id`).
   - Middle column bullet 1: `Title:` value with matched substring highlighted.
   - Bullet 2: `Description:` context snippet (~100 chars around first match) with highlight.
   - Support fallback copy when description field missing.
   - Provide skeleton/loading states + empty results messaging per category.
6. **Highlighting**
   - Backend returns highlight metadata per field as an array of ranges (e.g., first, second, nth match). Frontend helper consumes that data to wrap substrings in `<mark>` while we initially display only the first range for brevity. This keeps the contract future-proof for "show all matches" without schema changes.
7. **DTOs & Types**
   - Shared interface `DisneySearchResult` with `{ id, type: 'movie' | 'character' | 'park', title, descriptionSnippet, imageUrl, detailPath, highlightRanges }`.
   - Domain-specific DTOs extend base interface to include raw description for fallback, releaseYear, filmography, park metadata, etc.
8. **Persistence & History**
   - Persist last N (e.g., 10) search submissions with timestamp, categories, selected scopes, query string.
   - Show "Recent Searches" rail at page bottom with "Search again" buttons.
   - Integrate with existing cache clear settings so the history is cleared when user resets site data or explicitly removes an entry.
9. **State & Storage**
   - Redux slice `disneySearchSlice` should track query, selected categories, field scopes, results, loading status, error state, and history list (persisted via middleware/localStorage).
   - Use memoized selectors to derive column counts and to reuse cached results (optional optimization: store results keyed by serialized filter signature).
10. **Backend**
    - Introduce `/api/search` orchestrator (see architecture below) to prevent over-fetching on mobile and centralize filtering/highlighting. Endpoint accepts query string, category array, field map, pagination options, and optional limit per category.
    - Ensure DTOs include canonical image paths and detail slugs so the UI stays dumb.
11. **Analytics/Instrumentation (Optional but recommended)**
    - Emit telemetry for search submissions, result counts, click-through rate, and history usage to understand adoption.

---

## 🏗️ Proposed Architecture

### Backend

1. **Controller**: `SearchController` under `com.harmadavtian.disneyapp.controller` exposing `GET /api/search`.
2. **Service**: `SearchAggregationService` orchestrates repository calls in parallel (CompletableFuture) per category.
3. **DTOs** (in `dto` subpackage):
   - `DisneySearchResultDto` (base fields + highlight metadata).
   - `MovieSearchResultDto`, `CharacterSearchResultDto`, `ParkSearchResultDto` (include type-specific properties like `releaseYear`, `parkName`).
4. **Query Strategy**:
   - Use lightweight text search via `ILIKE` queries with prepared statements for `title`, `short_description`, etc. Evaluate PostgreSQL `tsvector` indexes later (flag in enhancements section).
   - Support two search scopes supplied per category: `basic` (title + short/long descriptions when present) and `extended` (all configured columns). Backend keeps a registry describing which physical columns belong to each scope so the frontend stays decoupled.
5. **Highlighting**:
   - Prefer backend highlight by returning index ranges (start/end) per field as arrays so multiple matches are captured in order. `HighlightingUtils` should compute snippets around the first range but include metadata for subsequent matches so the UI can upgrade later without API changes.
6. **Image Mapping**:
   - Reuse existing mappers in services (movies/characters/parks) to populate `imageUrl` for DTOs to keep logic consistent.
7. **Caching**:
   - Add optional caching (e.g., Spring Cache with caffeine) keyed by `(query, categories, scope presets)` to debounce repeated searches; TTL ~5 minutes. Useful once traffic grows.
8. **Capabilities Endpoint**:
   - Provide `/api/search/capabilities` returning the registry of categories, scopes, and underlying fields. This powers the frontend controls and allows us to change mappings without redeploying the UI.

### Frontend

1. **Routes & Navigation**:
   - Add `DisneySearchPage` under `src/pages/DisneySearchPage`.
   - Update router + nav to include `/search` route with lazy chunk.
2. **Page Composition**:
   - `SearchHero` (title + input + button + description text for context).
   - `SearchOptionsPanel` (primary checkboxes, nested field chips, toggles for "include images", etc.).
   - `SearchResultsGrid` (responsive multi-column container) using CSS grid with auto-fit per active categories.
   - `SearchResultColumn` component per category.
   - `SearchResultCard` (image, metadata, button) – shareable.
   - `SearchHistoryTray` anchored at bottom (cards with query + tags + "search again" + remove icon).
3. **State Management**:
   - `disneySearchSlice` handles query state, category toggles, selected scope (`basic` | `extended`), network status, persisted history.
   - Use `createAsyncThunk` to call backend `/api/search`. Include guard rails (min 2-3 chars) to avoid empty searches.
   - Provide selectors for `selectedCategories`, `columns`, `resultsByCategory`, active scope, and `history`.
4. **Highlight Rendering**:
   - Utility `applyHighlights(text, ranges)` iterates over potentially multiple ranges per field and returns React fragments with `<mark>` wrappers, defaulting to the first range when we want a single highlight.
5. **Capabilities Fetch**:
   - On first load, request `/api/search/capabilities` (or embed JSON) to learn which categories, scopes, and fields exist. Cache this data in Redux so UI controls stay data-driven rather than hard-coded.
6. **Saved History**:
   - Store in slice + persist `disney-search-history` key via existing middleware.
   - History entry shape: `{ id: uuid, query, categories, scopes, timestamp }`.
   - Provide CTA to "clear all" (ties into Site Settings) and per-entry removal.
7. **Theming & Styling**:
   - All colors/sizes pulled from CSS variables (hero gradient using `var(--surface-elevated)`, etc.).
   - Add SCSS module per component following BEM to align with doc instructions. Use Framer Motion for subtle hero input focus/column fade-ins.

---

## 📐 Data Flow (Happy Path)

1. User lands on `/search`; Redux rehydrates last session (query, options, history).
2. User enters query, adjusts checkboxes, clicks Search.
3. Thunk dispatches `fetchDisneySearchResults` calling `/api/search?query=ariel&categories=movies,characters&scope[movies]=extended&scope[characters]=basic` (signature derived from metadata).
4. Backend aggregates, highlights, returns payload:
   ```json
   {
     "movies": { "total": 12, "results": [ ... ] },
     "characters": { "total": 4, "results": [ ... ] },
     "parks": { "total": 0, "results": [] }
   }
   ```
5. Slice stores results keyed by category and updates history (dedupe identical submissions).
6. UI renders up to three columns, each with header (count) + cards; history tray records search.
7. User clicks "View" on card → navigates to detail page with standard router.

---

## 🧠 Enhancements & Edge Cases

- **Search Guardrails:** Minimum query length, trimmed whitespace, accent-insensitive comparison, optional phrase search.
- **Advanced Filters:** (Future) Add release year range for movies, affiliation filter for characters, park location filter. Documented now to keep layout flexible.
- **Pagination per Column:** Allow `limit` + `offset` per category with "Load more" control if results exceed default (e.g., 10 per column).
- **Error Handling:** Column-level error/skeleton vs. whole page failure. Provide retry buttons on per-category fetch failure.
- **Offline Cache:** With service worker we could cache last response to show offline fallback (stretch).
- **Analytics:** Instrument search submission, result interactions, view button usage.
- **Accessibility:** Ensure checkboxes and nested options have ARIA groups, search button labelled, highlight markup respects color contrast.

---

## 🧪 Testing Strategy

### Stage 0 – Planning & Contract Tests

- Approve OpenAPI contract for `/api/search` (example requests/responses, error payloads).
- Write DTO unit tests verifying mapper output + highlight utility.

### Stage 1 – Backend Validation

- **Service tests:** Mock repositories to confirm filtering logic respects selected scopes and field registries.
- **Integration tests:** Hit `/api/search` against in-memory DB with seeded data; assert counts, highlight ranges, pagination.
- **Performance tests:** Benchmark multi-category request vs separate endpoints; ensure parallel execution meets SLA (<400ms on warm cache).

### Stage 2 – Frontend Component Tests

- Unit test `SearchOptionsPanel`, `SearchResultCard`, highlight utility (Vitest + Testing Library).
- Snapshot hero layout under each responsive breakpoint.
- Cypress component tests for column layout switching (1/2/3 columns) based on selected categories.

### Stage 3 – End-to-End (Playwright/Cypress)

- Mock backend to simulate responses; verify query persistence, history tray interactions, highlight display, view button navigation.
- Real API smoke test in staging to ensure end-to-end search returns results with proper images.

### Stage 4 – Regression & Settings Integration

- Confirm Site Settings "Reset Site State" clears search history and query from Redux/localStorage.
- Test cross-session persistence: run search, close tab, reopen; ensure history + last query rehydrate.

---

## ❓ Open Questions

1. **Search trigger behavior:** Should we auto-search on typing (debounced) or require explicit submit when history is enabled? (Recommendation: debounce after 500ms but only when query length ≥3.)
2. **Result limits:** Do we cap each category to N results per request or stream paginated data? (Default recommendation: 10 per category with `total` value for load-more.)
3. **Highlight Responsibility:** Should backend send rich text (dangerous) or ranges (safer)? Current plan assumes ranges.
4. **Search history scope:** Should history be global (shared across devices via API) or local only? Plan assumes local for MVP.
5. **Analytics:** Are we integrating with existing telemetry (App Insights) or capturing later?

---

## 🚀 Next Steps

1. Review/approve this plan.
2. Finalize API contract + DTO shapes.
3. Stub backend service + integration tests.
4. Scaffold frontend page, slice, and navigation updates.
5. Iterate on UX details (animations, empty states) while backend work progresses in parallel.
6. Once feature is complete, update `README.md` (and any relevant docs) to showcase the Disney Search functionality, navigation entry, and API endpoint so downstream teams understand how to use it.
