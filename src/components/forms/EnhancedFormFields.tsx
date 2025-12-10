import React, { useState, useCallback, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
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
    if (isFocused) return "focus-ring";
    if (showError) return "border-error-500";
    if (showSuccess) return "border-success-500";
    return "border dark:border-navy-600";
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
          className="block font-medium text-secondary dark:text-neutral-300"
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
            bg-white dark:bg-navy-800
            text-primary dark:text-neutral-100
            placeholder-neutral-400 dark:placeholder-neutral-500
            focus:outline-none
            ${getInputBorderColor()}
          `}
          required={required}
        />

        {/* Status Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isFocused && (
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--component-button-primary-bg)" }}
            />
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
      <div className="min-h-5">
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

// Enhanced Select component using Headless UI Listbox
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
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`space-y-2 ${className}`}>
      <Typography
        variant="body-sm"
        as="label"
        className="block font-medium text-secondary dark:text-neutral-300"
      >
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </Typography>

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={`
              w-full px-3 py-2.5 rounded-lg transition-all duration-200
              bg-white dark:bg-navy-800
              text-primary dark:text-neutral-100
              border dark:border-navy-600
              focus:outline-none focus:ring-2 focus:ring-jade-500/50 focus:border-jade-500
              text-left cursor-pointer
            `}
          >
            <span className="block truncate">
              {selectedOption?.label || "Select..."}
            </span>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Icon
                name="chevron-down"
                size="sm"
                className="text-muted ui-open:rotate-180 transition-transform"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg bg-surface border border-border shadow-lg focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none py-2.5 px-3
                    ${active ? "bg-jade-50 dark:bg-jade-900/20" : ""}
                    ${selected ? "bg-jade-100 dark:bg-jade-900/30 text-jade-900 dark:text-jade-100" : "text-primary"}
                    `
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span
                        className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <Icon
                          name="check"
                          className="h-5 w-5 text-jade-600 dark:text-jade-400"
                        />
                      )}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

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
