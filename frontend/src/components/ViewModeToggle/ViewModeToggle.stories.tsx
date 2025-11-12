import type { Meta, StoryObj } from "@storybook/react";
import { ViewModeToggle } from "./ViewModeToggle";
import { useState } from "react";
import type { ViewMode } from "./ViewModeToggle";

const meta: Meta<typeof ViewModeToggle> = {
  title: "Components/Controls/ViewModeToggle",
  component: ViewModeToggle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Toggle button to switch between grid and list view modes. Features smooth animation indicator.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    currentMode: {
      control: "radio",
      options: ["grid", "list"],
      description: "Currently active view mode",
    },
    onModeChange: {
      action: "mode-changed",
      description: "Callback fired when mode changes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Grid mode active
 */
export const GridMode: Story = {
  args: {
    currentMode: "grid",
    onModeChange: () => {},
  },
};

/**
 * List mode active
 */
export const ListMode: Story = {
  args: {
    currentMode: "list",
    onModeChange: () => {},
  },
};

/**
 * Interactive toggle (click to switch modes)
 */
export const Interactive: Story = {
  render: () => {
    const [mode, setMode] = useState<ViewMode>("grid");

    return (
      <div>
        <ViewModeToggle currentMode={mode} onModeChange={setMode} />
        <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
          Current mode: <strong>{mode}</strong>
        </div>
      </div>
    );
  },
};
