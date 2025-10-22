import React from "react";
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
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <label className="text-sm text-text-secondary mr-2">Sort by:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          appearance-none
          bg-surface-primary
          border border-border
          rounded-lg
          px-4 py-2 pr-10
          text-sm text-text-primary
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
        <Icon name="chevron-down" className="h-4 w-4 text-text-muted" />
      </div>
    </div>
  );
};
