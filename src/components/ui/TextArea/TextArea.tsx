import { forwardRef, useEffect, useRef } from "react";

import { Typography } from "../../design-system";

/**
 * BoxCall TextArea Component
 *
 * Professional textarea component with auto-resize and character counting
 */
import type { TextAreaProps } from "./TextArea.types";
// TextArea styles using only Tailwind dark mode classes
const textareaStyles = {
  base: "block w-full rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 surface-card text-text-primary placeholder-text-secondary disabled:surface-subtle disabled:bg-surface-secondary disabled:text-text-secondary disabled:cursor-not-allowed",
  statuses: {
    default: "focus:border-text-info ring-text-info",
    error:
      "focus:border-text-error ring-text-error surface-subtle bg-surface-error/20",
    success:
      "focus:border-text-success ring-text-success surface-subtle bg-surface-success/20",
    warning:
      "focus:border-text-warning ring-text-warning surface-subtle bg-surface-warning/20",
  },
};
/**
 * TextArea Component
 *
 * Features:
 * - Auto-resize based on content
 * - Character counting with limit
 * - Validation states
 * - Dark mode support
 * - Accessibility features
 */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      size = "md",
      status = "default",
      label,
      helperText,
      errorMessage,
      successMessage,
      warningMessage,
      containerClassName = "",
      labelClassName = "",
      required = false,
      autoResize = false,
      maxLength,
      showCharacterCount = false,
      fullWidth = false,
      disabled = false,
      className = "",
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const internalRef = ref || textareaRef;
    // Generate unique ID if not provided
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    // Auto-resize functionality
    useEffect(() => {
      if (
        autoResize &&
        internalRef &&
        typeof internalRef !== "function" &&
        internalRef.current
      ) {
        const textarea = internalRef.current;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize, internalRef]);
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
    // Character count
    const characterCount = value ? String(value).length : 0;
    const isOverLimit = maxLength ? characterCount > maxLength : false;
    // Build textarea classes with theme awareness
    const textareaClasses = [
      // Base styles
      "block w-full rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
      // Size styles
      size === "sm" ? "px-3 py-1.5 text-sm" : "",
      size === "md" ? "px-3 py-2 text-sm" : "",
      size === "lg" ? "px-4 py-3 text-base" : "",
      // Theme-aware status styles
      textareaStyles.base,
      textareaStyles.statuses[status],
      // Auto-resize
      autoResize ? "resize-none" : "resize-y",
      // Full width
      fullWidth ? "w-full" : "",
      // Custom classes
      className,
    ]
      .filter(Boolean)
      .join(" ");
    // Container classes
    const containerClasses = [
      "space-y-1",
      fullWidth ? "w-full" : "",
      containerClassName,
    ]
      .filter(Boolean)
      .join(" ");
    // Label classes with theme awareness
    const labelClasses = [
      "block",
      size === "sm" ? "text-xs" : "text-sm",
      "font-medium text-text-primary text-border-light",
      labelClassName,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={textareaId} className={labelClasses}>
            <Typography variant="label-md" color="error">
              {label}
              {required && <span className="text-text-error ml-1">*</span>}
            </Typography>
          </label>
        )}
        <textarea
          ref={internalRef}
          id={textareaId}
          disabled={disabled}
          className={textareaClasses}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          aria-describedby={
            [
              getStatusMessage() ? `${textareaId}-helper` : undefined,
              showCharacterCount ? `${textareaId}-count` : undefined,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          aria-invalid={status === "error"}
          {...props}
        />
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {getStatusMessage() && (
              <div id={`${textareaId}-helper`}>
                <Typography variant="body-xs" color={getStatusMessageColor()}>
                  {getStatusMessage()}
                </Typography>
              </div>
            )}
          </div>
          {showCharacterCount && (
            <div id={`${textareaId}-count`} className="ml-2 flex-shrink-0">
              <Typography
                variant="body-xs"
                color={isOverLimit ? "error" : "muted"}
              >
                {characterCount}
                {maxLength ? `/${maxLength}` : ""}
              </Typography>
            </div>
          )}
        </div>
      </div>
    );
  }
);
TextArea.displayName = "TextArea";
export default TextArea;
