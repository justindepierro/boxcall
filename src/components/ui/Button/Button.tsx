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
    base: "text-white border" +
      " bg-[var(--semantic-primary-hover)] border-[var(--semantic-primary-hover)]",
    hover: "hover:bg-[var(--semantic-primary-active)] hover:border-[var(--semantic-primary-active)]",
    active: "active:bg-[var(--semantic-primary-active)] active:border-[var(--semantic-primary-active)]",
    disabled:
      "disabled:bg-[color:var(--color-jade-300)] disabled:border-[color:var(--color-jade-300)] disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  secondary: {
    base: "bg-transparent text-brand-navy border-2 border-brand-navy",
    hover: "hover:bg-brand-navy hover:text-white hover:border-brand-navy",
    active:
      "active:bg-brand-navy-dark active:text-white active:border-brand-navy-dark",
    disabled:
      "disabled:text-brand-navy-light disabled:border-brand-navy-light disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  outline: {
    base: "bg-transparent text-interaction-jade border border-brand-jade",
    hover:
      "hover:bg-surface-jade hover:text-interaction-jade hover:border-interaction-jade",
    active:
      "active:bg-surface-jade-dark active:text-brand-jade-dark active:border-brand-jade-dark",
    disabled:
      "disabled:text-brand-jade-light disabled:border-brand-jade-light disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  ghost: {
  // Strengthen default text color for readability on very light subtle surfaces
  base: "bg-transparent text-text-tertiary md:text-text-secondary border border-transparent",
  hover: "hover:bg-surface-neutral hover:text-text-primary",
  active: "active:bg-surface-neutral-dark active:text-text-primary",
    disabled: "disabled:text-text-muted disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  subtle: {
    base: "surface-subtle text-text-secondary border border-gray-300",
    hover: "surface-subtle-hover hover:text-text-primary",
    active: "active:surface-subtle active:text-text-primary",
    disabled:
      "disabled:surface-subtle disabled:text-text-muted disabled:border-subtle disabled:cursor-not-allowed",
    focus: "focus:ring-2 focus:ring-brand-jade focus:ring-offset-2",
  },
  link: {
    base: "bg-transparent text-interaction-jade border border-transparent p-0 h-auto",
    hover: "hover:text-brand-jade-dark hover:underline",
    active: "active:text-brand-jade-dark",
    disabled: "disabled:text-brand-jade-light disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  // Brand link style with slightly stronger weight (used where prior inline text-jade-* overrides existed)
  brandLink: {
    base: "bg-transparent text-brand-jade-dark border border-transparent p-0 h-auto font-medium",
    hover: "hover:text-brand-jade-darker hover:underline",
    active: "active:text-brand-jade-darker",
    disabled:
      "disabled:text-brand-jade-light disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  neutralLink: {
    base: "bg-transparent text-text-secondary border border-transparent p-0 h-auto",
    hover: "hover:text-text-primary hover:underline",
    active: "active:text-text-primary",
    disabled: "disabled:text-text-muted disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  infoLink: {
    base: "bg-transparent text-blue-700 border border-transparent p-0 h-auto",
    hover: "hover:text-blue-800 hover:underline",
    active: "active:text-blue-800",
    disabled: "disabled:text-blue-300 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  dangerLink: {
    base: "bg-transparent text-red-600 border border-transparent p-0 h-auto",
    hover: "hover:text-red-700 hover:underline",
    active: "active:text-red-700",
    disabled: "disabled:text-red-300 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset focus:rounded-sm",
  },
  danger: {
    base: "text-white border bg-[var(--semantic-error)] border-[var(--semantic-error)]",
    hover: "hover:bg-[color:var(--color-error-600)] hover:border-[color:var(--color-error-600)]",
    active: "active:bg-[color:var(--color-error-700)] active:border-[color:var(--color-error-700)]",
    disabled:
      "disabled:bg-[color:var(--color-error-500)]/50 disabled:border-[color:var(--color-error-500)]/50 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  success: {
    base: "text-white border bg-[color:var(--color-success-600)] border-[color:var(--color-success-600)]",
    hover: "hover:bg-[color:var(--color-success-700)] hover:border-[color:var(--color-success-700)]",
    active: "active:bg-[color:var(--color-success-700)] active:border-[color:var(--color-success-700)]",
    disabled:
      "disabled:bg-[color:var(--color-success-500)]/50 disabled:border-[color:var(--color-success-500)]/50 disabled:cursor-not-allowed",
    focus: "focus-ring focus-ring-offset",
  },
  warning: {
    base: "text-gray-900 border bg-[color:var(--color-warning-600)] border-[color:var(--color-warning-600)]",
    hover: "hover:bg-[color:var(--color-warning-700)] hover:border-[color:var(--color-warning-700)]",
    active: "active:bg-[color:var(--color-warning-700)] active:border-[color:var(--color-warning-700)]",
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
