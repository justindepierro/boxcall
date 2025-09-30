/**
 * Accessible Input Component
 *
 * WCAG 2.1 AA compliant input with comprehensive accessibility features
 */

import React, { forwardRef, useCallback, useRef, useState } from "react";
import { useAriaAttributes } from "../../hooks/useAccessibility";
import { ARIA_LABELS } from "../../config/accessibility";

interface AccessibleInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  hint?: string;
  showLabel?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  variant?: "default" | "filled" | "outlined";
  size?: "sm" | "md" | "lg";
}

export const AccessibleInput = forwardRef<
  HTMLInputElement,
  AccessibleInputProps
>(
  (
    {
      label,
      error,
      hint,
      showLabel = true,
      required = false,
      icon,
      iconPosition = "left",
      variant = "default",
      size = "md",
      className = "",
      id,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    const { generateId } = useAriaAttributes();
    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = id || generateId("input");
    const errorId = generateId("error");
    const hintId = generateId("hint");

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(event);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(event);
      },
      [onBlur]
    );

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(event);
      },
      [onChange]
    );

    const hasError = Boolean(error);
    const hasIcon = Boolean(icon);

    const baseInputClasses = `
    w-full
    border
    rounded-lg
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-offset-1
    disabled:opacity-50
    disabled:cursor-not-allowed
    ${hasIcon && iconPosition === "left" ? "pl-10" : ""}
    ${hasIcon && iconPosition === "right" ? "pr-10" : ""}
  `;

    const variantClasses = {
      default: `
      bg-white
      border-gray-300
      focus:border-blue-500
      focus:ring-blue-500
      ${hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
    `,
      filled: `
      bg-gray-50
      border-transparent
      focus:bg-white
      focus:border-blue-500
      focus:ring-blue-500
      ${hasError ? "bg-red-50 border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
    `,
      outlined: `
      bg-transparent
      border-2
      border-gray-300
      focus:border-blue-500
      focus:ring-blue-500
      ${hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
    `,
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm min-h-[32px]",
      md: "px-4 py-2 text-base min-h-[40px]",
      lg: "px-6 py-3 text-lg min-h-[48px]",
    };

    const labelClasses = `
    block
    text-sm
    font-medium
    mb-1
    ${hasError ? "text-red-700" : "text-gray-700"}
    ${required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ""}
  `;

    const describedBy =
      [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") ||
      undefined;

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className={showLabel ? labelClasses : "sr-only"}
        >
          {label}
          {required && <span className="sr-only">{ARIA_LABELS.REQUIRED}</span>}
        </label>

        <div className="relative">
          {hasIcon && iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span
                className={`${hasError ? "text-red-500" : "text-gray-400"}`}
                aria-hidden="true"
              >
                {icon}
              </span>
            </div>
          )}

          <input
            ref={ref || inputRef}
            id={inputId}
            className={`${baseInputClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            aria-required={required}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {hasIcon && iconPosition === "right" && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span
                className={`${hasError ? "text-red-500" : "text-gray-400"}`}
                aria-hidden="true"
              >
                {icon}
              </span>
            </div>
          )}

          {/* Visual focus indicator */}
          {isFocused && (
            <div
              className="absolute inset-0 rounded-lg border-2 border-blue-500 pointer-events-none"
              aria-hidden="true"
            />
          )}
        </div>

        {hint && !error && (
          <p id={hintId} className="text-sm text-gray-600" role="note">
            {hint}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            <span className="sr-only">{ARIA_LABELS.ERROR}: </span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = "AccessibleInput";
