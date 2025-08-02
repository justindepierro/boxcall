/**
 * BoxCall Input Component
 *
 * Masculine, technical input component with jade/navy theme
 * Square, confident design for football team management
 */

import { forwardRef, useState } from "react";
import { Typography } from "../../design-system";
import type {
  InputProps,
  InputSizeConfig,
  InputStylesConfig,
} from "./Input.types";

// Input base styles configuration - Square, technical styling with jade/navy theme
const inputStyles: InputStylesConfig = {
  base: "block w-full rounded-xs border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-sans",

  sizes: {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-4 text-base",
  },

  variants: {
    text: "",
    email: "",
    password: "",
    number: "font-mono", // Monospace for numerical precision
    tel: "font-mono",   // Monospace for phone numbers
    url: "",
    search: "",
  },

  statuses: {
    default:
      "border-gray-300 dark:border-gray-600 focus:border-jade-500 dark:focus:border-jade-400 focus:ring-jade-500 dark:focus:ring-jade-400",
    error:
      "border-red-400 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400 bg-red-50 dark:bg-red-900/20",
    success:
      "border-jade-400 dark:border-jade-500 focus:border-jade-500 dark:focus:border-jade-400 focus:ring-jade-500 dark:focus:ring-jade-400 bg-jade-50 dark:bg-jade-900/20",
    warning:
      "border-yellow-400 dark:border-yellow-500 focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-yellow-500 dark:focus:ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
  },

  focus: "focus:ring-2 focus:ring-offset-1",
  disabled:
    "disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 dark:disabled:border-gray-600",
};

// Size configuration
const sizeConfig: InputSizeConfig = {
  container: "space-y-1",
  input: "",
  label: "block",
  helper: "block",
  icon: "absolute top-1/2 transform -translate-y-1/2",
};

/**
 * Input Component
 *
 * A professional input component with comprehensive features:
 * - Multiple input types (text, email, password, etc.)
 * - Validation states (error, success, warning)
 * - Icon support (left and right)
 * - Size variants (sm, md, lg)
 * - Dark mode support
 * - Loading states
 * - Password visibility toggle
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "text",
      size = "md",
      status = "default",
      label,
      helperText,
      errorMessage,
      successMessage,
      warningMessage,
      leftIcon,
      rightIcon,
      containerClassName = "",
      labelClassName = "",
      required = false,
      showPasswordToggle = true,
      loading = false,
      fullWidth = false,
      disabled = false,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Determine the actual input type
    const inputType = variant === "password" && showPassword ? "text" : variant;

    // Get status message
    const getStatusMessage = () => {
      if (status === "error" && errorMessage) return errorMessage;
      if (status === "success" && successMessage) return successMessage;
      if (status === "warning" && warningMessage) return warningMessage;
      return helperText;
    };

    // Get status message color
    const getStatusMessageColor = () => {
      switch (status) {
        case "error":
          return "error";
        case "success":
          return "success";
        case "warning":
          return "warning";
        default:
          return "muted";
      }
    };

    // Build input classes with theme awareness
    const inputClasses = [
      inputStyles.base,
      inputStyles.sizes[size],
      inputStyles.statuses[status],
      inputStyles.disabled,
      leftIcon ? "pl-10" : "",
      rightIcon || (variant === "password" && showPasswordToggle)
        ? "pr-10"
        : "",
      loading ? "animate-pulse" : "",
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Container classes
    const containerClasses = [
      sizeConfig.container,
      fullWidth ? "w-full" : "",
      containerClassName,
    ]
      .filter(Boolean)
      .join(" ");

    // Label classes with display font for masculine impact
    const labelClasses = [
      sizeConfig.label,
      size === "sm" ? "text-xs" : "text-sm",
      "font-display font-medium text-gray-700 dark:text-gray-300", // Display font for labels
      labelClassName,
    ]
      .filter(Boolean)
      .join(" ");

    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            <Typography variant="label-md" color="error">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Typography>
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={`${sizeConfig.icon} left-3 text-gray-400 dark:text-gray-500`}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled || loading}
            className={inputClasses}
            aria-describedby={
              getStatusMessage() ? `${inputId}-helper` : undefined
            }
            aria-invalid={status === "error"}
            {...props}
          />

          {(rightIcon || (variant === "password" && showPasswordToggle)) && (
            <div className={`${sizeConfig.icon} right-3`}>
              {variant === "password" && showPasswordToggle ? (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="focus:outline-none text-gray-400 hover:text-gray-600 focus:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 dark:focus:text-gray-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              ) : rightIcon ? (
                <div className="text-gray-400 dark:text-gray-500">
                  {rightIcon}
                </div>
              ) : null}
            </div>
          )}

          {loading && (
            <div className={`${sizeConfig.icon} right-3`}>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-jade-500 border-t-transparent"></div>
            </div>
          )}
        </div>

        {getStatusMessage() && (
          <div id={`${inputId}-helper`} className={sizeConfig.helper}>
            <Typography variant="body-xs" color={getStatusMessageColor()}>
              {getStatusMessage()}
            </Typography>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
