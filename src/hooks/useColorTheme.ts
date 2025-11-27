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
    // Inline palette generation to avoid dependency issues
    let basePalette: ColorPalette = { ...defaultPalette };

    // Apply team colors if available
    if (themeConfig.teamColors) {
      basePalette = {
        ...basePalette,
        primary: themeConfig.teamColors.primary || basePalette.primary,
        secondary: themeConfig.teamColors.secondary || basePalette.secondary,
        accent: themeConfig.teamColors.secondary || basePalette.accent, // Use secondary as accent
      };
    }

    // Apply emotion-based adjustments
    if (themeConfig.emotion) {
      switch (themeConfig.emotion) {
        case "trust":
          basePalette = {
            ...basePalette,
            primary: colorTokens.emerald[500], // Green for trust
            background: "#F0FDF4",
            surface: "#DCFCE7",
          };
          break;
        case "energy":
          basePalette = {
            ...basePalette,
            primary: colorTokens.red[500], // Red for energy
            accent: colorTokens.amber[500], // Orange accent
            background: colorTokens.red[50],
            surface: colorTokens.red[100],
          };
          break;
        case "calm":
          basePalette = {
            ...basePalette,
            primary: colorTokens.blue[500], // Blue for calm
            background: "#EFF6FF",
            surface: colorTokens.blue[50],
          };
          break;
        case "achievement":
          basePalette = {
            ...basePalette,
            primary: colorTokens.violet[500], // Purple for achievement
            accent: colorTokens.amber[500], // Gold accent
            background: colorTokens.purple[100],
            surface: colorTokens.purple[200],
          };
          break;
      }
    }

    // Apply context-based adjustments
    if (themeConfig.context) {
      switch (themeConfig.context) {
        case "professional":
          basePalette = {
            ...basePalette,
            background: "#ffffff",
            surface: "#F8FAFC",
            text: "#1E293B",
          };
          break;
        case "energetic":
          basePalette = {
            ...basePalette,
            background: colorTokens.amber[100], // Light yellow
            surface: colorTokens.amber[200],
            primary: colorTokens.amber[500],
          };
          break;
        case "calm":
          basePalette = {
            ...basePalette,
            background: colorTokens.emerald[50], // Light green
            surface: colorTokens.emerald[100],
            primary: colorTokens.emerald[500],
          };
          break;
      }
    }

    // Apply dark mode transformations if needed
    if (themeConfig.mode === "dark") {
      basePalette = {
        ...basePalette,
        background: "#0F172A",
        surface: "#1E293B",
        text: "#F8FAFC",
        primary: basePalette.primary, // Keep custom primary
        secondary: "#94A3B8",
      };
    }

    setPalette(basePalette);
    applyPaletteToCSS(basePalette);
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
      // Use same palette generation logic as main effect
      let basePalette: ColorPalette = { ...defaultPalette };

      // Apply team colors if available
      if (themeConfig.teamColors) {
        basePalette = {
          ...basePalette,
          primary: themeConfig.teamColors.primary || basePalette.primary,
          secondary: themeConfig.teamColors.secondary || basePalette.secondary,
          accent: themeConfig.teamColors.secondary || basePalette.accent,
        };
      }

      // Apply emotion-based adjustments
      if (themeConfig.emotion) {
        switch (themeConfig.emotion) {
          case "trust":
            basePalette = {
              ...basePalette,
              primary: colorTokens.emerald[500],
              background: "#F0FDF4",
              surface: "#DCFCE7",
            };
            break;
          case "energy":
            basePalette = {
              ...basePalette,
              primary: colorTokens.red[500],
              accent: colorTokens.amber[500],
              background: colorTokens.red[50],
              surface: colorTokens.red[100],
            };
            break;
          case "calm":
            basePalette = {
              ...basePalette,
              primary: colorTokens.blue[500],
              background: "#EFF6FF",
              surface: colorTokens.blue[50],
            };
            break;
          case "achievement":
            basePalette = {
              ...basePalette,
              primary: colorTokens.violet[500],
              accent: colorTokens.amber[500],
              background: colorTokens.purple[100],
              surface: colorTokens.purple[200],
            };
            break;
        }
      }

      // Apply context-based adjustments
      if (themeConfig.context) {
        switch (themeConfig.context) {
          case "professional":
            basePalette = {
              ...basePalette,
              background: "#ffffff",
              surface: "#F8FAFC",
              text: "#1E293B",
            };
            break;
          case "energetic":
            basePalette = {
              ...basePalette,
              background: colorTokens.amber[100],
              surface: colorTokens.amber[200],
              primary: colorTokens.amber[500],
            };
            break;
          case "calm":
            basePalette = {
              ...basePalette,
              background: colorTokens.emerald[50],
              surface: colorTokens.emerald[100],
              primary: colorTokens.emerald[500],
            };
            break;
        }
      }

      // Apply system preference
      if (mediaQuery.matches) {
        basePalette = {
          ...basePalette,
          background: "#0F172A",
          surface: "#1E293B",
          text: "#F8FAFC",
          secondary: "#94A3B8",
        };
      }

      setPalette(basePalette);
      applyPaletteToCSS(basePalette);
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
