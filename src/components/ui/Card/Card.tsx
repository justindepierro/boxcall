/**
 * BoxCall Card Component
 *
 * Masculine, square card component with jade/navy accents
 * Professional, confident design for football team management
 */
import { forwardRef } from "react";

import type { CardProps, CardStylesConfig } from "./Card.types";
// Card styles configuration - Modern glassmorphism and clean design
const cardStyles: CardStylesConfig = {
  base: "rounded-xl transition-all duration-200 border border-border bg-surface-primary/80 backdrop-blur-sm shadow-sm", // Modern glass effect
  variants: {
    default:
      "bg-surface-primary/90 border-border hover:shadow-md hover:border-border hover:bg-surface-primary/95", // Clean surface with subtle glass
    glass:
      "bg-surface-primary/70 border-surface-primary/20 backdrop-blur-md shadow-lg hover:bg-surface-primary/80 hover:shadow-xl", // Full glassmorphism
    elevated:
      "bg-surface-primary shadow-lg border-border hover:animate-card-lift hover:shadow-xl", // Enhanced lift effect with smooth animation
    outlined:
      "bg-surface-primary border-border hover:border-border hover:bg-surface-secondary/50", // Clean outlined
    filled:
      "bg-surface-secondary/80 border-border hover:bg-surface-muted/80 hover:shadow-md", // Subtle filled
    accent:
      "bg-gradient-to-br from-surface-primary to-surface-secondary/50 border-border hover:from-surface-secondary hover:to-surface-primary hover:shadow-electric-500/20", // Accent with electric glow hint
  },
  sizes: {
    sm: "p-3",
    // Use density-driven padding utility for the default (md) size so cards inherit global density
    md: "bc-card-padding",
    lg: "p-6",
    xl: "p-8",
  },
  interactive:
    "cursor-pointer transition-all duration-300 ease-out hover:animate-card-hover hover:animate-card-glow focus:animate-card-glow focus:outline-none focus:ring-2 focus:ring-electric-500/50 focus:ring-offset-2", // Enhanced micro-animations with electric glow
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
/**
 * Card Component
 *
 * A flexible card component for containing and organizing content:
 * - Multiple variants (default, elevated, outlined, filled)
 * - Size variants (sm, md, lg, xl)
 * - Header and footer support
 * - Interactive states
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
    const cardClasses = [
      cardStyles.base,
      cardStyles.variants[variant],
      cardStyles.sizes[size],
      interactive && !disabled ? cardStyles.interactive : "",
      disabled ? cardStyles.disabled : "",
      loading ? cardStyles.loading : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");
    // Header classes with theme awareness
    const headerClasses = [getSectionStyles("header", size), headerClassName]
      .filter(Boolean)
      .join(" ");
    // Footer classes with theme awareness
    const footerClasses = [getSectionStyles("footer", size), footerClassName]
      .filter(Boolean)
      .join(" ");
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
              <div className="h-4 rounded animate-pulse surface-subtle dark:bg-surface-secondary"></div>
              <div className="h-4 rounded animate-pulse w-3/4 surface-subtle dark:bg-surface-secondary"></div>
              <div className="h-4 rounded animate-pulse w-1/2 surface-subtle dark:bg-surface-secondary"></div>
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
