/**
 * BoxCall Design Tokens - Single Source of Truth
 *
 * Centralized design system with complete color, spacing, typography tokens
 * All components should import from this file, never hardcode values
 */

// ============================================================================
// COLOR TOKENS - The Only Color Definitions
// ============================================================================

export const colorTokens = {
  // Primary Brand - Jade Green System
  jade: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#00A86B", // PRIMARY brand color
    600: "#047857", // MAIN interaction color (hover, focus, icons)
    700: "#065F46",
    800: "#064E3B",
    900: "#052E16",
  },

  // Secondary Brand - Navy Blue System
  navy: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A", // PRIMARY dark color
  },

  // Semantic Colors
  success: {
    50: "#F0FDF4",
    500: "#22C55E",
    600: "#16A34A",
  },

  warning: {
    50: "#FFFBEB",
    500: "#F59E0B",
    600: "#D97706",
  },

  error: {
    50: "#FEF2F2",
    500: "#EF4444",
    600: "#DC2626",
  },

  // Neutral System
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
} as const;

// ============================================================================
// SEMANTIC TOKEN MAPPING - Business Logic Colors
// ============================================================================

export const semanticTokens = {
  // Interactive states
  primary: colorTokens.jade[500],
  primaryHover: colorTokens.jade[600],
  primaryActive: colorTokens.jade[700],

  secondary: colorTokens.navy[500],
  secondaryHover: colorTokens.navy[600],
  secondaryActive: colorTokens.navy[700],

  // Text hierarchy
  textPrimary: colorTokens.gray[900],
  textSecondary: colorTokens.gray[600],
  textMuted: colorTokens.gray[500],
  textInverse: "#FFFFFF",
  textBrand: colorTokens.jade[600],

  // Backgrounds
  bgPrimary: "#FFFFFF",
  bgSecondary: colorTokens.gray[50],
  bgMuted: colorTokens.gray[100],
  bgBrand: colorTokens.jade[50],
  bgNavy: colorTokens.navy[50],

  // Borders & Focus
  border: colorTokens.gray[200],
  borderFocus: colorTokens.jade[500],
  borderError: colorTokens.error[500],

  // Status states
  success: colorTokens.success[500],
  successBg: colorTokens.success[50],
  warning: colorTokens.warning[500],
  warningBg: colorTokens.warning[50],
  error: colorTokens.error[500],
  errorBg: colorTokens.error[50],

  // Football-specific
  boxcallBrand: colorTokens.jade[600], // For BoxCall icons/elements
  coachAuthority: colorTokens.navy[600], // For coach-level elements
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typographyTokens = {
  fontFamily: {
    display: ["Bebas Neue", "system-ui", "sans-serif"],
    interface: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "Consolas", "monospace"],
  },

  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },

  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacingTokens = {
  0: "0px",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
} as const;

// ============================================================================
// COMPONENT TOKENS - Specific Use Cases
// ============================================================================

export const componentTokens = {
  // Icon colors (replaces hardcoded values)
  icon: {
    default: "currentColor",
    jade: semanticTokens.boxcallBrand, // #047857
    navy: semanticTokens.coachAuthority, // #475569
    slate: colorTokens.gray[500], // #6B7280
    success: semanticTokens.success, // #22C55E
    warning: semanticTokens.warning, // #F59E0B
    error: semanticTokens.error, // #EF4444
  },

  // Button variants
  button: {
    primaryBg: semanticTokens.primary,
    primaryBgHover: semanticTokens.primaryHover,
    primaryText: "#FFFFFF",

    secondaryBg: "transparent",
    secondaryBorder: semanticTokens.secondary,
    secondaryText: semanticTokens.secondary,
    secondaryBgHover: semanticTokens.bgNavy,
  },

  // Card backgrounds
  card: {
    background: semanticTokens.bgPrimary,
    border: semanticTokens.border,
    shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
  },

  // Navigation
  navigation: {
    background: semanticTokens.bgPrimary,
    border: semanticTokens.border,
    linkHover: semanticTokens.bgBrand,
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color by semantic token name
 * Usage: getColor('primary') -> '#00A86B'
 */
export function getColor(tokenName: keyof typeof semanticTokens): string {
  return semanticTokens[tokenName];
}

/**
 * Get component-specific color
 * Usage: getComponentColor('icon', 'jade') -> '#047857'
 */
export function getComponentColor(
  component: keyof typeof componentTokens,
  variant: string
): string {
  const componentGroup = componentTokens[component] as Record<string, string>;
  return (
    componentGroup[variant] ||
    componentGroup.default ||
    semanticTokens.textPrimary
  );
}

/**
 * Generate CSS custom properties for use in CSS files
 */
export function generateCSSCustomProperties(): Record<string, string> {
  const cssVars: Record<string, string> = {};

  // Add semantic tokens
  Object.entries(semanticTokens).forEach(([key, value]) => {
    cssVars[`--color-${key}`] = value;
  });

  // Add component tokens
  Object.entries(componentTokens).forEach(([componentKey, componentValue]) => {
    Object.entries(componentValue).forEach(([variantKey, variantValue]) => {
      cssVars[`--${componentKey}-${variantKey}`] = variantValue;
    });
  });

  return cssVars;
}

// ============================================================================
// EXPORTS FOR EXTERNAL USAGE
// ============================================================================

// For Tailwind config
export const tailwindColors = {
  jade: colorTokens.jade,
  navy: colorTokens.navy,
  gray: colorTokens.gray,
  success: colorTokens.success,
  warning: colorTokens.warning,
  error: colorTokens.error,
};

// For component development
export {
  colorTokens as colors,
  semanticTokens as semantic,
  componentTokens as component,
  typographyTokens as typography,
  spacingTokens as spacing,
};

// Default export for convenience
export default {
  colors: colorTokens,
  semantic: semanticTokens,
  component: componentTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  utils: {
    getColor,
    getComponentColor,
    generateCSSCustomProperties,
  },
};
