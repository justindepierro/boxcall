import { useCallback, useEffect, useState } from "react";

import {
  THEME_IDS,
  applyTheme,
  getStoredTheme,
  type ThemeName,
  DEFAULT_THEME,
} from "../themes/ThemeManager";

export type Theme = ThemeName;

/**
 * useTheme (legacy-compatible) now delegates to ThemeManager and supports high-contrast.
 * Provides current theme id, setters, and a cycle toggle.
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return getStoredTheme() ?? DEFAULT_THEME;
  });

  // Apply whenever state changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Sync if another tab changes localStorage
  useEffect(() => {
    const listener = (e: StorageEvent) => {
      if (e.key === "app-theme") {
        const stored = getStoredTheme();
        if (stored && stored !== theme) setThemeState(stored);
      }
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(() => {
    const idx = THEME_IDS.indexOf(theme);
    const next = THEME_IDS[(idx + 1) % THEME_IDS.length];
    setThemeState(next);
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
    isHighContrast: theme === "high-contrast",
    availableThemes: THEME_IDS,
  };
};
