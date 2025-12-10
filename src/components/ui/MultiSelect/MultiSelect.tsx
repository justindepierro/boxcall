/**
 * MultiSelect Component
 *
 * Accessible multi-select dropdown built on @headlessui/react
 * - Full keyboard navigation (Arrow keys, Enter, Escape, Space)
 * - ARIA compliant for screen readers
 * - Visual checkbox selection
 * - Consistent design system styling
 *
 * @example
 * ```tsx
 * <MultiSelect
 *   options={[
 *     { value: 'QB', label: 'Quarterback' },
 *     { value: 'RB', label: 'Running Back' },
 *   ]}
 *   selected={['QB']}
 *   onChange={(values) => setSelected(values)}
 *   placeholder="All Positions"
 * />
 * ```
 */

import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Icon } from "../Icon/Icon";
import { Typography } from "../../design-system";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  /** Available options to select from */
  options: MultiSelectOption[];
  /** Currently selected values */
  selected: string[];
  /** Callback when selection changes */
  onChange: (selected: string[]) => void;
  /** Placeholder text when nothing selected */
  placeholder?: string;
  /** Function to generate label from count */
  selectedLabel?: (count: number) => string;
  /** Additional CSS classes */
  className?: string;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

/**
 * MultiSelect dropdown component with checkbox selection
 */
export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  selectedLabel = (count) => `${count} selected`,
  className = "",
  disabled = false,
  ariaLabel,
}) => {
  const displayText =
    selected.length === 0 ? placeholder : selectedLabel(selected.length);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <Listbox value={selected} onChange={() => {}} multiple disabled={disabled}>
      <div className={`relative ${className}`}>
        <Listbox.Button
          className={`
            px-3 py-2 border rounded-lg bg-white dark:bg-navy-800 
            text-sm w-full sm:w-auto sm:min-w-44 
            flex items-center justify-between
            transition-colors
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:border-jade-500 focus:outline-none focus:ring-2 focus:ring-jade-500/50 focus:border-jade-500"
            }
            border-secondary dark:border-navy-600
            ui-open:ring-2 ui-open:ring-jade-500/50 ui-open:border-jade-500
          `}
          style={{ height: "42px" }}
          aria-label={ariaLabel}
        >
          <Typography variant="body-sm" className="truncate">
            {displayText}
          </Typography>
          <Icon
            name="chevron-down"
            size={16}
            className="ml-2 flex-shrink-0 ui-open:rotate-180 transition-transform"
          />
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-lg shadow-xl max-h-60 overflow-auto focus:outline-none">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    onClick={() => toggleOption(option.value)}
                    className={({ active }) =>
                      `flex items-center px-3 py-2 cursor-pointer transition-colors
                      ${active ? "bg-jade-50 dark:bg-jade-900/20" : ""}
                      ${isSelected ? "bg-jade-100 dark:bg-jade-900/30" : ""}
                      `
                    }
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 mr-2 text-jade-600 focus:ring-2 focus:ring-jade-500 rounded pointer-events-none"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <Typography variant="body-sm">{option.label}</Typography>
                  </Listbox.Option>
                );
              })
            )}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

MultiSelect.displayName = "MultiSelect";
