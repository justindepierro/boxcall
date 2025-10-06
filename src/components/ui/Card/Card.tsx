/**
 * BoxCall Card Component
 *
 * Masculine, square card component with jade/navy accents
 * Professional, confident design for football team management
 */
import { forwardRef } from "react";

import type { CardProps, CardStylesConfig } from "./Card.types";
// Card styles configuration - iOS-inspired glassmorphism and clean design
const cardStyles: CardStylesConfig = {
  base: "rounded-[var(--radius-card)] bg-surface-secondary shadow-card transition-all duration-200 ease-in-out",
  variants: {
    default: "hover:bg-surface-muted hover:shadow-card-hover",
    glass:
      "bg-surface-base/80 backdrop-blur-md hover:bg-surface-base/90 shadow-lg",
    elevated: "shadow-lg hover:shadow-xl bg-white dark:bg-surface-secondary",
    outlined: "border-card-elevated bg-surface-secondary",
    filled: "bg-surface-muted hover:bg-surface-muted/90 shadow-sm",
    accent:
      "bg-gradient-to-br from-brand-primary/15 via-surface-secondary to-surface-muted hover:from-brand-primary/20 shadow-md",
  },
  sizes: {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  },
  interactive:
    "cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 focus-visible:ring-offset-2",
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
              <div className="h-4 rounded animate-pulse bg-surface-muted"></div>
              <div className="h-4 rounded animate-pulse w-3/4 bg-surface-muted"></div>
              <div className="h-4 rounded animate-pulse w-1/2 bg-surface-muted"></div>
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
