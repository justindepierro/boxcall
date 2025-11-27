import React from "react";
import { Icon } from "./Icon";

interface FilterChip {
  id: string;
  label: string;
  active: boolean;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onToggle: (chipId: string) => void;
  className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  onToggle,
  className = "",
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {chips.map((chip) => (
        <button
          key={chip.id}
          onClick={() => onToggle(chip.id)}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
            transition-all duration-200
            ${
              chip.active
                ? "bg-primary text-white shadow-sm"
                : "bg-muted text-secondary hover:bg-secondary"
            }
          `}
          type="button"
        >
          {chip.active && <Icon name="check" className="h-3.5 w-3.5" />}
          {chip.label}
        </button>
      ))}
    </div>
  );
};
