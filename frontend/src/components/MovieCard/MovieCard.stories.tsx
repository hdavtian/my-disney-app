import type { Meta, StoryObj } from "@storybook/react";
import { MovieCard } from "./MovieCard";
import type { Movie } from "../../types/Movie";
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

// Mock movie data
const mockMovie: Movie = {
  id: "frozen-2013",
  title: "Frozen",
  posterUrl: "https://picsum.photos/seed/frozen/400/600",
  releaseYear: 2013,
  rating: "PG",
  genre: ["Animation", "Adventure", "Comedy"],
  director: "Chris Buck, Jennifer Lee",
  duration: 102,
  short_description:
    "When the newly-crowned Queen Elsa accidentally uses her power to turn things into ice...",
};

const mockClassicMovie: Movie = {
  id: "lion-king-1994",
  title: "The Lion King",
  posterUrl: "https://picsum.photos/seed/lionking/400/600",
  releaseYear: 1994,
  rating: "G",
  genre: ["Animation", "Adventure", "Drama"],
  director: "Roger Allers, Rob Minkoff",
  duration: 88,
  short_description:
    "Lion prince Simba and his father are targeted by his bitter uncle...",
};

const mockRecentMovie: Movie = {
  id: "encanto-2021",
  title: "Encanto",
  posterUrl: "https://picsum.photos/seed/encanto/400/600",
  releaseYear: 2021,
  rating: "PG",
  genre: ["Animation", "Comedy", "Fantasy"],
  director: "Jared Bush, Byron Howard",
  duration: 102,
  short_description:
    "A young Colombian girl has to face the frustration of being the only member of her family without magical powers.",
};

const mockOldMovie: Movie = {
  id: "snow-white-1937",
  title: "Snow White and the Seven Dwarfs",
  posterUrl: "https://picsum.photos/seed/snowwhite/400/600",
  releaseYear: 1937,
  rating: "G",
  genre: ["Animation", "Fantasy", "Musical"],
  director: "David Hand",
  duration: 83,
  short_description: "The first full-length animated feature film from Disney.",
};

const meta: Meta<typeof MovieCard> = {
  title: "Components/Cards/MovieCard",
  component: MovieCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Displays a Disney movie card with poster image, title, year, rating, and favorite button.",
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
    movie: {
      description: "Movie data object",
      control: "object",
    },
    onClick: {
      action: "clicked",
      description: "Callback when card is clicked",
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
 * Default movie card
 */
export const Default: Story = {
  args: {
    movie: mockMovie,
    index: 0,
  },
};

/**
 * Classic Disney movie from the 90s
 */
export const ClassicMovie: Story = {
  args: {
    movie: mockClassicMovie,
  },
};

/**
 * Recent Disney movie (2020s)
 */
export const RecentMovie: Story = {
  args: {
    movie: mockRecentMovie,
  },
};

/**
 * Historical Disney movie (1937)
 */
export const HistoricalMovie: Story = {
  args: {
    movie: mockOldMovie,
  },
};

/**
 * Movie without poster image (shows fallback)
 */
export const NoImage: Story = {
  args: {
    movie: {
      ...mockMovie,
      image_1: undefined,
      posterUrl: "",
    },
  },
};

/**
 * Multiple movie cards in a grid
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
      <MovieCard movie={mockMovie} index={0} />
      <MovieCard movie={mockClassicMovie} index={1} />
      <MovieCard movie={mockRecentMovie} index={2} />
    </div>
  ),
};
