/**
 * BoxCall Card Component
 *
 * Masculine, square card component with jade/navy accents
 * Professional, confident design for football team management
 */
import { forwardRef } from "react";

import type { CardProps, CardStylesConfig } from "./Card.types";
// Card styles configuration - Square, substantial styling with jade/navy theme
const cardStyles: CardStylesConfig = {
  base: "rounded-none transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.06)]", // Thin professional shadow
  variants: {
    default:
      "bg-[#FCFDFC] border border-subtle dark:bg-gray-800 dark:border-gray-700 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)]",
    elevated:
      "bg-[#FCFDFC] shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-subtle dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900/30 hover:shadow-[0_6px_18px_rgba(0,0,0,0.12)]",
    outlined:
      "bg-transparent border border-brand-jade/60 dark:border-brand-jade/70 hover:bg-brand-jade/5", // Subtle outlined
    filled:
      "surface-subtle/60 border border-subtle dark:bg-gray-900 dark:border-gray-700 surface-subtle-hover dark:hover:bg-gray-800",
    accent:
      "bg-surface-navy border border-brand-navy/70 dark:bg-surface-navy-dark dark:border-brand-navy", // Navy accent
  },
  sizes: {
    sm: "p-3",
    // Use density-driven padding utility for the default (md) size so cards inherit global density
    md: "bc-card-padding",
    lg: "p-6",
    xl: "p-8",
  },
  interactive:
    "cursor-pointer hover:shadow-[0_3px_6px_rgba(0,0,0,0.12)] active:shadow-[0_1px_2px_rgba(0,0,0,0.10)] active:translate-y-px", // Refined lift
  disabled: "opacity-50 cursor-not-allowed",
  loading: "animate-pulse",
};
// Header and footer styles with theme awareness
const getSectionStyles = (type: "header" | "footer", size: string) => {
  const base =
    type === "header"
      ? "border-b border-subtle dark:border-gray-700"
      : "border-t border-subtle dark:border-gray-700";
  const sizes = {
    sm: type === "header" ? "pb-2 mb-3" : "pt-2 mt-3",
    md: type === "header" ? "pb-3 mb-4" : "pt-3 mt-4",
    lg: type === "header" ? "pb-4 mb-6" : "pt-4 mt-6",
    xl: type === "header" ? "pb-6 mb-8" : "pt-6 mt-8",
  };
  return `${base} ${sizes[size as keyof typeof sizes]}`;
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
              <div className="h-4 rounded animate-pulse surface-subtle dark:bg-gray-700"></div>
              <div className="h-4 rounded animate-pulse w-3/4 surface-subtle dark:bg-gray-700"></div>
              <div className="h-4 rounded animate-pulse w-1/2 surface-subtle dark:bg-gray-700"></div>
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
