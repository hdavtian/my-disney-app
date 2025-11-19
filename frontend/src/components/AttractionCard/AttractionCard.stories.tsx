import type { Meta, StoryObj } from "@storybook/react";
import { AttractionCard } from "./AttractionCard";
import type { Attraction } from "../../types/Attraction";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "../../store/slices/favoritesSlice";

// Create a mock Redux store
const createMockStore = () => {
  return configureStore({
    reducer: {
      favorites: favoritesReducer,
    },
    preloadedState: {
      favorites: {
        items: [],
      },
    },
  });
};

// Mock attraction data
const mockAttraction: Attraction = {
  id: 1,
  url_id: "space-mountain",
  name: "Space Mountain",
  park_url_id: "magic-kingdom",
  land_area: "Tomorrowland",
  attraction_type: "Roller Coaster",
  thrill_level: "High",
  theme: "Space",
  short_description:
    "Blast off on a thrilling rocket ride through the darkest reaches of outer space!",
  is_operational: true,
  duration_minutes: 3,
  height_requirement_inches: 44,
  image_1: "space-mountain.webp",
};

const mockWaterAttraction: Attraction = {
  id: 2,
  url_id: "splash-mountain",
  name: "Splash Mountain",
  park_url_id: "magic-kingdom",
  land_area: "Frontierland",
  attraction_type: "Log Flume",
  thrill_level: "Medium",
  theme: "Adventure",
  short_description:
    "Zip-a-dee-doo-dah! Experience a musical adventure with thrills and spills.",
  is_operational: true,
  duration_minutes: 11,
  height_requirement_inches: 40,
  image_1: "splash-mountain.webp",
};

const mockDarkRide: Attraction = {
  id: 3,
  url_id: "haunted-mansion",
  name: "Haunted Mansion",
  park_url_id: "magic-kingdom",
  land_area: "Liberty Square",
  attraction_type: "Dark Ride",
  thrill_level: "Low",
  theme: "Spooky",
  short_description:
    "Welcome, foolish mortals, to the Haunted Mansion - home to 999 happy haunts!",
  is_operational: true,
  duration_minutes: 9,
  image_1: "haunted-mansion.webp",
};

const mockNoImageAttraction: Attraction = {
  id: 4,
  url_id: "tea-cups",
  name: "Mad Tea Party",
  park_url_id: "magic-kingdom",
  land_area: "Fantasyland",
  attraction_type: "Spinning Ride",
  thrill_level: "Low",
  is_operational: true,
  duration_minutes: 2,
};

const meta: Meta<typeof AttractionCard> = {
  title: "Components/Cards/AttractionCard",
  component: AttractionCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Displays a Disney park attraction card with image, name, land area, type, and favorite button. Supports overlay and external layouts.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Provider store={createMockStore()}>
        <Story />
      </Provider>
    ),
  ],
  argTypes: {
    attraction: {
      description: "Attraction data object",
      control: "object",
    },
    onClick: {
      action: "clicked",
      description: "Callback when card is clicked",
    },
    layout: {
      control: "radio",
      options: ["overlay", "external"],
      description: "Layout style for card content",
    },
    index: {
      control: "number",
      description: "Index for staggered animation",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default attraction card with overlay layout
 */
export const Default: Story = {
  args: {
    attraction: mockAttraction,
    layout: "overlay",
    index: 0,
  },
};

/**
 * External layout - content below the card image
 */
export const ExternalLayout: Story = {
  args: {
    attraction: mockAttraction,
    layout: "external",
    index: 0,
  },
};

/**
 * Water ride attraction
 */
export const WaterRide: Story = {
  args: {
    attraction: mockWaterAttraction,
    layout: "overlay",
  },
};

/**
 * Dark ride attraction
 */
export const DarkRide: Story = {
  args: {
    attraction: mockDarkRide,
    layout: "overlay",
  },
};

/**
 * Attraction without image (shows fallback)
 */
export const NoImage: Story = {
  args: {
    attraction: mockNoImageAttraction,
    layout: "overlay",
  },
};

/**
 * Multiple attraction cards in a grid
 */
export const MultipleCards: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        maxWidth: "900px",
      }}
    >
      <AttractionCard attraction={mockAttraction} index={0} />
      <AttractionCard attraction={mockWaterAttraction} index={1} />
      <AttractionCard attraction={mockDarkRide} index={2} />
    </div>
  ),
};

/**
 * Comparison of overlay vs external layouts
 */
export const LayoutComparison: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "40px",
        maxWidth: "700px",
      }}
    >
      <div>
        <h4 style={{ marginBottom: "10px", textAlign: "center" }}>
          Overlay Layout
        </h4>
        <AttractionCard attraction={mockAttraction} layout="overlay" />
      </div>
      <div>
        <h4 style={{ marginBottom: "10px", textAlign: "center" }}>
          External Layout
        </h4>
        <AttractionCard attraction={mockAttraction} layout="external" />
      </div>
    </div>
  ),
};
