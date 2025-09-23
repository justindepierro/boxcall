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
  base: "rounded-xl transition-all duration-200 border border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-sm", // Modern glass effect
  variants: {
    default:
      "bg-white/90 border-gray-200/50 hover:shadow-md hover:border-gray-300/50 hover:bg-white/95", // Clean white with subtle glass
    glass:
      "bg-white/70 border-white/20 backdrop-blur-md shadow-lg hover:bg-white/80 hover:shadow-xl", // Full glassmorphism
    elevated:
      "bg-white shadow-lg border-gray-100 hover:shadow-xl hover:-translate-y-1", // Elevated with lift effect
    outlined:
      "bg-transparent border-gray-300 hover:border-gray-400 hover:bg-gray-50/50", // Clean outlined
    filled:
      "bg-gray-50/80 border-gray-200 hover:bg-gray-100/80 hover:shadow-md", // Subtle filled
    accent:
      "bg-gradient-to-br from-jade-50 to-jade-100/50 border-jade-200/50 hover:from-jade-100 hover:to-jade-50", // Jade accent
  },
  sizes: {
    sm: "p-3",
    // Use density-driven padding utility for the default (md) size so cards inherit global density
    md: "bc-card-padding",
    lg: "p-6",
    xl: "p-8",
  },
  interactive:
    "cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out", // Modern lift and scale effect
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
