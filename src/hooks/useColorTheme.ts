/**
 * Advanced Color Theming Hook
 * Provides dynamic color palette generation and runtime theming
 */

import React, { useState, useEffect, useCallback } from "react";
import type { ColorPalette, TeamColors } from "../lib/colorGeneration";
import { colorTokens } from "../design-system/tokens";

export type ThemeMode = "light" | "dark" | "auto";
export type AccessibilityMode =
  | "normal"
  | "highContrast"
  | "deuteranopia"
  | "protanopia"
  | "tritanopia";
export type EmotionTheme = "trust" | "energy" | "calm" | "achievement";
export type ContextTheme = "calm" | "energetic" | "professional";

export interface ThemeConfig {
  mode: ThemeMode;
  accessibility: AccessibilityMode;
  emotion?: EmotionTheme;
  context?: ContextTheme;
  teamColors?: TeamColors;
  customPalette?: Partial<ColorPalette>;
}

export interface UseColorThemeReturn {
  palette: ColorPalette;
  themeConfig: ThemeConfig;
  updateTheme: (config: Partial<ThemeConfig>) => void;
  resetToDefault: () => void;
  generateTeamPalette: (teamColors: TeamColors) => ColorPalette;
  generateEmotionPalette: (emotion: EmotionTheme) => ColorPalette;
  generateContextPalette: (context: ContextTheme) => ColorPalette;
  generateAccessiblePalette: (
    accessibilityMode: AccessibilityMode
  ) => ColorPalette;
}

const defaultConfig: ThemeConfig = {
  mode: "light",
  accessibility: "normal",
};

const defaultPalette: ColorPalette = {
  primary: "#00A86B",
  secondary: "#1E293B",
  accent: colorTokens.violet[600],
  background: "#F8FAFC",
  surface: "#ffffff",
  text: "#1E293B",
  success: colorTokens.emerald[500],
  warning: colorTokens.amber[500],
  error: colorTokens.red[500],
  info: colorTokens.blue[500],
};

// Apply team colors to palette
function applyTeamColors(
  basePalette: ColorPalette,
  teamColors?: TeamColors
): ColorPalette {
  if (!teamColors) return basePalette;

  return {
    ...basePalette,
    primary: teamColors.primary || basePalette.primary,
    secondary: teamColors.secondary || basePalette.secondary,
    accent: teamColors.secondary || basePalette.accent,
  };
}

// Apply emotion-based palette adjustments
function applyEmotionTheme(
  basePalette: ColorPalette,
  emotion?: EmotionTheme
): ColorPalette {
  if (!emotion) return basePalette;

  switch (emotion) {
    case "trust":
      return {
        ...basePalette,
        primary: colorTokens.emerald[500],
        background: "#F0FDF4",
        surface: "#DCFCE7",
      };
    case "energy":
      return {
        ...basePalette,
        primary: colorTokens.red[500],
        accent: colorTokens.amber[500],
        background: colorTokens.red[50],
        surface: colorTokens.red[100],
      };
    case "calm":
      return {
        ...basePalette,
        primary: colorTokens.blue[500],
        background: "#EFF6FF",
        surface: colorTokens.blue[50],
      };
    case "achievement":
      return {
        ...basePalette,
        primary: colorTokens.violet[500],
        accent: colorTokens.amber[500],
        background: colorTokens.purple[100],
        surface: colorTokens.purple[200],
      };
    default:
      return basePalette;
  }
}

// Apply context-based palette adjustments
function applyContextTheme(
  basePalette: ColorPalette,
  context?: ContextTheme
): ColorPalette {
  if (!context) return basePalette;

  switch (context) {
    case "professional":
      return {
        ...basePalette,
        background: "#ffffff",
        surface: "#F8FAFC",
        text: "#1E293B",
      };
    case "energetic":
      return {
        ...basePalette,
        background: colorTokens.amber[100],
        surface: colorTokens.amber[200],
        primary: colorTokens.amber[500],
      };
    case "calm":
      return {
        ...basePalette,
        background: colorTokens.emerald[50],
        surface: colorTokens.emerald[100],
        primary: colorTokens.emerald[500],
      };
    default:
      return basePalette;
  }
}

// Apply dark mode transformations
function applyDarkMode(
  basePalette: ColorPalette,
  isDark: boolean
): ColorPalette {
  if (!isDark) return basePalette;

  return {
    ...basePalette,
    background: "#0F172A",
    surface: "#1E293B",
    text: "#F8FAFC",
    primary: basePalette.primary,
    secondary: "#94A3B8",
  };
}

// Generate complete palette from theme config
function generatePalette(
  config: ThemeConfig,
  prefersDark: boolean
): ColorPalette {
  let palette = { ...defaultPalette };

  palette = applyTeamColors(palette, config.teamColors);
  palette = applyEmotionTheme(palette, config.emotion);
  palette = applyContextTheme(palette, config.context);

  const isDark =
    config.mode === "dark" || (config.mode === "auto" && prefersDark);
  palette = applyDarkMode(palette, isDark);

  return palette;
}

export function useColorTheme(
  initialConfig?: Partial<ThemeConfig>
): UseColorThemeReturn {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    ...defaultConfig,
    ...initialConfig,
  });

  const [palette, setPalette] = useState<ColorPalette>(defaultPalette);

  // Update theme configuration
  const updateTheme = useCallback((newConfig: Partial<ThemeConfig>) => {
    setThemeConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // Reset to default theme
  const resetToDefault = useCallback(() => {
    setThemeConfig(defaultConfig);
  }, []);

  // Generate team-specific palette
  const generateTeamPalette = useCallback(
    (_teamColors: TeamColors): ColorPalette => {
      return { ...defaultPalette }; // Simplified for now
    },
    []
  );

  // Generate emotion-based palette
  const generateEmotionPalette = useCallback(
    (_emotion: EmotionTheme): ColorPalette => {
      return { ...defaultPalette }; // Simplified for now
    },
    []
  );

  // Generate context-based palette
  const generateContextPalette = useCallback(
    (_context: ContextTheme): ColorPalette => {
      return { ...defaultPalette }; // Simplified for now
    },
    []
  );

  // Generate accessibility-compliant palette
  const generateAccessiblePalette = useCallback(
    (_accessibilityMode: AccessibilityMode): ColorPalette => {
      return { ...defaultPalette }; // Simplified for now
    },
    []
  );

  // Update palette when theme config changes
  useEffect(() => {
    const palette = generatePalette(themeConfig, false);
    setPalette(palette);
    applyPaletteToCSS(palette);
  }, [themeConfig]);

  // Apply palette as CSS custom properties
  const applyPaletteToCSS = (palette: ColorPalette) => {
    const root = document.documentElement;
    Object.entries(palette).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (themeConfig.mode !== "auto") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const newPalette = generatePalette(themeConfig, mediaQuery.matches);
      setPalette(newPalette);
      applyPaletteToCSS(newPalette);
    };

    // Initial setup for auto mode
    handleChange();

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeConfig]);

  return {
    palette,
    themeConfig,
    updateTheme,
    resetToDefault,
    generateTeamPalette,
    generateEmotionPalette,
    generateContextPalette,
    generateAccessiblePalette,
  };
}

// Higher-order component for theme provider
export function withColorTheme<P extends object>(
  WrappedComponent: React.ComponentType<P & { theme: UseColorThemeReturn }>
) {
  return function ThemedComponent(props: P) {
    const theme = useColorTheme();
    return React.createElement(WrappedComponent, { ...props, theme });
  };
}

// Utility hook for emotion-based theming
export function useEmotionTheme(emotion: EmotionTheme) {
  return useColorTheme({ emotion, mode: "light" });
}

// Utility hook for context-based theming
export function useContextTheme(context: ContextTheme) {
  return useColorTheme({ context, mode: "light" });
}

// Utility hook for team-based theming
export function useTeamTheme(teamColors: TeamColors) {
  return useColorTheme({ teamColors, mode: "light" });
}
