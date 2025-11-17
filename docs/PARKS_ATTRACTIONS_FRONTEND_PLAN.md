# Parks & Attractions Frontend Implementation Plan

**Created:** November 16, 2025  
**Status:** 🎨 **DESIGN & PLANNING**  
**Branch:** `feature/integrating-webp-images` (will add parks frontend)

---

## 📋 Executive Summary

This document outlines creative options and implementation strategy for presenting Disney Parks & Attractions data through an immersive, cinematic frontend experience. The goal is to create a visually stunning, interactive presentation that showcases 12 Disney parks worldwide and their 334+ attractions.

### Backend Context

✅ **Backend Complete:**

- 12 Disney parks worldwide
- 334+ attractions across all parks
- REST API endpoints fully functional:
  - `GET /api/parks` - All parks
  - `GET /api/parks/{urlId}` - Specific park
  - `GET /api/attractions/park/{parkUrlId}` - Park attractions
  - Additional filtering endpoints (by type, thrill level, etc.)

### Frontend Goals

- Create an immersive, cinematic experience inspired by Disney+/theme park websites
- Showcase parks with visual impact and smooth animations
- Present attractions in an engaging, browsable format
- Fully responsive across all devices
- Integrate with existing caching strategy
- Adhere to theme system and design variables
- Use Framer Motion for smooth animations

---

## 🎨 Creative Concepts

### **Vision 1: Three-Column Immersive Experience** 🎯 ⭐ **[SELECTED FOR IMPLEMENTATION]**

**Layout:**

```
┌──────────────────────┬──────────┬────────────────────────┐
│                      │          │                        │
│   PARK CHOOSER       │ ATTR.    │   ATTRACTION DETAILS   │
│   (40% width)        │ LIST     │   (40% width)          │
│                      │ (20%)    │                        │
│   Full-height        │          │   Full-height          │
│   Parallax BG        │ Vertical │   Background image     │
│   Snap scroll        │ scroll   │   Content overlay      │
│   Park overlay       │ cards    │   Auto-select first    │
│                      │          │                        │
└──────────────────────┴──────────┴────────────────────────┘
```

**Column 1: Park Chooser (40% width)**

- Full viewport height minus header
- Background: Full-size park image with parallax effect
- Foreground overlay:
  - Park name (large, elegant typography)
  - Location subtitle (city, country)
  - Semi-transparent dark overlay for text readability
- Navigation:
  - Mouse wheel scrolls through parks vertically
  - Snap-to-park behavior (one park at a time)
  - Up/down arrow buttons for explicit navigation
  - "Choose This Park" button overlay with blur effect
- Animations:
  - Parallax background movement on scroll
  - Fade-in transitions between parks
  - Smooth snap scrolling

**Column 2: Attractions List (20% width)**

- Displays attractions for currently selected park
- Layout: Vertical scrollable stack of horizontal cards
- Card design:
  - Left: Attraction thumbnail image
  - Right: Name, type badge, thrill level indicator
  - Hover: Scale effect (1.05x)
- Behavior:
  - Auto-loads when park is selected
  - Staggered fade-in animation (50ms delay per card)
  - Click to select attraction (updates Column 3)
  - First attraction auto-selected on park change
- Visual: Clean, minimal cards with subtle shadows

**Column 3: Attraction Details (40% width)**

- Full viewport height minus header
- Background: Full-size attraction image
- Foreground content overlay:
  - Gradient overlay (dark at bottom, transparent at top)
  - Attraction name (hero text)
  - Badge row: Type, thrill level, operational status
  - Description text (scrollable if long)
  - Info cards: Height requirement, duration, features
- Animations:
  - Fade-in when attraction selected
  - Background image crossfade transition
  - Content slides up from bottom

**Interaction Flow:**

1. Page loads → First park auto-selected
2. Column 1 shows first park with parallax background
3. Column 2 loads and displays that park's attractions
4. Column 3 auto-selects and displays first attraction
5. User scrolls Column 1 (wheel/arrows) → New park snaps into view
6. Column 2 updates with new park's attractions (staggered animation)
7. Column 3 auto-selects first attraction of new park
8. User clicks attraction in Column 2 → Column 3 updates details

**Responsive Strategy:**

- **Desktop (1280px+):** Full three-column layout (40%-20%-40%)
- **Tablet (769-1279px):** Keep three columns, adjust to 35%-30%-35%
- **Mobile (<769px):** Punt for now, implement later as stacked vertical layout

**Technical Implementation:**

- React + TypeScript + Redux Toolkit
- Framer Motion for all animations
- Custom scroll handling for snap behavior
- CSS Grid for column layout
- Theme variables for consistent styling
- fetch API for data loading
- 5-minute cache via CacheService

**Pros:**

- ✅ Extremely immersive and cinematic
- ✅ Clear visual hierarchy (park → attractions → details)
- ✅ Unique three-column interaction model
- ✅ Showcases both park and attraction imagery prominently
- ✅ Smooth, app-like experience with snap scrolling
- ✅ Auto-selection reduces clicks for quick browsing
- ✅ Leverages full viewport height

**Cons:**

- ⚠️ Complex scroll coordination required
- ⚠️ Desktop-optimized (mobile needs separate implementation)
- ⚠️ Requires custom wheel event handling
- ⚠️ More moving parts = more edge cases to handle

**Why This Vision:**
This design maximizes visual impact while maintaining functional efficiency. The three-column split creates a clear mental model: choose a park (left), browse attractions (middle), see details (right). The auto-selection and snap scrolling make the experience feel polished and intentional, like a curated theme park guide rather than a database query tool.

---

### **Option 1: Dual-Pane Scrolling Experience** (Original Exploration)

**Layout:**

```
┌─────────────────────────┬─────────────────────────┐
│                         │                         │
│   PARKS NAVIGATOR       │   ATTRACTIONS VIEWER    │
│   (Left Half)           │   (Right Half)          │
│   - Vertical scroll     │   - Horizontal carousel │
│   - 12 parks listed     │   - Filtered by park    │
│   - Background parallax │   - Card-based grid     │
│                         │                         │
└─────────────────────────┴─────────────────────────┘
```

**Key Features:**

- **Left Column:** Vertical list of 12 parks with parallax background images
  - Click or scroll to select a park
  - Active park highlighted with cinematic reveal
  - Background image morphs/transitions between parks
  - Park info overlay (name, location, icon)
- **Right Column:** Attractions display for selected park
  - Initially shows featured attractions
  - Can scroll horizontally (carousel) or vertically (grid)
  - Filter by attraction type, thrill level
  - Cards with hover effects showing images/details

**Pros:**

- ✅ Visually stunning and unique
- ✅ Clear separation of navigation and content
- ✅ Works well for comparing parks
- ✅ Desktop-optimized experience

**Cons:**

- ⚠️ Complex mobile adaptation (would need to stack vertically)
- ⚠️ Requires sophisticated scroll coordination
- ⚠️ May need custom scrolling library (not Skrollr - deprecated)

---

### **Option 2: Full-Screen Park Slides with Nested Attraction Gallery**

**Layout:**

```
Park 1 (Full Screen)
  ↓ (Scroll down)
    → Attractions Horizontal Scroll
  ↓ (Continue scroll)
Park 2 (Full Screen)
  ↓
    → Attractions Horizontal Scroll
```

**Key Features:**

- Full-height sections per park (like iPhone product pages)
- Each park section has:
  - Hero background image
  - Park title/info overlay
  - Horizontal attraction carousel embedded
- Vertical scroll through all 12 parks
- Snap-scroll effect (park sections snap into view)
- Smooth parallax on park backgrounds

**Pros:**

- ✅ Extremely cinematic and immersive
- ✅ Natural scroll behavior (vertical = parks, horizontal = attractions)
- ✅ Mobile-friendly (stacks naturally)
- ✅ Can use Intersection Observer for animations

**Cons:**

- ⚠️ Requires more scrolling to see all parks
- ⚠️ May be overwhelming with 12 full-height sections

---

### **Option 3: Interactive World Map with Attraction Modals**

**Layout:**

```
┌────────────────────────────────────────────┐
│                                            │
│        Disney Parks World Map              │
│                                            │
│    🗺️ Interactive pins for each park     │
│                                            │
└────────────────────────────────────────────┘
  ↓ (Click park pin)
┌────────────────────────────────────────────┐
│  Park Detail Modal/Overlay                 │
│  - Park info                               │
│  - Attractions grid/carousel               │
└────────────────────────────────────────────┘
```

**Key Features:**

- SVG world map with animated pins for each park
- Hover shows park preview
- Click opens full park experience with attractions
- Filter attractions by park directly on map
- Visual clustering (US parks, Asia parks, Europe parks)

**Pros:**

- ✅ Highly interactive and engaging
- ✅ Geographical context for parks
- ✅ Great for discovery
- ✅ Unique approach

**Cons:**

- ⚠️ Requires custom SVG map creation/animation
- ⚠️ Complex state management for pins
- ⚠️ May not showcase attraction images prominently enough

---

### **Option 4: Netflix-Style Browse Experience** (Simplest)

**Layout:**

```
Parks & Attractions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   [All Parks] [USA] [Asia] [Europe]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Magic Kingdom ────────────────────────→
[Attraction] [Attraction] [Attraction]...

Disneyland Park ──────────────────────→
[Attraction] [Attraction] [Attraction]...

EPCOT ────────────────────────────────→
[Attraction] [Attraction] [Attraction]...
```

**Key Features:**

- Vertical scroll through parks
- Each park has its own horizontal attraction carousel
- Filter tabs at top (All, by region, by type)
- Consistent with existing site patterns (Characters/Movies pages)
- Lazy load attractions as user scrolls

**Pros:**

- ✅ Familiar UX pattern (Netflix, Disney+)
- ✅ Easy to implement with existing components
- ✅ Works perfectly on mobile
- ✅ Can reuse Swiper/carousel logic
- ✅ Fast to build

**Cons:**

- ⚠️ Less visually unique/innovative
- ⚠️ Doesn't have as much "wow factor"

---

### **Option 5: Stacked Cards with 3D Tilt Effects** (Most Innovative)

**Layout:**

```
    [Park Card Stack - 3D Effect]
    ┌──────────┐
    │  Park 1  │
    │┌─────────┤
    ││ Park 2  │
    ││┌────────┤
    │││Park 3  │

  ↓ Swipe/Click to flip through parks

Selected Park → Attractions Grid Below
```

**Key Features:**

- Stacked card interface for parks (like Tinder but elegant)
- Swipe or click to navigate parks
- 3D CSS transforms on cards
- Selected park expands to show attractions
- Smooth transitions using Framer Motion
- Perspective effects on scroll

**Pros:**

- ✅ Extremely unique and memorable
- ✅ Tactile/playful interaction
- ✅ Great use of Framer Motion
- ✅ Compact park navigation

**Cons:**

- ⚠️ May be too "gimmicky" for some users
- ⚠️ Accessibility concerns with gesture controls
- ⚠️ Complex state management

---

## 🎯 Recommended Approach

### **Primary Recommendation: Hybrid of Options 1 & 2**

**Name:** "Disney Parks Explorer"

**Desktop Experience:**

- **Left Sidebar (30% width):** Park navigator with vertical scroll
  - List of 12 parks with thumbnails
  - Active park highlighted
  - Smooth background transitions
  - Filter by region at top
- **Right Content (70% width):** Selected park showcase
  - Hero section with park image/info
  - Attractions presented in grid or horizontal scroll
  - Filter attractions by type, thrill level
  - Sort options (name, opening date, popularity)

**Mobile Experience:**

- Single-column layout
- Park selector at top (dropdown or horizontal scroll)
- Selected park hero
- Attractions grid below (responsive columns)

**Why This Works:**

1. ✅ Balances innovation with usability
2. ✅ Desktop-optimized without sacrificing mobile
3. ✅ Clear information hierarchy
4. ✅ Leverages existing component patterns
5. ✅ Allows for cinematic effects without overwhelming UX
6. ✅ Fast initial load with lazy loading

---

## 🏗️ Technical Architecture

### **Component Structure**

```
src/pages/ParksPage/
  ├── ParksPage.tsx              # Main page container
  ├── ParksPage.scss             # Page styles
  └── components/
      ├── ParkNavigator/         # Left sidebar park list
      │   ├── ParkNavigator.tsx
      │   ├── ParkNavigator.scss
      │   └── ParkListItem/
      │       ├── ParkListItem.tsx
      │       └── ParkListItem.scss
      ├── ParkShowcase/          # Right content area
      │   ├── ParkShowcase.tsx
      │   ├── ParkShowcase.scss
      │   └── components/
      │       ├── ParkHero/
      │       │   ├── ParkHero.tsx
      │       │   └── ParkHero.scss
      │       └── AttractionsSection/
      │           ├── AttractionsSection.tsx
      │           └── AttractionsSection.scss
      └── AttractionCard/        # Individual attraction card
          ├── AttractionCard.tsx
          └── AttractionCard.scss
```

### **Redux State Management**

```typescript
// src/store/slices/parksSlice.ts
interface ParksState {
  parks: Park[];
  selectedPark: Park | null;
  loading: boolean;
  error: string | null;
  filters: {
    region: "all" | "usa" | "asia" | "europe";
  };
  cache: {
    timestamp: number;
    data: Park[];
  };
}

// src/store/slices/attractionsSlice.ts
interface AttractionsState {
  attractions: Record<string, Attraction[]>; // Keyed by park urlId
  loading: Record<string, boolean>;
  error: string | null;
  filters: {
    type: string | null;
    thrillLevel: string | null;
    operational: boolean | null;
  };
  cache: {
    [parkUrlId: string]: {
      timestamp: number;
      data: Attraction[];
    };
  };
}
```

### **API Integration**

```typescript
// src/api/parksApi.ts
export const parksApi = {
  getAllParks: () => axios.get<Park[]>("/api/parks"),
  getParkByUrlId: (urlId: string) => axios.get<Park>(`/api/parks/${urlId}`),
  getParksByRegion: (region: string) =>
    axios.get<Park[]>(`/api/parks/country/${region}`),
};

// src/api/attractionsApi.ts
export const attractionsApi = {
  getAttractionsByPark: (parkUrlId: string) =>
    axios.get<Attraction[]>(`/api/attractions/park/${parkUrlId}`),
  getOperationalAttractions: (parkUrlId: string) =>
    axios.get<Attraction[]>(`/api/attractions/park/${parkUrlId}/operational`),
  getAttractionsByType: (type: string) =>
    axios.get<Attraction[]>(`/api/attractions/type/${type}`),
  getAttractionsByThrillLevel: (level: string) =>
    axios.get<Attraction[]>(`/api/attractions/thrill/${level}`),
};
```

### **Caching Strategy**

```typescript
// Match existing caching pattern from characters/movies
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// In Redux thunk:
export const fetchParks = createAsyncThunk(
  "parks/fetchParks",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { cache } = state.parks;

    // Check cache
    if (
      cache.data.length > 0 &&
      Date.now() - cache.timestamp < CACHE_DURATION
    ) {
      return cache.data;
    }

    // Fetch fresh data
    const response = await parksApi.getAllParks();
    return response.data;
  }
);
```

---

## 🎨 UI/UX Design Specifications

### **Color Palette**

Use existing theme variables:

- Primary: `var(--disney-blue)` for park elements
- Accent: `var(--disney-gold)` for highlights/active states
- Backgrounds: `var(--gray-50)` light, `var(--gray-900)` dark mode
- Text: Standard theme text colors

### **Typography**

- Park names: `var(--font-display)`, `var(--text-3xl)`, `var(--font-bold)`
- Section headers: `var(--text-2xl)`, `var(--font-semibold)`
- Attraction names: `var(--text-lg)`, `var(--font-medium)`
- Body text: `var(--text-base)`, `var(--font-normal)`

### **Spacing & Layout**

- Container max-width: `1920px` (full-width for immersive feel)
- Content padding: `var(--space-6)` mobile, `var(--space-12)` desktop
- Card gaps: `var(--space-4)` mobile, `var(--space-6)` desktop
- Section spacing: `var(--space-16)`

### **Animations (Framer Motion)**

```typescript
// Page entrance
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Park selection
const parkTransition = {
  type: "spring",
  stiffness: 260,
  damping: 20,
};

// Card hover
const cardHover = {
  scale: 1.05,
  y: -8,
  transition: { duration: 0.3 },
};

// Stagger children
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
```

---

## 📱 Responsive Breakpoints

### **Mobile (0-480px)**

- Single column layout
- Park selector: Dropdown or compact horizontal scroll
- Attractions: 1 column grid
- Full-width cards
- Simplified filters

### **Tablet (481-768px)**

- Single column or stacked layout
- Park selector: Horizontal scroll tabs
- Attractions: 2 column grid
- Larger cards with more info

### **Desktop (769-1279px)**

- Two-column layout (30/70 split)
- Left: Park navigator sidebar
- Right: Park showcase with attractions grid (3 columns)
- All filters visible

### **Large Desktop (1280px+)**

- Two-column layout (25/75 split)
- Attractions: 4-5 column grid
- Enhanced animations and parallax effects
- Full hero imagery

---

## 🧩 Component Details

### **1. ParksPage (Main Container)**

**Props:** None (page-level component)

**Responsibilities:**

- Fetch parks data on mount
- Manage global page state (selected park)
- Handle URL routing (`/parks` and `/parks/:parkUrlId`)
- Coordinate between navigator and showcase

**Key Features:**

- URL parameter support for deep linking
- Smooth transitions between park selections
- Loading/error states
- SEO metadata

---

### **2. ParkNavigator (Left Sidebar)**

**Props:**

```typescript
interface ParkNavigatorProps {
  parks: Park[];
  selectedParkId: string | null;
  onParkSelect: (parkUrlId: string) => void;
  filters: {
    region: string;
  };
  onFilterChange: (region: string) => void;
}
```

**Features:**

- Sticky positioning (follows scroll)
- Region filter tabs at top
- Scrollable park list
- Active park highlighting
- Hover previews (park image overlay)
- Smooth scroll to park in view

**Styling:**

- Fixed width on desktop: `min(30vw, 400px)`
- Full width on mobile: `100vw`
- Background: Semi-transparent with backdrop blur
- Border right: Subtle divider

---

### **3. ParkShowcase (Right Content)**

**Props:**

```typescript
interface ParkShowcaseProps {
  park: Park | null;
  attractions: Attraction[];
  loading: boolean;
  onFilterChange: (filters: AttractionFilters) => void;
}
```

**Features:**

- Hero section with park background image
- Park info overlay (name, location, opening date)
- Attraction filters/sort controls
- Grid or carousel view toggle
- Infinite scroll/pagination support

---

### **4. ParkHero (Hero Section)**

**Props:**

```typescript
interface ParkHeroProps {
  park: Park;
  imageUrl?: string;
}
```

**Features:**

- Full-width background image with parallax
- Gradient overlay for text readability
- Park icon/logo (if available)
- Key stats (attraction count, opening year, location)
- "Visit Website" CTA button
- Responsive image loading

**Styling:**

- Height: `50vh` desktop, `40vh` mobile
- Background: `background-size: cover; background-position: center;`
- Overlay: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))`

---

### **5. AttractionsSection**

**Props:**

```typescript
interface AttractionsSectionProps {
  attractions: Attraction[];
  loading: boolean;
  viewMode: "grid" | "carousel";
  filters: AttractionFilters;
  onFilterChange: (filters: AttractionFilters) => void;
}
```

**Features:**

- Filter bar (type, thrill level, operational status)
- Sort dropdown (name, opening date, thrill level)
- View mode toggle (grid vs carousel)
- Loading skeletons
- Empty state for no results
- Lazy loading as user scrolls

---

### **6. AttractionCard**

**Props:**

```typescript
interface AttractionCardProps {
  attraction: Attraction;
  onClick?: () => void;
  layout?: "grid" | "carousel";
}
```

**Features:**

- Image thumbnail (fallback to placeholder)
- Attraction name
- Attraction type badge
- Thrill level indicator (emoji or color)
- Height requirement (if applicable)
- Operational status indicator
- Hover effect (scale + lift)
- Click to expand details (modal or detail page)

**Card Design:**

```scss
.attraction-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: var(--transition-normal);
  background: var(--gray-50);

  &:hover {
    box-shadow: var(--shadow-xl);
    transform: translateY(-8px) scale(1.02);
  }

  &__image {
    aspect-ratio: 16/9;
    object-fit: cover;
    width: 100%;
  }

  &__content {
    padding: var(--space-4);
  }

  &__name {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    margin-bottom: var(--space-2);
  }

  &__type {
    display: inline-block;
    padding: var(--space-1) var(--space-3);
    background: var(--disney-blue);
    color: white;
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
  }

  &__thrill {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-2);
    font-size: var(--text-sm);

    &--mild {
      color: var(--success);
    }
    &--moderate {
      color: var(--warning);
    }
    &--intense {
      color: var(--error);
    }
  }
}
```

---

## 🔧 Implementation Phases

### **Phase 1: Data Layer & Types** (Day 1)

**Tasks:**

- [ ] Create TypeScript types for `Park` and `Attraction`
- [ ] Set up Redux slices for parks and attractions
- [ ] Create API service functions
- [ ] Implement caching logic
- [ ] Write thunks for data fetching
- [ ] Add mock data for development

**Testing:**

- Test Redux actions and state updates
- Verify API calls work with backend
- Confirm cache invalidation logic

**Files to Create:**

```
src/types/Park.ts
src/types/Attraction.ts
src/api/parksApi.ts
src/api/attractionsApi.ts
src/store/slices/parksSlice.ts
src/store/slices/attractionsSlice.ts
```

---

### **Phase 2: Basic Page Structure** (Day 1-2)

**Tasks:**

- [ ] Create `ParksPage` component with routing
- [ ] Add page to navigation
- [ ] Set up basic layout structure (desktop two-column)
- [ ] Implement mobile responsive stack
- [ ] Add loading states
- [ ] Add error boundaries

**Testing:**

- Navigate to `/parks` route
- Verify responsive layout changes
- Test loading/error states

**Files to Create:**

```
src/pages/ParksPage/ParksPage.tsx
src/pages/ParksPage/ParksPage.scss
src/pages/ParksPage/index.ts
```

---

### **Phase 3: Park Navigator** (Day 2)

**Tasks:**

- [ ] Create `ParkNavigator` component
- [ ] Implement park list with scroll
- [ ] Add region filter tabs
- [ ] Style active/hover states
- [ ] Implement park selection logic
- [ ] Add Framer Motion animations

**Testing:**

- Click parks to select
- Test filter tabs
- Verify smooth scrolling
- Check animations on selection

**Files to Create:**

```
src/pages/ParksPage/components/ParkNavigator/ParkNavigator.tsx
src/pages/ParksPage/components/ParkNavigator/ParkNavigator.scss
src/pages/ParksPage/components/ParkNavigator/ParkListItem/ParkListItem.tsx
src/pages/ParksPage/components/ParkNavigator/ParkListItem/ParkListItem.scss
```

---

### **Phase 4: Park Showcase & Hero** (Day 3)

**Tasks:**

- [ ] Create `ParkShowcase` component
- [ ] Build `ParkHero` section with parallax
- [ ] Add park info display
- [ ] Implement responsive images
- [ ] Add fallback placeholder images
- [ ] Style with theme variables

**Testing:**

- Select different parks
- Verify hero image changes
- Test parallax effect on scroll
- Check image fallbacks

**Files to Create:**

```
src/pages/ParksPage/components/ParkShowcase/ParkShowcase.tsx
src/pages/ParksPage/components/ParkShowcase/ParkShowcase.scss
src/pages/ParksPage/components/ParkShowcase/components/ParkHero/ParkHero.tsx
src/pages/ParksPage/components/ParkShowcase/components/ParkHero/ParkHero.scss
```

---

### **Phase 5: Attractions Section** (Day 3-4)

**Tasks:**

- [ ] Create `AttractionsSection` component
- [ ] Fetch attractions for selected park
- [ ] Implement filter controls (type, thrill, operational)
- [ ] Add sort dropdown
- [ ] Build grid layout (responsive columns)
- [ ] Add loading skeletons
- [ ] Implement empty state

**Testing:**

- Select park and verify attractions load
- Test filter combinations
- Verify sort order
- Check responsive grid

**Files to Create:**

```
src/pages/ParksPage/components/ParkShowcase/components/AttractionsSection/AttractionsSection.tsx
src/pages/ParksPage/components/ParkShowcase/components/AttractionsSection/AttractionsSection.scss
```

---

### **Phase 6: Attraction Cards** (Day 4)

**Tasks:**

- [ ] Create `AttractionCard` component
- [ ] Style card with image, name, badges
- [ ] Add thrill level indicator
- [ ] Implement hover animations
- [ ] Add operational status indicator
- [ ] Add height requirement display
- [ ] Link to attraction details (future feature)

**Testing:**

- Verify card hover effects
- Test different attraction types
- Check thrill level colors
- Verify fallback images

**Files to Create:**

```
src/pages/ParksPage/components/AttractionCard/AttractionCard.tsx
src/pages/ParksPage/components/AttractionCard/AttractionCard.scss
```

---

### **Phase 7: Advanced Features** (Day 5)

**Tasks:**

- [ ] Add view mode toggle (grid vs carousel)
- [ ] Implement carousel view with Swiper
- [ ] Add search functionality
- [ ] Implement deep linking (`/parks/:parkUrlId`)
- [ ] Add "Recently Viewed Parks" tracking
- [ ] Add favorites functionality (future)
- [ ] Optimize performance (lazy loading, virtualization)

**Testing:**

- Test grid vs carousel modes
- Search for attractions
- Test deep links with different parks
- Verify recently viewed tracking

---

### **Phase 8: Polish & Optimization** (Day 6)

**Tasks:**

- [ ] Add micro-interactions (button hovers, transitions)
- [ ] Optimize images (lazy loading, responsive srcset)
- [ ] Add SEO metadata
- [ ] Test accessibility (keyboard nav, screen readers)
- [ ] Cross-browser testing
- [ ] Performance audit (Lighthouse)
- [ ] Add analytics tracking
- [ ] Write unit tests

**Testing:**

- Full regression testing
- Accessibility audit with axe DevTools
- Performance testing with Lighthouse
- Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## 📊 Performance Considerations

### **Lazy Loading**

- Attractions loaded on park selection
- Images lazy-loaded with Intersection Observer
- Infinite scroll for large attraction lists

### **Caching**

- Parks cached for 5 minutes
- Attractions cached per park
- Cache invalidation on manual refresh

### **Optimization**

- Use React.memo for expensive components
- Virtualize long lists with `react-window` if needed
- Debounce search input
- Throttle scroll handlers

### **Bundle Size**

- Code split by route (lazy load ParksPage)
- Dynamic imports for large dependencies
- Tree-shake unused code

---

## ♿ Accessibility

- **Keyboard Navigation:** All interactive elements keyboard-accessible
- **Screen Readers:** Semantic HTML and ARIA labels
- **Focus Management:** Visible focus indicators
- **Color Contrast:** WCAG AA compliant
- **Skip Links:** Skip to main content
- **Reduced Motion:** Respect `prefers-reduced-motion`

---

## 🧪 Testing Strategy

### **Unit Tests**

- Redux slices (actions, reducers)
- API service functions
- Utility functions (filtering, sorting)

### **Integration Tests**

- Component interactions
- Navigation flows
- API integration

### **E2E Tests (Optional)**

- User journey: Select park → View attractions → Filter
- Deep linking scenarios

---

## 🚀 Deployment Checklist

- [ ] All components implemented
- [ ] Styles match theme system
- [ ] Responsive on all breakpoints
- [ ] Performance optimized
- [ ] Accessibility tested
- [ ] Cross-browser tested
- [ ] SEO metadata added
- [ ] Analytics integrated
- [ ] Unit tests passing
- [ ] Code reviewed
- [ ] Documentation updated

---

## 📝 Future Enhancements

1. **Attraction Detail Pages:** Dedicated pages for each attraction
2. **Park Comparison:** Side-by-side park comparison tool
3. **Virtual Tours:** 360° images or videos of attractions
4. **Wait Times (if API available):** Live wait times integration
5. **Trip Planner:** Save favorite attractions, build itinerary
6. **Reviews & Ratings:** User reviews and ratings
7. **Weather Widget:** Current weather at park location
8. **AR Features:** AR preview of attractions
9. **Social Sharing:** Share favorite parks/attractions
10. **Multi-language:** i18n support for global parks

---

## 📚 Resources & References

- **Design Inspiration:**
  - https://disneyparks.disney.go.com/
  - https://www.disneyplus.com/
  - https://www.apple.com/ (product pages)
- **Libraries:**
  - Framer Motion: https://www.framer.com/motion/
  - Swiper: https://swiperjs.com/
  - Intersection Observer API
- **Existing Components to Reference:**
  - `CharacterCarousel`
  - `MovieCard`
  - `MoviesGridView`
  - `Navigation`

---

## 🎬 Conclusion

This plan provides a comprehensive roadmap for building an immersive, cinematic Parks & Attractions experience. The hybrid approach balances visual impact with usability, leverages existing patterns, and sets the foundation for future enhancements.

**Estimated Timeline:** 5-6 days for full implementation

**Next Steps:**

1. Review and approve design concept
2. Confirm technical approach
3. Begin Phase 1 implementation
4. Iterate based on feedback

---

**Document Status:** Ready for Review ✅  
**Ready to Implement:** Pending approval 🟡
