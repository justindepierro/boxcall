/**
 * BoxCall Button Component
 *
 * Masculine, square button component with jade/navy theme
 * Professional, confident design for football team management
 */
import React, { forwardRef } from "react";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import type {
  ButtonProps,
  ButtonSizeConfig,
  ButtonStylesConfig,
} from "./Button.types";
// Button variant styles configuration - Updated with semantic design system
const buttonVariants: ButtonStylesConfig = {
  primary: {
    base: "text-text-inverse bg-[var(--semantic-primary)] transition-colors duration-200",
    hover: "hover:bg-[var(--semantic-primary-hover)]",
    active: "active:bg-[var(--semantic-primary-active)]",
    disabled:
      "disabled:bg-surface-muted disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-50",
    focus:
      "focus:outline-none focus:ring-2 focus:ring-[var(--semantic-primary)] focus:ring-offset-2",
  },
  secondary: {
    base: "text-text-primary bg-[var(--semantic-bg-secondary)] transition-colors duration-200",
    hover: "hover:bg-[var(--semantic-bg-muted)]",
    active: "active:bg-[color:var(--color-gray-200)]",
    disabled:
      "disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-50",
    focus:
      "focus:outline-none focus:ring-2 focus:ring-[var(--semantic-primary)] focus:ring-offset-2",
  },
  outline: {
    base: "text-[var(--semantic-primary)] border border-[var(--semantic-primary)] bg-transparent transition-colors duration-200",
    hover: "hover:bg-[var(--semantic-primary)] hover:text-text-inverse",
    active:
      "active:bg-[var(--semantic-primary-active)] active:border-[var(--semantic-primary-active)] active:text-text-inverse",
    disabled:
      "disabled:text-text-muted disabled:border-text-muted disabled:cursor-not-allowed disabled:opacity-50",
    focus:
      "focus:outline-none focus:ring-2 focus:ring-[var(--semantic-primary)] focus:ring-offset-2",
  },
  gradient: {
    base: "text-surface-primary bg-gradient-to-r from-electric-600 to-electric-700 transition-all duration-200",
    hover: "hover:from-electric-500 hover:to-electric-600",
    active: "active:from-electric-700 active:to-electric-800",
    disabled:
      "disabled:from-electric-300 disabled:to-electric-400 disabled:cursor-not-allowed disabled:opacity-50",
    focus:
      "focus:outline-none focus:ring-2 focus:ring-electric-500 focus:ring-offset-2",
  },
  glass: {
    base: "bg-surface-primary/10 backdrop-blur-md text-surface-primary transition-colors duration-200",
    hover: "hover:bg-surface-primary/20",
    active: "active:bg-surface-primary/30",
    disabled:
      "disabled:bg-surface-primary/5 disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-50",
    focus:
      "focus:outline-none focus:ring-2 focus:ring-surface-primary focus:ring-offset-2",
  },
  ghost: {
    base: "text-[var(--semantic-text-primary)] bg-transparent transition-colors duration-200",
    hover: "hover:bg-[var(--semantic-bg-muted)]",
    active: "active:bg-[color:var(--color-gray-200)]",
    disabled:
      "disabled:text-[var(--semantic-text-muted)] disabled:cursor-not-allowed disabled:opacity-50",
    focus:
      "focus:outline-none focus:ring-2 focus:ring-[var(--semantic-primary)] focus:ring-offset-2",
  },
  subtle: {
    base: "bg-[var(--semantic-bg-secondary)] text-[var(--semantic-text-secondary)] transition-colors duration-200",
    hover:
      "hover:bg-[var(--semantic-bg-muted)] hover:text-[var(--semantic-text-primary)]",
    active:
      "active:bg-[color:var(--color-gray-200)] active:text-[var(--semantic-text-primary)]",
    disabled:
      "disabled:bg-[var(--semantic-bg-secondary)] disabled:text-[var(--semantic-text-muted)] disabled:cursor-not-allowed disabled:opacity-50",
    focus:
      "focus:outline-none focus:ring-2 focus:ring-[var(--semantic-primary)] focus:ring-offset-2",
  },
  link: {
    base: "text-[var(--semantic-primary-hover)] p-0 h-auto",
    hover: "hover:text-[var(--semantic-primary-active)] hover:underline",
    active: "active:text-[var(--semantic-primary-active)]",
    disabled:
      "disabled:text-[color:var(--color-jade-300)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  // Brand link style with slightly stronger weight (used where prior inline text-jade-* overrides existed)
  brandLink: {
    base: "text-[var(--semantic-primary-active)] p-0 h-auto font-medium",
    hover: "hover:text-[color:var(--color-jade-800)] hover:underline",
    active: "active:text-[color:var(--color-jade-800)]",
    disabled:
      "disabled:text-[color:var(--color-jade-300)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  neutralLink: {
    base: "text-[var(--semantic-text-secondary)] p-0 h-auto",
    hover: "hover:text-[var(--semantic-text-primary)] hover:underline",
    active: "active:text-[var(--semantic-text-primary)]",
    disabled:
      "disabled:text-[var(--semantic-text-muted)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  infoLink: {
    base: "text-[color:var(--color-navy-600)] p-0 h-auto",
    hover: "hover:text-[color:var(--color-navy-700)] hover:underline",
    active: "active:text-[color:var(--color-navy-700)]",
    disabled:
      "disabled:text-[color:var(--color-navy-300)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  dangerLink: {
    base: "text-[color:var(--color-error-600)] p-0 h-auto",
    hover: "hover:text-[color:var(--color-error-700)] hover:underline",
    active: "active:text-[color:var(--color-error-700)]",
    disabled:
      "disabled:text-[color:var(--color-error-300,#fca5a5)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  danger: {
    base: "text-surface-primary bg-[var(--semantic-error)]",
    hover: "hover:bg-[color:var(--color-error-600)]",
    active: "active:bg-[color:var(--color-error-700)]",
    disabled:
      "disabled:bg-[color:var(--color-error-500)]/50 disabled:border-[color:var(--color-error-500)]/50 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  success: {
    base: "text-surface-primary bg-[color:var(--color-success-600)]",
    hover: "hover:bg-[color:var(--color-success-700)]",
    active: "active:bg-[color:var(--color-success-700)]",
    disabled:
      "disabled:bg-[color:var(--color-success-500)]/50 disabled:border-[color:var(--color-success-500)]/50 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  warning: {
    base: "text-text-primary bg-[color:var(--color-warning-600)]",
    hover: "hover:bg-[color:var(--color-warning-700)]",
    active: "active:bg-[color:var(--color-warning-700)]",
    disabled:
      "disabled:bg-[color:var(--color-warning-500)]/50 disabled:border-[color:var(--color-warning-500)]/50 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
};
// Button size styles configuration - Enhanced for masculine, substantial feel
const buttonSizes: ButtonSizeConfig = {
  xs: {
    padding: "px-2.5 py-1.25",
    fontSize: "text-xs font-medium",
    iconSize: "w-3 h-3",
    height: "h-[1.85rem]",
  },
  sm: {
    padding: "px-3.5 py-1.75",
    fontSize: "text-[0.85rem] font-medium",
    iconSize: "w-[0.9rem] h-[0.9rem]",
    height: "h-[2.35rem]",
  },
  md: {
    padding: "px-5 py-2.4",
    fontSize: "text-[0.9rem] font-semibold",
    iconSize: "w-[0.95rem] h-[0.95rem]",
    height: "h-[2.7rem]",
  },
  lg: {
    padding: "px-6.5 py-3",
    fontSize: "text-[0.98rem] font-semibold",
    iconSize: "w-[1.05rem] h-[1.05rem]",
    height: "h-[3rem]",
  },
  xl: {
    padding: "px-8 py-3.6",
    fontSize: "text-[1.15rem] font-semibold font-display",
    iconSize: "w-[1.2rem] h-[1.2rem]",
    height: "h-[3.4rem]",
  },
};
// Loading spinner component
const LoadingSpinner: React.FC<{ size: string }> = ({ size }) => (
  <svg
    className={`animate-spin ${size}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
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
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
/**
 * Button component with comprehensive styling and functionality
 *
 * @param variant - Button style variant
 * @param size - Button size
 * @param children - Button content
 * @param loading - Show loading spinner
 * @param disabled - Disabled state
 * @param fullWidth - Full width button
 * @param icon - Icon element
 * @param iconPosition - Icon position relative to text
 * @param className - Additional CSS classes
 * @param type - Button type attribute
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      children,
      loading = false,
      disabled = false,
      fullWidth = false,
      icon,
      iconPosition = "left",
      hapticType = "medium",
      className = "",
      type = "button",
      onClick,
      ...restProps
    },
    ref
  ) => {
    // Get variant styles
    const variantStyles = buttonVariants[variant];
    const sizeStyles = buttonSizes[size];
    // Determine if button should be disabled
    const isDisabled = disabled || loading;

    // Handle click with haptic feedback
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        triggerHapticFeedback(hapticType);
      }
      onClick?.(event);
    };
    // Build class string - Clean, minimal styling
    const baseClasses = [
      // Base button styles - clean and minimal
      "inline-flex items-center justify-center flex-row flex-nowrap",
      "font-sans rounded-md", // Clean rounded corners
      "focus:outline-none",
      "overflow-hidden", // Handle overflow gracefully
      // Variant styles
      variantStyles.base,
      !isDisabled && variantStyles.hover,
      !isDisabled && variantStyles.active,
      variantStyles.focus,
      isDisabled && variantStyles.disabled,
      // Size styles (skip for link variant)
      variant !== "link" && sizeStyles.padding,
      variant !== "link" && sizeStyles.height,
      sizeStyles.fontSize,
      // Width
      fullWidth && "w-full",
      // Custom classes
      className,
    ]
      .filter(Boolean)
      .join(" ");
    // Render icon
    const renderIcon = (position: "left" | "right") => {
      if (!icon || iconPosition === "only" || iconPosition !== position)
        return null;
      return (
        <span
          className={`inline-flex items-center ${sizeStyles.iconSize} flex-shrink-0 ${
            position === "left" && children
              ? "mr-2"
              : position === "right" && children
                ? "ml-2"
                : ""
          }`}
        >
          {icon}
        </span>
      );
    };
    // Render loading spinner
    const renderLoadingSpinner = () => {
      if (!loading) return null;
      return (
        <LoadingSpinner
          size={`${sizeStyles.iconSize} ${children ? "mr-2" : ""}`}
        />
      );
    };
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={baseClasses}
        onClick={handleClick}
        style={{
          borderRadius: "var(--button-border-radius)",
        }}
        {...restProps}
      >
        {renderLoadingSpinner()}
        {renderIcon("left")}
        {iconPosition === "only" ? (
          <span
            className={`inline-flex items-center justify-center ${sizeStyles.iconSize}`}
          >
            {icon}
          </span>
        ) : (
          <span className="inline-flex items-center leading-tight truncate min-w-0">
            {children}
          </span>
        )}
        {renderIcon("right")}
      </button>
    );
  }
);
// Set display name for debugging
Button.displayName = "Button";
