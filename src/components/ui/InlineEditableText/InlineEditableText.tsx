import React, { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "../Icon/Icon";

import type { InlineEditableTextProps } from "./InlineEditableText.types";

/**
 * InlineEditableText Component
 *
 * A reusable inline editable text component with validation, visual feedback, and accessibility features.
 * Features:
 * - Subtle off-color highlight for editable state
 * - Green highlight when editing and data is valid
 * - Length and symbol validation
 * - Configurable warnings for diagram compatibility
 * - Keyboard navigation support
 */
export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  onChange,
  onEditStart,
  onEditEnd,
  placeholder = "Click to edit...",
  maxLength,
  minLength,
  allowSymbols = false,
  validationRules = [],
  showLengthWarnings = true,
  maxRecommendedLength = 2,
  className = "",
  disabled = false,
  showValidation = true,
  customValidator,
  icon,
  size = "md",
  autoFocus = true,
  selectAllOnFocus = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message?: string;
    level?: "error" | "warning";
  }>({ isValid: true });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Size configurations
  const sizeClasses = {
    sm: "px-2 py-1 text-sm min-h-[24px]",
    md: "px-3 py-2 text-sm min-h-[32px]",
    lg: "px-4 py-3 text-base min-h-[40px]",
  };

  // Update edit value when prop value changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Validation function
  const validateValue = useCallback(
    (
      val: string
    ): { isValid: boolean; message?: string; level?: "error" | "warning" } => {
      // Custom validator takes precedence
      if (customValidator) {
        return customValidator(val);
      }

      // Length validation
      if (minLength && val.length < minLength) {
        return {
          isValid: false,
          message: `Minimum ${minLength} characters required`,
          level: "error",
        };
      }

      if (maxLength && val.length > maxLength) {
        return {
          isValid: false,
          message: `Maximum ${maxLength} characters allowed`,
          level: "error",
        };
      }

      // Symbol validation
      if (!allowSymbols && /[^a-zA-Z0-9\s]/.test(val)) {
        return {
          isValid: false,
          message: "Symbols are not allowed",
          level: "error",
        };
      }

      // Length warning for diagram compatibility
      if (showLengthWarnings && val.length > maxRecommendedLength) {
        return {
          isValid: true,
          message: `Long text may overdraw on diagram shapes`,
          level: "warning",
        };
      }

      // Custom validation rules
      for (const rule of validationRules) {
        if (!rule.validate(val)) {
          return {
            isValid: false,
            message: rule.message,
            level: rule.level,
          };
        }
      }

      return { isValid: true };
    },
    [
      minLength,
      maxLength,
      allowSymbols,
      showLengthWarnings,
      maxRecommendedLength,
      validationRules,
      customValidator,
    ]
  );

  // Update validation when edit value changes
  useEffect(() => {
    if (isEditing) {
      const result = validateValue(editValue);
      setValidationResult(result);
    }
  }, [editValue, isEditing, validateValue]);

  // Handle starting edit
  const handleStartEdit = useCallback(() => {
    if (disabled) return;

    setIsEditing(true);
    setEditValue(value);
    onEditStart?.();

    // Focus and select text after render
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        if (selectAllOnFocus) {
          inputRef.current.select();
        }
      }
    }, 0);
  }, [disabled, value, onEditStart, selectAllOnFocus]);

  // Handle finishing edit
  const handleFinishEdit = useCallback(() => {
    const result = validateValue(editValue);

    // Only save if valid or if it's a warning (warnings allow saving)
    if (result.isValid || result.level === "warning") {
      onChange(editValue);
      onEditEnd?.(editValue);
    }

    setIsEditing(false);
    setValidationResult({ isValid: true });
  }, [editValue, validateValue, onChange, onEditEnd]);

  // Handle key events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleFinishEdit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setEditValue(value);
        setIsEditing(false);
        setValidationResult({ isValid: true });
      }
    },
    [handleFinishEdit, value]
  );

  // Handle blur (finish editing)
  const handleBlur = useCallback(() => {
    handleFinishEdit();
  }, [handleFinishEdit]);

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditValue(e.target.value);
    },
    []
  );

  // Determine display classes based on state
  const getDisplayClasses = () => {
    const baseClasses = `
      inline-flex items-center gap-2 rounded-lg transition-all duration-200 cursor-pointer
      border-2 border-surface-primary hover:border-border-light hover:border-text-tertiary
      ${sizeClasses[size]}
      ${className}
    `;

    if (isEditing) {
      if (validationResult.isValid) {
        return `${baseClasses} bg-surface-success border-text-success`;
      } else if (validationResult.level === "warning") {
        return `${baseClasses} bg-surface-warning border-text-warning`;
      } else {
        return `${baseClasses} bg-surface-error border-text-error`;
      }
    }

    return `${baseClasses} hover:bg-surface-secondary`;
  };

  const getTextClasses = () => {
    const baseClasses = "flex-1 truncate";

    if (!value && placeholder) {
      return `${baseClasses} text-text-secondary italic`;
    }

    return baseClasses;
  };

  const getInputClasses = () => {
    const baseClasses = `
      flex-1 bg-surface-primary border-none outline-none p-0 m-0
      text-text-primary font-inherit leading-inherit
      placeholder:text-text-secondary
    `;

    if (validationResult.isValid) {
      return `${baseClasses} text-text-success`;
    } else if (validationResult.level === "warning") {
      return `${baseClasses} text-text-warning`;
    } else {
      return `${baseClasses} text-text-error`;
    }
  };

  // Render validation message
  const renderValidationMessage = () => {
    if (!showValidation || validationResult.isValid || !isEditing) return null;

    const messageClasses =
      validationResult.level === "warning"
        ? "text-text-warning"
        : "text-text-error";

    return (
      <div className={`text-xs mt-1 ${messageClasses}`}>
        {validationResult.message}
      </div>
    );
  };

  return (
    <div className="inline-block">
      <div
        ref={containerRef}
        className={getDisplayClasses()}
        onClick={isEditing ? undefined : handleStartEdit}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleStartEdit();
          }
        }}
        aria-label={`Edit ${value || placeholder}`}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={getInputClasses()}
            placeholder={placeholder}
            maxLength={maxLength}
            autoFocus={autoFocus}
            aria-invalid={!validationResult.isValid}
            aria-describedby={
              validationResult.message ? "validation-message" : undefined
            }
          />
        ) : (
          <>
            <span className={getTextClasses()}>{value || placeholder}</span>
            {icon && (
              <span className="flex-shrink-0 text-text-muted dark:text-text-muted">
                {icon}
              </span>
            )}
            {!icon && (
              <Icon
                name="edit"
                size="sm"
                className="flex-shrink-0 text-text-muted dark:text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}
          </>
        )}
      </div>

      {renderValidationMessage() && (
        <div id="validation-message" className="sr-only">
          {validationResult.message}
        </div>
      )}
    </div>
  );
};
