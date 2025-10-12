import React from "react";

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
      className={`w-11 h-11 rounded-full bg-white dark:bg-slate-900 border-2 dark:border-slate-600 shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      onClick={handleClick}
      aria-label={label}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleChange}
        disabled={disabled}
        className="w-5 h-5 rounded-lg border-0 text-brand-primary focus:ring-2 focus:ring-brand-primary/30 cursor-pointer disabled:cursor-not-allowed"
        aria-label={label}
      />
    </label>
  );
};
