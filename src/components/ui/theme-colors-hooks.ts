/**
 * Theme Colors Hook
 * Separated from DarkModeToggle to avoid fast refresh warnings
 */
import { useApp } from "../core/useApp";

export const useThemeColors = () => {
  const { designConfig: config } = useApp();
  const isDark = config.theme === "dark" ||
    (config.theme === "auto" && typeof window !== "undefined" &&
     window.matchMedia("(prefers-color-scheme: dark)").matches);

  return {
    isDark,
    theme: config.theme,
    // Surface colors
    surface: {
      primary: isDark ? "bg-dark-surface-primary" : "bg-surface-primary",
      secondary: isDark ? "bg-dark-surface-secondary" : "bg-surface-secondary",
      tertiary: isDark ? "bg-dark-surface-tertiary" : "bg-surface-tertiary",
      accent: isDark ? "bg-dark-surface-accent" : "bg-navy-900",
    },
    // Text colors
    text: {
      primary: isDark ? "text-dark-text-primary" : "text-text-primary",
      secondary: isDark ? "text-dark-text-secondary" : "text-text-secondary",
      tertiary: isDark ? "text-dark-text-tertiary" : "text-text-tertiary",
      inverse: isDark ? "text-dark-text-inverse" : "text-surface-primary",
    },
    // Interactive colors
    interactive: {
      hover: isDark ? "hover:bg-dark-interactive-hover" : "hover:bg-surface-tertiary",
      active: isDark ? "active:bg-dark-interactive-active" : "active:bg-border",
      focus: "focus:ring-electric-500",
    },
  };
};