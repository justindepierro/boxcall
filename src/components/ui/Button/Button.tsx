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
// NOTE: Using CSS variables mapped from design tokens (generated-tokens.css)
// to reduce direct Tailwind color utility coupling. Utilities retained for spacing/structure only.
const buttonVariants: ButtonStylesConfig = {
  primary: {
    base:
      "text-white border" +
      " bg-[var(--semantic-primary-hover)] border-[var(--semantic-primary-hover)]",
    hover:
      "hover:bg-[var(--semantic-primary-active)] hover:border-[var(--semantic-primary-active)]",
    active:
      "active:bg-[var(--semantic-primary-active)] active:border-[var(--semantic-primary-active)]",
    disabled:
      "disabled:bg-[color:var(--color-jade-300)] disabled:border-[color:var(--color-jade-300)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  secondary: {
    base: "bg-transparent text-[var(--color-navy-700)] border-2 border-[var(--color-navy-700)]",
    hover:
      "hover:bg-[var(--color-navy-700)] hover:text-white hover:border-[var(--color-navy-700)]",
    active:
      "active:bg-[var(--color-navy-800)] active:text-white active:border-[var(--color-navy-800)]",
    disabled:
      "disabled:text-[color:var(--color-navy-400)] disabled:border-[color:var(--color-navy-300)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  outline: {
    base: "bg-transparent text-[var(--semantic-primary-hover)] border border-[var(--semantic-primary-hover)]",
    hover:
      "hover:bg-[color:var(--color-jade-50)] hover:text-[var(--semantic-primary-active)] hover:border-[var(--semantic-primary-active)]",
    active:
      "active:bg-[color:var(--color-jade-100)] active:text-[var(--semantic-primary-active)] active:border-[var(--semantic-primary-active)]",
    disabled:
      "disabled:text-[color:var(--color-jade-300)] disabled:border-[color:var(--color-jade-200)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  ghost: {
    base: "bg-transparent text-[var(--semantic-text-secondary)] border border-transparent",
    hover:
      "hover:bg-[var(--semantic-bg-muted)] hover:text-[var(--semantic-text-primary)]",
    active:
      "active:bg-[color:var(--color-gray-200)] active:text-[var(--semantic-text-primary)]",
    disabled:
      "disabled:text-[var(--semantic-text-muted)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  subtle: {
    base: "bg-[var(--semantic-bg-secondary)] text-[var(--semantic-text-secondary)] border border-[var(--semantic-border)]",
    hover:
      "hover:bg-[var(--semantic-bg-muted)] hover:text-[var(--semantic-text-primary)]",
    active:
      "active:bg-[color:var(--color-gray-200)] active:text-[var(--semantic-text-primary)]",
    disabled:
      "disabled:bg-[var(--semantic-bg-secondary)] disabled:text-[var(--semantic-text-muted)] disabled:border-[var(--semantic-border)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  link: {
    base: "bg-transparent text-[var(--semantic-primary-hover)] border border-transparent p-0 h-auto",
    hover: "hover:text-[var(--semantic-primary-active)] hover:underline",
    active: "active:text-[var(--semantic-primary-active)]",
    disabled:
      "disabled:text-[color:var(--color-jade-300)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  // Brand link style with slightly stronger weight (used where prior inline text-jade-* overrides existed)
  brandLink: {
    base: "bg-transparent text-[var(--semantic-primary-active)] border border-transparent p-0 h-auto font-medium",
    hover: "hover:text-[color:var(--color-jade-800)] hover:underline",
    active: "active:text-[color:var(--color-jade-800)]",
    disabled:
      "disabled:text-[color:var(--color-jade-300)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  neutralLink: {
    base: "bg-transparent text-[var(--semantic-text-secondary)] border border-transparent p-0 h-auto",
    hover: "hover:text-[var(--semantic-text-primary)] hover:underline",
    active: "active:text-[var(--semantic-text-primary)]",
    disabled:
      "disabled:text-[var(--semantic-text-muted)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  infoLink: {
    base: "bg-transparent text-[color:var(--color-navy-600)] border border-transparent p-0 h-auto",
    hover: "hover:text-[color:var(--color-navy-700)] hover:underline",
    active: "active:text-[color:var(--color-navy-700)]",
    disabled:
      "disabled:text-[color:var(--color-navy-300)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  dangerLink: {
    base: "bg-transparent text-[color:var(--color-error-600)] border border-transparent p-0 h-auto",
    hover: "hover:text-[color:var(--color-error-700)] hover:underline",
    active: "active:text-[color:var(--color-error-700)]",
    disabled:
      "disabled:text-[color:var(--color-error-300,#fca5a5)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  danger: {
    base: "text-white border bg-[var(--semantic-error)] border-[var(--semantic-error)]",
    hover:
      "hover:bg-[color:var(--color-error-600)] hover:border-[color:var(--color-error-600)]",
    active:
      "active:bg-[color:var(--color-error-700)] active:border-[color:var(--color-error-700)]",
    disabled:
      "disabled:bg-[color:var(--color-error-500)]/50 disabled:border-[color:var(--color-error-500)]/50 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  success: {
    base: "text-white border bg-[color:var(--color-success-600)] border-[color:var(--color-success-600)]",
    hover:
      "hover:bg-[color:var(--color-success-700)] hover:border-[color:var(--color-success-700)]",
    active:
      "active:bg-[color:var(--color-success-700)] active:border-[color:var(--color-success-700)]",
    disabled:
      "disabled:bg-[color:var(--color-success-500)]/50 disabled:border-[color:var(--color-success-500)]/50 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  warning: {
    base: "text-gray-900 border bg-[color:var(--color-warning-600)] border-[color:var(--color-warning-600)]",
    hover:
      "hover:bg-[color:var(--color-warning-700)] hover:border-[color:var(--color-warning-700)]",
    active:
      "active:bg-[color:var(--color-warning-700)] active:border-[color:var(--color-warning-700)]",
    disabled:
      "disabled:bg-[color:var(--color-warning-500)]/50 disabled:border-[color:var(--color-warning-500)]/50 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
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
      "font-sans", // radius via CSS var
      "transition-square hover-lift active-press focus-square",
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
        style={{
          borderRadius: "var(--button-border-radius)",
          boxShadow: "var(--button-shadow)",
        }}
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
