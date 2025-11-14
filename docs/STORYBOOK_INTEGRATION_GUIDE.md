# 📚 Storybook Integration Guide - Disney App

**Status:** Draft - Requirements Review  
**Created:** November 12, 2025  
**Project:** Disney App Frontend  
**Framework:** React 18 + Vite + TypeScript

---

## 📖 Table of Contents

1. [What is Storybook?](#what-is-storybook)
2. [Benefits for Disney App](#benefits-for-disney-app)
3. [Architecture Overview](#architecture-overview)
4. [Scope & Coverage](#scope--coverage)
5. [Installation & Setup](#installation--setup)
6. [Component Stories Strategy](#component-stories-strategy)
7. [Integration with Existing Stack](#integration-with-existing-stack)
8. [File Structure](#file-structure)
9. [Development Workflow](#development-workflow)
10. [Addons & Features](#addons--features)
11. [Deployment Strategy](#deployment-strategy)
12. [Timeline & Milestones](#timeline--milestones)
13. [Open Questions & Decisions](#open-questions--decisions)

---

## 🎯 What is Storybook?

### Analogy: Swagger for Frontend

**Yes, you're correct!** Storybook is to UI components what Swagger/OpenAPI is to REST APIs:

| **Swagger/OpenAPI**            | **Storybook**                 |
| ------------------------------ | ----------------------------- |
| Documents REST endpoints       | Documents UI components       |
| Interactive API testing        | Interactive component testing |
| Shows request/response schemas | Shows props/states            |
| Try API calls in browser       | Try components in isolation   |
| API documentation site         | Component library site        |

### What Storybook Provides

1. **Component Catalog** - Browse all React components in one place
2. **Interactive Playground** - Change props via UI controls in real-time
3. **Visual Documentation** - Add MDX/markdown docs alongside components
4. **Isolated Development** - Build components without running full app
5. **Visual Testing** - Catch UI regressions before deployment
6. **Design System Hub** - Living style guide for team collaboration
7. **Accessibility Checks** - Built-in a11y testing addon

### How It Works

```tsx
// CharacterCard.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { CharacterCard } from "./CharacterCard";

const meta: Meta<typeof CharacterCard> = {
  title: "Components/CharacterCard",
  component: CharacterCard,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ✨ Each "story" is a component state you can view/interact with
export const Default: Story = {
  args: {
    character: {
      id: "1",
      name: "Mickey Mouse",
      category: "Classic",
      profile_image1: "mickey.jpg",
    },
  },
};

export const WithoutImage: Story = {
  args: {
    character: {
      id: "2",
      name: "Donald Duck",
      category: "Classic",
      // No image - tests fallback
    },
  },
};
```

**Result:** You'll see a UI with:

- Left sidebar: All components organized by category
- Main area: Live component preview
- Bottom panel: Controls to change props dynamically
- Tabs: Docs, Actions, Accessibility checks

---

## 🎨 Benefits for Disney App

### For Development

- ✅ **Isolated Component Development** - Build `CharacterCard` without running backend
- ✅ **Faster Iteration** - Change props via UI controls, no code changes needed
- ✅ **Visual Regression Detection** - Catch styling bugs before production
- ✅ **Component API Documentation** - Auto-generated from TypeScript props
- ✅ **Reusability** - Ensures components work in different contexts

### For Team Collaboration

- ✅ **Design Review** - Designers can see all components without technical setup
- ✅ **QA Testing** - Test edge cases easily (loading states, errors, empty data)
- ✅ **Onboarding** - New developers see component library instantly
- ✅ **Component Discovery** - Avoid rebuilding existing components

### For Quality

- ✅ **Accessibility Testing** - Built-in a11y checks for ARIA, contrast, etc.
- ✅ **Responsive Testing** - View components at different viewport sizes
- ✅ **Browser Testing** - Test across Chrome, Firefox, Safari
- ✅ **Documentation Enforcement** - Forces you to document component usage

---

## 🏗️ Architecture Overview

### Tech Stack Integration

```
┌─────────────────────────────────────────────────────────────┐
│                     DISNEY APP FRONTEND                      │
├─────────────────────────────────────────────────────────────┤
│  React 18 + Vite + TypeScript + SCSS + Redux Toolkit        │
│  ├── Components (18+)                                        │
│  ├── Pages                                                   │
│  ├── Hooks                                                   │
│  └── Store (Redux slices)                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ + Storybook Layer
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        STORYBOOK                             │
├─────────────────────────────────────────────────────────────┤
│  • Runs on separate port (6006)                             │
│  • Imports your components                                  │
│  • No backend dependency                                    │
│  • Mock data for stories                                    │
│  • Preserves your SCSS styles                               │
│  • Works with Framer Motion animations                      │
└─────────────────────────────────────────────────────────────┘
```

### How It Fits Your Current Setup

| **Your Stack**     | **Storybook Integration**                    |
| ------------------ | -------------------------------------------- |
| **Vite**           | Native Vite support (uses `@storybook/vite`) |
| **React 18**       | Full React 18 support with hooks             |
| **TypeScript**     | Auto-generates prop docs from types          |
| **SCSS/Bootstrap** | Import your existing styles                  |
| **Framer Motion**  | Animations work in stories                   |
| **Redux Toolkit**  | Mock Redux store for stories                 |
| **DevExtreme**     | Stories for DataGrid configs                 |

---

## 📦 Scope & Coverage

### Phase 1: Core Components (Recommended Start)

**Goal:** Document reusable UI components

Components to include:

1. ✅ **CharacterCard** - With/without image, loading states, favorited
2. ✅ **MovieCard** - Different ratings, years, image variants
3. ✅ **FavoriteButton** - All states (favorited/unfavorited, loading)
4. ✅ **SearchInput** - Empty, with value, loading, error states
5. ✅ **Navigation** - Desktop/mobile views, active states
6. ✅ **Footer** - Light theme variant
7. ✅ **ViewModeToggle** - Grid/List modes

**Why start here?**

- These are pure presentational components
- Minimal Redux dependencies
- High reusability
- Easy to document

### Phase 2: Complex Components

8. ✅ **HeroCarousel** - With Swiper integration
9. ✅ **CharacterCarousel** - Horizontal scroll variants
10. ✅ **MovieCarousel** - Different content types
11. ✅ **RecentlyViewed** - Various item counts
12. ✅ **AccessGate** - Gated content variants

### Phase 3: Connected Components

13. ✅ **CharactersGridView** - With mock Redux store
14. ✅ **MoviesGridView** - With DevExtreme DataGrid
15. ✅ **CharactersListView** - List layout variants
16. ✅ **MoviesListView** - List layout variants

### Phase 4: Interactive Components

17. ✅ **CharacterQuiz** - Full quiz flow with mock data
18. ✅ **HomePage** - Complete homepage composition

### Out of Scope (Initially)

- ❌ Full pages (handled separately)
- ❌ Pages with complex routing logic
- ❌ Backend API integration (use mocks)
- ❌ Redux store configuration (mock state)

---

## 🚀 Installation & Setup

### 1. Install Storybook

```powershell
# Navigate to frontend directory
cd c:\sites\my-disney-app\frontend

# Initialize Storybook (auto-detects Vite + React)
npx storybook@latest init
```

**What this does:**

- Installs Storybook dependencies
- Configures `.storybook/` directory
- Adds example stories
- Updates `package.json` with scripts
- Creates `vite.config.ts` integration

### 2. Install Recommended Addons

```powershell
npm install --save-dev @storybook/addon-a11y
npm install --save-dev @storybook/addon-viewport
npm install --save-dev @storybook/addon-interactions
npm install --save-dev storybook-addon-redux
```

**Addons Explained:**

- **a11y** - Accessibility testing (ARIA, contrast, keyboard nav)
- **viewport** - Responsive testing (mobile/tablet/desktop)
- **interactions** - Test user interactions in stories
- **redux** - Mock Redux store for connected components

### 3. Package.json Updates

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "devDependencies": {
    "@storybook/react": "^10.x",
    "@storybook/react-vite": "^10.x",
    "@storybook/addon-essentials": "^10.x",
    "@storybook/addon-a11y": "^10.x",
    "@storybook/addon-viewport": "^10.x",
    "@storybook/addon-interactions": "^10.x",
    "storybook": "^10.x",
    "storybook-addon-redux": "^2.x",
    "vite": "^7.2.2",
    "sass": "^1.94.0"
  }
}
```

---

## 📝 Component Stories Strategy

### Story Naming Convention

```
frontend/src/components/
  CharacterCard/
    ├── CharacterCard.tsx          # Component
    ├── CharacterCard.scss         # Styles
    ├── CharacterCard.stories.tsx  # ⭐ Storybook stories
    ├── CharacterCard.test.tsx     # (Future) Unit tests
    └── index.ts                   # Exports
```

### Story Template

```tsx
// CharacterCard.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { CharacterCard } from "./CharacterCard";
import type { Character } from "../../types/Character";

// ===========================
// Meta Configuration
// ===========================
const meta: Meta<typeof CharacterCard> = {
  title: "Components/Cards/CharacterCard",
  component: CharacterCard,
  parameters: {
    layout: "centered", // Center in canvas
    docs: {
      description: {
        component:
          "Displays a Disney character with image, name, category badge, and favorite button.",
      },
    },
  },
  tags: ["autodocs"], // Auto-generate documentation
  argTypes: {
    character: {
      description: "Character data object",
      control: "object",
    },
    onClick: { action: "clicked" }, // Logs clicks in Actions panel
    showTitle: {
      control: "boolean",
      description: "Show/hide character name",
    },
    enableFavoriting: {
      control: "boolean",
      description: "Enable favorite button",
    },
    size: {
      control: "radio",
      options: ["normal", "large"],
      description: "Card size variant",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ===========================
// Mock Data
// ===========================
const mockCharacter: Character = {
  id: "mickey-001",
  name: "Mickey Mouse",
  category: "Classic",
  profile_image1: "mickey-mouse.jpg",
  description: "The iconic Disney mascot",
  first_appearance: "Steamboat Willie (1928)",
};

// ===========================
// Stories (Component States)
// ===========================

// Default state
export const Default: Story = {
  args: {
    character: mockCharacter,
    showTitle: true,
    enableFavoriting: true,
    size: "normal",
  },
};

// Large size variant
export const LargeSize: Story = {
  args: {
    character: mockCharacter,
    size: "large",
  },
};

// Without image (fallback)
export const NoImage: Story = {
  args: {
    character: {
      ...mockCharacter,
      profile_image1: undefined,
      imageUrl: undefined,
    },
  },
};

// Quiz mode (no title, no favoriting)
export const QuizMode: Story = {
  args: {
    character: mockCharacter,
    showTitle: false,
    enableFavoriting: false,
    disableNavigation: true,
  },
};

// Loading skeleton (simulate loading)
export const Loading: Story = {
  render: () => (
    <div className="character-card">
      <div className="character-card__skeleton">
        <div className="skeleton skeleton--image"></div>
      </div>
      <div className="skeleton skeleton--title"></div>
    </div>
  ),
};
```

### Stories for Different Component Types

#### 1. Simple Presentational Component

```tsx
// FavoriteButton.stories.tsx
export const Unfavorited: Story = {
  args: { id: "1", type: "character" },
};

export const Favorited: Story = {
  args: { id: "1", type: "character" },
  play: async ({ canvasElement }) => {
    // Simulate clicking favorite
    const button = canvasElement.querySelector("button");
    await userEvent.click(button);
  },
};
```

#### 2. Component with Redux

```tsx
// CharactersGridView.stories.tsx
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "../../store/slices/favoritesSlice";

// Create mock store
const mockStore = configureStore({
  reducer: {
    favorites: favoritesReducer,
  },
  preloadedState: {
    favorites: {
      characters: ["mickey-001", "donald-002"],
      movies: [],
    },
  },
});

const meta: Meta<typeof CharactersGridView> = {
  title: "Components/Views/CharactersGridView",
  component: CharactersGridView,
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
};
```

#### 3. Component with Framer Motion

```tsx
// HeroCarousel.stories.tsx
const meta: Meta<typeof HeroCarousel> = {
  title: "Components/Carousels/HeroCarousel",
  component: HeroCarousel,
  parameters: {
    layout: "fullscreen", // Full width for carousel
    // Reduce motion in stories for accessibility
    viewport: {
      defaultViewport: "responsive",
    },
  },
};
```

#### 4. Interactive Component

```tsx
// CharacterQuiz.stories.tsx
export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click an answer
    const answerButton = canvas.getByRole("button", { name: /Mickey Mouse/i });
    await userEvent.click(answerButton);

    // Check if correct feedback shown
    await expect(canvas.getByText(/Correct!/i)).toBeInTheDocument();
  },
};
```

---

## 🔧 Integration with Existing Stack

### 1. SCSS Styles

**Your current setup:**

```scss
// main.scss imports
@import "base";
@import "variables";
@import "components";
```

**Storybook config:**

```ts
// .storybook/preview.ts
import "../src/styles/main.scss"; // ✅ Import your global styles
import "bootstrap/dist/css/bootstrap.min.css";

export const parameters = {
  // ... other config
};
```

### 2. Redux Store

**Strategy:** Create mock stores per story

```tsx
// stories/decorators/ReduxDecorator.tsx
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

export const withRedux = (storyFn, context) => {
  const store = configureStore({
    reducer: {
      /* your reducers */
    },
    preloadedState: context.parameters.reduxState || {},
  });

  return <Provider store={store}>{storyFn()}</Provider>;
};
```

### 3. React Router

**Strategy:** Mock router context

```tsx
// stories/decorators/RouterDecorator.tsx
import { BrowserRouter } from "react-router-dom";

export const withRouter = (Story) => (
  <BrowserRouter>
    <Story />
  </BrowserRouter>
);
```

### 4. DevExtreme DataGrid

**Strategy:** Include DevExtreme styles + mock data

```tsx
// CharactersGridView.stories.tsx
import "devextreme/dist/css/dx.light.css";

export const Default: Story = {
  args: {
    characters: mockCharactersArray, // Use your test data
  },
};
```

### 5. API Mocking

**Strategy:** Mock Service Worker (MSW)

```powershell
npm install --save-dev msw msw-storybook-addon
```

```ts
// .storybook/preview.ts
import { initialize, mswLoader } from "msw-storybook-addon";

initialize(); // Initialize MSW

export const loaders = [mswLoader];
```

---

## 📁 File Structure

### After Integration

```
frontend/
├── .storybook/                    # ⭐ Storybook config
│   ├── main.ts                    # Storybook config
│   ├── preview.ts                 # Global decorators/parameters
│   └── manager.ts                 # UI customization
│
├── src/
│   ├── components/
│   │   ├── CharacterCard/
│   │   │   ├── CharacterCard.tsx
│   │   │   ├── CharacterCard.scss
│   │   │   ├── CharacterCard.stories.tsx  # ⭐ Stories
│   │   │   └── index.ts
│   │   │
│   │   ├── MovieCard/
│   │   │   ├── MovieCard.tsx
│   │   │   ├── MovieCard.scss
│   │   │   ├── MovieCard.stories.tsx      # ⭐ Stories
│   │   │   └── index.ts
│   │   │
│   │   └── ... (all components)
│   │
│   ├── stories/                   # ⭐ Shared story utilities
│   │   ├── decorators/            # Redux, Router decorators
│   │   ├── mocks/                 # Mock data for stories
│   │   ├── Introduction.mdx       # Storybook homepage
│   │   └── DesignSystem.mdx       # Design tokens docs
│   │
│   └── ... (rest of your app)
│
├── storybook-static/              # ⭐ Built Storybook (gitignored)
└── package.json
```

---

## 🔄 Development Workflow

### Day-to-Day Usage

#### 1. Building New Component

```powershell
# Terminal 1: Run your app
npm run dev

# Terminal 2: Run Storybook
npm run storybook
```

**Workflow:**

1. Create component in `src/components/MyComponent/`
2. Create story `MyComponent.stories.tsx`
3. View in Storybook at `http://localhost:6006`
4. Iterate on component using Storybook controls
5. Once satisfied, integrate into app

#### 2. Updating Existing Component

1. Open Storybook
2. Navigate to component
3. Use controls to test edge cases
4. Update component code
5. Hot reload shows changes instantly

#### 3. Code Review Process

1. Developer creates PR with component changes
2. Reviewer opens Storybook locally
3. Visually verify all stories still work
4. Check accessibility panel for issues
5. Approve/request changes

---

## 🎨 Addons & Features

### Essential Addons (Included)

#### 1. Controls

- **What:** Dynamically edit component props via UI
- **Example:** Change `CharacterCard` size from "normal" to "large"

#### 2. Actions

- **What:** Log events (clicks, hovers, etc.)
- **Example:** See when user clicks `onClick` handler

#### 3. Docs

- **What:** Auto-generated documentation from TypeScript
- **Example:** Prop table shows all `CharacterCardProps`

#### 4. Viewport

- **What:** Test responsive breakpoints
- **Example:** View `Navigation` at mobile (375px) vs desktop (1920px)

#### 5. Backgrounds

- **What:** Change canvas background color
- **Example:** Test light cards on dark background

### Recommended Addons

#### 6. Accessibility (a11y)

```powershell
npm install --save-dev @storybook/addon-a11y
```

**Features:**

- ✅ Color contrast checker
- ✅ ARIA attribute validator
- ✅ Keyboard navigation tester
- ✅ Screen reader hints

**Usage:**

```tsx
// .storybook/main.ts
export default {
  addons: [
    "@storybook/addon-a11y", // ⭐ Add this
  ],
};
```

#### 7. Interactions

```powershell
npm install --save-dev @storybook/addon-interactions
npm install --save-dev @storybook/test
```

**Features:**

- ✅ Simulate user clicks/typing
- ✅ Test component behavior
- ✅ Visual regression testing

**Usage:**

```tsx
import { userEvent, within } from "@storybook/test";

export const UserInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);
  },
};
```

### Optional Addons (Future)

- **Figma Plugin** - Link Figma designs to components
- **Chromatic** - Visual regression testing service
- **Storybook Deployer** - One-click deployment

---

## 🚀 Deployment Strategy

### Option 1: Azure Static Web App (Recommended)

**Why:** Matches your current frontend deployment

```powershell
# Build Storybook
cd frontend
npm run build-storybook

# Output: storybook-static/
# Deploy alongside main app
```

**Subdomain Setup:**

- Main app: `disneyapp.azurestaticapps.net`
- Storybook: `storybook.disneyapp.azurestaticapps.net`

**Configuration:**

```json
// staticwebapp.config.json
{
  "routes": [
    {
      "route": "/storybook/*",
      "rewrite": "/storybook-static/*"
    }
  ]
}
```

### Option 2: GitHub Pages

**Why:** Free, simple, public documentation

```powershell
npm install --save-dev @storybook/storybook-deployer

# Add script
"deploy-storybook": "storybook-to-ghpages"
```

**URL:** `https://hdavtian.github.io/my-disney-app-storybook/`

### Option 3: Chromatic (Recommended for Teams)

**Why:** Professional solution with visual testing

```powershell
npm install --save-dev chromatic

# Deploy
npx chromatic --project-token=<token>
```

**Features:**

- ✅ Visual regression testing
- ✅ Automatic PR comments
- ✅ Component library hosting
- ✅ Free tier available

---

## 📅 Timeline & Milestones

### Phase 1: Setup & Foundation (Week 1)

**Goal:** Get Storybook running

- [ ] Install Storybook with Vite integration
- [ ] Configure `.storybook/` directory
- [ ] Import global SCSS styles
- [ ] Create Introduction.mdx homepage
- [ ] Document design tokens (colors, spacing, typography)
- [ ] **Deliverable:** Running Storybook at `localhost:6006`

**Estimated Time:** 4-6 hours

---

### Phase 2: Core Components (Week 2)

**Goal:** Document primary UI components

- [ ] `CharacterCard.stories.tsx` (5-7 stories)
- [ ] `MovieCard.stories.tsx` (4-6 stories)
- [ ] `FavoriteButton.stories.tsx` (3 stories)
- [ ] `SearchInput.stories.tsx` (4 stories)
- [ ] `Navigation.stories.tsx` (2-3 stories)
- [ ] `Footer.stories.tsx` (1 story)
- [ ] `ViewModeToggle.stories.tsx` (2 stories)
- [ ] **Deliverable:** 7 components documented

**Estimated Time:** 8-12 hours

---

### Phase 3: Complex Components (Week 3)

**Goal:** Add carousel and interactive components

- [ ] `HeroCarousel.stories.tsx` (3 stories)
- [ ] `CharacterCarousel.stories.tsx` (2 stories)
- [ ] `MovieCarousel.stories.tsx` (2 stories)
- [ ] `RecentlyViewed.stories.tsx` (3 stories)
- [ ] `AccessGate.stories.tsx` (2 stories)
- [ ] **Deliverable:** 12 total components

**Estimated Time:** 6-8 hours

---

### Phase 4: Redux Integration (Week 4)

**Goal:** Add connected components with mock store

- [ ] Create Redux decorator
- [ ] Mock favorites slice
- [ ] `CharactersGridView.stories.tsx`
- [ ] `MoviesGridView.stories.tsx`
- [ ] `CharactersListView.stories.tsx`
- [ ] `MoviesListView.stories.tsx`
- [ ] **Deliverable:** 16 total components

**Estimated Time:** 8-10 hours

---

### Phase 5: Polish & Deploy (Week 5)

**Goal:** Production-ready documentation

- [ ] Add MDX documentation pages
- [ ] Configure accessibility addon
- [ ] Add interaction tests for quiz
- [ ] Build and test production bundle
- [ ] Deploy to Azure/GitHub Pages
- [ ] **Deliverable:** Public Storybook URL

**Estimated Time:** 4-6 hours

---

### **Total Estimated Time:** 30-42 hours (1-2 weeks of focused work)

---

## ❓ Open Questions & Decisions

### Questions for Stakeholder Approval

#### 1. Scope of Components

- **Question:** Should we include ALL 18 components or prioritize?
- **Recommendation:** Start with Phase 1-2 (core components), expand later
- **Decision:** [ ] All components [ ] Phased approach

#### 2. Deployment Location

- **Question:** Where should Storybook be hosted?
- **Options:**
  - [ ] Azure Static Web App (subdomain)
  - [ ] GitHub Pages (free, public)
  - [ ] Chromatic (professional, paid)
- **Decision:** **\*\***\_**\*\***

#### 3. Team Access

- **Question:** Should Storybook be public or private?
- **Considerations:**
  - Public: Good for portfolio, open-source
  - Private: Protects proprietary designs
- **Decision:** [ ] Public [ ] Private

#### 4. Redux Mocking Strategy

- **Question:** How detailed should Redux mocks be?
- **Options:**
  - [ ] Minimal (just structure)
  - [ ] Realistic (actual data)
- **Decision:** **\*\***\_**\*\***

#### 5. Story Coverage

- **Question:** How many stories per component?
- **Recommendation:** 3-7 stories covering:
  - Default state
  - Edge cases (no data, error)
  - Variants (sizes, themes)
- **Decision:** [ ] Comprehensive [ ] Minimal

#### 6. CI/CD Integration

- **Question:** Auto-build Storybook on PR?
- **Options:**
  - [ ] Yes - builds on every commit
  - [ ] No - manual builds only
- **Decision:** **\*\***\_**\*\***

#### 7. Visual Regression Testing

- **Question:** Implement Chromatic for screenshot diffs?
- **Cost:** Free tier: 5,000 snapshots/month
- **Decision:** [ ] Yes [ ] No [ ] Later

#### 8. DevExtreme Stories

- **Question:** Include DataGrid configuration stories?
- **Note:** Helpful for documenting column configs
- **Decision:** [ ] Yes [ ] No

---

## 🎓 Learning Resources

### Official Documentation

- **Storybook Docs:** https://storybook.js.org/docs/react/get-started/introduction
- **Vite Integration:** https://storybook.js.org/docs/react/builders/vite
- **TypeScript Guide:** https://storybook.js.org/docs/react/configure/typescript

### Video Tutorials

- **Storybook Crash Course (2024):** https://www.youtube.com/watch?v=BySFuXgG-ow
- **React + TypeScript + Storybook:** https://www.youtube.com/watch?v=p2sZKAPOQXs

### Example Repos

- **Storybook Design System:** https://github.com/storybookjs/design-system
- **Material-UI Storybook:** https://github.com/mui/material-ui/tree/master/docs/src

---

## ✅ Next Steps (Pending Approval)

### If Approved:

1. **Review this document** - Add comments/questions
2. **Answer open questions** - Make decisions on scope/deployment
3. **Schedule kickoff** - 30-minute planning session
4. **Install Storybook** - Run `npx storybook@latest init`
5. **Create first story** - Start with `CharacterCard`
6. **Iterate and expand** - Follow phased timeline

### If Changes Needed:

- **Provide feedback** - What's unclear or needs adjustment?
- **Adjust scope** - Too ambitious? Too limited?
- **Budget concerns** - Time/resource constraints?

---

## 📝 Approval Checklist

- [ ] **Understood:** Storybook concept and benefits clear
- [ ] **Scope Agreed:** Component coverage defined
- [ ] **Timeline Approved:** Development schedule acceptable
- [ ] **Deployment Plan:** Hosting strategy decided
- [ ] **Questions Answered:** All open questions resolved
- [ ] **Ready to Proceed:** Green light to install and build

---

**Prepared by:** GitHub Copilot  
**Review Date:** **\*\***\_**\*\***  
**Approved by:** **\*\***\_**\*\***  
**Start Date:** **\*\***\_**\*\***

---

## 🚦 Status Updates

| Date               | Update                 | Status            |
| ------------------ | ---------------------- | ----------------- |
| Nov 12, 2025       | Document created       | ⏳ Pending Review |
| \***\*\_\_\_\*\*** | Requirements finalized | ⏸️ Not Started    |
| \***\*\_\_\_\*\*** | Installation complete  | ⏸️ Not Started    |
| \***\*\_\_\_\*\*** | First story deployed   | ⏸️ Not Started    |

---

**End of Document**
