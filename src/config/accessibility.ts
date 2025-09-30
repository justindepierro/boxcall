/**
 * Accessibility Configuration
 * 
 * Configuration for WCAG 2.1 AA compliance and accessibility features
 */

export interface AccessibilityConfig {
  // WCAG Guidelines
  colorContrast: {
    minRatio: number;
    enhancedRatio: number;
    checkContrast: boolean;
  };
  
  // Keyboard Navigation
  keyboardNavigation: {
    enabled: boolean;
    skipLinks: boolean;
    focusVisible: boolean;
    trapFocus: boolean;
  };
  
  // Screen Reader Support
  screenReader: {
    enabled: boolean;
    announcePageChanges: boolean;
    announceErrors: boolean;
    announceSuccess: boolean;
  };
  
  // Motion and Animation
  motion: {
    respectReducedMotion: boolean;
    defaultAnimationDuration: number;
    disableAutoplay: boolean;
  };
  
  // Text and Typography
  text: {
    minFontSize: number;
    maxLineLength: number;
    lineHeight: number;
    letterSpacing: number;
  };
  
  // Interactive Elements
  interactive: {
    minTouchTarget: number;
    focusIndicatorWidth: number;
    hoverDelayMs: number;
  };
}

export const accessibilityConfig: AccessibilityConfig = {
  colorContrast: {
    minRatio: 4.5, // WCAG AA standard
    enhancedRatio: 7.0, // WCAG AAA standard
    checkContrast: process.env.NODE_ENV === 'development',
  },
  
  keyboardNavigation: {
    enabled: true,
    skipLinks: true,
    focusVisible: true,
    trapFocus: true,
  },
  
  screenReader: {
    enabled: true,
    announcePageChanges: true,
    announceErrors: true,
    announceSuccess: true,
  },
  
  motion: {
    respectReducedMotion: true,
    defaultAnimationDuration: 200,
    disableAutoplay: true,
  },
  
  text: {
    minFontSize: 16,
    maxLineLength: 80, // characters
    lineHeight: 1.5,
    letterSpacing: 0.02,
  },
  
  interactive: {
    minTouchTarget: 44, // pixels (iOS/Android guideline)
    focusIndicatorWidth: 2,
    hoverDelayMs: 300,
  },
};

// ARIA Live Region Types
export const ARIA_LIVE_REGIONS = {
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
  OFF: 'off',
} as const;

// Common ARIA Labels
export const ARIA_LABELS = {
  // Navigation
  MAIN_NAVIGATION: 'Main navigation',
  BREADCRUMB: 'Breadcrumb navigation',
  PAGINATION: 'Pagination navigation',
  SKIP_TO_CONTENT: 'Skip to main content',
  
  // Actions
  CLOSE: 'Close',
  OPEN: 'Open',
  EXPAND: 'Expand',
  COLLAPSE: 'Collapse',
  DELETE: 'Delete',
  EDIT: 'Edit',
  SAVE: 'Save',
  CANCEL: 'Cancel',
  
  // Status
  LOADING: 'Loading',
  ERROR: 'Error',
  SUCCESS: 'Success',
  WARNING: 'Warning',
  
  // Forms
  REQUIRED: 'Required field',
  OPTIONAL: 'Optional field',
  INVALID: 'Invalid input',
  VALID: 'Valid input',
} as const;

// Keyboard Navigation Keys
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

// Color Contrast Utilities
export const calculateContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd use a proper color library
  const getLuminance = (color: string): number => {
    // Convert hex to RGB and calculate relative luminance
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const toLinear = (val: number) => val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

export const isContrastCompliant = (
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const ratio = calculateContrastRatio(foreground, background);
  const minRatio = level === 'AAA' ? accessibilityConfig.colorContrast.enhancedRatio : accessibilityConfig.colorContrast.minRatio;
  return ratio >= minRatio;
};