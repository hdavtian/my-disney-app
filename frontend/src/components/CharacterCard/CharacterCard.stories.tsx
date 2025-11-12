import type { Meta, StoryObj } from "@storybook/react";
import { CharacterCard } from "./CharacterCard";
import type { Character } from "../../types/Character";
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

// Mock character data
const mockCharacter: Character = {
  id: "mickey-001",
  name: "Mickey Mouse",
  category: "hero",
  profile_image1: "https://picsum.photos/seed/mickey/400/400",
  short_description: "The iconic Disney mascot and lovable character.",
  first_appearance: "Steamboat Willie (1928)",
  franchise: "Mickey Mouse & Friends",
};

const mockPrincess: Character = {
  id: "elsa-001",
  name: "Elsa",
  category: "princess",
  profile_image1: "https://picsum.photos/seed/elsa/400/400",
  short_description: "Queen of Arendelle with magical ice powers.",
  first_appearance: "Frozen (2013)",
  franchise: "Frozen",
};

const mockVillain: Character = {
  id: "maleficent-001",
  name: "Maleficent",
  category: "villain",
  profile_image1: "https://picsum.photos/seed/maleficent/400/400",
  short_description: "The Mistress of All Evil.",
  first_appearance: "Sleeping Beauty (1959)",
  franchise: "Sleeping Beauty",
};

const meta: Meta<typeof CharacterCard> = {
  title: "Components/Cards/CharacterCard",
  component: CharacterCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Displays a Disney character card with image, name, category badge, and favorite button. Supports multiple sizes and quiz mode.",
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
    character: {
      description: "Character data object",
      control: "object",
    },
    onClick: {
      action: "clicked",
      description: "Callback when card is clicked",
    },
    showTitle: {
      control: "boolean",
      description: "Show or hide character name",
    },
    enableFavoriting: {
      control: "boolean",
      description: "Enable or disable favorite button",
    },
    disableNavigation: {
      control: "boolean",
      description: "Disable navigation (for quiz mode)",
    },
    size: {
      control: "radio",
      options: ["normal", "large"],
      description: "Card size variant",
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
 * Default character card with all features enabled
 */
export const Default: Story = {
  args: {
    character: mockCharacter,
    showTitle: true,
    enableFavoriting: true,
    disableNavigation: false,
    size: "normal",
    index: 0,
  },
};

/**
 * Large size variant of the character card
 */
export const LargeSize: Story = {
  args: {
    character: mockCharacter,
    size: "large",
    showTitle: true,
    enableFavoriting: true,
  },
};

/**
 * Character card without image (shows fallback)
 */
export const NoImage: Story = {
  args: {
    character: {
      ...mockCharacter,
      profile_image1: undefined,
      imageUrl: undefined,
    },
    showTitle: true,
    enableFavoriting: true,
  },
};

/**
 * Quiz mode - no title, no favoriting, navigation disabled
 */
export const QuizMode: Story = {
  args: {
    character: mockCharacter,
    showTitle: false,
    enableFavoriting: false,
    disableNavigation: true,
  },
};

/**
 * Princess category character
 */
export const Princess: Story = {
  args: {
    character: mockPrincess,
    showTitle: true,
    enableFavoriting: true,
  },
};

/**
 * Villain category character
 */
export const Villain: Story = {
  args: {
    character: mockVillain,
    showTitle: true,
    enableFavoriting: true,
  },
};

/**
 * Multiple cards in a grid (shows staggered animation)
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
      <CharacterCard character={mockCharacter} index={0} />
      <CharacterCard character={mockPrincess} index={1} />
      <CharacterCard character={mockVillain} index={2} />
    </div>
  ),
};
