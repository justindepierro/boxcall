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
    700: "#15803D", // Added missing 700 shade
  },

  warning: {
    50: "#FFFBEB",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309", // Added missing 700 shade
  },

  error: {
    50: "#FEF2F2",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C", // Added missing 700 shade
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

  // Text colors
  text: {
    primary: "#111827", // gray-900
    secondary: "#6B7280", // gray-500
    muted: "#9CA3AF", // gray-400
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
  surfaceSubtleHover: colorTokens.gray[100],
  surfaceInverse: colorTokens.gray[900],
  surfaceInverseAlt: colorTokens.gray[700],

  // Borders & Focus
  border: colorTokens.gray[200],
  borderFocus: colorTokens.jade[500],
  borderError: colorTokens.error[500],
  focusRing: colorTokens.jade[600],

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

// Density scale (compact layout support)
export const densityTokens = {
  compact: {
    cardPadding: spacingTokens[3], // 12px
    gridGap: spacingTokens[4], // 16px (visual rhythm)
    headerPadding: spacingTokens[3],
  },
  comfortable: {
    cardPadding: spacingTokens[4], // 16px
    gridGap: spacingTokens[5], // 20px
    headerPadding: spacingTokens[4],
  },
} as const;

// ============================================================================
// ELEVATION & SHADOW SYSTEM - "Professional Depth"
// ============================================================================

export const elevationTokens = {
  // Minimal shadows for subtle depth
  none: "none",

  // Card elevations - increasing depth
  card: {
    resting: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    hover: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    active: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  },

  // Button elevations
  button: {
    resting: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    hover: "0 2px 4px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    active: "inset 0 1px 2px 0 rgb(0 0 0 / 0.1)",
  },

  // Modal and overlay elevations
  modal: "0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 0 1px rgb(0 0 0 / 0.05)",
  dropdown:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",

  // Focus rings for accessibility
  focus: "0 0 0 2px rgb(4 120 87 / 0.2)", // Jade focus ring
} as const;

// ============================================================================
// ENHANCED CONTRAST SYSTEM - "Industry-Leading Accessibility"
// ============================================================================

export const contrastTokens = {
  // High contrast text combinations for maximum readability
  text: {
    // Primary text (AAA compliance)
    onLight: colorTokens.gray[900], // #111827 on light backgrounds
    onDark: "#FFFFFF", // White on dark backgrounds
    onBrand: "#FFFFFF", // White on jade/navy

    // Secondary text (AA+ compliance)
    secondaryOnLight: colorTokens.gray[700], // #374151
    secondaryOnDark: colorTokens.gray[300], // #D1D5DB

    // Muted text (AA compliance)
    mutedOnLight: colorTokens.gray[600], // #4B5563
    mutedOnDark: colorTokens.gray[400], // #9CA3AF
  },

  // Interactive element contrast
  interactive: {
    // Brand interactions with guaranteed contrast
    brandOnLight: colorTokens.jade[600], // #047857 - Strong contrast
    brandOnDark: colorTokens.jade[400], // #34D399 - Enhanced for dark mode

    // Hover states with enhanced visibility
    hoverOnLight: colorTokens.jade[700], // #065F46 - Darker for better contrast
    hoverOnDark: colorTokens.jade[300], // #6EE7B7 - Lighter for dark mode
  },

  // Status colors with enhanced contrast
  status: {
    success: colorTokens.success[700], // #15803D - Darker green
    warning: colorTokens.warning[700], // #B45309 - Darker amber
    error: colorTokens.error[700], // #B91C1C - Darker red
    info: colorTokens.jade[700], // #065F46 - Brand-aligned info
  },

  // Psychological color system for badges and UI states
  psychology: {
    // 🔴 RED = URGENCY - Immediate attention required
    urgency: {
      background: "#FEF2F2", // red-50
      text: "#991B1B", // red-800
      border: "#FECACA", // red-200
      hover: "#FEE2E2", // red-100
    },

    // 🟢 GREEN = ACHIEVEMENT - Success and accomplishment
    achievement: {
      background: "#F0FDF4", // green-50
      text: "#166534", // green-800
      border: "#BBF7D0", // green-200
      hover: "#DCFCE7", // green-100
    },

    // 🔵 BLUE = INFORMATION - Neutral, informative content
    information: {
      background: "#EFF6FF", // blue-50
      text: "#1E40AF", // blue-800
      border: "#BFDBFE", // blue-200
      hover: "#DBEAFE", // blue-100
    },

    // 🟡 YELLOW = ATTENTION - Important but not urgent
    attention: {
      background: "#FFFBEB", // amber-50
      text: "#92400E", // amber-800
      border: "#FDE68A", // amber-200
      hover: "#FEF3C7", // amber-100
    },

    // 🟣 PURPLE = PREMIUM - Special, elite, exclusive
    premium: {
      background: "#F5F3FF", // violet-50
      text: "#5B21B6", // violet-800
      border: "#C4B5FD", // violet-200
      hover: "#EDE9FE", // violet-100
    },
  },
} as const; // ============================================================================
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
    info: colorTokens.jade[500], // #00A86B - Using brand jade for info
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
