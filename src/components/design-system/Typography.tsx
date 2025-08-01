/**
 * BoxCall Design System - Typography
 *
 * Professional typography system for football management platform
 * Provides consistent text styling across all components
 */

import React from "react";

// Typography variant types
export type TypographyVariant =
  | "headline-xl"
  | "headline-lg"
  | "headline-md"
  | "headline-sm"
  | "body-lg"
  | "body-md"
  | "body-sm"
  | "body-xs"
  | "label-lg"
  | "label-md"
  | "button"
  | "caption";

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
  | "label";

export interface TypographyProps {
  /** Typography variant for consistent styling */
  variant: TypographyVariant;

  /** HTML element to render */
  as?: TypographyElement;

  /** Text content */
  children: React.ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Text color override */
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "muted"
    | "inverse";

  /** Text alignment */
  align?: "left" | "center" | "right";

  /** Truncate text with ellipsis */
  truncate?: boolean;
}

// Typography variant class mappings
const typographyClasses: Record<TypographyVariant, string> = {
  // Headlines
  "headline-xl": "text-4xl font-bold leading-tight",
  "headline-lg": "text-3xl font-bold leading-tight",
  "headline-md": "text-2xl font-bold leading-tight",
  "headline-sm": "text-xl font-bold leading-tight",

  // Body text
  "body-lg": "text-lg leading-relaxed",
  "body-md": "text-base leading-relaxed",
  "body-sm": "text-sm leading-relaxed",
  "body-xs": "text-xs leading-relaxed",

  // Labels and UI
  "label-lg": "text-sm font-semibold uppercase tracking-wide",
  "label-md": "text-xs font-semibold uppercase tracking-wide",
  button: "text-sm font-semibold",
  caption: "text-xs text-gray-600",
};

// Color class mappings
const colorClasses: Record<string, string> = {
  primary: "text-blue-600",
  secondary: "text-gray-600",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
  muted: "text-gray-500",
  inverse: "text-white",
};

// Text alignment classes
const alignClasses: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

// Default element mapping for semantic HTML
const defaultElements: Record<TypographyVariant, TypographyElement> = {
  "headline-xl": "h1",
  "headline-lg": "h2",
  "headline-md": "h3",
  "headline-sm": "h4",
  "body-lg": "p",
  "body-md": "p",
  "body-sm": "p",
  "body-xs": "p",
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
