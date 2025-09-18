/**
 * BoxCall Design System - Spacing
 *
 * Professional spacing system for football management platform
 * Provides consistent spacing tokens and utilities
 */
// Spacing scale (based on Tailwind CSS with 4px base unit)
export const spacing = {
  // Micro spacing
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "0.75rem", // 12px
  lg: "1rem", // 16px
  xl: "1.25rem", // 20px
  // Component spacing
  "2xl": "1.5rem", // 24px
  "3xl": "2rem", // 32px
  "4xl": "2.5rem", // 40px
  "5xl": "3rem", // 48px
  "6xl": "4rem", // 64px
  // Layout spacing
  "7xl": "5rem", // 80px
  "8xl": "6rem", // 96px
  "9xl": "8rem", // 128px
} as const;
// Semantic spacing mappings for component usage
export const semanticSpacing = {
  // Component internal spacing
  component: {
    padding: {
      xs: spacing.sm, // 8px
      sm: spacing.md, // 12px
      md: spacing.lg, // 16px
      lg: spacing.xl, // 20px
      xl: spacing["2xl"], // 24px
    },
    margin: {
      xs: spacing.xs, // 4px
      sm: spacing.sm, // 8px
      md: spacing.md, // 12px
      lg: spacing.lg, // 16px
      xl: spacing.xl, // 20px
    },
    gap: {
      xs: spacing.xs, // 4px
      sm: spacing.sm, // 8px
      md: spacing.md, // 12px
      lg: spacing.lg, // 16px
      xl: spacing.xl, // 20px
    },
  },
  // Layout spacing
  layout: {
    section: spacing["6xl"], // 64px between major sections
    container: spacing["5xl"], // 48px container padding
    sidebar: spacing["3xl"], // 32px sidebar padding
    header: spacing["2xl"], // 24px header padding
    footer: spacing["2xl"], // 24px footer padding
  },
  // Form spacing
  form: {
    fieldGap: spacing.lg, // 16px between form fields
    groupGap: spacing["2xl"], // 24px between form groups
    buttonGap: spacing.md, // 12px between buttons
    labelGap: spacing.sm, // 8px between label and input
  },
  // Card spacing
  card: {
    padding: spacing.lg, // 16px card internal padding
    gap: spacing.md, // 12px between card elements
    margin: spacing.lg, // 16px between cards
  },
  // Football-specific spacing
  football: {
    playerGap: spacing.md, // 12px between player elements
    statGap: spacing.sm, // 8px between stats
    playGap: spacing.lg, // 16px between plays
    teamGap: spacing.xl, // 20px between team sections
  },
} as const;
// Tailwind CSS spacing classes for common patterns
export const spacingClasses = {
  // Padding classes
  padding: {
    none: "p-0",
    xs: "p-1", // 4px
    sm: "p-2", // 8px
    md: "p-3", // 12px
    lg: "p-4", // 16px
    xl: "p-5", // 20px
    "2xl": "p-6", // 24px
    "3xl": "p-8", // 32px
    "4xl": "p-10", // 40px
    "5xl": "p-12", // 48px
    "6xl": "p-16", // 64px
  },
  // Margin classes
  margin: {
    none: "m-0",
    xs: "m-1", // 4px
    sm: "m-2", // 8px
    md: "m-3", // 12px
    lg: "m-4", // 16px
    xl: "m-5", // 20px
    "2xl": "m-6", // 24px
    "3xl": "m-8", // 32px
    "4xl": "m-10", // 40px
    "5xl": "m-12", // 48px
    "6xl": "m-16", // 64px
  },
  // Gap classes (for flexbox/grid)
  gap: {
    none: "gap-0",
    xs: "gap-1", // 4px
    sm: "gap-2", // 8px
    md: "gap-3", // 12px
    lg: "gap-4", // 16px
    xl: "gap-5", // 20px
    "2xl": "gap-6", // 24px
    "3xl": "gap-8", // 32px
    "4xl": "gap-10", // 40px
    "5xl": "gap-12", // 48px
    "6xl": "gap-16", // 64px
  },
  // Space between classes
  space: {
    xs: "space-y-1 space-x-1", // 4px
    sm: "space-y-2 space-x-2", // 8px
    md: "space-y-3 space-x-3", // 12px
    lg: "space-y-4 space-x-4", // 16px
    xl: "space-y-5 space-x-5", // 20px
    "2xl": "space-y-6 space-x-6", // 24px
    "3xl": "space-y-8 space-x-8", // 32px
  },
} as const;
// Spacing utility functions
export const spacingUtils = {
  /**
   * Get spacing value by key
   */
  getSpacing: (key: keyof typeof spacing): string => {
    return spacing[key];
  },
  /**
   * Get semantic spacing value
   */
  getSemantic: (
    category: keyof typeof semanticSpacing,
    subcategory: string,
    variant?: string
  ): string => {
    const categorySpacing = semanticSpacing[category] as Record<
      string,
      unknown
    >;
    if (variant && typeof categorySpacing[subcategory] === "object") {
      const subcategorySpacing = categorySpacing[subcategory] as Record<
        string,
        string
      >;
      return subcategorySpacing[variant] || spacing.md;
    }
    return (categorySpacing[subcategory] as string) || spacing.md;
  },
  /**
   * Generate responsive spacing classes
   */
  responsive: (
    base: string,
    sm?: string,
    md?: string,
    lg?: string,
    xl?: string
  ): string => {
    const classes = [base];
    if (sm) classes.push(`sm:${sm}`);
    if (md) classes.push(`md:${md}`);
    if (lg) classes.push(`lg:${lg}`);
    if (xl) classes.push(`xl:${xl}`);
    return classes.join(" ");
  },
  /**
   * Generate CSS custom properties for spacing
   */
  toCSSCustomProperties: (): Record<string, string> => {
    const cssVars: Record<string, string> = {};
    // Add base spacing
    Object.entries(spacing).forEach(([key, value]) => {
      cssVars[`--spacing-${key}`] = value;
    });
    // Add semantic spacing
    const flattenSpacing = (
      obj: Record<string, unknown>,
      prefix: string
    ): void => {
      Object.entries(obj).forEach(([key, value]) => {
        const varName = `${prefix}-${key}`;
        if (typeof value === "string") {
          cssVars[`--spacing-${varName}`] = value;
        } else if (typeof value === "object" && value !== null) {
          flattenSpacing(value as Record<string, unknown>, varName);
        }
      });
    };
    flattenSpacing(semanticSpacing, "semantic");
    return cssVars;
  },
};
export default spacing;
