import React, { useId } from "react";
import { Icon } from "./Icon";

export type SortOption = {
  id: string;
  label: string;
};

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (optionId: string) => void;
  className?: string;
  label?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  value,
  onChange,
  className = "",
  label = "Sort by",
}) => {
  const selectId = useId();

  return (
    <div className={`relative inline-block ${className}`}>
      <label
        htmlFor={selectId}
        className="mb-2 block text-sm text-secondary sm:mb-0 sm:inline sm:mr-2"
      >
        <span className="sr-only sm:not-sr-only">{label}:</span>
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          appearance-none
          bg-primary
          border border-border
          rounded-lg
          px-4 py-2 pr-10
          text-sm text-primary
          cursor-pointer
          hover:border-primary
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          transition-colors
        "
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <Icon name="chevron-down" className="h-4 w-4 text-muted" />
      </div>
    </div>
  );
};
