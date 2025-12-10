import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Icon } from "../Icon/Icon";

/**
 * BoxCall Dropdown Component
 *
 * Lightweight dropdown using @headlessui/react Listbox
 * - Mobile-friendly with proper touch targets
 * - Full accessibility (ARIA, keyboard navigation)
 * - Consistent styling across the app
 *
 * For searchable dropdowns, use Combobox from @headlessui/react directly
 */

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  /** Array of options to display */
  options: DropdownOption[];
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Label displayed above the dropdown */
  label?: string;
  /** Disable the dropdown */
  disabled?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Additional className for container */
  className?: string;
  /** Full width mode */
  fullWidth?: boolean;
  /** ID for form association */
  id?: string;
  /** Name for form submission */
  name?: string;
  /** Allow clearing selection */
  clearable?: boolean;
}

const sizeClasses = {
  sm: "min-h-[36px] py-1.5 px-3 text-sm",
  md: "min-h-[44px] py-2 px-3 text-sm",
  lg: "min-h-[52px] py-3 px-4 text-base",
};

const optionSizeClasses = {
  sm: "py-2 px-3 text-sm",
  md: "py-3 px-3 text-sm",
  lg: "py-4 px-4 text-base",
};

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  disabled = false,
  size = "md",
  error = false,
  errorMessage,
  className = "",
  fullWidth = true,
  id,
  name,
  clearable = false,
}) => {
  const selectedOption = options.find((opt) => opt.value === value);

  // Add empty option at the beginning if clearable
  const optionsWithClear = clearable
    ? [{ value: "", label: placeholder || "None" }, ...options]
    : options;

  return (
    <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-primary mb-1.5"
        >
          {label}
        </label>
      )}

      <Listbox
        value={value}
        onChange={onChange}
        disabled={disabled}
        name={name}
      >
        <div className="relative">
          <Listbox.Button
            id={id}
            className={`
              relative w-full cursor-pointer rounded-lg border bg-surface text-left
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-jade-500 focus:ring-offset-2
              ${sizeClasses[size]}
              ${error ? "border-error" : "border-border hover:border-jade-400"}
              ${disabled ? "opacity-50 cursor-not-allowed bg-surface-muted" : ""}
            `}
          >
            <span
              className={`block truncate ${
                selectedOption ? "text-primary" : "text-muted"
              }`}
            >
              {selectedOption?.label || placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <Icon
                name="chevron-down"
                className="h-5 w-5 text-muted"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-surface border border-border shadow-lg focus:outline-none">
              {optionsWithClear.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none ${optionSizeClasses[size]}
                    ${active ? "bg-jade-50 dark:bg-jade-900/20" : ""}
                    ${selected ? "bg-jade-100 dark:bg-jade-900/30 text-jade-900 dark:text-jade-100" : "text-primary"}
                    ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}
                    `
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <Icon
                          name="check"
                          className="h-5 w-5 text-jade-600 dark:text-jade-400"
                          aria-hidden="true"
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

      {errorMessage && (
        <p className="mt-1.5 text-sm text-error">{errorMessage}</p>
      )}
    </div>
  );
};

export default Dropdown;
