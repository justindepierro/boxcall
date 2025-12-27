/**
 * SortDropdown - Play sorting control
 *
 * Compact dropdown for selecting play sort order.
 * Used in both mobile and desktop playbook headers.
 */

import React, { useState, useRef, useEffect } from "react";
import { Icon } from "../../ui/Icon";
import { Typography } from "../../design-system/Typography";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { SORT_OPTIONS, type PlaySortOption } from "../../../types/filters";

export interface SortDropdownProps {
  value: PlaySortOption;
  onChange: (value: PlaySortOption) => void;
  className?: string;
  /** Compact mode for mobile - shows only icon */
  compact?: boolean;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  className = "",
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
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

  const currentLabel =
    SORT_OPTIONS.find((opt) => opt.value === value)?.label || "Sort";

  const handleSelect = (option: PlaySortOption) => {
    triggerHapticFeedback("light");
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => {
          triggerHapticFeedback("light");
          setIsOpen(!isOpen);
        }}
        className={`
          flex items-center gap-2 
          ${compact ? "h-9 w-9 p-0 justify-center" : "px-3 py-2"}
          rounded-lg
          bg-white dark:bg-navy-800 
          hover:bg-neutral-100 dark:hover:bg-navy-700
          border border-neutral-200 dark:border-navy-600
          transition-colors
        `}
        aria-label="Sort plays"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Icon
          name="list"
          className={`h-4 w-4 ${value !== "name_asc" ? "text-jade-600 dark:text-jade-400" : "text-neutral-500 dark:text-neutral-400"}`}
        />
        {!compact && (
          <>
            <Typography variant="body-sm" className="text-primary">
              {currentLabel}
            </Typography>
            <Icon
              name="chevron-down"
              className={`h-4 w-4 text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute right-0 top-full mt-2 z-50
            min-w-48 py-2
            bg-white dark:bg-navy-800
            border border-neutral-200 dark:border-navy-600
            rounded-xl
            shadow-xl
          "
          role="listbox"
          aria-label="Sort options"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5
                text-left transition-colors
                ${
                  value === option.value
                    ? "bg-jade-100 dark:bg-jade-900/30 text-jade-700 dark:text-jade-400"
                    : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-navy-700"
                }
              `}
              role="option"
              aria-selected={value === option.value}
            >
              {value === option.value && (
                <Icon
                  name="check"
                  className="h-4 w-4 text-jade-600 dark:text-jade-400"
                />
              )}
              <Typography
                variant="body-sm"
                className={value === option.value ? "font-medium" : ""}
              >
                {option.label}
              </Typography>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
