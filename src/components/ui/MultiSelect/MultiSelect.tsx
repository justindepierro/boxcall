/**
 * MultiSelect Component
 *
 * Accessible multi-select dropdown for filtering
 * - Custom implementation replacing native <select multiple>
 * - Keyboard navigation support
 * - ARIA attributes for accessibility
 * - Click-outside to close
 * - Visual checkbox selection
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

import React, { useState, useRef, useEffect } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleKeyDown = (event: React.KeyboardEvent, value: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleOption(value);
    }
  };

  const displayText =
    selected.length === 0 ? placeholder : selectedLabel(selected.length);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 
          text-sm w-full sm:w-auto sm:min-w-44 
          flex items-center justify-between
          transition-colors
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          }
          ${isOpen ? "border-primary-500" : "border-gray-300 dark:border-gray-600"}
        `}
        style={{ height: "42px" }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <Typography variant="body-sm" className="truncate">
          {displayText}
        </Typography>
        <Icon
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          className="ml-2 flex-shrink-0"
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full bg-surface-primary rounded-lg shadow-xl max-h-60 overflow-auto"
          role="listbox"
          aria-multiselectable="true"
          aria-label={ariaLabel || "Select options"}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted">
              No options available
            </div>
          ) : (
            options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onClick={() => toggleOption(option.value)}
                  onKeyDown={(e) => handleKeyDown(e, option.value)}
                  className="flex items-center px-3 py-2 hover:bg-surface-muted cursor-pointer transition-colors focus:outline-none focus:bg-surface-muted"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by parent div
                    className="w-4 h-4 mr-2 text-primary-600 focus:ring-2 focus:ring-primary-500 rounded pointer-events-none"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  <Typography variant="body-sm">{option.label}</Typography>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

MultiSelect.displayName = "MultiSelect";
