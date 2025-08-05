/**
 * Design System Utilities
 * Helper functions for working with design tokens
 */

import { colorTokens, semantic, component } from "./tokens";

// Interface for nested token structure
interface TokenObject {
  [key: string]: string | TokenObject;
}

/**
 * Get a color value by token path
 * Provides type-safe access to design tokens
 */
export function getTokenColor(path: string): string {
  const parts = path.split(".");
  let current: string | TokenObject = { ...colorTokens, semantic, component };

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      console.warn(`Design token path "${path}" not found`);
      return semantic.primary; // Fallback to primary color
    }
  }

  return typeof current === "string" ? current : semantic.primary;
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

  function traverse(obj: TokenObject, prefix = ""): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "string") {
        paths.push(currentPath);
      } else if (typeof value === "object" && value !== null) {
        traverse(value, currentPath);
      }
    }
  }

  traverse({ ...colorTokens, semantic, component });
  return paths.sort();
}

/**
 * Development helper: Print all available tokens
 */
export function printTokens(): void {
  if (process.env.NODE_ENV === "development") {
    console.group("[Design/Colorful] Available Design Tokens:");
    getAllTokenPaths().forEach((path) => {
      console.log(`${path}: ${getTokenColor(path)}`);
    });
    console.groupEnd();
  }
}
