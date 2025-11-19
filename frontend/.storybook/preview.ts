import type { Preview, Decorator } from "@storybook/react-vite";
import { useEffect } from "react";
import "../src/styles/main.scss"; // Import global styles
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap

/**
 * Global decorator to apply theme classes to all stories.
 * This ensures that all CSS variables defined in theme files are available.
 */
const withTheme: Decorator = (Story, context) => {
  // Apply theme class to document body for global effect
  useEffect(() => {
    const theme = context.globals.theme || "theme-light";
    document.body.className = theme;
    return () => {
      document.body.className = "";
    };
  }, [context.globals.theme]);

  return Story();
};

const preview: Preview = {
  decorators: [withTheme],

  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "theme-light",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "theme-light", title: "Light Theme" },
          { value: "theme-dark", title: "Dark Theme" },
          { value: "theme-walt-disney", title: "Walt Disney Theme" },
          { value: "theme-pixar", title: "Pixar Theme" },
          { value: "theme-marvel", title: "Marvel Theme" },
          { value: "theme-star-wars", title: "Star Wars Theme" },
          { value: "theme-matrix", title: "Matrix Theme" },
          { value: "theme-military", title: "Military Theme" },
        ],
        showName: true,
      },
    },
  },

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },

    // Layout options for stories
    layout: "centered",

    // Backgrounds for testing components
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#1a1a1a" },
      ],
    },
  },
};

export default preview;
