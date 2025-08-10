/**
 * BoxCall Button Component
 *
 * Masculine, square button component with jade/navy theme
 * Professional, confident design for football team management
 */
import React, { forwardRef } from "react";
import type {
  ButtonProps,
  ButtonSizeConfig,
  ButtonStylesConfig,
} from "./Button.types";
// Button variant styles configuration - Updated with jade/navy theme
const buttonVariants: ButtonStylesConfig = {
  primary: {
  // Darken base background (jade 600) for AA contrast with white text
  base: "bg-brand-jade-dark text-white border border-brand-jade-dark",
  hover: "hover:bg-brand-jade-darker hover:border-brand-jade-darker",
  active: "active:bg-brand-jade-darker active:border-brand-jade-darker",
    disabled:
      "disabled:bg-brand-jade-light disabled:border-brand-jade-light disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-brand-jade focus:ring-offset-2",
  },
  secondary: {
    base: "bg-transparent text-brand-navy border-2 border-brand-navy",
    hover: "hover:bg-brand-navy hover:text-white hover:border-brand-navy",
    active:
      "active:bg-brand-navy-dark active:text-white active:border-brand-navy-dark",
    disabled:
      "disabled:text-brand-navy-light disabled:border-brand-navy-light disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-brand-navy focus:ring-offset-2",
  },
  outline: {
    base: "bg-transparent text-interaction-jade border border-brand-jade",
    hover:
      "hover:bg-surface-jade hover:text-interaction-jade hover:border-interaction-jade",
    active:
      "active:bg-surface-jade-dark active:text-brand-jade-dark active:border-brand-jade-dark",
    disabled:
      "disabled:text-brand-jade-light disabled:border-brand-jade-light disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-brand-jade focus:ring-offset-2",
  },
  ghost: {
    base: "bg-transparent text-text-secondary border border-transparent",
    hover: "hover:bg-surface-neutral hover:text-text-primary",
    active: "active:bg-surface-neutral-dark active:text-text-primary",
    disabled: "disabled:text-text-muted disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-brand-jade focus:ring-offset-2",
  },
  link: {
    base: "bg-transparent text-interaction-jade border border-transparent p-0 h-auto",
    hover: "hover:text-brand-jade-dark hover:underline",
    active: "active:text-brand-jade-dark",
    disabled: "disabled:text-brand-jade-light disabled:cursor-not-allowed",
    focus:
      "focus:ring-2 focus:ring-brand-jade focus:ring-offset-2 focus:rounded-xs",
  },
  danger: {
    base: "bg-red-600 text-white border border-red-600",
    hover: "hover:bg-red-700 hover:border-red-700",
    active: "active:bg-red-800 active:border-red-800",
    disabled:
      "disabled:bg-red-300 disabled:border-red-300 disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
  },
  success: {
    base: "bg-interaction-jade text-white border border-interaction-jade",
    hover: "hover:bg-brand-jade-dark hover:border-brand-jade-dark",
    active: "active:bg-brand-jade-darker active:border-brand-jade-darker",
    disabled:
      "disabled:bg-brand-jade-light disabled:border-brand-jade-light disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-brand-jade focus:ring-offset-2",
  },
  warning: {
  // Use darker background and dark text for AA contrast
  base: "bg-yellow-600 text-gray-900 border border-yellow-600",
  hover: "hover:bg-yellow-700 hover:border-yellow-700",
  active: "active:bg-yellow-700 active:border-yellow-700",
    disabled:
      "disabled:bg-yellow-300 disabled:border-yellow-300 disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2",
  },
};
// Button size styles configuration - Enhanced for masculine, substantial feel
const buttonSizes: ButtonSizeConfig = {
  xs: {
    padding: "px-3 py-1.5",
    fontSize: "text-xs font-medium",
    iconSize: "w-3 h-3",
    height: "h-7",
  },
  sm: {
    padding: "px-4 py-2",
    fontSize: "text-sm font-medium",
    iconSize: "w-4 h-4",
    height: "h-9",
  },
  md: {
    padding: "px-6 py-3",
    fontSize: "text-sm font-semibold",
    iconSize: "w-4 h-4",
    height: "h-11",
  },
  lg: {
    padding: "px-8 py-4",
    fontSize: "text-base font-semibold",
    iconSize: "w-5 h-5",
    height: "h-13",
  },
  xl: {
    padding: "px-10 py-5",
    fontSize: "text-lg font-bold font-display",
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
      className = "",
      type = "button",
      ...restProps
    },
    ref
  ) => {
    // Get variant styles
    const variantStyles = buttonVariants[variant];
    const sizeStyles = buttonSizes[size];
    // Determine if button should be disabled
    const isDisabled = disabled || loading;
    // Build class string - Square, masculine styling with enhanced animations
    const baseClasses = [
      // Base button styles - square, confident
      "inline-flex items-center justify-center",
      "font-sans rounded-sm", // Square corners for masculine feel
      "transition-square hover-lift active-press focus-square",
      "focus:outline-none",
      "shadow-sm hover:shadow-md", // Stronger shadows for depth
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
          className={`${sizeStyles.iconSize} ${
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
      // eslint-disable-next-line no-raw-button/no-raw-button
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={baseClasses}
        {...restProps}
      >
        {renderLoadingSpinner()}
        {renderIcon("left")}
        {iconPosition === "only" ? (
          <span className={sizeStyles.iconSize}>{icon}</span>
        ) : (
          children
        )}
        {renderIcon("right")}
      </button>
    );
  }
);
// Set display name for debugging
Button.displayName = "Button";
export default Button;
