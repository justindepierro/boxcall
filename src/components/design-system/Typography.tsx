/**
 * BoxCall Design System - Typography
 *
 * Professional typography system with masculine, square aesthetic
 * Features Bebas Neue (display) + Inter (body) + IBM Plex Mono (code)
 */

import React from "react";

// Typography variant types - Updated with new display variant
export type TypographyVariant =
  | "display-xl" // NEW: Hero text, team names (Bebas Neue)
  | "display-lg" // NEW: Large display text (Bebas Neue)
  | "display-md" // NEW: Medium display text (Bebas Neue)
  | "headline-xl" // Main headlines (Inter Bold)
  | "headline-lg" // Section headers (Inter Bold)
  | "headline-md" // Subsection headers (Inter Bold)
  | "headline-sm" // Small headers (Inter Bold)
  | "body-lg" // Large body text (Inter)
  | "body-md" // Standard body text (Inter)
  | "body-sm" // Small body text (Inter)
  | "body-xs" // Extra small body text (Inter)
  | "code-lg" // NEW: Large code/stats (IBM Plex Mono)
  | "code-md" // NEW: Standard code/stats (IBM Plex Mono)
  | "code-sm" // NEW: Small code/stats (IBM Plex Mono)
  | "label-lg" // Large labels (Inter Medium)
  | "label-md" // Standard labels (Inter Medium)
  | "button" // Button text (Inter Semibold)
  | "caption"; // Caption text (Inter)

export type TypographyElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div"
  | "label"
  | "code";

export interface TypographyProps {
  /** Typography variant for consistent styling */
  variant: TypographyVariant;

  /** HTML element to render */
  as?: TypographyElement;

  /** Text content */
  children: React.ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Text color override - Updated with jade/navy colors */
  color?:
    | "primary" // jade-600
    | "secondary" // navy-600
    | "success" // green-600
    | "warning" // yellow-600
    | "error" // red-600
    | "muted" // gray-500
    | "inverse"; // white/dark mode text

  /** Text alignment */
  align?: "left" | "center" | "right";

  /** Truncate text with ellipsis */
  truncate?: boolean;
}

// Typography variant class mappings - Updated with new font families and square aesthetic
const typographyClasses: Record<TypographyVariant, string> = {
  // Display variants - Bebas Neue for maximum impact
  "display-xl": "font-display text-6xl font-normal leading-none tracking-tight",
  "display-lg": "font-display text-5xl font-normal leading-none tracking-tight",
  "display-md":
    "font-display text-4xl font-normal leading-tight tracking-tight",

  // Headlines - Inter Bold for hierarchy
  "headline-xl": "font-sans text-4xl font-bold leading-tight",
  "headline-lg": "font-sans text-3xl font-bold leading-tight",
  "headline-md": "font-sans text-2xl font-bold leading-tight",
  "headline-sm": "font-sans text-xl font-bold leading-tight",

  // Body text - Inter for readability
  "body-lg": "font-sans text-lg leading-relaxed",
  "body-md": "font-sans text-base leading-relaxed",
  "body-sm": "font-sans text-sm leading-relaxed",
  "body-xs": "font-sans text-xs leading-relaxed",

  // Code/Stats - IBM Plex Mono for technical data
  "code-lg": "font-mono text-lg leading-normal",
  "code-md": "font-mono text-base leading-normal",
  "code-sm": "font-mono text-sm leading-normal",

  // Labels and UI - Inter Medium
  "label-lg": "font-sans text-sm font-semibold uppercase tracking-wide",
  "label-md": "font-sans text-xs font-semibold uppercase tracking-wide",
  button: "font-sans text-sm font-semibold",
  caption: "font-sans text-xs text-gray-600 dark:text-gray-400",
};

// Color class mappings - Updated with jade/navy system
const colorClasses: Record<string, string> = {
  primary: "text-jade-600 dark:text-jade-400", // Jade green for primary
  secondary: "text-navy-600 dark:text-navy-400", // Navy blue for secondary
  success: "text-green-600 dark:text-green-400", // Success green
  warning: "text-yellow-600 dark:text-yellow-400", // Warning yellow
  error: "text-red-600 dark:text-red-400", // Error red
  muted: "text-gray-500 dark:text-gray-400", // Muted gray
  inverse: "text-white dark:text-gray-900", // Inverse colors
};

// Text alignment classes
const alignClasses: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

// Default element mapping for semantic HTML - Updated with new variants
const defaultElements: Record<TypographyVariant, TypographyElement> = {
  "display-xl": "h1",
  "display-lg": "h1",
  "display-md": "h2",
  "headline-xl": "h1",
  "headline-lg": "h2",
  "headline-md": "h3",
  "headline-sm": "h4",
  "body-lg": "p",
  "body-md": "p",
  "body-sm": "p",
  "body-xs": "p",
  "code-lg": "code",
  "code-md": "code",
  "code-sm": "code",
  "label-lg": "label",
  "label-md": "label",
  button: "span",
  caption: "span",
};

/**
 * Typography component for consistent text styling across BoxCall
 *
 * @param variant - Typography style variant
 * @param as - HTML element to render (optional, defaults based on variant)
 * @param children - Text content
 * @param className - Additional CSS classes
 * @param color - Text color variant
 * @param align - Text alignment
 * @param truncate - Whether to truncate text with ellipsis
 */
export const Typography: React.FC<TypographyProps> = ({
  variant,
  as,
  children,
  className = "",
  color,
  align,
  truncate = false,
  ...restProps
}) => {
  // Determine the HTML element to render
  const Element = as || defaultElements[variant];

  // Build class string
  const classes = [
    typographyClasses[variant],
    color && colorClasses[color],
    align && alignClasses[align],
    truncate && "truncate",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Element className={classes} {...restProps}>
      {children}
    </Element>
  );
};

// Set display name for debugging
Typography.displayName = "Typography";

export default Typography;
