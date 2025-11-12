import type { Meta, StoryObj } from "@storybook/react";
import { FavoriteButton } from "./FavoriteButton";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "../../store/slices/favoritesSlice";
import type { FavoriteItem } from "../../hooks/useFavorites";

// Create a mock Redux store for stories
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

const meta: Meta<typeof FavoriteButton> = {
  title: "Components/Buttons/FavoriteButton",
  component: FavoriteButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A heart-shaped button to add/remove items from favorites. Changes color and fill when active.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Provider store={createMockStore([])}>
        <div
          style={{
            padding: "20px",
            background: "#f0f0f0",
            borderRadius: "8px",
          }}
        >
          <Story />
        </div>
      </Provider>
    ),
  ],
  argTypes: {
    id: {
      description: "ID of the character or movie",
      control: "text",
    },
    type: {
      control: "radio",
      options: ["character", "movie"],
      description: "Type of item (character or movie)",
    },
    size: {
      control: "number",
      description: "Size of the icon in pixels",
    },
    ariaLabel: {
      control: "text",
      description: "Accessibility label for the button",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default unfavorited state for a character
 */
export const UnfavoritedCharacter: Story = {
  args: {
    id: "mickey-001",
    type: "character",
    size: 24,
  },
};

/**
 * Favorited state for a character (pre-filled heart)
 */
export const FavoritedCharacter: Story = {
  args: {
    id: "elsa-001",
    type: "character",
    size: 24,
  },
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore([
          { id: "elsa-001", type: "character", addedAt: Date.now() },
        ])}
      >
        <div
          style={{
            padding: "20px",
            background: "#f0f0f0",
            borderRadius: "8px",
          }}
        >
          <Story />
        </div>
      </Provider>
    ),
  ],
};

/**
 * Unfavorited state for a movie
 */
export const UnfavoritedMovie: Story = {
  args: {
    id: "frozen-2013",
    type: "movie",
    size: 24,
  },
};

/**
 * Favorited state for a movie (pre-filled heart)
 */
export const FavoritedMovie: Story = {
  args: {
    id: "lion-king-1994",
    type: "movie",
    size: 24,
  },
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore([
          { id: "lion-king-1994", type: "movie", addedAt: Date.now() },
        ])}
      >
        <div
          style={{
            padding: "20px",
            background: "#f0f0f0",
            borderRadius: "8px",
          }}
        >
          <Story />
        </div>
      </Provider>
    ),
  ],
};

/**
 * Large size variant
 */
export const LargeSize: Story = {
  args: {
    id: "mickey-001",
    type: "character",
    size: 48,
  },
};

/**
 * Small size variant
 */
export const SmallSize: Story = {
  args: {
    id: "mickey-001",
    type: "character",
    size: 16,
  },
};

/**
 * Multiple buttons showing different states
 */
export const MultipleStates: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <FavoriteButton id="item-1" type="character" size={24} />
        <div style={{ marginTop: "8px", fontSize: "12px" }}>Unfavorited</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <Provider
          store={createMockStore([
            { id: "item-2", type: "character", addedAt: Date.now() },
          ])}
        >
          <FavoriteButton id="item-2" type="character" size={24} />
        </Provider>
        <div style={{ marginTop: "8px", fontSize: "12px" }}>Favorited</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <FavoriteButton id="item-3" type="character" size={48} />
        <div style={{ marginTop: "8px", fontSize: "12px" }}>Large</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <FavoriteButton id="item-4" type="character" size={16} />
        <div style={{ marginTop: "8px", fontSize: "12px" }}>Small</div>
      </div>
    </div>
  ),
};
