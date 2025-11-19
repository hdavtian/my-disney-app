import type { Meta, StoryObj } from "@storybook/react";
import { CardSizeControl } from "./CardSizeControl";
import { useState } from "react";

const meta: Meta<typeof CardSizeControl> = {
  title: "Components/Controls/CardSizeControl",
  component: CardSizeControl,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A slider control for adjusting grid column count. Used to dynamically change card sizes in grid layouts.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    currentColumns: {
      control: "number",
      description: "Currently selected number of columns",
    },
    minColumns: {
      control: "number",
      description: "Minimum number of columns allowed",
    },
    maxColumns: {
      control: "number",
      description: "Maximum number of columns allowed",
    },
    defaultColumns: {
      control: "number",
      description: "Default number of columns if current is 0 or invalid",
    },
    onChange: {
      action: "changed",
      description: "Callback fired when slider value changes",
    },
    labels: {
      control: "object",
      description: "Optional labels for slider ticks",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default card size control (3-6 columns)
 */
export const Default: Story = {
  args: {
    currentColumns: 4,
    minColumns: 3,
    maxColumns: 6,
    defaultColumns: 4,
    onChange: () => {},
  },
};

/**
 * Minimum position (3 columns)
 */
export const MinimumSize: Story = {
  args: {
    currentColumns: 3,
    minColumns: 3,
    maxColumns: 6,
    defaultColumns: 4,
    onChange: () => {},
  },
};

/**
 * Maximum position (6 columns)
 */
export const MaximumSize: Story = {
  args: {
    currentColumns: 6,
    minColumns: 3,
    maxColumns: 6,
    defaultColumns: 4,
    onChange: () => {},
  },
};

/**
 * Wide range (2-8 columns)
 */
export const WideRange: Story = {
  args: {
    currentColumns: 5,
    minColumns: 2,
    maxColumns: 8,
    defaultColumns: 5,
    onChange: () => {},
  },
};

/**
 * Narrow range (4-5 columns)
 */
export const NarrowRange: Story = {
  args: {
    currentColumns: 4,
    minColumns: 4,
    maxColumns: 5,
    defaultColumns: 4,
    onChange: () => {},
  },
};

/**
 * Interactive control with state
 */
export const Interactive: Story = {
  render: () => {
    const [columns, setColumns] = useState(4);

    return (
      <div style={{ width: "400px" }}>
        <CardSizeControl
          currentColumns={columns}
          minColumns={3}
          maxColumns={6}
          defaultColumns={4}
          onChange={setColumns}
        />
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f0f0f0",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <strong>Selected Columns:</strong> {columns}
        </div>
        <div
          style={{
            marginTop: "10px",
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: "5px",
          }}
        >
          {Array.from({ length: columns * 2 }).map((_, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                background: "#4a90e2",
                borderRadius: "4px",
              }}
            />
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Multiple controls showing different ranges
 */
export const MultipleControls: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
      <div>
        <h4 style={{ marginBottom: "10px" }}>Small Range (3-4 columns)</h4>
        <CardSizeControl
          currentColumns={3}
          minColumns={3}
          maxColumns={4}
          defaultColumns={3}
          onChange={() => {}}
        />
      </div>
      <div>
        <h4 style={{ marginBottom: "10px" }}>Medium Range (3-6 columns)</h4>
        <CardSizeControl
          currentColumns={4}
          minColumns={3}
          maxColumns={6}
          defaultColumns={4}
          onChange={() => {}}
        />
      </div>
      <div>
        <h4 style={{ marginBottom: "10px" }}>Large Range (2-8 columns)</h4>
        <CardSizeControl
          currentColumns={5}
          minColumns={2}
          maxColumns={8}
          defaultColumns={5}
          onChange={() => {}}
        />
      </div>
    </div>
  ),
};
