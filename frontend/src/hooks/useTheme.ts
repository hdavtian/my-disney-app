/**
 * useTheme Hook
 * Manages theme application and switching
 */

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store/store";
import {
  setTheme,
  setAppliedTheme,
  selectSelectedTheme,
  selectAppliedTheme,
  selectAvailableThemes,
  type ThemeOption,
} from "../store/slices/themeSlice";
import { resolveTheme, watchSystemTheme } from "../utils/themeDetection";

/**
 * Hook return type
 */
interface UseThemeReturn {
  /** Current user-selected theme (can be "auto") */
  selectedTheme: ThemeOption;
  /** Currently applied theme (never "auto", always specific theme) */
  appliedTheme: Exclude<ThemeOption, "auto">;
  /** Available themes for selection */
  availableThemes: ReturnType<typeof selectAvailableThemes>;
  /** Change theme selection */
  changeTheme: (theme: ThemeOption) => void;
}

/**
 * Custom hook for theme management
 * Handles theme selection, system preference detection, and body class application
 *
 * @returns Theme state and control functions
 */
export const useTheme = (): UseThemeReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedTheme = useSelector(selectSelectedTheme);
  const appliedTheme = useSelector(selectAppliedTheme);
  const availableThemes = useSelector(selectAvailableThemes);

  /**
   * Apply theme class to body element
   */
  const applyThemeToBody = useCallback(
    (theme: Exclude<ThemeOption, "auto">) => {
      // Remove all theme classes
      document.body.classList.remove(
        "theme-dark",
        "theme-light",
        "theme-star-wars",
        "theme-marvel",
        "theme-walt-disney",
        "theme-pixar"
      );

      // Add new theme class
      document.body.classList.add(theme);
      console.log(`🎨 Applied theme class to body: ${theme}`);
    },
    []
  );

  /**
   * Change theme selection
   */
  const changeTheme = useCallback(
    (theme: ThemeOption) => {
      console.log(`🎨 User selected theme: ${theme}`);
      dispatch(setTheme(theme));

      // Resolve and apply theme immediately
      const resolvedTheme = resolveTheme(theme);
      dispatch(setAppliedTheme(resolvedTheme));
      applyThemeToBody(resolvedTheme);
    },
    [dispatch, applyThemeToBody]
  );

  /**
   * Effect: Apply current theme to body on mount and when appliedTheme changes
   */
  useEffect(() => {
    applyThemeToBody(appliedTheme);
  }, [appliedTheme, applyThemeToBody]);

  /**
   * Effect: Watch for system theme changes when in "auto" mode
   */
  useEffect(() => {
    // Only watch if user selected "auto"
    if (selectedTheme !== "auto") {
      return;
    }

    console.log("🎨 Starting system theme watcher (auto mode)");

    // Set up system theme watcher
    const cleanup = watchSystemTheme((systemTheme) => {
      console.log(`🎨 System theme changed, applying: ${systemTheme}`);
      dispatch(setAppliedTheme(systemTheme));
      applyThemeToBody(systemTheme);
    });

    // Cleanup on unmount or when selectedTheme changes
    return () => {
      console.log("🎨 Stopping system theme watcher");
      cleanup();
    };
  }, [selectedTheme, dispatch, applyThemeToBody]);

  /**
   * Effect: Initialize theme on mount if needed
   */
  useEffect(() => {
    // Resolve current theme (in case it's "auto" and needs system detection)
    const resolvedTheme = resolveTheme(selectedTheme);

    // If resolved theme differs from applied theme, update it
    if (resolvedTheme !== appliedTheme) {
      console.log(
        `🎨 Initializing theme - resolved ${selectedTheme} to ${resolvedTheme}`
      );
      dispatch(setAppliedTheme(resolvedTheme));
      applyThemeToBody(resolvedTheme);
    }
  }, []); // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps

  return {
    selectedTheme,
    appliedTheme,
    availableThemes,
    changeTheme,
  };
};
