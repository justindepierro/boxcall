import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

/**
 * Theme hook for managing light/dark mode
 * Uses system preference by default, allows manual override
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if there's a saved theme preference
    const savedTheme = localStorage.getItem("boxcall-theme") as Theme;
    if (savedTheme) {
      return savedTheme;
    }

    // Default to system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove("light", "dark");

    // Add current theme class
    root.classList.add(theme);

    // Save theme preference
    localStorage.setItem("boxcall-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
  };
};
