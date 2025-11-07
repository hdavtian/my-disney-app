# Swiper.js Migration Plan

## 🎯 Overview

This document outlines the comprehensive migration plan from home-grown carousel implementations to Swiper.js for the Disney App. The migration will replace three existing carousel components with modern, performant Swiper.js implementations while maintaining existing functionality and improving code maintainability.

## � Executive Summary

### What We're Doing

Migrating 3 carousel components from custom Framer Motion implementations to Swiper.js:

- **HeroCarousel** → Swiper + new HeroCard component (10-15 slides)
- **MovieSlider** → MovieCarousel (Swiper + Virtual Slides + existing MovieCard) - **800+ movies**
- **CharacterCircles** → CharacterCarousel (Swiper + Virtual Slides + existing CharacterCard) - **180+ characters**

### Critical Performance Requirements

- ⚡ **MovieCarousel**: MUST use Virtual Slides (800+ items)
- ⚡ **CharacterCarousel**: SHOULD use Virtual Slides (180+ items)
- ✅ **HeroCarousel**: No virtualization needed (10-15 items)

### What We're NOT Changing

- ✅ MovieCard & CharacterCard components (keep all animations)
- ✅ Redux store and data fetching logic
- ✅ Backend APIs and database
- ✅ Search functionality and caching
- ✅ Image serving and asset configuration
- ✅ Framer Motion (for page transitions and card animations)

### Key Benefits

- 🚀 Better performance (hardware-accelerated, virtual slides for large datasets)
- 📊 **Massive DOM reduction**: 800+ → ~20 nodes (MovieCarousel), 180+ → ~30 nodes (CharacterCarousel)
- 📱 Enhanced mobile/touch support
- ♿ Improved accessibility
- 🧹 Cleaner, more maintainable code
- 🎨 Professional carousel features out-of-the-box

### Migration Approach

**Phase 1**: HeroCarousel + create HeroCard (1-2 days)  
**Phase 2**: MovieCarousel with Virtual Slides (1-2 days) - **Performance critical**  
**Phase 3**: CharacterCarousel with Virtual Slides (1 day)  
**Total Estimated Time**: 3-5 days

---

## �📋 Current State Analysis

### Existing Carousel Components

1. **HeroCarousel** (`/components/HeroCarousel/`)

   - Location: Homepage hero section
   - Data Source: Backend API (`/carousels?location=homepage`)
   - **Dataset Size**: 10-15 slides (small, curated)
   - Features: Auto-advance (8s), navigation arrows, dot indicators, background images
   - Current Implementation: Custom carousel with Framer Motion
   - Content: Movie data with titles, descriptions, and background images
   - **Performance**: No virtualization needed due to small dataset

2. **MovieSlider** (`/components/MovieSlider/`)

   - Location: Homepage "Featured Movies" section
   - Data Source: Redux store (movies slice) + optional props
   - **Dataset Size**: 800+ movies (large, growing)
   - Features: Horizontal scroll, wheel navigation, responsive (1 card mobile, 6 desktop)
   - Current Implementation: Custom slider with Framer Motion
   - Content: MovieCard components with images, titles, years, ratings
   - **Performance Challenge**: Currently loads all 800+ movies, needs optimization

3. **CharacterCircles** (`/components/CharacterCircles/`)
   - Location: Homepage "Beloved Characters" section
   - Data Source: Redux store (characters slice) + optional props
   - **Dataset Size**: 180+ characters (medium, growing)
   - Features: Horizontal scroll, circular character images, responsive (1 circle mobile, 10 desktop)
   - Current Implementation: Custom carousel with Framer Motion
   - Content: Character circular images with favorites and navigation
   - **Performance Challenge**: Currently loads all 180+ characters, needs optimization

### Existing Card Components (Reusable)

- **MovieCard** (`/components/MovieCard/`) ✅ Keep
- **CharacterCard** (`/components/CharacterCard/`) ✅ Keep

### Dependencies to Remove/Update

- **Framer Motion**: Will be partially removed from carousel logic, kept for page transitions
- **Motion Components**: Replace carousel-specific motion with Swiper.js animations

## 🚀 Migration Strategy

### Phase 1: Setup & HeroCarousel Migration

### Phase 2: MovieCarousel Implementation

### Phase 3: CharacterCarousel Implementation

## 📦 Dependencies

### New Dependencies to Add

```bash
npm install swiper
```

**Note**: Swiper is installed as a single package. CSS imports are done directly in component files or SCSS.

### Dependencies to Keep

- `framer-motion`: For page transitions and non-carousel animations (HomePage wrapper, card stagger animations)
- All existing dependencies remain unchanged

### Dependencies Usage After Migration

- **Framer Motion**: Page-level transitions, MovieCard/CharacterCard stagger animations
- **Swiper.js**: All carousel/slider functionality
- **React Router**: Navigation remains unchanged
- **Redux Toolkit**: State management remains unchanged

## 🎨 Naming Conventions & Architecture

### New Component Structure

```
frontend/src/components/
├── HeroCarousel/           # Swiper.js hero carousel
│   ├── HeroCarousel.tsx
│   ├── HeroCarousel.scss
│   ├── HeroCard/           # New component
│   │   ├── HeroCard.tsx
│   │   ├── HeroCard.scss
│   │   └── index.ts
│   └── index.ts
├── MovieCarousel/          # New Swiper.js movie carousel
│   ├── MovieCarousel.tsx
│   ├── MovieCarousel.scss
│   └── index.ts
├── CharacterCarousel/      # New Swiper.js character carousel
│   ├── CharacterCarousel.tsx
│   ├── CharacterCarousel.scss
│   └── index.ts
├── MovieCard/              # Keep existing (reuse)
└── CharacterCard/          # Keep existing (reuse)
```

### Component Responsibilities

#### HeroCarousel

- **Purpose**: Homepage hero section with large promotional content
- **Wrapper**: Swiper.js carousel container
- **Content**: HeroCard components
- **Features**: Auto-advance, navigation, pagination, background images
- **Data**: Backend carousel API

#### MovieCarousel

- **Purpose**: Homepage featured movies horizontal scroll
- **Wrapper**: Swiper.js carousel container
- **Content**: Existing MovieCard components
- **Features**: Touch/drag, navigation arrows, responsive slides
- **Data**: Redux movies store + props

#### CharacterCarousel

- **Purpose**: Homepage beloved characters horizontal scroll
- **Wrapper**: Swiper.js carousel container
- **Content**: Existing CharacterCard components (circular layout)
- **Features**: Touch/drag, navigation arrows, responsive slides
- **Data**: Redux characters store + props

#### HeroCard (New)

- **Purpose**: Individual hero slide content
- **Content**: Movie title, description, background image, CTA button
- **Design**: Current hero slide markup extracted into component
- **Reusable**: Can be used in other hero contexts

---

## ⚠️ Important: What NOT to Change

### Components to Keep Unchanged

1. **MovieCard** (`/components/MovieCard/`)

   - Keep all Framer Motion animations (stagger, hover effects)
   - Maintain FavoriteButton integration
   - Keep loading skeletons and lazy image loading
   - No changes to props interface

2. **CharacterCard** (`/components/CharacterCard/`)

   - Keep all Framer Motion animations
   - Maintain circular image layout and category badges
   - Keep quiz-specific props (showTitle, enableFavoriting, etc.)
   - No changes to props interface

3. **HomePage** (`/components/HomePage/`)

   - Keep page-level Framer Motion wrapper
   - Maintain SearchInput integration
   - Keep section structure and styling
   - Only change: import names for new carousel components

4. **Redux Slices**

   - No changes to moviesSlice
   - No changes to charactersSlice
   - No changes to data fetching logic

5. **Backend/API**
   - No changes to carousel endpoints
   - No changes to movie/character endpoints
   - No changes to database models

### Files to Keep As-Is

- `src/config/api.ts` - API configuration
- `src/config/assets.ts` - Image URL helpers
- `src/utils/cacheService.ts` - Caching logic
- `src/utils/performanceMonitor.ts` - Performance tracking
- `src/hooks/useFavorites.ts` - Favorites functionality
- All Redux store files
- All type definitions

### Styling Files to Update Carefully

- `src/styles/main.scss` - Only update carousel component imports
- Component-specific SCSS - Migrate styles but preserve structure
- Keep all CSS variables and mixins unchanged

---

## 🐛 Common Pitfalls & Solutions

### Pitfall 1: Breaking Card Animations

**Issue**: Removing Framer Motion from MovieCard/CharacterCard breaks stagger animations  
**Solution**: Keep motion imports in card components; only remove from carousel containers

### Pitfall 2: Search Integration

**Issue**: Search results not displaying after carousel replacement  
**Solution**: Ensure `isSearchActive` prop is passed and handled correctly; maintain exact prop names

### Pitfall 3: Favorites Not Working

**Issue**: FavoriteButton stops working after migration  
**Solution**: Ensure cards are rendered as children, not modified; Swiper should wrap unmodified cards

### Pitfall 4: Navigation Broken

**Issue**: Click navigation to detail pages stops working  
**Solution**: Ensure onClick handlers in cards are preserved; don't prevent default or stop propagation in Swiper

### Pitfall 5: Loading States Lost

**Issue**: Skeleton screens don't show during loading  
**Solution**: Implement loading states at carousel level before rendering Swiper; maintain existing loading UI

### Pitfall 6: Image URLs Broken

**Issue**: Images fail to load after migration  
**Solution**: Ensure getImageUrl() is still called in card components; Swiper shouldn't modify image src

### Pitfall 7: Responsive Breakpoints

**Issue**: Slides per view doesn't match original design  
**Solution**: Use exact breakpoint values from original components; test on actual devices

### Pitfall 8: Cache Not Working

**Issue**: Data fetches on every render after migration  
**Solution**: Maintain Redux integration pattern; don't bypass existing data flow

### Pitfall 9: Virtual Slides with Search

**Issue**: Search/filter breaks when virtual slides are enabled  
**Solution**: Ensure filtered data array is passed correctly to Swiper; virtual slides work with any array length

### Pitfall 10: Performance Degradation with Large Datasets

**Issue**: Scroll becomes laggy with 800+ movies without virtual slides  
**Solution**: MUST enable virtual slides for MovieCarousel; recommended for CharacterCarousel

---

## 📅 Phase 1: Setup & HeroCarousel Migration

### 1.1 Dependencies Installation

```bash
cd frontend
npm install swiper
```

### 1.2 Create HeroCard Component

- Extract existing hero slide markup from HeroCarousel.tsx
- Create standalone HeroCard component
- **Content includes**:
  - Title (motion.h1)
  - Description (motion.p)
  - CTA button (motion.button with navigation)
  - Props: slide data, onClick handler
- **Styling notes**:
  - Reuse existing hero-slide styles
  - Keep Framer Motion for card content animations (stagger effect)
  - Remove AnimatePresence (Swiper handles slide transitions)
- Add props interface for slide data
- Maintain button navigation to movie detail pages

### 1.3 Migrate HeroCarousel to Swiper.js

- Replace Framer Motion AnimatePresence with Swiper
- Implement Swiper modules: Navigation, Pagination, Autoplay (8s interval)
- **Keep existing functionality**:
  - API integration (getApiUrl + API_ENDPOINTS.CAROUSELS)
  - Data fetching with AbortController and cleanup
  - Loading states with skeleton UI
  - Error handling
  - Background image fade transitions
  - Timer management (clearTimer, startTimer refs)
- **Swiper configuration**:
  ```typescript
  {
    modules: [Navigation, Pagination, Autoplay],
    spaceBetween: 0,
    slidesPerView: 1,
    autoplay: { delay: 8000, disableOnInteraction: false },
    navigation: true,
    pagination: { clickable: true },
    loop: true
  }
  ```
- Preserve background image functionality (hero-background-images layer)
- Ensure responsive design maintained
- Map fetched data to HeroCard components

### 1.4 Update Styling

- **Import Swiper CSS** in HeroCarousel.tsx or SCSS:
  ```typescript
  import "swiper/css";
  import "swiper/css/navigation";
  import "swiper/css/pagination";
  import "swiper/css/autoplay";
  ```
- Convert motion-based slide transitions to Swiper CSS (handled by Swiper)
- **Keep Framer Motion** for HeroCard internal animations (title, description, button stagger)
- Maintain existing visual design and Disney theme
- Override Swiper default styles with Disney brand colors
- Ensure modular SCSS structure
- Responsive breakpoint compatibility
- Update main.scss to import HeroCard styles (if separate)

### 1.5 Update HomePage Integration

- Update import: `HeroCarousel` (same component name, new implementation)
- **No changes needed** to HomePage.tsx structure
- Verify hero-background-images layer still works
- Test functionality and performance
- Test auto-advance (8s) and navigation
- Verify background image fade transitions
- Test responsive behavior

---

## 📅 Phase 2: MovieCarousel Implementation

### 2.1 Create MovieCarousel Component

- New Swiper.js wrapper component in `/components/MovieCarousel/`
- Integrate existing MovieCard components as slides
- **CRITICAL: Enable Virtual Slides for 800+ movies**

  ```typescript
  import { Virtual } from "swiper/modules";

  modules: [Navigation, Virtual];
  virtual: true; // Only renders visible slides
  ```

- **Responsive slides configuration**:
  ```typescript
  breakpoints: {
    0: { slidesPerView: 1, spaceBetween: 10 },      // Mobile
    481: { slidesPerView: 2, spaceBetween: 15 },     // Small tablet
    768: { slidesPerView: 4, spaceBetween: 20 },     // Tablet
    1024: { slidesPerView: 6, spaceBetween: 20 }     // Desktop
  }
  ```
- Add navigation arrows (conditional based on overflow)
- **Performance**: Virtual slides ensure only ~10-20 DOM nodes exist instead of 800+
- Enable freeMode for smooth scrolling
- slidesPerGroup: 1 (scroll one at a time)

### 2.2 Data Integration

- **Props interface** (same as current MovieSlider):
  ```typescript
  interface MovieCarouselProps {
    movies?: Movie[]; // Optional data override
    isSearchActive?: boolean; // Search mode indicator
    loading?: boolean; // Loading state
  }
  ```
- Maintain existing Redux integration pattern (useAppSelector + useAppDispatch)
- Support both props and store data: `movies = propMovies || storeMovies`
- Preserve loading/error/empty states with existing UI
- Keep search functionality integration (filter results display)
- **No changes to Redux slices or API calls**

### 2.3 Features Implementation

- Touch/drag navigation (built-in Swiper)
- **Wheel scroll support**: Swiper mousewheel module (optional, evaluate UX)
  ```typescript
  mousewheel: {
    forceToAxis: true;
  }
  ```
- Responsive breakpoints (as defined in 2.1)
- **Virtual slides**: MUST enable for 800+ movies
- Lazy loading for images (Swiper lazy module)
- Navigation arrows with conditional visibility
- **Remove custom wheel event handler** (replace with Swiper mousewheel)
- Smooth transitions and animations
- Maintain MovieCard hover effects and animations
- **Performance monitoring**: Track virtual slide rendering performance

### 2.4 Replace MovieSlider

- Update HomePage import: change `MovieSlider` to `MovieCarousel`
- Update main.scss: replace MovieSlider import with MovieCarousel
- **After full verification**: Remove old MovieSlider component folder
- Update imports and styling references
- Verify search integration works (SearchInput → MovieCarousel)
- Test loading states, empty states, error states
- Verify FavoriteButton functionality in MovieCard
- Test navigation to movie detail pages

---

## 📅 Phase 3: CharacterCarousel Implementation

### 3.1 Create CharacterCarousel Component

- New Swiper.js wrapper component in `/components/CharacterCarousel/`
- Integrate existing CharacterCard components as slides
- **RECOMMENDED: Enable Virtual Slides for 180+ characters**

  ```typescript
  import { Virtual } from "swiper/modules";

  modules: [Navigation, Virtual];
  virtual: true; // Renders only visible slides
  ```

- **Responsive slides configuration**:
  ```typescript
  breakpoints: {
    0: { slidesPerView: 1, spaceBetween: 10 },       // Mobile
    481: { slidesPerView: 3, spaceBetween: 15 },     // Small tablet
    768: { slidesPerView: 6, spaceBetween: 20 },     // Tablet
    1024: { slidesPerView: 10, spaceBetween: 20 }    // Desktop
  }
  ```
- Maintain circular character design (handled by CharacterCard)
- **Performance**: Virtual slides reduce DOM nodes from 180+ to ~15-30
- Enable freeMode for smooth character browsing
- slidesPerGroup: 2 (scroll two at a time, matching current behavior)

### 3.2 Character-Specific Features

- **Props interface** (same as current CharacterCircles):
  ```typescript
  interface CharacterCarouselProps {
    characters?: Character[]; // Optional data override
    isSearchActive?: boolean; // Search mode indicator
    loading?: boolean; // Loading state
  }
  ```
- Preserve circular image layout of CharacterCard (no changes to card)
- Maintain favorites functionality (FavoriteButton in CharacterCard)
- Keep search integration (filter results display)
- Support loading/error/empty states with existing UI
- **No changes to Redux slices or CharacterCard component**

### 3.3 Navigation & Interaction

- Touch/drag navigation optimized for character browsing
- Navigation arrows with conditional visibility
- Smooth transitions for character selection
- **Virtual slides** for performance with 180+ items
- Accessibility improvements (keyboard navigation, ARIA labels)
- Maintain scroll-by-2 behavior (slidesPerGroup: 2)

### 3.4 Replace CharacterCircles

- Update HomePage import: change `CharacterCircles` to `CharacterCarousel`
- Update main.scss: replace CharacterCircles import with CharacterCarousel
- **After full verification**: Remove old CharacterCircles component folder
- Update imports and styling references
- Verify search and favorites work
- Test character navigation to detail pages
- Test loading states, empty states, error states
- Verify circular image design and category badges

---

## 🔧 Technical Requirements

### Performance Optimization

- **Lazy Loading**: Enable Swiper lazy loading for images
  ```typescript
  lazy: {
    loadPrevNext: true,
    loadPrevNextAmount: 2
  }
  ```
- **Virtual Slides**: **CRITICAL for MovieCarousel (800+ items)**
  - Enable Swiper Virtual module to render only visible slides
  - Reduces DOM nodes from 800+ to ~10-20 at any time
  - Dramatically improves scroll performance and memory usage
  - **Image loading behavior**: Images are loaded when slides enter the viewport (lazy loading)
  ```typescript
  // MovieCarousel configuration
  virtual: true,
  modules: [Navigation, Virtual]
  ```
- **Virtual Slides for CharacterCarousel**: **RECOMMENDED (180+ items)**
  - Enable Virtual module for better performance
  - Reduces DOM nodes from 180+ to ~15-30
  - Optional but highly recommended for scalability
  - **Image loading behavior**: Images load progressively as user scrolls
- **No Virtual Slides for HeroCarousel**: Small dataset (10-15), not needed
  - **Why not virtual slides?**: Background images need to be accessible for transitions
  - All hero images are preloaded upfront for smooth background transitions
  - Virtual slides would break the background image sync logic
  - With only 10-15 slides, performance impact is negligible
- **Caching**: Maintain existing CacheService integration (2-hour TTL)
  - Movies cached with key pattern: `disney_movies`
  - Characters cached with key pattern: `disney_characters`
  - Carousel data cached from backend API
- **Image Optimization**: Keep existing getImageUrl() integration
  - Azure CDN for production
  - Local fallbacks for development
- **Bundle Optimization**: Tree-shake unused Swiper modules
- **Preload Strategy**:
  - HeroCarousel: Preload all slides (small dataset, needed for background sync)
  - MovieCarousel: Use Virtual + lazy loading (images load on scroll)
  - CharacterCarousel: Use Virtual + lazy loading (images load on scroll)

### Responsive Design

```scss
// Breakpoint configuration
$mobile: 480px;
$tablet: 768px;
$desktop: 1024px;

// Slides per view
mobile: 1 slide
tablet: 3-4 slides
desktop: 6-10 slides (depending on component)
```

### Accessibility

- ARIA labels for navigation
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Reduced motion support

### Browser Support

- Modern browsers (ES6+)
- Touch device support
- Mobile optimization
- Cross-platform consistency

## 🎨 Styling Strategy

### Modular SCSS Structure

```scss
// Each carousel component
.hero-carousel,
.movie-carousel,
.character-carousel {
  // Swiper container styling
  .swiper {
    width: 100%;
    height: 100%;
  }

  .swiper-slide {
    // Slide-specific styles
  }

  // Custom navigation (if overriding default)
  &__nav {
    // Custom arrow styling
  }

  // Custom pagination (if overriding default)
  &__pagination {
    // Custom dot styling
  }

  // Loading, error, empty states
  &__loading,
  &__error,
  &__empty {
    // State-specific styling (keep existing)
  }
}
```

### Design Consistency

- Maintain existing Disney theme colors
- Keep current button styles and hover effects
- Preserve spacing and typography
- Consistent animation timing and easing

### Swiper CSS Integration

```scss
// Import Swiper styles at component level or in main.scss
@import "swiper/css";
@import "swiper/css/navigation";
@import "swiper/css/pagination";
@import "swiper/css/autoplay";

// Override Swiper defaults with Disney theme
.swiper-button-next,
.swiper-button-prev {
  color: var(--disney-gold);
  background: var(--white);
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    background: var(--disney-gold);
    color: var(--white);
    transform: scale(1.15);
  }
}

.swiper-pagination-bullet {
  background: var(--white);
  opacity: 0.5;

  &-active {
    opacity: 1;
    background: var(--disney-gold);
  }
}
```

## 🔄 Data Flow & Integration

### Redux Integration

- **Movies**: Keep existing movies slice integration
- **Characters**: Keep existing characters slice integration
- **Carousel Data**: Keep existing API integration for hero content
- **Caching**: Maintain existing cache service usage

### Props Interface

```typescript
// Consistent props pattern across all carousels
interface CarouselProps<T> {
  items?: T[]; // Optional data override (movies, characters, etc.)
  loading?: boolean; // Loading state
  isSearchActive?: boolean; // Search mode indicator (3+ chars triggers search)
}

// Specific implementations
interface HeroCarouselProps {
  // No props - fetches from backend API internally
}

interface MovieCarouselProps {
  movies?: Movie[];
  loading?: boolean;
  isSearchActive?: boolean;
}

interface CharacterCarouselProps {
  characters?: Character[];
  loading?: boolean;
  isSearchActive?: boolean;
}
```

### Performance Monitoring

- Keep existing performanceMonitor.ts integration
- Track carousel interaction metrics
- Monitor loading times and cache hit rates

## 🧪 Testing Strategy

### Component Testing

- Unit tests for each new carousel component
- Integration tests with existing Card components
- Props and state management testing
- Error boundary and loading state testing

### Visual Testing

- Cross-browser compatibility
- Mobile responsiveness testing
- Touch interaction testing
- Accessibility auditing

### Performance Testing

- Load time measurements
- Memory usage profiling
- Animation smoothness verification
- Cache effectiveness testing

## 📋 Migration Checklist

### Pre-Migration

- [x] Install Swiper.js dependencies
- [x] Review current carousel implementations and performance
- [x] Document current dataset sizes (10-15 hero, 800+ movies, 180+ characters)

### Phase 1: HeroCarousel ✅ COMPLETE

- [x] Create HeroCard component
- [x] Implement new HeroCarousel with Swiper (no virtual slides needed)
- [x] Maintain API integration and data fetching
- [x] Update styling and responsive design
- [x] Test auto-advance (8s) and navigation
- [x] Update HomePage integration
- [x] Verify functionality with ~10-15 slides
- [x] Fix pagination dots centering issue
- [x] Fix background image sync with loop mode (realIndex vs activeIndex)
- [ ] Delete old HeroCarousel implementation files (after final verification)

### Phase 2: MovieCarousel ✅ COMPLETE

- [x] Create MovieCarousel component
- [x] **CRITICAL**: Enable Virtual slides module for 800+ movies
- [x] Integrate with existing MovieCard
- [x] Implement responsive slides configuration
- [x] Add navigation and touch support
- [x] Test Redux integration and search functionality
- [x] Fix card sizing issues (removed explicit width calculations, let Swiper handle it)
- [x] Fix gap spacing (standardized to 16px across all breakpoints)
- [x] Fix navigation button vertical alignment (added margin-top offset)
- [x] Fix content flickering below carousel (adjusted padding structure)
- [x] Update HomePage integration
- [x] Update main.scss imports
- [ ] **Performance test**: Verify virtual slides working (DOM nodes ~10-20 not 800+)
- [ ] Test with full 800+ movie dataset
- [ ] Delete old MovieSlider folder (after verification)

### Phase 3: CharacterCarousel ✅ COMPLETE

- [x] Create CharacterCarousel component
- [x] **RECOMMENDED**: Enable Virtual slides module for 180+ characters
- [x] Integrate with circular character design (reused character-circle styles)
- [x] Maintain circular character design
- [x] Implement responsive slides configuration (1/3/6/10 slides per view)
- [x] Test favorites and search functionality
- [x] Update HomePage integration
- [x] Update main.scss imports
- [ ] **Performance test**: Verify virtual slides working (DOM nodes ~15-30 not 180+)
- [ ] Test with full 180+ character dataset
- [ ] Delete old CharacterCircles folder (after verification)

### Post-Migration 🚧 IN PROGRESS

- [ ] Performance audit and optimization
  - [ ] Verify MovieCarousel virtual slides reduce DOM from 800+ to ~20
  - [ ] Verify CharacterCarousel virtual slides reduce DOM from 180+ to ~30
  - [ ] Monitor bundle size impact of Swiper.js
  - [ ] Test scroll performance with large datasets
- [ ] Accessibility testing and improvements
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS, Android)
- [ ] Documentation updates (README, component docs)
- [ ] Code cleanup:
  - [ ] Remove unused Framer Motion imports from carousel files
  - [ ] Update main.scss imports (remove old carousels, add new)
  - [ ] Confirm old component folders deleted (MovieSlider, CharacterCircles)
  - [ ] Clean up unused motion animations
- [ ] Verify CacheService integration still works correctly
- [ ] Git commit: "feat: migrate carousels to Swiper.js with virtual slides"

## 🚨 Risks & Mitigation

### Technical Risks

- **Bundle Size**: Monitor impact of adding Swiper.js dependency (~40-50KB gzipped with modules)
- **Virtual Slides Complexity**: Ensure virtual slides work correctly with search/filter functionality
- **Performance with Large Datasets**: Critical for 800+ movies - must use virtual slides
- **Breaking Changes**: Maintain backward compatibility during migration
- **Mobile Experience**: Ensure touch interactions work seamlessly with virtual slides

### Mitigation Strategies

- **Gradual Rollout**: Migrate one component at a time
- **Git Version Control**: Code is in repo, easy rollback if needed
- **Testing**: Comprehensive testing at each phase, especially with full datasets
- **Performance Monitoring**: Use browser DevTools to verify DOM node counts
- **Virtual Slides Validation**: Test extensively with 800+ movies to ensure smooth scrolling

## 📈 Success Metrics

### Code Quality

- **Reduced LOC**: Simplified carousel logic with Swiper.js
- **Better Maintainability**: Standardized carousel patterns
- **Improved Performance**: Leveraging Swiper's optimizations
- **Enhanced Accessibility**: Better keyboard and screen reader support

### User Experience

- **Smoother Animations**: Hardware-accelerated Swiper transitions
- **Better Touch Support**: Native touch/drag interactions
- **Improved Loading**: Enhanced lazy loading and performance
- **Consistent Behavior**: Standardized carousel interactions

### Development Experience

- **Unified API**: Consistent carousel component interfaces
- **Better Documentation**: Clear component responsibilities
- **Easier Testing**: Simplified logic and state management
- **Future Flexibility**: Easy to extend with new Swiper features

---

## � Implementation Examples

### Example 1: HeroCarousel with Swiper

```typescript
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { HeroCard } from "./HeroCard/HeroCard";

export const HeroCarousel = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  // Keep existing data fetching logic
  useEffect(() => {
    // Existing API fetch logic here...
  }, []);

  if (loading) {
    return <div className="hero-carousel__loading">...</div>;
  }

  return (
    <div className="hero-carousel">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        spaceBetween={0}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        loop={true}
        onSlideChange={(swiper) => {
          // Update background image if needed
        }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <HeroCard slide={slide} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
```

### Example 2: MovieCarousel with Virtual Slides (CRITICAL for 800+ movies)

```typescript
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Virtual } from "swiper/modules";
import { MovieCard } from "../MovieCard/MovieCard";

export const MovieCarousel = ({
  movies,
  loading,
  isSearchActive,
}: MovieCarouselProps) => {
  // Keep existing Redux integration
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const storeMovies = useAppSelector((state) => state.movies.movies);
  const displayMovies = movies || storeMovies;

  if (loading) return <div className="movie-carousel__loading">...</div>;
  if (displayMovies.length === 0 && isSearchActive) {
    return <div className="movie-carousel__empty">No results</div>;
  }

  return (
    <div className="movie-carousel">
      <Swiper
        modules={[Navigation, Virtual]}
        navigation
        virtual // CRITICAL: Only renders visible slides
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 10 },
          481: { slidesPerView: 2, spaceBetween: 15 },
          768: { slidesPerView: 4, spaceBetween: 20 },
          1024: { slidesPerView: 6, spaceBetween: 20 },
        }}
      >
        {displayMovies.map((movie, index) => (
          <SwiperSlide key={movie.id} virtualIndex={index}>
            <MovieCard
              movie={movie}
              index={index}
              onClick={(id) => navigate(`/movie/${id}`)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
```

### Example 3: CharacterCarousel with Virtual Slides (RECOMMENDED for 180+ characters)

```typescript
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Virtual } from "swiper/modules";
import { CharacterCard } from "../CharacterCard/CharacterCard";

export const CharacterCarousel = ({
  characters,
  loading,
  isSearchActive,
}: CharacterCarouselProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const storeCharacters = useAppSelector(
    (state) => state.characters.characters
  );
  const displayCharacters = characters || storeCharacters;

  if (loading) return <div className="character-carousel__loading">...</div>;
  if (displayCharacters.length === 0 && isSearchActive) {
    return <div className="character-carousel__empty">No results</div>;
  }

  return (
    <div className="character-carousel">
      <Swiper
        modules={[Navigation, Virtual]}
        navigation
        virtual // RECOMMENDED: Improves performance with 180+ items
        slidesPerGroup={2} // Scroll 2 at a time
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 10 },
          481: { slidesPerView: 3, spaceBetween: 15 },
          768: { slidesPerView: 6, spaceBetween: 20 },
          1024: { slidesPerView: 10, spaceBetween: 20 },
        }}
      >
        {displayCharacters.map((character, index) => (
          <SwiperSlide key={character.id} virtualIndex={index}>
            <CharacterCard
              character={character}
              index={index}
              onClick={(id) => navigate(`/character/${id}`)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
```

### Example 4: Styling Override

```scss
// MovieCarousel.scss
@import "../../styles/variables";
@import "../../styles/mixins";

.movie-carousel {
  width: 100%;

  // Override Swiper navigation
  .swiper-button-next,
  .swiper-button-prev {
    color: var(--disney-blue);
    background: var(--white);
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all var(--transition-fast);

    &:hover {
      background: var(--disney-gold);
      color: var(--white);
      transform: scale(1.15);
    }

    // Hide on mobile
    @include mobile {
      display: none;
    }
  }

  .swiper-button-next {
    right: -1.5rem;
  }

  .swiper-button-prev {
    left: -1.5rem;
  }

  // Keep existing loading/error states
  &__loading,
  &__error,
  &__empty {
    // Same as current implementation
  }
}
```

---

## �🔗 References

- [Swiper.js Documentation](https://swiperjs.com/)
- [Swiper React Components](https://swiperjs.com/react)
- [Current MovieCard Implementation](../frontend/src/components/MovieCard/)
- [Current CharacterCard Implementation](../frontend/src/components/CharacterCard/)
- [Existing Performance Monitor](../frontend/src/utils/performanceMonitor.ts)

---

_Last Updated: November 6, 2025_
_Status: 🎉 **IMPLEMENTATION COMPLETE** - All 3 Phases Done! Now in Testing & Cleanup Phase_

## 📊 Migration Summary

### ✅ Completed Components

1. **HeroCarousel** - Migrated with Navigation, Pagination, Autoplay modules
2. **MovieCarousel** - Migrated with Virtual Slides for 800+ movies
3. **CharacterCarousel** - Migrated with Virtual Slides for 180+ characters

### 🔧 Issues Resolved During Migration

1. **Phase 1 Issues**:

   - Pagination dots left-aligned → Fixed with CSS overrides and centering
   - Background images not syncing in loop mode → Fixed by using `swiper.realIndex` instead of `activeIndex`
   - Background image transitions → Added fade transitions with opacity

2. **Phase 2 Issues**:

   - Movie cards appearing tiny → Fixed by removing explicit width calculations and letting Swiper handle sizing naturally
   - Large gaps between cards → Fixed by standardizing `spaceBetween: 16px` across breakpoints
   - Navigation buttons not vertically centered → Fixed with `margin-top: -1.5rem` offset
   - Content flickering below carousel → Fixed by adjusting padding structure (moved from `.swiper` to `.movie-carousel__container`)

3. **Phase 3 Issues**: None - Learned from Phase 2 and applied correct patterns immediately

### 🚀 Next Steps

1. **Test all carousels** at http://localhost:3001
2. **Verify Virtual Slides performance** (check DOM node counts in DevTools)
3. **Clean up old components** (MovieSlider, CharacterCircles folders)
4. **Final Git commit** with all changes
