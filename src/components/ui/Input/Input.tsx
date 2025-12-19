import { forwardRef, useState } from "react";

import { Typography } from "../../design-system";
/**
 * BoxCall Input Component
 *
 * Masculine, technical input component with jade/navy theme
 * Square, confident design for football team management
 */
import { IconButton } from "../IconButton/IconButton";

import type {
  InputProps,
  InputSizeConfig,
  InputStylesConfig,
} from "./Input.types";

function getStatusMessage({
  status,
  helperText,
  errorMessage,
  successMessage,
  warningMessage,
}: Pick<
  InputProps,
  "status" | "helperText" | "errorMessage" | "successMessage" | "warningMessage"
>) {
  if (status === "error" && errorMessage) return errorMessage;
  if (status === "success" && successMessage) return successMessage;
  if (status === "warning" && warningMessage) return warningMessage;
  return helperText;
}

function getStatusMessageColor(status: NonNullable<InputProps["status"]>) {
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
}

function buildInputClasses({
  size,
  status,
  variant,
  className,
  leftIcon,
  rightIcon,
  showPasswordToggle,
  loading,
  fullWidth,
}: {
  size: NonNullable<InputProps["size"]>;
  status: NonNullable<InputProps["status"]>;
  variant: NonNullable<InputProps["variant"]>;
  className: string;
  leftIcon: InputProps["leftIcon"];
  rightIcon: InputProps["rightIcon"];
  showPasswordToggle: boolean;
  loading: boolean;
  fullWidth: boolean;
}) {
  const classes: string[] = [];
  classes.push(
    inputStyles.base,
    inputStyles.sizes[size],
    inputStyles.statuses[status]
  );

  if (inputStyles.variants[variant])
    classes.push(inputStyles.variants[variant]);
  if (leftIcon) classes.push("pl-10");

  const hasRightAdornment =
    Boolean(rightIcon) || (variant === "password" && showPasswordToggle);
  if (hasRightAdornment) classes.push("pr-10");

  if (loading) classes.push("animate-pulse");
  if (fullWidth) classes.push("w-full");
  if (className) classes.push(className);

  return classes.filter(Boolean).join(" ");
}

function buildContainerClasses({
  fullWidth,
  containerClassName,
}: {
  fullWidth: boolean;
  containerClassName: string;
}) {
  const classes: string[] = [sizeConfig.container];
  if (fullWidth) classes.push("w-full");
  if (containerClassName) classes.push(containerClassName);
  return classes.filter(Boolean).join(" ");
}

function buildLabelClasses({
  size,
  labelClassName,
}: {
  size: NonNullable<InputProps["size"]>;
  labelClassName: string;
}) {
  const classes: string[] = [sizeConfig.label];
  classes.push(size === "sm" ? "text-xs" : "text-sm");
  classes.push("font-display font-medium text-primary dark:text-border-light");
  if (labelClassName) classes.push(labelClassName);
  return classes.filter(Boolean).join(" ");
}

function renderRightAdornment({
  variant,
  showPasswordToggle,
  showPassword,
  togglePasswordVisibility,
  rightIcon,
}: {
  variant: InputProps["variant"];
  showPasswordToggle: boolean;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  rightIcon: InputProps["rightIcon"];
}) {
  const isPasswordToggle = variant === "password" && showPasswordToggle;
  if (isPasswordToggle) {
    return (
      <IconButton
        aria-label={showPassword ? "Hide password" : "Show password"}
        tooltip={showPassword ? "Hide password" : "Show password"}
        onClick={togglePasswordVisibility}
        size="xs"
        variant="ghost"
        className="text-secondary hover:text-primary dark:text-secondary dark:hover:text-primary"
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
      </IconButton>
    );
  }

  if (rightIcon) {
    return <div className="text-muted dark:text-muted">{rightIcon}</div>;
  }

  return null;
}

function resolveInputId(id?: string) {
  if (id) return id;
  return `input-${Math.random().toString(36).substr(2, 9)}`;
}

function resolveInputType(
  variant: NonNullable<InputProps["variant"]>,
  showPassword: boolean
) {
  if (variant === "password" && showPassword) return "text";
  return variant;
}

function resolveInputDisabled(disabled: boolean, loading: boolean) {
  if (disabled) return true;
  if (loading) return true;
  return false;
}

function resolveAriaDescribedBy({
  inputId,
  statusMessage,
}: {
  inputId: string;
  statusMessage: string | undefined;
}) {
  if (!statusMessage) return undefined;
  return `${inputId}-helper`;
}

function renderInputLabel({
  label,
  inputId,
  labelClasses,
  required,
}: {
  label: InputProps["label"];
  inputId: string;
  labelClasses: string;
  required: boolean;
}) {
  if (!label) return null;
  return (
    <label htmlFor={inputId} className={labelClasses}>
      <Typography variant="label-md" color="error">
        {label}
        {required ? <span className="text-error ml-1">*</span> : null}
      </Typography>
    </label>
  );
}

function renderLeftAdornment({
  leftIcon,
}: {
  leftIcon: InputProps["leftIcon"];
}) {
  if (!leftIcon) return null;
  return (
    <div
      className={`${sizeConfig.icon} left-3 text-secondary dark:text-secondary`}
    >
      {leftIcon}
    </div>
  );
}

function renderRightAdornmentContainer({
  variant,
  showPasswordToggle,
  showPassword,
  togglePasswordVisibility,
  rightIcon,
}: {
  variant: InputProps["variant"];
  showPasswordToggle: boolean;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  rightIcon: InputProps["rightIcon"];
}) {
  const shouldShow =
    Boolean(rightIcon) || (variant === "password" && showPasswordToggle);
  if (!shouldShow) return null;

  return (
    <div className={`${sizeConfig.icon} right-3`}>
      {renderRightAdornment({
        variant,
        showPasswordToggle,
        showPassword,
        togglePasswordVisibility,
        rightIcon,
      })}
    </div>
  );
}

function renderLoadingIndicator(loading: boolean) {
  if (!loading) return null;
  return (
    <div className={`${sizeConfig.icon} right-3`}>
      <div
        className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent"
        style={{ borderColor: "var(--component-button-primary-bg)" }}
      ></div>
    </div>
  );
}

function renderHelperText({
  inputId,
  statusMessage,
  statusMessageColor,
}: {
  inputId: string;
  statusMessage: string | undefined;
  statusMessageColor: ReturnType<typeof getStatusMessageColor>;
}) {
  if (!statusMessage) return null;
  return (
    <div id={`${inputId}-helper`} className={sizeConfig.helper}>
      <Typography variant="body-xs" color={statusMessageColor}>
        {statusMessage}
      </Typography>
    </div>
  );
}
// Input base styles configuration - Using component token system (Priority 5)
const inputStyles: InputStylesConfig = {
  base: "input block w-full rounded-lg transition-all duration-200 focus:outline-none font-sans",
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
    tel: "font-mono", // Monospace for phone numbers
    url: "",
    search: "",
  },
  statuses: {
    default: "", // .input class handles default state
    error: "input-error",
    success: "input-success",
    warning: "input-warning",
  },
  focus: "", // Handled by .input class
  disabled: "", // Handled by .input:disabled
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

    const inputId = resolveInputId(id);
    const inputType = resolveInputType(variant, showPassword);
    const inputDisabled = resolveInputDisabled(disabled, loading);

    const statusMessage = getStatusMessage({
      status,
      helperText,
      errorMessage,
      successMessage,
      warningMessage,
    });
    const statusMessageColor = getStatusMessageColor(status);
    const describedBy = resolveAriaDescribedBy({ inputId, statusMessage });

    const labelNode = renderInputLabel({
      label,
      inputId,
      labelClasses: buildLabelClasses({ size, labelClassName }),
      required,
    });
    const leftAdornmentNode = renderLeftAdornment({ leftIcon });

    const inputClasses = buildInputClasses({
      size,
      status,
      variant,
      className,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      loading,
      fullWidth,
    });

    const containerClasses = buildContainerClasses({
      fullWidth,
      containerClassName,
    });
    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const rightAdornmentNode = renderRightAdornmentContainer({
      variant,
      showPasswordToggle,
      showPassword,
      togglePasswordVisibility,
      rightIcon,
    });
    const loadingNode = renderLoadingIndicator(loading);
    const helperNode = renderHelperText({
      inputId,
      statusMessage,
      statusMessageColor,
    });
    return (
      <div className={containerClasses}>
        {labelNode}
        <div className="relative">
          {leftAdornmentNode}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={inputDisabled}
            className={inputClasses}
            aria-describedby={describedBy}
            aria-invalid={status === "error"}
            {...props}
          />
          {rightAdornmentNode}
          {loadingNode}
        </div>
        {helperNode}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
