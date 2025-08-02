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
  base: "rounded-md transition-all duration-200 shadow-sm", // More square corners, stronger shadows

  variants: {
    default:
      "bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md",
    elevated:
      "bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900/20 hover:shadow-xl",
    outlined: 
      "bg-transparent border-2 border-jade-500 dark:border-jade-400 hover:bg-jade-50 dark:hover:bg-jade-900/10", // Jade outlined variant
    filled:
      "bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
    accent:
      "bg-navy-50 border-2 border-navy-500 dark:bg-navy-900/20 dark:border-navy-400", // New navy accent variant
  },

  sizes: {
    sm: "p-4",   // More substantial padding
    md: "p-6",   // Increased from p-4
    lg: "p-8",   // Increased from p-6  
    xl: "p-10",  // Increased from p-8
  },

  interactive:
    "cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0", // Subtle lift effect, no scale
  disabled: "opacity-50 cursor-not-allowed",
  loading: "animate-pulse",
};

// Header and footer styles with theme awareness
const getSectionStyles = (type: "header" | "footer", size: string) => {
  const base =
    type === "header"
      ? "border-b border-gray-200 dark:border-gray-700"
      : "border-t border-gray-200 dark:border-gray-700";

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
              <div className="h-4 rounded animate-pulse bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 rounded animate-pulse w-3/4 bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 rounded animate-pulse w-1/2 bg-gray-200 dark:bg-gray-700"></div>
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
