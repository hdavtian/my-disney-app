import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

/**
 * Theme Options
 * - "auto" follows system preference (prefers-color-scheme)
 * - Specific theme IDs apply that theme regardless of system preference
 */
export type ThemeOption =
  | "auto"
  | "theme-dark"
  | "theme-light"
  | "theme-star-wars"
  | "theme-marvel"
  | "theme-walt-disney"
  | "theme-pixar"
  | "theme-matrix"
  | "theme-military";

/**
 * Theme metadata for display in UI
 */
export interface Theme {
  id: ThemeOption;
  name: string;
  description: string;
  preview: {
    background: string;
    text: string;
    accent: string;
  };
  swatches?: string[]; // Color palette swatches for visual preview
}

/**
 * Theme state
 * - selectedTheme: User's choice (or "auto")
 * - appliedTheme: Actual theme currently applied (resolved from "auto" if needed)
 */
interface ThemeState {
  selectedTheme: ThemeOption;
  appliedTheme: Exclude<ThemeOption, "auto">; // Never "auto", always specific theme
  availableThemes: Theme[];
}

/**
 * Available themes with metadata for theme selector UI
 */
const AVAILABLE_THEMES: Theme[] = [
  {
    id: "auto",
    name: "Auto (System)",
    description: "Follow your system's theme preference",
    preview: {
      background: "linear-gradient(135deg, #000000 0%, #ffffff 100%)",
      text: "#888888",
      accent: "#4a90e2",
    },
  },
  {
    id: "theme-dark",
    name: "Dark",
    description: "Classic dark theme with Disney blue accents",
    preview: {
      background: "#000000",
      text: "#ffffff",
      accent: "#4a90e2",
    },
    swatches: ["#000000", "#4a90e2", "#fdd017", "#ffffff", "#cbd5e1"],
  },
  {
    id: "theme-light",
    name: "Light",
    description: "Clean light theme with Disney blue accents",
    preview: {
      background: "#ffffff",
      text: "#0f172a",
      accent: "#006bb3",
    },
    swatches: ["#ffffff", "#006bb3", "#fdd017", "#0f172a", "#475569"],
  },
  {
    id: "theme-star-wars",
    name: "Star Wars",
    description: "Deep space black with iconic yellow accents",
    preview: {
      background: "#000000",
      text: "#e0e0e0",
      accent: "#ffe81f",
    },
    swatches: ["#000000", "#ffe81f", "#ffd700", "#e0e0e0", "#b0b0b0"],
  },
  {
    id: "theme-marvel",
    name: "Marvel",
    description: "Bold dark red with Marvel's signature red",
    preview: {
      background: "#1a0a0e",
      text: "#ffffff",
      accent: "#ed1d24",
    },
    swatches: ["#1a0a0e", "#ed1d24", "#ffd700", "#ffffff", "#d0d0d0"],
  },
  {
    id: "theme-walt-disney",
    name: "Walt Disney Classic",
    description: "Classic Disney blue with gold accents",
    preview: {
      background: "#003d6b",
      text: "#ffffff",
      accent: "#fdd017",
    },
    swatches: ["#003d6b", "#006bb3", "#fdd017", "#ffffff", "#d4d4d4"],
  },
  {
    id: "theme-pixar",
    name: "Pixar",
    description: "Bright and playful with vibrant colors",
    preview: {
      background: "#f0f8ff",
      text: "#1a3a4a",
      accent: "#00a8e8",
    },
    swatches: ["#f0f8ff", "#00a8e8", "#ffd93d", "#1a3a4a", "#4a6a7a"],
  },
  {
    id: "theme-matrix",
    name: "Matrix",
    description: "Digital green code on deep black",
    preview: {
      background: "#0d0208",
      text: "#00ff41",
      accent: "#39ff14",
    },
    swatches: ["#0d0208", "#00ff41", "#39ff14", "#00cc33", "#008f11"],
  },
  {
    id: "theme-military",
    name: "Military",
    description: "Tactical camo with olive and tan colors",
    preview: {
      background: "#1a1f16",
      text: "#e8e6d5",
      accent: "#6b7c59",
    },
    swatches: ["#1a1f16", "#6b7c59", "#c9a962", "#e8e6d5", "#5a6a48"],
  },
];

const initialState: ThemeState = {
  selectedTheme: "auto", // Default to auto (system preference)
  appliedTheme: "theme-dark", // Default fallback if system has no preference
  availableThemes: AVAILABLE_THEMES,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    /**
     * Set user's theme choice
     * If "auto", the appliedTheme should be updated by system detection logic
     */
    setTheme: (state, action: PayloadAction<ThemeOption>) => {
      state.selectedTheme = action.payload;
      console.log(`🎨 Theme selection changed to: ${action.payload}`);
    },

    /**
     * Set the currently applied theme (after resolving "auto" mode)
     * This is called by theme detection logic when system preference changes
     */
    setAppliedTheme: (
      state,
      action: PayloadAction<Exclude<ThemeOption, "auto">>
    ) => {
      state.appliedTheme = action.payload;
      console.log(`🎨 Applied theme changed to: ${action.payload}`);
    },

    /**
     * Initialize theme from localStorage or system
     */
    initializeTheme: (
      state,
      action: PayloadAction<{
        selectedTheme: ThemeOption;
        appliedTheme: Exclude<ThemeOption, "auto">;
      }>
    ) => {
      state.selectedTheme = action.payload.selectedTheme;
      state.appliedTheme = action.payload.appliedTheme;
      console.log(
        `🎨 Theme initialized - Selected: ${action.payload.selectedTheme}, Applied: ${action.payload.appliedTheme}`
      );
    },

    /**
     * Reset to default theme
     */
    resetTheme: (state) => {
      state.selectedTheme = "auto";
      state.appliedTheme = "theme-dark";
      console.log("🎨 Theme reset to defaults");
    },
  },
});

// Actions
export const { setTheme, setAppliedTheme, initializeTheme, resetTheme } =
  themeSlice.actions;

// Selectors
export const selectTheme = (state: RootState) => state.theme;
export const selectSelectedTheme = (state: RootState) =>
  state.theme.selectedTheme;
export const selectAppliedTheme = (state: RootState) =>
  state.theme.appliedTheme;
export const selectAvailableThemes = (state: RootState) =>
  state.theme.availableThemes;

// Reducer
export default themeSlice.reducer;
