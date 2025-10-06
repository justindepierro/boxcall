import React, { useState, useCallback } from "react";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon/Icon";

interface EnhancedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "url";
  helperText?: string;
  maxLength?: number;
  validation?: {
    pattern?: RegExp;
    message?: string;
    minLength?: number;
  };
  className?: string;
}

interface ValidationState {
  isValid: boolean;
  message: string;
  isEmpty: boolean;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  helperText,
  maxLength,
  validation,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);

  const validateInput = useCallback(
    (inputValue: string): ValidationState => {
      const isEmpty = inputValue.trim() === "";

      if (isEmpty && required) {
        return {
          isValid: false,
          message: `${label} is required`,
          isEmpty: true,
        };
      }

      if (!isEmpty && validation) {
        if (validation.minLength && inputValue.length < validation.minLength) {
          return {
            isValid: false,
            message: `${label} must be at least ${validation.minLength} characters`,
            isEmpty: false,
          };
        }

        if (validation.pattern && !validation.pattern.test(inputValue)) {
          return {
            isValid: false,
            message: validation.message || `${label} format is invalid`,
            isEmpty: false,
          };
        }
      }

      // Type-specific validation
      if (!isEmpty && type === "email") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(inputValue)) {
          return {
            isValid: false,
            message: "Please enter a valid email address",
            isEmpty: false,
          };
        }
      }

      if (!isEmpty && type === "tel") {
        const phonePattern = /^[+]?[\d\s\-().]{10,}$/;
        if (!phonePattern.test(inputValue)) {
          return {
            isValid: false,
            message: "Please enter a valid phone number",
            isEmpty: false,
          };
        }
      }

      return {
        isValid: true,
        message: "",
        isEmpty,
      };
    },
    [label, required, validation, type]
  );

  const validationState = validateInput(value);
  const showValidation = hasBeenTouched && !isFocused;
  const showError = showValidation && !validationState.isValid;
  const showSuccess =
    showValidation && validationState.isValid && !validationState.isEmpty;

  const getInputBorderColor = () => {
    if (isFocused) return "border-jade-500 ring-2 ring-jade-500/20";
    if (showError) return "border-error-500";
    if (showSuccess) return "border-success-500";
    return "border dark:border-slate-600";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    onChange(newValue);
  };

  const formatPlaceholder = () => {
    if (!placeholder) return "";

    switch (type) {
      case "email":
        return placeholder || "e.g., coach@school.edu";
      case "tel":
        return placeholder || "e.g., (555) 123-4567";
      default:
        return placeholder;
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <Typography
          variant="body-sm"
          as="label"
          className="block font-medium text-secondary dark:text-slate-300"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </Typography>

        {maxLength && (
          <Typography
            variant="body-xs"
            color="muted"
            className={`text-right ${value.length > maxLength * 0.8 ? "text-warning-600" : ""}`}
          >
            {value.length}/{maxLength}
          </Typography>
        )}
      </div>

      {/* Input Container */}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setHasBeenTouched(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={formatPlaceholder()}
          className={`
            w-full px-3 py-2.5 rounded-lg transition-all duration-200
            bg-white dark:bg-slate-800
            text-primary dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none
            ${getInputBorderColor()}
          `}
          required={required}
        />

        {/* Status Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isFocused && (
            <div className="w-2 h-2 bg-jade-500 rounded-full animate-pulse" />
          )}
          {showError && (
            <Icon name="alert" size="sm" className="text-error-500" />
          )}
          {showSuccess && (
            <Icon name="check-circle" size="sm" className="text-success-500" />
          )}
        </div>
      </div>

      {/* Helper Text / Validation Messages */}
      {/* eslint-disable-next-line boxcall-design/no-arbitrary-spacing, boxcall-design/no-raw-tailwind-colors */}
      <div className="min-h-[1.25rem]">
        {showError && (
          <div className="flex items-center gap-1.5">
            <Icon
              name="alert-triangle"
              size="xs"
              className="text-error-500 mt-0.5"
            />
            <Typography
              variant="body-xs"
              className="text-error-600 dark:text-error-500"
            >
              {validationState.message}
            </Typography>
          </div>
        )}

        {showSuccess && !helperText && (
          <div className="flex items-center gap-1.5">
            <Icon name="check" size="xs" className="text-success-500 mt-0.5" />
            <Typography
              variant="body-xs"
              className="text-success-600 dark:text-success-400"
            >
              Looks good!
            </Typography>
          </div>
        )}

        {helperText && !showError && (
          <Typography
            variant="body-xs"
            color="muted"
            className="flex items-center gap-1.5"
          >
            <Icon name="info" size="xs" className="mt-0.5" />
            {helperText}
          </Typography>
        )}
      </div>
    </div>
  );
};

// Enhanced Select component
interface EnhancedSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  required?: boolean;
  helperText?: string;
  className?: string;
}

export const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  helperText,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (isFocused) return "border-jade-500 ring-2 ring-jade-500/20";
    return "border dark:border-slate-600";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Typography
        variant="body-sm"
        as="label"
        className="block font-medium text-secondary dark:text-slate-300"
      >
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </Typography>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-3 py-2.5 rounded-lg transition-all duration-200
            bg-white dark:bg-slate-800
            text-primary dark:text-slate-100
            focus:outline-none
            appearance-none
            ${getBorderColor()}
          `}
          required={required}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Icon name="chevron-down" size="sm" className="text-muted" />
        </div>
      </div>

      {helperText && (
        <Typography
          variant="body-xs"
          color="muted"
          className="flex items-center gap-1.5"
        >
          <Icon name="info" size="xs" className="mt-0.5" />
          {helperText}
        </Typography>
      )}
    </div>
  );
};
