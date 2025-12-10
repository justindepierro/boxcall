/**
 * FormSelect Component
 *
 * A drop-in replacement for native <select> using Headless UI Listbox.
 * Provides consistent styling, accessibility, and keyboard navigation.
 */

import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";

export interface FormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Optional label rendered above the select */
  label?: string;
  /** ID for accessibility */
  id?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  className = "",
  label,
  id,
}) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-secondary dark:text-neutral-300 mb-1"
        >
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            id={id}
            className={`
              w-full px-3 py-2 rounded-lg transition-all duration-200
              bg-white dark:bg-navy-800
              text-primary dark:text-neutral-100
              border border-secondary dark:border-navy-600
              focus:outline-none focus:ring-2 focus:ring-jade-500/50 focus:border-jade-500
              text-left cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
              text-sm
            `}
          >
            <span className={`block truncate ${!selectedOption ? "text-muted" : ""}`}>
              {selectedOption?.label || placeholder}
            </span>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-muted ui-open:rotate-180 transition-transform" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg bg-white dark:bg-navy-800 border border-secondary dark:border-navy-600 shadow-lg focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none py-2 px-3 text-sm
                    ${active ? "bg-jade-50 dark:bg-jade-900/20" : ""}
                    ${selected ? "bg-jade-100 dark:bg-jade-900/30 text-jade-900 dark:text-jade-100" : "text-primary dark:text-neutral-100"}
                    ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}
                    `
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                        {option.label}
                      </span>
                      {selected && (
                        <Check className="h-4 w-4 text-jade-600 dark:text-jade-400" />
                      )}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default FormSelect;
