/**
 * BoxCall Design System - Colors
 *
 * Professional color system for football management platform
 * Provides consistent color tokens and utilities
 */

// BoxCall Football Color Palette
export const colors = {
  // Primary Brand Colors
  primary: {
    50: "#f0f9ff", // lightest blue
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9", // primary blue
    600: "#0284c7", // primary dark
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e", // darkest blue
  },

  // Football Field Green
  field: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e", // field green
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  // Warning/Alert Colors (Yellow for penalties, etc.)
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b", // warning yellow
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  // Error/Penalty Colors
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444", // error red
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  // Success Colors (Touchdowns, wins)
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e", // success green
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  // Neutral Colors
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280", // neutral text
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827", // darkest text
  },
} as const;

// Semantic color mappings for component usage
export const semanticColors = {
  // Text colors
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    muted: colors.gray[500],
    inverse: "#ffffff",
  },

  // Background colors
  background: {
    primary: "#ffffff",
    secondary: colors.gray[50],
    muted: colors.gray[100],
    dark: colors.gray[900],
  },

  // Border colors
  border: {
    primary: colors.gray[200],
    secondary: colors.gray[300],
    focus: colors.primary[500],
    error: colors.error[500],
  },

  // Interactive colors
  interactive: {
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    primaryActive: colors.primary[700],
    secondary: colors.gray[100],
    secondaryHover: colors.gray[200],
    secondaryActive: colors.gray[300],
  },

  // Status colors
  status: {
    success: colors.success[500],
    successLight: colors.success[100],
    warning: colors.warning[500],
    warningLight: colors.warning[100],
    error: colors.error[500],
    errorLight: colors.error[100],
    info: colors.primary[500],
    infoLight: colors.primary[100],
  },

  // Football-specific colors
  football: {
    field: colors.field[500],
    fieldLight: colors.field[100],
    penalty: colors.warning[500],
    penaltyLight: colors.warning[100],
    touchdown: colors.success[500],
    touchdownLight: colors.success[100],
  },
} as const;

// Color utility functions
export const colorUtils = {
  /**
   * Get color value by path (e.g., 'primary.500')
   */
  getColor: (path: string): string => {
    const keys = path.split(".");
    let value: Record<string, unknown> | string = colors;

    for (const key of keys) {
      if (typeof value === "object" && value !== null && key in value) {
        value = (value as Record<string, unknown>)[key] as
          | Record<string, unknown>
          | string;
      } else {
        return path;
      }
    }

    return typeof value === "string" ? value : path;
  },

  /**
   * Get semantic color value
   */
  getSemantic: (
    category: keyof typeof semanticColors,
    variant: string
  ): string => {
    const categoryColors = semanticColors[category] as Record<string, string>;
    return categoryColors?.[variant] || variant;
  },

  /**
   * Generate CSS custom properties for colors
   */
  toCSSCustomProperties: (): Record<string, string> => {
    const cssVars: Record<string, string> = {};

    const flattenColors = (obj: Record<string, unknown>, prefix = ""): void => {
      Object.entries(obj).forEach(([key, value]) => {
        const varName = prefix ? `${prefix}-${key}` : key;

        if (typeof value === "string") {
          cssVars[`--color-${varName}`] = value;
        } else if (typeof value === "object" && value !== null) {
          flattenColors(value as Record<string, unknown>, varName);
        }
      });
    };

    flattenColors({ ...colors, ...semanticColors });
    return cssVars;
  },
};

// Tailwind CSS class utilities for common color patterns
export const colorClasses = {
  // Text color classes
  text: {
    primary: "text-gray-900",
    secondary: "text-gray-600",
    muted: "text-gray-500",
    inverse: "text-white",
    brand: "text-blue-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
    field: "text-green-600",
  },

  // Background color classes
  bg: {
    primary: "bg-white",
    secondary: "bg-gray-50",
    muted: "bg-gray-100",
    dark: "bg-gray-900",
    brand: "bg-blue-600",
    brandLight: "bg-blue-50",
    success: "bg-green-600",
    successLight: "bg-green-50",
    warning: "bg-yellow-600",
    warningLight: "bg-yellow-50",
    error: "bg-red-600",
    errorLight: "bg-red-50",
    field: "bg-green-600",
    fieldLight: "bg-green-50",
  },

  // Border color classes
  border: {
    primary: "border-gray-200",
    secondary: "border-gray-300",
    focus: "border-blue-500",
    success: "border-green-500",
    warning: "border-yellow-500",
    error: "border-red-500",
    field: "border-green-500",
  },

  // Ring color classes (for focus states)
  ring: {
    primary: "ring-blue-500",
    success: "ring-green-500",
    warning: "ring-yellow-500",
    error: "ring-red-500",
    field: "ring-green-500",
  },
} as const;

export default colors;
