/**
 * Advanced Color Theming Hook
 * Provides dynamic color palette generation and runtime theming
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ColorPalette, TeamColors } from '../lib/colorGeneration';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type AccessibilityMode = 'normal' | 'highContrast' | 'deuteranopia' | 'protanopia' | 'tritanopia';
export type EmotionTheme = 'trust' | 'energy' | 'calm' | 'achievement';
export type ContextTheme = 'calm' | 'energetic' | 'professional';

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
  generateAccessiblePalette: (accessibilityMode: AccessibilityMode) => ColorPalette;
}

const defaultConfig: ThemeConfig = {
  mode: 'light',
  accessibility: 'normal',
};

const defaultPalette: ColorPalette = {
  primary: '#00A86B',
  secondary: '#1E293B',
  accent: '#7C3AED',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export function useColorTheme(initialConfig?: Partial<ThemeConfig>): UseColorThemeReturn {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    ...defaultConfig,
    ...initialConfig,
  });

  const [palette, setPalette] = useState<ColorPalette>(defaultPalette);

  // Update theme configuration
  const updateTheme = useCallback((newConfig: Partial<ThemeConfig>) => {
    setThemeConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Reset to default theme
  const resetToDefault = useCallback(() => {
    setThemeConfig(defaultConfig);
  }, []);

  // Generate team-specific palette
  const generateTeamPalette = useCallback((_teamColors: TeamColors): ColorPalette => {
    return { ...defaultPalette }; // Simplified for now
  }, []);

  // Generate emotion-based palette
  const generateEmotionPalette = useCallback((_emotion: EmotionTheme): ColorPalette => {
    return { ...defaultPalette }; // Simplified for now
  }, []);

  // Generate context-based palette
  const generateContextPalette = useCallback((_context: ContextTheme): ColorPalette => {
    return { ...defaultPalette }; // Simplified for now
  }, []);

  // Generate accessibility-compliant palette
  const generateAccessiblePalette = useCallback((_accessibilityMode: AccessibilityMode): ColorPalette => {
    return { ...defaultPalette }; // Simplified for now
  }, []);

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
        case 'trust':
          basePalette = {
            ...basePalette,
            primary: '#22C55E', // Green for trust
            background: '#F0FDF4',
            surface: '#DCFCE7',
          };
          break;
        case 'energy':
          basePalette = {
            ...basePalette,
            primary: '#EF4444', // Red for energy
            accent: '#F59E0B', // Orange accent
            background: '#FEF2F2',
            surface: '#FEE2E2',
          };
          break;
        case 'calm':
          basePalette = {
            ...basePalette,
            primary: '#3B82F6', // Blue for calm
            background: '#EFF6FF',
            surface: '#DBEAFE',
          };
          break;
        case 'achievement':
          basePalette = {
            ...basePalette,
            primary: '#8B5CF6', // Purple for achievement
            accent: '#F59E0B', // Gold accent
            background: '#F3E8FF',
            surface: '#E9D5FF',
          };
          break;
      }
    }

    // Apply context-based adjustments
    if (themeConfig.context) {
      switch (themeConfig.context) {
        case 'professional':
          basePalette = {
            ...basePalette,
            background: '#FFFFFF',
            surface: '#F8FAFC',
            text: '#1E293B',
          };
          break;
        case 'energetic':
          basePalette = {
            ...basePalette,
            background: '#FEF3C7', // Light yellow
            surface: '#FDE68A',
            primary: '#F59E0B',
          };
          break;
        case 'calm':
          basePalette = {
            ...basePalette,
            background: '#ECFDF5', // Light green
            surface: '#D1FAE5',
            primary: '#10B981',
          };
          break;
      }
    }

    // Apply dark mode transformations if needed
    if (themeConfig.mode === 'dark') {
      basePalette = {
        ...basePalette,
        background: '#0F172A',
        surface: '#1E293B',
        text: '#F8FAFC',
        primary: basePalette.primary, // Keep custom primary
        secondary: '#94A3B8',
      };
    }

    setPalette(basePalette);
    applyPaletteToCSS(basePalette);
  }, [themeConfig]);

  // Apply palette as CSS custom properties
  const applyPaletteToCSS = (palette: ColorPalette) => {
    const root = document.documentElement;
    Object.entries(palette).forEach(([key, value]) => {
      root.style.setProperty(`--semantic-${key}`, value);
    });
  };

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (themeConfig.mode !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
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
          case 'trust':
            basePalette = { ...basePalette, primary: '#22C55E', background: '#F0FDF4', surface: '#DCFCE7' };
            break;
          case 'energy':
            basePalette = { ...basePalette, primary: '#EF4444', accent: '#F59E0B', background: '#FEF2F2', surface: '#FEE2E2' };
            break;
          case 'calm':
            basePalette = { ...basePalette, primary: '#3B82F6', background: '#EFF6FF', surface: '#DBEAFE' };
            break;
          case 'achievement':
            basePalette = { ...basePalette, primary: '#8B5CF6', accent: '#F59E0B', background: '#F3E8FF', surface: '#E9D5FF' };
            break;
        }
      }

      // Apply context-based adjustments
      if (themeConfig.context) {
        switch (themeConfig.context) {
          case 'professional':
            basePalette = { ...basePalette, background: '#FFFFFF', surface: '#F8FAFC', text: '#1E293B' };
            break;
          case 'energetic':
            basePalette = { ...basePalette, background: '#FEF3C7', surface: '#FDE68A', primary: '#F59E0B' };
            break;
          case 'calm':
            basePalette = { ...basePalette, background: '#ECFDF5', surface: '#D1FAE5', primary: '#10B981' };
            break;
        }
      }

      // Apply system preference
      if (mediaQuery.matches) {
        basePalette = {
          ...basePalette,
          background: '#0F172A',
          surface: '#1E293B',
          text: '#F8FAFC',
          secondary: '#94A3B8',
        };
      }

      setPalette(basePalette);
      applyPaletteToCSS(basePalette);
    };

    // Initial setup for auto mode
    handleChange();

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
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
  return useColorTheme({ emotion, mode: 'light' });
}

// Utility hook for context-based theming
export function useContextTheme(context: ContextTheme) {
  return useColorTheme({ context, mode: 'light' });
}

// Utility hook for team-based theming
export function useTeamTheme(teamColors: TeamColors) {
  return useColorTheme({ teamColors, mode: 'light' });
}