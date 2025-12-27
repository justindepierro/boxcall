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
          ${compact ? "h-11 w-11 p-0 justify-center" : "px-3 py-2"}
          rounded-xl
          bg-surface-elevated hover:bg-surface-hover
          border border-muted
          transition-colors
        `}
        aria-label="Sort plays"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Icon
          name="list"
          className={`h-4 w-4 ${value !== "name_asc" ? "text-brand-jade" : "text-secondary"}`}
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
            bg-surface-elevated
            border border-muted
            rounded-xl
            shadow-lg shadow-black/10
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
                    ? "bg-brand-jade/10 text-brand-jade"
                    : "text-primary hover:bg-surface-hover"
                }
              `}
              role="option"
              aria-selected={value === option.value}
            >
              {value === option.value && (
                <Icon name="check" className="h-4 w-4 text-brand-jade" />
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
