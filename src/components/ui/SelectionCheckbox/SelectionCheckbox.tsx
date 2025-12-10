import React from "react";
import { cn } from "../../../lib/utils/cn";

export interface SelectionCheckboxProps {
  isSelected: boolean;
  onChange: (selected: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * SelectionCheckbox - A floating checkbox for bulk selection
 *
 * Features:
 * - Circular container with shadow
 * - Hover scale animation
 * - Prevents event bubbling (stopPropagation)
 * - Accessible with proper labels
 * - Focus ring styling
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <SelectionCheckbox
 *   isSelected={isSelected}
 *   onChange={(selected) => onSelectionChange(id, selected)}
 *   label="Select this item"
 * />
 * ```
 */
export const SelectionCheckbox: React.FC<SelectionCheckboxProps> = ({
  isSelected,
  onChange,
  label,
  className = "",
  disabled = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <label
      className={cn(
        "relative w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200",
        isSelected
          ? "bg-primary-default border-primary-default text-white shadow-[0_4px_12px_rgba(34,197,94,0.4)]"
          : "bg-white dark:bg-secondary border-secondary hover:border-accent shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
        disabled && "opacity-50 cursor-not-allowed",
        // Hover effects
        !disabled &&
          !isSelected &&
          "hover:scale-110 hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)]",
        !disabled &&
          isSelected &&
          "hover:scale-110 text-success-text ring-success-border",
        className
      )}
      onClick={handleClick}
      aria-label={label}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleChange}
        disabled={disabled}
        className="w-5 h-5 rounded-lg border-0 text-success-text focus:ring-2 focus:ring-success-border/30 cursor-pointer disabled:cursor-not-allowed"
        aria-label={label}
      />
    </label>
  );
};
