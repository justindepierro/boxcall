/**
 * BoxCall Card Component
 *
 * Professional card component for content containers
 */

import { forwardRef } from "react";
import type { CardProps, CardStylesConfig } from "./Card.types";

// Card styles configuration using only Tailwind dark mode classes
// This ensures consistent theme behavior without JavaScript conflicts

const cardStyles: CardStylesConfig = {
  base: "rounded-lg transition-all duration-200",

  variants: {
    default:
      "bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700",
    elevated:
      "bg-white shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900/20",
    outlined: "bg-transparent border-2 border-gray-300 dark:border-gray-600",
    filled:
      "bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700",
  },

  sizes: {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  },

  interactive:
    "cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
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
