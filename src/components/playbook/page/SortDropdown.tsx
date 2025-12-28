/**
 * SortDropdown - Play sorting control
 *
 * Compact dropdown for selecting play sort order.
 * Used in both mobile and desktop playbook headers.
 */

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
          hover:bg-neutral-50 dark:hover:bg-navy-700
          border border-neutral-200/60 dark:border-navy-600
          shadow-sm hover:shadow-md transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary/20
        `}
        aria-label="Sort plays"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Icon
          name="list"
          className={`h-4 w-4 ${value !== "name_asc" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`}
        />
        {!compact && (
          <>
            <Typography variant="body-sm" className="font-medium text-neutral-700 dark:text-neutral-200">
              {currentLabel}
            </Typography>
            <Icon
              name="chevron-down"
              className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="
              absolute right-0 top-full mt-2 z-50
              w-56 rounded-xl
              bg-white dark:bg-navy-800
              border border-neutral-100 dark:border-navy-600
              shadow-xl shadow-neutral-200/50 dark:shadow-black/40
              overflow-hidden
              py-1.5
            "
          >
            <div className="px-3 py-2 border-b border-neutral-100 dark:border-navy-700 mb-1">
              <Typography variant="label-md" className="text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-xs">
                Sort By
              </Typography>
            </div>
            
            <div className="max-h-72 overflow-y-auto custom-scrollbar">
              {SORT_OPTIONS.map((option) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full text-left px-3 py-2.5 mx-1 rounded-lg
                      flex items-center justify-between
                      transition-colors duration-150
                      ${
                        isSelected
                          ? "bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary-400"
                          : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-navy-700"
                      }
                    `}
                  >
                    <span className={`text-sm ${isSelected ? "font-semibold" : "font-medium"}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <Icon name="check" className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SortDropdown;
