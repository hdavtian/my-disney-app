# Disney App Performance Optimization Plan

**Date:** November 5, 2025  
**Goal:** Optimize user experience without changing architecture

## 🎯 Current Performance Issues

1. **HeroCarousel takes minutes to load** - Blocking image preload
2. **Characters/Movies pages load all data at once** - No pagination
3. **No caching** - Fresh API calls on every navigation
4. **Large bundle size** - Everything loads upfront
5. **No lazy loading** - All images load immediately

## 🏆 Success Metrics

**Before Optimization:**

- First Load: 5-8 seconds
- Carousel Load: 2-5 minutes
- Page Navigation: 2-3 seconds
- Bundle Size: ~2MB

**Target After Optimization:**

- First Load: <2 seconds
- Carousel Load: <3 seconds
- Page Navigation: <0.5 seconds (cached)
- Bundle Size: <1MB initial

## 🗓 Implementation Phases

### Phase 1: Caching Infrastructure

**Files to modify:**

- `src/utils/cacheService.ts` (new)
- `src/store/slices/charactersSlice.ts`
- `src/store/slices/moviesSlice.ts`

**Tasks:**

- [ ] Create localStorage cache service with 2-hour TTL
- [ ] Integrate cache with Redux character fetching
- [ ] Integrate cache with Redux movie fetching
- [ ] Test cache persistence across browser restart

### Phase 2: Fix HeroCarousel Performance & Image Lazy Loading

**Files to modify:**

- `src/components/HeroCarousel/HeroCarousel.tsx`
- `src/components/CharacterCard/CharacterCard.tsx`
- `src/components/MovieCard/MovieCard.tsx`
- `src/components/CharactersGridView/CharactersGridView.tsx`
- `src/components/MoviesGridView/MoviesGridView.tsx`

**Tasks:**

- [ ] Remove blocking image preload from carousel
- [ ] Add progressive loading with skeleton for carousel
- [ ] Implement background image loading for carousel
- [ ] Add proper loading states for carousel
- [ ] Cache carousel API response
- [ ] Add native lazy loading to CharacterCard images (`loading="lazy"`)
- [ ] Add native lazy loading to MovieCard images (`loading="lazy"`)
- [ ] Add native lazy loading to grid view components
- [ ] Test image lazy loading across different screen sizes
- [ ] Replace carousel loading spinner with skeleton + progressive loading
- [ ] Add skeleton states for CharacterCard image loading
- [ ] Add skeleton states for MovieCard image loading
- [ ] Replace grid loading spinners with skeleton grids
- [ ] Keep spinners only for user actions (clicks, submits)

### Phase 3: Implement Pagination & Search Optimization

**Files to modify:**

- `src/pages/CharactersPage/CharactersPage.tsx`
- `src/pages/MoviesPage/MoviesPage.tsx`
- `src/components/CharactersGridView/CharactersGridView.tsx`
- `src/components/MoviesGridView/MoviesGridView.tsx`
- `src/components/SearchInput/SearchInput.tsx`

**Tasks:**

- [ ] Add pagination state management
- [ ] Implement infinite scroll for characters (20 initial, +10 per scroll)
- [ ] Implement infinite scroll for movies (20 initial, +10 per scroll)
- [ ] Add "Load More" button fallback
- [ ] Add search result caching for frequent queries
- [ ] Optimize search algorithm for large datasets (800+ movies)
- [ ] Add search loading skeleton states
- [ ] Test search performance with paginated data

### Phase 4: Bundle Optimization & Route Code Splitting

**Files to modify:**

- `vite.config.ts`
- `src/components/` (add React.memo where needed)
- `src/pages/CharactersPage/index.ts` (new)
- `src/pages/MoviesPage/index.ts` (new)
- `src/pages/MovieDetailPage/index.ts` (new)
- `src/pages/CharacterDetailPage/index.ts` (new)
- `src/App.tsx` (update routes)

**Tasks:**

- [ ] Add manual chunking for vendor libraries
- [ ] Wrap expensive components with React.memo
- [ ] Implement React.lazy() for CharactersPage
- [ ] Implement React.lazy() for MoviesPage
- [ ] Implement React.lazy() for MovieDetailPage
- [ ] Implement React.lazy() for CharacterDetailPage
- [ ] Add Suspense fallbacks with loading skeletons
- [ ] Update routing to use lazy-loaded components
- [ ] Add bundle analysis script
- [ ] Add basic performance monitoring
- [ ] Final testing

## 📋 Cache Strategy Details

**What to Cache:**

- `disney_characters_list` - All characters JSON (2 hours)
- `disney_movies_list` - All movies JSON (2 hours)
- `disney_carousel_data` - Homepage carousel (2 hours)
- `disney_character_{id}` - Individual character details (2 hours)
- `disney_movie_{id}` - Individual movie details (2 hours)

**Cache Flow:**

1. Check localStorage for `disney_{key}`
2. If exists and not expired → return cached data
3. If missing/expired → API call → save to cache → return data
4. Cache expires after 2 hours automatically

## 🚀 Implementation Rules

**DO:**

- ✅ Keep existing architecture (React + Vite + Redux)
- ✅ Maintain current Azure Static Web Apps setup
- ✅ Focus on high-impact, low-risk changes
- ✅ Test each change incrementally
- ✅ Use existing component patterns

**DON'T:**

- ❌ Change build system (stay with Vite)
- ❌ Modify backend APIs (frontend optimization only)
- ❌ Break existing functionality
- ❌ Add complex dependencies
- ❌ Change deployment setup

## 🧪 Testing Checklist

After each phase, verify:

- [ ] App builds successfully (`npm run build`)
- [ ] Dev server runs (`npm run dev`)
- [ ] All pages load correctly
- [ ] Navigation works smoothly
- [ ] No console errors
- [ ] Performance improvements visible

## 📊 Performance Monitoring

**Simple metrics to track:**

- Bundle size (before/after)
- Page load times (Network tab)
- Cache hit rates (localStorage inspection)
- User experience (navigation smoothness)

## 🔄 Rollback Plan

If any optimization breaks functionality:

1. Git commit each major change
2. Revert specific commit if issues arise
3. Test rollback works correctly
4. Document what went wrong

---

**Sign-off:** Ready to proceed with this plan? ✅
