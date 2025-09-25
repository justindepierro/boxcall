/**
 * Advanced Color Theming Hook
 * Provides dynamic color palette generation and runtime theming
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ColorGenerationService } from '../lib/colorGeneration';
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

  // Generate palette based on current theme configuration
  const generatePalette = useCallback((config: ThemeConfig): ColorPalette => {
    // Apply dark mode transformations
    const applyDarkModeTransform = (palette: ColorPalette): ColorPalette => {
      return {
        ...palette,
        background: '#0F172A', // Dark navy background
        surface: '#1E293B',    // Darker surface
        text: '#F8FAFC',       // Light text
        primary: lightenColorUtil(palette.primary, 0.2), // Brighter primary
        secondary: lightenColorUtil(palette.secondary, 0.3), // Brighter secondary
      };
    };

    // Utility to lighten colors for dark mode
    const lightenColorUtil = (color: string, factor: number): string => {
      const rgb = hexToRgbUtil(color);
      if (!rgb) return color;

      return `rgb(${Math.min(255, rgb.r + (255 - rgb.r) * factor)}, ${Math.min(255, rgb.g + (255 - rgb.g) * factor)}, ${Math.min(255, rgb.b + (255 - rgb.b) * factor)})`;
    };

    const hexToRgbUtil = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    let basePalette: ColorPalette;

    // Start with team colors if provided
    if (config.teamColors) {
      basePalette = ColorGenerationService.generateTeamPalette(config.teamColors);
    }
    // Use emotion-based palette
    else if (config.emotion) {
      basePalette = ColorGenerationService.generateEmotionPalette(config.emotion);
    }
    // Use context-based palette
    else if (config.context) {
      basePalette = ColorGenerationService.generateContextPalette(config.context);
    }
    // Default palette
    else {
      basePalette = { ...defaultPalette };
    }

    // Apply accessibility modifications
    if (config.accessibility !== 'normal') {
      basePalette = ColorGenerationService.generateAccessiblePalette(basePalette, config.accessibility);
    }

    // Apply custom overrides
    if (config.customPalette) {
      basePalette = { ...basePalette, ...config.customPalette };
    }

    // Apply dark mode transformations if needed
    if (config.mode === 'dark' || (config.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      basePalette = applyDarkModeTransform(basePalette);
    }

    return basePalette;
  }, []);

  // Update theme configuration
  const updateTheme = useCallback((newConfig: Partial<ThemeConfig>) => {
    setThemeConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Reset to default theme
  const resetToDefault = useCallback(() => {
    setThemeConfig(defaultConfig);
  }, []);

  // Generate team-specific palette
  const generateTeamPalette = useCallback((teamColors: TeamColors): ColorPalette => {
    return ColorGenerationService.generateTeamPalette(teamColors);
  }, []);

  // Generate emotion-based palette
  const generateEmotionPalette = useCallback((emotion: EmotionTheme): ColorPalette => {
    return ColorGenerationService.generateEmotionPalette(emotion);
  }, []);

  // Generate context-based palette
  const generateContextPalette = useCallback((context: ContextTheme): ColorPalette => {
    return ColorGenerationService.generateContextPalette(context);
  }, []);

  // Generate accessibility-compliant palette
  const generateAccessiblePalette = useCallback((accessibilityMode: AccessibilityMode): ColorPalette => {
    return ColorGenerationService.generateAccessiblePalette(palette, accessibilityMode);
  }, [palette]);

  // Update palette when theme config changes
  useEffect(() => {
    const newPalette = generatePalette(themeConfig);
    setPalette(newPalette);

    // Apply CSS custom properties to document root
    applyPaletteToCSS(newPalette);
  }, [themeConfig, generatePalette]);

  // Apply palette as CSS custom properties
  const applyPaletteToCSS = (palette: ColorPalette) => {
    const root = document.documentElement;
    Object.entries(palette).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (themeConfig.mode !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setPalette(generatePalette({ ...themeConfig, mode: mediaQuery.matches ? 'dark' : 'light' }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeConfig, generatePalette]);

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