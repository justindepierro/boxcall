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
    base: "text-text-inverse bg-brand-primary transition-colors duration-200 shadow-sm",
    hover: "hover:bg-brand-hover hover:shadow-md",
    active: "active:bg-brand-active active:shadow-sm",
    disabled:
      "disabled:bg-surface-muted disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
    focus:
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
  },
  secondary: {
    base: "text-text-primary bg-surface-secondary transition-colors duration-200 shadow-sm",
    hover: "hover:bg-surface-muted hover:shadow-md",
    active: "active:bg-surface-base active:shadow-sm",
    disabled:
      "disabled:bg-surface-muted disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
    focus:
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
  },
  outline: {
    base: "text-brand-primary bg-surface-base/50 backdrop-blur-sm transition-all duration-200 ring-1 ring-inset ring-brand-primary/30",
    hover: "hover:bg-brand-primary/10 hover:ring-brand-primary/50",
    active:
      "active:bg-brand-primary/20 active:ring-brand-primary",
    disabled:
      "disabled:text-text-muted disabled:ring-gray-200 disabled:bg-transparent disabled:cursor-not-allowed disabled:opacity-60",
    focus:
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
  },
  gradient: {
    base: "text-text-inverse bg-gradient-to-r from-electric-600 to-electric-700 transition-all duration-200",
    hover: "hover:from-electric-500 hover:to-electric-600",
    active: "active:from-electric-700 active:to-electric-800",
    disabled:
      "disabled:from-electric-300 disabled:to-electric-400 disabled:cursor-not-allowed disabled:opacity-60",
    focus:
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-500 focus-visible:ring-offset-2",
  },
  glass: {
    base: "bg-surface-base/10 backdrop-blur-md text-text-primary transition-colors duration-200",
    hover: "hover:bg-surface-base/20",
    active: "active:bg-surface-base/30",
    disabled:
      "disabled:bg-surface-base/5 disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-60",
    focus:
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
  },
  ghost: {
    base: "text-text-primary bg-transparent transition-colors duration-200",
    hover: "hover:bg-surface-muted",
    active: "active:bg-surface-base",
    disabled:
      "disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-60",
    focus:
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
  },
  subtle: {
    base: "bg-surface-secondary text-text-secondary transition-colors duration-200",
    hover: "hover:bg-surface-muted hover:text-text-primary",
    active: "active:bg-surface-base active:text-text-primary",
    disabled:
      "disabled:bg-surface-secondary disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-60",
    focus:
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
  },
  link: {
    base: "text-brand-hover p-0 h-auto",
    hover: "hover:text-brand-active hover:underline",
    active: "active:text-brand-active",
    disabled: "disabled:text-brand-primary/40 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-lg",
  },
  brandLink: {
    base: "text-brand-active p-0 h-auto font-medium",
    hover: "hover:text-brand-hover hover:underline",
    active: "active:text-brand-hover",
    disabled: "disabled:text-brand-primary/40 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-lg",
  },
  neutralLink: {
    base: "text-text-secondary p-0 h-auto",
    hover: "hover:text-text-primary hover:underline",
    active: "active:text-text-primary",
    disabled: "disabled:text-text-muted disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-lg",
  },
  infoLink: {
    base: "text-navy-600 p-0 h-auto",
    hover: "hover:text-navy-700 hover:underline",
    active: "active:text-navy-700",
    disabled: "disabled:text-navy-300 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-lg",
  },
  dangerLink: {
    base: "text-error-600 p-0 h-auto",
    hover: "hover:text-error-700 hover:underline",
    active: "active:text-error-700",
    disabled: "disabled:text-error-500/40 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-lg",
  },
  danger: {
    base: "text-text-inverse bg-status-error",
    hover: "hover:bg-error-600",
    active: "active:bg-error-700",
    disabled:
      "disabled:bg-error-500/60 disabled:cursor-not-allowed disabled:opacity-70",
    focus: "focus-ring focus-ring-offset",
  },
  success: {
    base: "text-text-inverse bg-success-600",
    hover: "hover:bg-success-700",
    active: "active:bg-success-700",
    disabled:
      "disabled:bg-success-500/60 disabled:cursor-not-allowed disabled:opacity-70",
    focus: "focus-ring focus-ring-offset",
  },
  warning: {
    base: "text-text-primary bg-warning-600",
    hover: "hover:bg-warning-700",
    active: "active:bg-warning-700",
    disabled:
      "disabled:bg-warning-500/60 disabled:cursor-not-allowed disabled:opacity-70",
    focus: "focus-ring focus-ring-offset",
  },
};
// Button size styles configuration - aligned to 8px rhythm
const buttonSizes: ButtonSizeConfig = {
  xs: {
    padding: "px-3 py-2",
    fontSize: "text-xs font-medium",
    iconSize: "w-4 h-4",
    height: "h-8",
  },
  sm: {
    padding: "px-4 py-2",
    fontSize: "text-sm font-medium",
    iconSize: "w-4 h-4",
    height: "h-10",
  },
  md: {
    padding: "px-6 py-3",
    fontSize: "text-sm font-semibold",
    iconSize: "w-5 h-5",
    height: "h-12",
  },
  lg: {
    padding: "px-6 py-3",
    fontSize: "text-base font-semibold",
    iconSize: "w-5 h-5",
    height: "h-14",
  },
  xl: {
    padding: "px-8 py-4",
    fontSize: "text-lg font-semibold font-display",
    iconSize: "w-6 h-6",
    height: "h-16",
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
    // Build class string - Clean, minimal styling with smooth transitions
    const baseClasses = [
      // Base button styles - clean and minimal
      "inline-flex items-center justify-center flex-row flex-nowrap",
      "font-sans rounded-md", // Clean rounded corners
      "focus:outline-none",
      "overflow-hidden", // Handle overflow gracefully
      // Smooth transitions for transform and colors
      "transition-all duration-200 ease-in-out",
      // Hover scale effect (subtle lift)
      !isDisabled &&
        variant !== "link" &&
        variant !== "brandLink" &&
        "hover:scale-[1.02]",
      // Active scale effect (pressed feeling)
      !isDisabled &&
        variant !== "link" &&
        variant !== "brandLink" &&
        "active:scale-[0.98]",
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
