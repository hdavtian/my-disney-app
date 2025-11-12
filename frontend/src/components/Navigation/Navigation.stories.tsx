import type { Meta, StoryObj } from "@storybook/react";
import { Navigation } from "./Navigation";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "../../store/slices/favoritesSlice";
import type { FavoriteItem } from "../../hooks/useFavorites";

// Create a mock Redux store
const createMockStore = (initialFavorites: FavoriteItem[]) => {
  return configureStore({
    reducer: {
      favorites: favoritesReducer,
    },
    preloadedState: {
      favorites: {
        items: initialFavorites,
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

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default navigation (desktop view, no favorites)
 */
export const Default: Story = {};

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
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Mobile viewport (320px width)
 */
export const MobileView: Story = {
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
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};
