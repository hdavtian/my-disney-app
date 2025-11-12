import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "./SearchInput";
import type { Character } from "../../types/Character";

// Mock character data for search
const mockCharacters: Character[] = [
  {
    id: "mickey-001",
    name: "Mickey Mouse",
    category: "hero",
    short_description: "The iconic Disney mascot",
  },
  {
    id: "minnie-002",
    name: "Minnie Mouse",
    category: "hero",
    short_description: "Mickey's girlfriend",
  },
  {
    id: "elsa-003",
    name: "Elsa",
    category: "princess",
    short_description: "Queen of Arendelle",
  },
  {
    id: "anna-004",
    name: "Anna",
    category: "princess",
    short_description: "Princess of Arendelle",
  },
  {
    id: "simba-005",
    name: "Simba",
    category: "hero",
    short_description: "Lion prince",
  },
  {
    id: "mal-006",
    name: "Maleficent",
    category: "villain",
    short_description: "Mistress of All Evil",
  },
];

const meta: Meta<typeof SearchInput<Character>> = {
  title: "Components/Inputs/SearchInput",
  component: SearchInput as any,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A search input component with autocomplete dropdown, keyboard navigation, and debounced search.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    items: {
      description: "Array of items to search through",
      control: "object",
    },
    onSearch: {
      action: "searched",
      description: "Callback fired when search results change",
    },
    searchFields: {
      description: 'Fields to search in (e.g., ["name", "short_description"])',
      control: "object",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text for the input",
    },
    minCharacters: {
      control: "number",
      description: "Minimum characters before search triggers",
    },
    getDisplayText: {
      description: "Function to get primary display text from item",
    },
    getSecondaryText: {
      description: "Function to get secondary display text from item",
    },
    onSelectItem: {
      action: "selected",
      description: "Callback when an item is selected from dropdown",
    },
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput<Character>>;

/**
 * Default search input with character data
 */
export const Default: Story = {
  args: {
    items: mockCharacters,
    searchFields: ["name", "short_description"],
    placeholder: "Search characters...",
    minCharacters: 2,
    getDisplayText: (char: Character) => char.name,
    getSecondaryText: (char: Character) => char.short_description || "",
  } as any,
};

/**
 * Search with longer placeholder
 */
export const LongPlaceholder: Story = {
  args: {
    items: mockCharacters,
    searchFields: ["name"],
    placeholder: "Search for your favorite Disney character...",
    minCharacters: 2,
    getDisplayText: (char: Character) => char.name,
  } as any,
};

/**
 * Search with lower minimum character requirement
 */
export const LowMinCharacters: Story = {
  args: {
    items: mockCharacters,
    searchFields: ["name"],
    placeholder: "Search (min 1 character)...",
    minCharacters: 1,
    getDisplayText: (char: Character) => char.name,
    getSecondaryText: (char: Character) => char.category,
  } as any,
};

/**
 * Search without secondary text
 */
export const WithoutSecondaryText: Story = {
  args: {
    items: mockCharacters,
    searchFields: ["name"],
    placeholder: "Search characters...",
    minCharacters: 2,
    getDisplayText: (char: Character) => char.name,
  } as any,
};

/**
 * Full width search in a container
 */
export const FullWidth: Story = {
  args: {
    items: mockCharacters,
    searchFields: ["name", "short_description"],
    placeholder: "Search...",
    minCharacters: 2,
    getDisplayText: (char: Character) => char.name,
    getSecondaryText: (char: Character) => char.short_description || "",
  } as any,
  decorators: [
    (Story) => (
      <div style={{ width: "500px" }}>
        <Story />
      </div>
    ),
  ],
};
