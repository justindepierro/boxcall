/**
 * BoxCall TextArea Component
 *
 * Professional textarea component with auto-resize and character counting
 */

import { forwardRef, useEffect, useRef } from "react";
import { Typography } from "../../design-system";
import type { TextAreaProps } from "./TextArea.types";

// TextArea styles using only Tailwind dark mode classes
const textareaStyles = {
  base: "block w-full rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 dark:disabled:border-gray-600",

  statuses: {
    default:
      "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400",
    error:
      "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400 bg-red-50 dark:bg-red-900/20",
    success:
      "border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500 dark:focus:ring-green-400 bg-green-50 dark:bg-green-900/20",
    warning:
      "border-yellow-300 dark:border-yellow-600 focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-yellow-500 dark:focus:ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
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
      "font-medium text-gray-700 dark:text-gray-300",
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
              {required && <span className="text-red-500 ml-1">*</span>}
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
