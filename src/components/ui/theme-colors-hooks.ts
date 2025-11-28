/**
 * Theme Colors Hook
 * Separated from DarkModeToggle to avoid fast refresh warnings
 */
import { useApp } from "../core/useApp";

export const useThemeColors = () => {
  const { designConfig: config } = useApp();
  const isDark =
    config.theme === "dark" ||
    (config.theme === "auto" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return {
    isDark,
    theme: config.theme,
    // Surface colors
    surface: {
      primary: isDark ? "bg-dark-bg-primary" : "bg-primary",
      secondary: isDark ? "bg-dark-bg-secondary" : "bg-secondary",
      tertiary: isDark ? "bg-dark-bg-tertiary" : "bg-tertiary",
      accent: isDark ? "bg-dark-surface-accent" : "bg-navy-900",
    },
    // Text colors
    text: {
      primary: isDark ? "text-dark-text-primary" : "text-primary",
      secondary: isDark ? "text-dark-text-secondary" : "text-secondary",
      tertiary: isDark ? "text-dark-text-tertiary" : "text-tertiary",
      inverse: isDark ? "text-dark-text-inverse" : "text-bg-primary",
    },
    // Interactive colors
    interactive: {
      hover: isDark ? "hover:bg-dark-interactive-hover" : "hover:bg-tertiary",
      active: isDark ? "active:bg-dark-interactive-active" : "active:bg-border",
      focus: "focus:ring-electric-500",
    },
  };
};
