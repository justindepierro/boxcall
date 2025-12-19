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

function buildButtonClasses({
  variant,
  size,
  isDisabled,
  fullWidth,
  className,
}: {
  variant: ButtonProps["variant"];
  size: ButtonProps["size"];
  isDisabled: boolean;
  fullWidth: boolean;
  className: string;
}) {
  const variantStyles = buttonVariants[variant ?? "primary"];
  const sizeStyles = buttonSizes[size ?? "md"];
  const classes: string[] = [];

  classes.push(
    "inline-flex items-center justify-center flex-row flex-nowrap",
    "font-sans rounded-lg",
    "focus:outline-none",
    "overflow-hidden",
    "transition-all duration-200 ease-in-out",
    variantStyles.base,
    variantStyles.focus,
    sizeStyles.fontSize
  );

  const isLinkLike = variant === "link" || variant === "brandLink";
  if (!isDisabled && !isLinkLike) {
    classes.push("hover:scale-[1.02]", "active:scale-[0.98]");
  }

  if (!isDisabled) {
    if (variantStyles.hover) classes.push(variantStyles.hover);
    if (variantStyles.active) classes.push(variantStyles.active);
  }

  if (isDisabled && variantStyles.disabled)
    classes.push(variantStyles.disabled);

  if (variant !== "link") {
    classes.push(sizeStyles.padding, sizeStyles.height);
  }

  if (fullWidth) classes.push("w-full");
  if (className) classes.push(className);

  return classes.filter(Boolean).join(" ");
}

function getIconSpacingClass({
  position,
  hasChildren,
}: {
  position: "left" | "right";
  hasChildren: boolean;
}) {
  if (!hasChildren) return "";
  return position === "left" ? "mr-2" : "ml-2";
}

function renderButtonIcon({
  icon,
  iconPosition,
  position,
  sizeClass,
  hasChildren,
}: {
  icon: React.ReactNode;
  iconPosition: ButtonProps["iconPosition"];
  position: "left" | "right";
  sizeClass: string;
  hasChildren: boolean;
}) {
  if (!icon) return null;
  if (iconPosition === "only") return null;
  if (iconPosition !== position) return null;

  return (
    <span
      className={`inline-flex items-center ${sizeClass} flex-shrink-0 ${getIconSpacingClass(
        {
          position,
          hasChildren,
        }
      )}`}
    >
      {icon}
    </span>
  );
}

function renderButtonLoadingSpinner({
  loading,
  sizeClass,
  hasChildren,
}: {
  loading: boolean;
  sizeClass: string;
  hasChildren: boolean;
}) {
  if (!loading) return null;
  return <LoadingSpinner size={`${sizeClass} ${hasChildren ? "mr-2" : ""}`} />;
}

// Button variant styles configuration - Using component token system (Priority 5)
const buttonVariants: ButtonStylesConfig = {
  primary: {
    base: "btn-primary transition-colors duration-200",
    hover: "", // Handled by .btn-primary:hover
    active: "", // Handled by .btn-primary:active
    disabled: "", // Handled by .btn-primary:disabled
    focus: "focus-ring",
  },
  secondary: {
    base: "btn-secondary transition-colors duration-200",
    hover: "",
    active: "",
    disabled: "",
    focus: "focus-ring",
  },
  outline: {
    base: "btn-outline transition-all duration-200",
    hover: "",
    active: "",
    disabled: "",
    focus: "focus-ring",
  },
  gradient: {
    // Gradient not in component tokens - keep custom
    base: "text-inverse bg-gradient-to-r from-electric-600 to-electric-700 transition-all duration-200",
    hover: "hover:from-electric-500 hover:to-electric-600",
    active: "active:from-electric-700 active:to-electric-800",
    disabled:
      "disabled:from-electric-300 disabled:to-electric-400 disabled:cursor-not-allowed disabled:opacity-60",
    focus: "focus-ring",
  },
  glass: {
    // Glass not in component tokens - keep custom
    base: "bg-surface-base/10 backdrop-blur-md text-primary transition-colors duration-200",
    hover: "hover:bg-surface-base/20",
    active: "active:bg-surface-base/30",
    disabled:
      "disabled:bg-surface-base/5 disabled:text-muted disabled:cursor-not-allowed disabled:opacity-60",
    focus: "focus-ring",
  },
  ghost: {
    base: "btn-ghost transition-colors duration-200",
    hover: "",
    active: "",
    disabled: "",
    focus: "focus-ring",
  },
  subtle: {
    // Subtle is like secondary - use secondary tokens
    base: "btn-secondary transition-colors duration-200",
    hover: "",
    active: "",
    disabled: "",
    focus: "focus-ring",
  },
  link: {
    base: "btn-link",
    hover: "",
    active: "",
    disabled: "",
    focus: "focus-ring",
  },
  brandLink: {
    // Keep custom (brand-specific variant)
    base: "text-brand-active p-0 h-auto font-medium",
    hover: "hover:text-brand-hover hover:underline",
    active: "active:text-brand-hover",
    disabled: "disabled:text-brand-primary/40 disabled:cursor-not-allowed",
    focus: "focus-ring",
  },
  neutralLink: {
    // Keep custom (neutral link variant)
    base: "text-secondary p-0 h-auto",
    hover: "hover:text-primary hover:underline",
    active: "active:text-primary",
    disabled: "disabled:text-muted disabled:cursor-not-allowed",
    focus: "focus-ring",
  },
  infoLink: {
    // Info link variant using text-info (semantic color for info text)
    base: "btn-link text-info",
    hover: "", // Handled by .btn-link:hover
    active: "", // Handled by .btn-link:active
    disabled: "", // Handled by .btn-link:disabled
    focus: "focus-ring",
  },
  dangerLink: {
    // Danger link variant using text-error
    base: "text-error-600 p-0 h-auto",
    hover: "hover:text-error-700 hover:underline",
    active: "active:text-error-700",
    disabled: "disabled:text-error-500/40 disabled:cursor-not-allowed",
    focus: "focus-ring",
  },
  danger: {
    base: "btn-danger",
    hover: "",
    active: "",
    disabled: "",
    focus: "focus-ring",
  },
  success: {
    base: "btn-success",
    hover: "",
    active: "",
    disabled: "",
    focus: "focus-ring",
  },
  warning: {
    base: "btn-warning",
    hover: "",
    active: "",
    disabled: "",
    focus: "focus-ring",
  },
};
// Button size styles configuration - Using component token heights (Priority 5)
const buttonSizes: ButtonSizeConfig = {
  xs: {
    padding: "px-3 py-2",
    fontSize: "text-xs font-medium",
    iconSize: "w-4 h-4",
    height: "btn-xs", // Uses --component-button-height-xs (32px)
  },
  sm: {
    padding: "px-4 py-2",
    fontSize: "text-sm font-medium",
    iconSize: "w-4 h-4",
    height: "btn-sm", // Uses --component-button-height-sm (36px)
  },
  md: {
    padding: "px-6 py-3",
    fontSize: "text-sm font-semibold",
    iconSize: "w-5 h-5",
    height: "btn-md", // Uses --component-button-height-md (40px)
  },
  lg: {
    padding: "px-6 py-3",
    fontSize: "text-base font-semibold",
    iconSize: "w-5 h-5",
    height: "btn-lg", // Uses --component-button-height-lg (44px)
  },
  xl: {
    padding: "px-8 py-4",
    fontSize: "text-lg font-semibold font-display",
    iconSize: "w-6 h-6",
    height: "btn-xl", // Uses --component-button-height-xl (48px)
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
    const sizeStyles = buttonSizes[size];
    const isDisabled = disabled || loading;

    // Handle click with haptic feedback
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!isDisabled) {
        triggerHapticFeedback(hapticType);
      }
      onClick?.(event);
    };
    const baseClasses = buildButtonClasses({
      variant,
      size,
      isDisabled,
      fullWidth,
      className,
    });

    const hasChildren = Boolean(children);
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
        {renderButtonLoadingSpinner({
          loading,
          sizeClass: sizeStyles.iconSize,
          hasChildren,
        })}
        {renderButtonIcon({
          icon,
          iconPosition,
          position: "left",
          sizeClass: sizeStyles.iconSize,
          hasChildren,
        })}
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
        {renderButtonIcon({
          icon,
          iconPosition,
          position: "right",
          sizeClass: sizeStyles.iconSize,
          hasChildren,
        })}
      </button>
    );
  }
);
// Set display name for debugging
Button.displayName = "Button";
