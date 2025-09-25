/**
 * Advanced Theme Provider
 * Comprehensive theming system with AI-powered color generation,
 * emotion-based palettes, contextual schemes, and accessibility support
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  useColorTheme,
  type ThemeConfig,
  type UseColorThemeReturn,
} from "../../hooks/useColorTheme";
import type { TeamColors } from "../../lib/colorGeneration";

interface AdvancedThemeContextType extends UseColorThemeReturn {
  // Team theming
  teamColors: TeamColors | null;
  setTeamColors: (colors: TeamColors | null) => void;

  // Context switching
  currentContext: "calm" | "energetic" | "professional" | null;
  setContext: (context: "calm" | "energetic" | "professional" | null) => void;

  // Emotion theming
  currentEmotion: "trust" | "energy" | "calm" | "achievement" | null;
  setEmotion: (
    emotion: "trust" | "energy" | "calm" | "achievement" | null
  ) => void;

  // Quick theme presets
  applyTeamTheme: (teamColors: TeamColors) => void;
  applyEmotionTheme: (
    emotion: "trust" | "energy" | "calm" | "achievement"
  ) => void;
  applyContextTheme: (context: "calm" | "energetic" | "professional") => void;

  // Theme showcase
  showcaseMode: boolean;
  setShowcaseMode: (enabled: boolean) => void;
}

const AdvancedThemeContext = createContext<AdvancedThemeContextType | null>(
  null
);

interface AdvancedThemeProviderProps {
  children: React.ReactNode;
  initialTeamColors?: TeamColors;
  initialContext?: "calm" | "energetic" | "professional";
  initialEmotion?: "trust" | "energy" | "calm" | "achievement";
  enableShowcase?: boolean;
}

export function AdvancedThemeProvider({
  children,
  initialTeamColors,
  initialContext,
  initialEmotion,
  enableShowcase = false,
}: AdvancedThemeProviderProps) {
  // Initialize with team colors if provided
  const initialConfig: Partial<ThemeConfig> = {
    teamColors: initialTeamColors,
    context: initialContext,
    emotion: initialEmotion,
  };

  const colorTheme = useColorTheme(initialConfig);

  // Additional state for advanced theming
  const [teamColors, setTeamColors] = useState<TeamColors | null>(
    initialTeamColors || null
  );
  const [currentContext, setCurrentContext] = useState<
    "calm" | "energetic" | "professional" | null
  >(initialContext || null);
  const [currentEmotion, setCurrentEmotion] = useState<
    "trust" | "energy" | "calm" | "achievement" | null
  >(initialEmotion || null);
  const [showcaseMode, setShowcaseMode] = useState(enableShowcase);

  // Apply team theme
  const applyTeamTheme = (colors: TeamColors) => {
    setTeamColors(colors);
    colorTheme.updateTheme({
      teamColors: colors,
      context: undefined, // Clear context when applying team colors
      emotion: undefined, // Clear emotion when applying team colors
    });
  };

  // Apply emotion theme
  const applyEmotionTheme = (
    emotion: "trust" | "energy" | "calm" | "achievement"
  ) => {
    setCurrentEmotion(emotion);
    colorTheme.updateTheme({
      emotion,
      teamColors: undefined, // Clear team colors when applying emotion
      context: undefined, // Clear context when applying emotion
    });
  };

  // Apply context theme
  const applyContextTheme = (
    context: "calm" | "energetic" | "professional"
  ) => {
    setCurrentContext(context);
    colorTheme.updateTheme({
      context,
      teamColors: undefined, // Clear team colors when applying context
      emotion: undefined, // Clear emotion when applying context
    });
  };

  // Update context when internal state changes
  useEffect(() => {
    if (currentContext) {
      colorTheme.updateTheme({ context: currentContext });
    }
  }, [currentContext, colorTheme]);

  useEffect(() => {
    if (currentEmotion) {
      colorTheme.updateTheme({ emotion: currentEmotion });
    }
  }, [currentEmotion, colorTheme]);

  useEffect(() => {
    if (teamColors) {
      colorTheme.updateTheme({ teamColors });
    }
  }, [teamColors, colorTheme]);

  const contextValue: AdvancedThemeContextType = {
    ...colorTheme,
    teamColors,
    setTeamColors,
    currentContext,
    setContext: setCurrentContext,
    currentEmotion,
    setEmotion: setCurrentEmotion,
    applyTeamTheme,
    applyEmotionTheme,
    applyContextTheme,
    showcaseMode,
    setShowcaseMode,
  };

  return (
    <AdvancedThemeContext.Provider value={contextValue}>
      {children}
    </AdvancedThemeContext.Provider>
  );
}

// Hook to use advanced theming
export function useAdvancedTheme(): AdvancedThemeContextType {
  const context = useContext(AdvancedThemeContext);
  if (!context) {
    throw new Error(
      "useAdvancedTheme must be used within an AdvancedThemeProvider"
    );
  }
  return context;
}

// Higher-order component for advanced theming
export function withAdvancedTheme<P extends object>(
  WrappedComponent: React.ComponentType<P & { theme: AdvancedThemeContextType }>
) {
  return function ThemedComponent(props: P) {
    const theme = useAdvancedTheme();
    return React.createElement(WrappedComponent, { ...props, theme });
  };
}
