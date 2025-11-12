import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from "./Footer";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof Footer> = {
  title: "Components/Footer/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Application footer with project information, disclaimer link, and social/portfolio links.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default footer
 */
export const Default: Story = {};

/**
 * Mobile viewport
 */
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
