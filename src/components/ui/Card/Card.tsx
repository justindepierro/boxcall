/**
 * BoxCall Card Component
 *
 * Shadow-based elevation system for clean, professional UI
 * NO BORDERS on cards - shadows create depth instead
 * Follows design system surfaceTokens standard
 */
import { forwardRef } from "react";

import type { CardProps, CardStylesConfig } from "./Card.types";

/**
 * Card styles configuration - Shadow-only design (NO BORDERS)
 *
 * Philosophy: Clean SaaS aesthetic with shadow-based depth
 * - Similar to Linear, Notion, Figma
 * - Borders reserved for inputs, dividers only
 * - Shadows create visual hierarchy
 * - Enhanced with modern dramatic hover states
 *
 * Uses surfaceTokens from design-system/tokens.ts
 */
const cardStyles: CardStylesConfig = {
  base: "rounded-lg transition-all duration-300 ease-out overflow-visible",
  variants: {
    // Default: Standard card with medium shadow (MOST COMMON)
    default: "bg-bg-primary shadow-md hover:shadow-xl",

    // Elevated: Stronger shadow for prominent cards - MORE DRAMATIC
    elevated: "bg-bg-primary shadow-lg hover:shadow-2xl",

    // Subtle: Minimal shadow for secondary content
    subtle: "bg-bg-subtle shadow-sm hover:shadow-lg",

    // Glass: Translucent with backdrop blur
    glass:
      "bg-bg-primary/80 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-divider",

    // Filled: Muted background, no elevation (for backgrounds)
    filled: "bg-bg-muted shadow-none hover:shadow-md",

    // Accent: Brand gradient with shadow - MORE VIBRANT
    accent:
      "bg-gradient-to-br from-jade-500/15 via-bg-subtle to-bg-muted hover:from-jade-500/25 shadow-lg hover:shadow-xl",

    // Floating: Maximum shadow for modals/overlays
    floating: "bg-bg-primary shadow-2xl",
  },
  sizes: {
    sm: "p-3", // 12px - compact
    md: "p-4", // 16px - standard (MOST COMMON)
    lg: "p-6", // 24px - spacious
    xl: "p-8", // 32px - hero sections
  },
  interactive:
    "cursor-pointer hover:-translate-y-1 hover:scale-[1.01] active:translate-y-0 active:scale-100 focus-visible:outline-none focus:ring-2 focus:ring-brand-primary/20",
  disabled: "opacity-50 cursor-not-allowed",
  loading: "animate-pulse",
};

// Header and footer styles with theme awareness
const getSectionStyles = (type: "header" | "footer", size: string) => {
  const sizes = {
    sm: type === "header" ? "pb-2 mb-3" : "pt-2 mt-3",
    md: type === "header" ? "pb-3 mb-4" : "pt-3 mt-4",
    lg: type === "header" ? "pb-4 mb-6" : "pt-4 mt-6",
    xl: type === "header" ? "pb-6 mb-8" : "pt-6 mt-8",
  };
  return sizes[size as keyof typeof sizes];
};

function buildCardClasses(options: {
  variant: keyof CardStylesConfig["variants"];
  size: keyof CardStylesConfig["sizes"];
  interactive: boolean;
  disabled: boolean;
  loading: boolean;
  className: string;
}) {
  const classes: string[] = [
    cardStyles.base,
    cardStyles.variants[options.variant],
    cardStyles.sizes[options.size],
    options.className,
  ];

  if (options.interactive && !options.disabled) {
    classes.push(cardStyles.interactive);
  }
  if (options.disabled) {
    classes.push(cardStyles.disabled);
  }
  if (options.loading) {
    classes.push(cardStyles.loading);
  }

  return classes.filter(Boolean).join(" ");
}

function buildSectionClasses(
  type: "header" | "footer",
  size: string,
  extra: string
) {
  return [getSectionStyles(type, size), extra].filter(Boolean).join(" ");
}

/**
 * Card Component
 *
 * A flexible card component with shadow-based elevation:
 * - Shadow-only design (no borders)
 * - Multiple elevation variants (default, elevated, subtle, glass, filled, accent, floating)
 * - Size variants (sm, md, lg, xl)
 * - Header and footer support
 * - Interactive states with lift animation
 * - Loading states
 * - Dark mode support
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      size = "md",
      header,
      footer,
      interactive = false,
      disabled = false,
      headerClassName = "",
      contentClassName = "",
      footerClassName = "",
      loading = false,
      children,
      className = "",
      onClick,
      ...props
    },
    ref
  ) => {
    // Build card classes using only Tailwind dark mode classes
    const cardClasses = buildCardClasses({
      variant,
      size,
      interactive,
      disabled,
      loading,
      className,
    });

    // Header/footer classes with theme awareness
    const headerClasses = buildSectionClasses("header", size, headerClassName);
    const footerClasses = buildSectionClasses("footer", size, footerClassName);

    // Content classes
    const contentClasses = ["flex-1", contentClassName]
      .filter(Boolean)
      .join(" ");
    return (
      <div
        ref={ref}
        className={cardClasses}
        onClick={disabled ? undefined : onClick}
        role={interactive ? "button" : undefined}
        tabIndex={interactive && !disabled ? 0 : undefined}
        aria-disabled={disabled}
        {...props}
      >
        {header && <div className={headerClasses}>{header}</div>}
        <div className={contentClasses}>
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 rounded-lg animate-pulse bg-muted"></div>
              <div className="h-4 rounded-lg animate-pulse w-3/4 bg-muted"></div>
              <div className="h-4 rounded-lg animate-pulse w-1/2 bg-muted"></div>
            </div>
          ) : (
            children
          )}
        </div>
        {footer && <div className={footerClasses}>{footer}</div>}
      </div>
    );
  }
);
Card.displayName = "Card";
export default Card;
