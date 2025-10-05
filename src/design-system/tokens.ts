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

  // Blue System - Links, Actions, Interactive Elements
  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6", // PRIMARY interactive blue (66 occurrences in audit!)
    600: "#2563EB", // Links, primary actions (48 occurrences!)
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },

  // Cyan System - Highlights, Selections, Focus States
  cyan: {
    50: "#ECFEFF",
    100: "#CFFAFE",
    200: "#A5F3FC",
    300: "#67E8F9",
    400: "#22D3EE", // Highlight color (42 occurrences in audit!)
    500: "#06B6D4",
    600: "#0891B2",
    700: "#0E7490",
    800: "#155E75",
    900: "#164E63",
  },

  // Amber System - Warnings, Selections, Active States
  amber: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24", // Selection highlight (118 occurrences! 🔥 Top hardcoded color!)
    500: "#F59E0B", // Warning states (54 occurrences!)
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },

  // Emerald System - Success States, Positive Actions
  emerald: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981", // Success indicators (28 occurrences!)
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },

  // Purple System - Electric Theme, Premium Features
  purple: {
    50: "#FAF5FF",
    100: "#F3E8FF",
    200: "#E9D5FF",
    300: "#D8B4FE",
    400: "#C084FC",
    500: "#A855F7",
    600: "#9333EA",
    700: "#7C3AED", // Electric accent (24 occurrences!)
    800: "#6B21A8",
    900: "#581C87",
  },

  // Violet System - Alternative Purple Tones
  violet: {
    50: "#F5F3FF",
    100: "#EDE9FE",
    200: "#DDD6FE",
    300: "#C4B5FD",
    400: "#A78BFA",
    500: "#8B5CF6", // Premium features
    600: "#7C3AED",
    700: "#6D28D9",
    800: "#5B21B6",
    900: "#4C1D95",
  },

  // Red System - Extended for Defensive Players, Alerts
  red: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C", // Defensive player color (15 occurrences!)
    800: "#991B1B",
    900: "#7F1D1D",
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

  // Links & Interactive Elements
  linkColor: colorTokens.blue[600], // Primary link color
  linkHoverColor: colorTokens.blue[700], // Link hover state
  linkVisitedColor: colorTokens.purple[700], // Visited link color

  // Highlights & Selections
  highlightColor: colorTokens.amber[400], // Selection highlight
  highlightBg: colorTokens.amber[50], // Highlight background
  selectionColor: colorTokens.cyan[400], // Active selection
  selectionBg: colorTokens.cyan[50], // Selection background
  selectionBorder: colorTokens.amber[400], // Selection border (118 occurrences!)

  // Diagram-Specific Colors
  diagram: {
    // Player colors
    offensivePlayer: colorTokens.blue[600], // Offensive player (blue)
    offensivePlayerAlt: colorTokens.blue[900], // Alternative offensive (#1e3a8a)
    defensivePlayer: colorTokens.red[700], // Defensive player (red)
    defensivePlayerAlt: colorTokens.red[600], // Alternative defensive
    specialTeamsPlayer: colorTokens.amber[500], // Special teams

    // Route colors
    routeColor: colorTokens.emerald[500], // Route paths (green)
    routeColorAlt: colorTokens.blue[600], // Alternative route color
    routeStart: colorTokens.emerald[400], // Route start point
    routeEnd: colorTokens.amber[400], // Route end point

    // Annotation colors
    annotationColor: colorTokens.gray[900], // Default annotation color
    annotationHighlight: colorTokens.cyan[400], // Highlighted annotation
    annotationConnector: colorTokens.blue[500], // Connector lines
    annotationSelection: colorTokens.blue[500], // Selected annotation

    // Guide & Grid colors
    guideColor: colorTokens.success[500], // Alignment guides (#22c55e)
    gridColor: colorTokens.gray[200], // Grid lines
    gridColorDark: colorTokens.gray[700], // Dark theme grid

    // Field colors
    fieldBackground: colorTokens.gray[50], // Light field background
    fieldBackgroundDark: colorTokens.gray[900], // Dark field background
    fieldBorder: colorTokens.jade[700], // Field borders
    fieldZone: colorTokens.jade[800], // End zones

    // Minimap colors
    minimapBorder: colorTokens.amber[400], // Minimap viewport border
    minimapBackground: "#FFFFFF", // Minimap background
  },

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

// Fine-grained spacing for precision layouts
export const fineSpacingTokens = {
  0.5: "0.125rem", // 2px - hairline spacing
  1.5: "0.375rem", // 6px - fine spacing
  2.5: "0.625rem", // 10px - between standard steps
  3.5: "0.875rem", // 14px - precise layouts
} as const;

// Semantic spacing tokens for common use cases
export const semanticSpacingTokens = {
  // Component padding
  buttonPadding: spacingTokens[3], // 12px
  buttonPaddingLarge: spacingTokens[4], // 16px
  cardPadding: spacingTokens[4], // 16px
  cardPaddingLarge: spacingTokens[6], // 24px
  inputPadding: spacingTokens[3], // 12px
  
  // Layout spacing
  sectionGap: spacingTokens[8], // 32px between sections
  itemSpacing: spacingTokens[4], // 16px between items
  listGap: spacingTokens[2], // 8px between list items
  gridGap: spacingTokens[4], // 16px grid gap
  
  // Stack spacing
  stackTight: spacingTokens[1], // 4px
  stackNormal: spacingTokens[2], // 8px
  stackRelaxed: spacingTokens[4], // 16px
  stackLoose: spacingTokens[6], // 24px
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
// OPACITY/ALPHA SYSTEM - Transparent Overlays
// ============================================================================

export const opacityTokens = {
  0: "0",
  5: "0.05", // 5% - very subtle
  10: "0.1", // 10% - subtle overlay
  15: "0.15", // 15% - light overlay
  20: "0.2", // 20% - moderate overlay
  30: "0.3", // 30% - visible overlay
  40: "0.4", // 40% - strong overlay
  50: "0.5", // 50% - half opacity
  60: "0.6", // 60% - more opaque
  70: "0.7", // 70% - mostly opaque
  75: "0.75", // 75% - three-quarters
  80: "0.8", // 80% - very opaque
  90: "0.9", // 90% - nearly solid
  95: "0.95", // 95% - almost solid
  100: "1", // 100% - fully opaque
} as const;

// ============================================================================
// BORDER RADIUS SYSTEM - Consistent Corner Styles
// ============================================================================

export const borderRadiusTokens = {
  none: "0", // No rounding
  sm: "0.125rem", // 2px - subtle rounding
  md: "0.375rem", // 6px - moderate rounding
  lg: "0.5rem", // 8px - large rounding
  xl: "0.75rem", // 12px - extra large
  "2xl": "1rem", // 16px - very large
  "3xl": "1.5rem", // 24px - huge
  full: "9999px", // Fully rounded (pills, circles)
} as const;

// Semantic border radius for common components
export const semanticBorderRadiusTokens = {
  button: borderRadiusTokens.md, // 6px
  card: borderRadiusTokens.lg, // 8px
  input: borderRadiusTokens.md, // 6px
  modal: borderRadiusTokens.xl, // 12px
  badge: borderRadiusTokens.full, // Fully rounded
  avatar: borderRadiusTokens.full, // Fully rounded
  image: borderRadiusTokens.lg, // 8px
} as const;

// ============================================================================
// ELEVATION & SHADOW SYSTEM - "Professional Depth"
// ============================================================================

export const elevationTokens = {
  // Minimal shadows for subtle depth
  none: "none",

  // Standardized shadow scale
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)", // Subtle shadow
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", // Moderate shadow
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", // Large shadow
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)", // Extra large shadow
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)", // Huge shadow

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
export function getColor(
  tokenName: Exclude<keyof typeof semanticTokens, "diagram">
): string {
  const value = semanticTokens[tokenName];
  if (typeof value === "string") {
    return value;
  }
  throw new Error(`Token ${tokenName} is not a string value`);
}

/**
 * Get diagram-specific color
 * Usage: getDiagramColor('offensivePlayer') -> '#2563EB'
 */
export function getDiagramColor(
  colorName: keyof typeof semanticTokens.diagram
): string {
  return semanticTokens.diagram[colorName];
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

  // Add semantic tokens (excluding nested objects)
  Object.entries(semanticTokens).forEach(([key, value]) => {
    if (typeof value === "string") {
      cssVars[`--color-${key}`] = value;
    } else if (typeof value === "object") {
      // Handle nested objects like diagram
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        cssVars[`--color-${key}-${nestedKey}`] = nestedValue as string;
      });
    }
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
  blue: colorTokens.blue,
  cyan: colorTokens.cyan,
  amber: colorTokens.amber,
  emerald: colorTokens.emerald,
  purple: colorTokens.purple,
  violet: colorTokens.violet,
  red: colorTokens.red,
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
  fineSpacingTokens as fineSpacing,
  semanticSpacingTokens as semanticSpacing,
  densityTokens as density,
  opacityTokens as opacity,
  borderRadiusTokens as borderRadius,
  semanticBorderRadiusTokens as semanticBorderRadius,
  elevationTokens as elevation,
};
