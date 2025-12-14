/**
 * Advanced Theme Provider
 * Comprehensive theming system with AI-powered color generation,
 * emotion-based palettes, contextual schemes, and accessibility support
 */

import React, { createContext, useState, useEffect } from "react";
import {
  useColorTheme,
  type UseColorThemeReturn,
} from "../../hooks/useColorTheme";
import { useDesignSystem } from "./design-system-hooks";
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

// Export context for use in hooks file
export { AdvancedThemeContext };

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
  const { config: designSystemConfig } = useDesignSystem();

  const colorTheme = useColorTheme();

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

  // Update theme when design system config changes
  useEffect(() => {
    const mode = (() => {
      if (designSystemConfig.theme === "auto") return "auto";
      if (designSystemConfig.theme === "dark") return "dark";
      return "light";
    })();
    colorTheme.updateTheme({ mode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designSystemConfig.theme]);

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
