/**
 * BoxCall Button Component
 *
 * Professional button component with multiple variants and sizes
 * Follows enterprise design system standards
 */

import React, { forwardRef } from "react";
import type {
  ButtonProps,
  ButtonSizeConfig,
  ButtonStylesConfig,
} from "./Button.types";

// Button variant styles configuration
const buttonVariants: ButtonStylesConfig = {
  primary: {
    base: "bg-blue-600 text-white border border-blue-600",
    hover: "hover:bg-blue-700 hover:border-blue-700",
    active: "active:bg-blue-800 active:border-blue-800",
    disabled:
      "disabled:bg-blue-300 disabled:border-blue-300 disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  },
  secondary: {
    base: "bg-gray-100 text-gray-900 border border-gray-300",
    hover: "hover:bg-gray-200 hover:border-gray-400",
    active: "active:bg-gray-300 active:border-gray-500",
    disabled:
      "disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
  },
  outline: {
    base: "bg-transparent text-blue-600 border border-blue-600",
    hover: "hover:bg-blue-50 hover:text-blue-700",
    active: "active:bg-blue-100 active:text-blue-800",
    disabled:
      "disabled:text-blue-300 disabled:border-blue-300 disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  },
  ghost: {
    base: "bg-transparent text-gray-600 border border-transparent",
    hover: "hover:bg-gray-100 hover:text-gray-900",
    active: "active:bg-gray-200 active:text-gray-900",
    disabled: "disabled:text-gray-400 disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
  },
  link: {
    base: "bg-transparent text-blue-600 border border-transparent p-0 h-auto",
    hover: "hover:text-blue-700 hover:underline",
    active: "active:text-blue-800",
    disabled: "disabled:text-blue-300 disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:rounded",
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
    base: "bg-green-600 text-white border border-green-600",
    hover: "hover:bg-green-700 hover:border-green-700",
    active: "active:bg-green-800 active:border-green-800",
    disabled:
      "disabled:bg-green-300 disabled:border-green-300 disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
  },
  warning: {
    base: "bg-yellow-600 text-white border border-yellow-600",
    hover: "hover:bg-yellow-700 hover:border-yellow-700",
    active: "active:bg-yellow-800 active:border-yellow-800",
    disabled:
      "disabled:bg-yellow-300 disabled:border-yellow-300 disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2",
  },
};

// Button size styles configuration
const buttonSizes: ButtonSizeConfig = {
  xs: {
    padding: "px-2 py-1",
    fontSize: "text-xs",
    iconSize: "w-3 h-3",
    height: "h-6",
  },
  sm: {
    padding: "px-3 py-1.5",
    fontSize: "text-sm",
    iconSize: "w-4 h-4",
    height: "h-8",
  },
  md: {
    padding: "px-4 py-2",
    fontSize: "text-sm",
    iconSize: "w-4 h-4",
    height: "h-10",
  },
  lg: {
    padding: "px-6 py-3",
    fontSize: "text-base",
    iconSize: "w-5 h-5",
    height: "h-12",
  },
  xl: {
    padding: "px-8 py-4",
    fontSize: "text-lg",
    iconSize: "w-6 h-6",
    height: "h-14",
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

    // Build class string
    const baseClasses = [
      // Base button styles
      "inline-flex items-center justify-center",
      "font-semibold rounded-md",
      "transition-all duration-150 ease-in-out",
      "focus:outline-none",

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
