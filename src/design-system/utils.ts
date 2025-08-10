/**
 * Design System Utilities
 * Helper functions for working with design tokens
 */

import {
  colorTokens,
  semanticTokens,
  componentTokens,
  contrastTokens,
} from "./tokens";

/**
 * Get a color value by token path
 * Provides type-safe access to design tokens
 */
export function getTokenColor(path: string): string {
  const parts = path.split(".");
  let current: unknown = {
    ...colorTokens,
    ...semanticTokens,
    ...componentTokens,
  };

  for (const part of parts) {
    if (
      current &&
      typeof current === "object" &&
      current !== null &&
      part in current
    ) {
      current = (current as Record<string, unknown>)[part];
    } else {
      console.warn(`Design token path "${path}" not found`);
      return semanticTokens.primary; // Fallback to primary color
    }
  }

  return typeof current === "string" ? current : semanticTokens.primary;
}

/**
 * Generate Tailwind classes with design tokens
 * Ensures consistent usage patterns
 */
export const tokenClasses = {
  // Primary button styles
  buttonPrimary:
    "bg-brand-jade hover:bg-interaction-jade focus:bg-interaction-jade text-white font-semibold py-2 px-4 rounded transition-colors",

  // Secondary button styles
  buttonSecondary:
    "bg-surface-jade hover:bg-surface-jade-dark text-brand-jade-dark font-semibold py-2 px-4 rounded border border-surface-jade-dark transition-colors",

  // Card styles
  card: "bg-white border border-surface-jade-dark rounded-lg shadow-sm",
  cardHover:
    "hover:shadow-md hover:border-brand-jade transition-all duration-200",

  // Navigation styles
  navItem:
    "text-gray-600 hover:text-interaction-jade hover:bg-surface-jade p-2 rounded transition-colors",
  navBrand: "text-interaction-jade font-bold text-xl",

  // Form styles
  input:
    "border border-surface-jade-dark focus:border-brand-jade focus:ring-1 focus:ring-brand-jade rounded px-3 py-2",
  inputError: "border-red-500 focus:border-red-500 focus:ring-red-500",

  // Text styles
  heading: "text-brand-navy-dark font-bold",
  body: "text-gray-700",
  muted: "text-gray-500",

  // Interactive states
  interactive:
    "hover:bg-interaction-jade hover:text-white transition-colors cursor-pointer",

  // Status styles
  success: "bg-green-50 text-green-800 border border-green-200",
  warning: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  error: "bg-red-50 text-red-800 border border-red-200",

  // Icon color standardization - Professional consistency
  iconBrand: `text-[${componentTokens.icon.jade}]`,
  iconPrimary: `text-[${colorTokens.text.primary}]`,
  iconSecondary: `text-[${colorTokens.text.secondary}]`,
  iconSuccess: `text-[${contrastTokens.status.success}]`,
  iconWarning: `text-[${contrastTokens.status.warning}]`,
  iconError: `text-[${contrastTokens.status.error}]`,
  iconInfo: `text-[${contrastTokens.status.info}]`,
  iconMuted: `text-[${colorTokens.text.muted}]`,
  iconInverted: `text-[${contrastTokens.text.onDark}]`,

  // Enhanced elevation classes
  elevationCard: "elevation-card",
  elevationCardHover: "elevation-card hoverable",
  elevationButton: "elevation-button",
  elevationButtonHover: "elevation-button", // hover state handled in CSS
  elevationModal: "elevation-modal",
  elevationDropdown: "elevation-dropdown",

  // Enhanced contrast classes
  textHighContrast: `text-[${contrastTokens.text.onLight}]`,
  textBrandContrast: `text-[${contrastTokens.interactive.brandOnLight}]`,
  textHoverContrast: `hover:text-[${contrastTokens.interactive.hoverOnLight}]`,
} as const;

/**
 * Validate if a token exists
 */
export function isValidToken(path: string): boolean {
  try {
    getTokenColor(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all available token paths
 * Useful for development and debugging
 */
export function getAllTokenPaths(): string[] {
  const paths: string[] = [];

  function traverse(obj: unknown, prefix = ""): void {
    if (obj && typeof obj === "object" && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = prefix ? `${prefix}.${key}` : key;

        if (typeof value === "string") {
          paths.push(currentPath);
        } else if (typeof value === "object" && value !== null) {
          traverse(value, currentPath);
        }
      }
    }
  }

  traverse({ ...colorTokens, ...semanticTokens, ...componentTokens });
  return paths.sort();
}

/**
 * Development helper: Print all available tokens
 */
export function printTokens(): void {
  if (process.env.NODE_ENV === "development") {
    console.group("🎨 Available Design Tokens:");
    getAllTokenPaths().forEach((path) => {
      console.log(`${path}: ${getTokenColor(path)}`);
    });
    console.groupEnd();
  }
}
