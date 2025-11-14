/**
 * Theme Detection Utilities
 * Handles system preference detection and monitoring
 */

import type { ThemeOption } from "../store/slices/themeSlice";

/**
 * Detect system's preferred color scheme
 * @returns "theme-dark" or "theme-light" based on system preference
 */
export const detectSystemTheme = (): "theme-dark" | "theme-light" => {
  // Check if running in browser
  if (typeof window === "undefined") {
    return "theme-dark";
  }

  // Check for prefers-color-scheme media query support
  if (!window.matchMedia) {
    return "theme-dark";
  }

  // Detect system preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const prefersLight = window.matchMedia(
    "(prefers-color-scheme: light)"
  ).matches;

  if (prefersDark) {
    console.log("🌙 System prefers dark theme");
    return "theme-dark";
  }

  if (prefersLight) {
    console.log("☀️ System prefers light theme");
    return "theme-light";
  }

  // Default to dark if no preference
  console.log("🌙 No system preference, defaulting to dark");
  return "theme-dark";
};

/**
 * Resolve theme option to actual theme ID
 * Handles "auto" by detecting system preference
 *
 * @param selectedTheme - User's theme selection
 * @returns Actual theme ID to apply
 */
export const resolveTheme = (
  selectedTheme: ThemeOption
): Exclude<ThemeOption, "auto"> => {
  if (selectedTheme === "auto") {
    return detectSystemTheme();
  }

  return selectedTheme as Exclude<ThemeOption, "auto">;
};

/**
 * Watch for system theme changes
 * Calls callback when system preference changes
 *
 * @param callback - Function to call when system theme changes
 * @returns Cleanup function to remove listener
 */
export const watchSystemTheme = (
  callback: (theme: "theme-dark" | "theme-light") => void
): (() => void) => {
  // Check if running in browser
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {}; // No-op cleanup
  }

  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const lightModeQuery = window.matchMedia("(prefers-color-scheme: light)");

  // Handler for media query changes
  const handleChange = () => {
    const newTheme = detectSystemTheme();
    console.log(`🎨 System theme changed to: ${newTheme}`);
    callback(newTheme);
  };

  // Add listeners (using addEventListener for modern browsers)
  if (darkModeQuery.addEventListener) {
    darkModeQuery.addEventListener("change", handleChange);
    lightModeQuery.addEventListener("change", handleChange);
  } else {
    // Fallback for older browsers
    // @ts-expect-error - addListener is deprecated but needed for older browsers
    darkModeQuery.addListener(handleChange);
    // @ts-expect-error - addListener is deprecated but needed for older browsers
    lightModeQuery.addListener(handleChange);
  }

  // Return cleanup function
  return () => {
    if (darkModeQuery.removeEventListener) {
      darkModeQuery.removeEventListener("change", handleChange);
      lightModeQuery.removeEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      // @ts-expect-error - removeListener is deprecated but needed for older browsers
      darkModeQuery.removeListener(handleChange);
      // @ts-expect-error - removeListener is deprecated but needed for older browsers
      lightModeQuery.removeListener(handleChange);
    }
  };
};
