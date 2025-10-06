/**
 * Accessible Button Component
 *
 * WCAG 2.1 AA compliant button with comprehensive accessibility features
 */

import React, { forwardRef, useCallback, useRef } from "react";
import { useAriaAttributes } from "../../hooks/useAccessibility";
import { ARIA_LABELS, KEYBOARD_KEYS } from "../../config/accessibility";

interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  tooltip?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  fullWidth?: boolean;
}

export const AccessibleButton = forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      loadingText = "Loading...",
      leftIcon,
      rightIcon,
      tooltip,
      ariaLabel,
      ariaDescribedBy,
      ariaPressed,
      ariaExpanded,
      fullWidth = false,
      disabled,
      onClick,
      onKeyDown,
      className = "",
      ...props
    },
    ref
  ) => {
    const { generateId } = useAriaAttributes();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const tooltipId = useRef(generateId("tooltip"));

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return;
        onClick?.(event);
      },
      [loading, disabled, onClick]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        // Handle space key for button activation (Enter is handled by default)
        if (event.key === KEYBOARD_KEYS.SPACE) {
          event.preventDefault();
          if (!loading && !disabled) {
            handleClick(event as any);
          }
        }
        onKeyDown?.(event);
      },
      [loading, disabled, handleClick, onKeyDown]
    );

    const baseClasses = `
    relative
    inline-flex
    items-center
    justify-center
    font-medium
    text-center
    border
    rounded-lg
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
    ${fullWidth ? "w-full" : ""}
  `;

    const variantClasses = {
      primary: `
      bg-blue-600
      border-blue-600
      text-white
      hover:bg-blue-700
      hover:border-blue-700
      focus:ring-blue-500
      active:bg-blue-800
    `,
      secondary: `
      bg-gray-100
      border-gray-300
      text-gray-900
      hover:bg-gray-200
      hover:border-gray-400
      focus:ring-gray-500
      active:bg-gray-300
    `,
      danger: `
      bg-red-600
      border-red-600
      text-white
      hover:bg-red-700
      hover:border-red-700
      focus:ring-red-500
      active:bg-red-800
    `,
      ghost: `
      bg-transparent
      border-transparent
      text-gray-600
      hover:bg-gray-100
      hover:text-gray-900
      focus:ring-gray-500
      active:bg-gray-200
    `,
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm min-h-8",
      md: "px-4 py-2 text-base min-h-10",
      lg: "px-6 py-3 text-lg min-h-12",
    };

    const isDisabled = disabled || loading;

    return (
      <>
        <button
          ref={ref || buttonRef}
          type="button"
          className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
          disabled={isDisabled}
          aria-label={
            ariaLabel || (typeof children === "string" ? children : undefined)
          }
          aria-describedby={
            tooltip
              ? `${ariaDescribedBy || ""} ${tooltipId.current}`.trim()
              : ariaDescribedBy
          }
          aria-pressed={ariaPressed}
          aria-expanded={ariaExpanded}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {loading && (
            <span className="mr-2" aria-hidden="true">
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                role="img"
                aria-label={ARIA_LABELS.LOADING}
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          )}

          {!loading && leftIcon && (
            <span className="mr-2" aria-hidden="true">
              {leftIcon}
            </span>
          )}

          <span>{loading ? loadingText : children}</span>

          {!loading && rightIcon && (
            <span className="ml-2" aria-hidden="true">
              {rightIcon}
            </span>
          )}

          {loading && <span className="sr-only">{loadingText}</span>}
        </button>

        {tooltip && (
          <div
            id={tooltipId.current}
            role="tooltip"
            className="sr-only"
            aria-hidden="true"
          >
            {tooltip}
          </div>
        )}
      </>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";
