import React from "react";
import { Button } from "../Button";

export interface SegmentOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel = "Segmented control",
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex items-center p-0.5 border rounded-[12px] bg-[var(--semantic-bg-secondary)] border-[var(--semantic-border)] ${className}`}
      style={{
        boxShadow: "var(--panel-shadow)",
      }}
    >
      {options.map((opt) => {
        const selected = opt.id === value;
        return (
          <Button
            key={opt.id}
            aria-selected={selected}
            onClick={() => onChange(opt.id)}
            size="xs"
            variant={selected ? "subtle" : "ghost"}
            className={`inline-flex items-center gap-2 px-3 h-8 rounded-[10px] text-sm ${
              selected ? "surface-card" : ""
            }`}
          >
            {opt.icon ? <span className="w-4 h-4">{opt.icon}</span> : null}
            <span>{opt.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
