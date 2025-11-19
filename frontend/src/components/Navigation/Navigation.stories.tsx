import type { Meta, StoryObj } from "@storybook/react";
import { Navigation } from "./Navigation";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "../../store/slices/favoritesSlice";
import uiPreferencesReducer, {
  type ViewMode,
} from "../../store/slices/uiPreferencesSlice";
import themeReducer, { type ThemeOption } from "../../store/slices/themeSlice";
import type { FavoriteItem } from "../../hooks/useFavorites";

// Create a mock Redux store
const createMockStore = (initialFavorites: FavoriteItem[]) => {
  return configureStore({
    reducer: {
      favorites: favoritesReducer,
      uiPreferences: uiPreferencesReducer,
      theme: themeReducer,
    },
    preloadedState: {
      favorites: {
        items: initialFavorites,
      },
      uiPreferences: {
        movies: {
          viewMode: "grid" as ViewMode,
          gridItemsToShow: 20,
          searchQuery: "",
          gridColumns: 0,
          lastUpdated: Date.now(),
        },
        characters: {
          viewMode: "grid" as ViewMode,
          gridItemsToShow: 20,
          searchQuery: "",
          gridColumns: 0,
          lastUpdated: Date.now(),
        },
        favorites: {
          viewMode: "grid" as ViewMode,
          gridItemsToShow: 20,
          searchQuery: "",
          gridColumns: 0,
          filterType: "all" as const,
          lastUpdated: Date.now(),
        },
        parks: {
          searchQuery: "",
          searchMode: "current" as const,
          lastUpdated: Date.now(),
        },
        theme: "light" as const,
      },
      theme: {
        selectedTheme: "auto" as ThemeOption,
        appliedTheme: "theme-light" as Exclude<ThemeOption, "auto">,
        availableThemes: [
          {
            id: "theme-light" as ThemeOption,
            name: "Light",
            description: "Clean light theme",
            preview: {
              background: "#ffffff",
              text: "#0f172a",
              accent: "#006bb3",
            },
          },
        ],
      },
    },
  });
};

const meta: Meta<typeof Navigation> = {
  title: "Components/Navigation/Navigation",
  component: Navigation,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Main navigation bar with desktop and mobile responsive layouts. Includes favorites counter badge.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default navigation (desktop view, no favorites)
 */
export const Default: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore([])}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </Provider>
    ),
  ],
};

/**
 * Navigation with favorites count badge
 */
export const WithFavorites: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore([
          { id: "mickey-001", type: "character", addedAt: Date.now() },
          { id: "frozen-2013", type: "movie", addedAt: Date.now() },
          { id: "elsa-002", type: "character", addedAt: Date.now() },
        ])}
      >
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </Provider>
    ),
  ],
};

/**
 * Mobile viewport (320px width)
 */
export const MobileView: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore([])}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </Provider>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

/**
 * Tablet viewport (768px width)
 */
export const TabletView: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore([])}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </Provider>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};
