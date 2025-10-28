import React from "react";

export type FieldContext = "midfield" | "redzone" | "goalline" | "backed_up";

interface FieldSettingsPanelProps {
  value: FieldContext;
  onChange: (value: FieldContext) => void;
}

export const FieldSettingsPanel: React.FC<FieldSettingsPanelProps> = ({
  value,
  onChange,
}) => (
  <div className="bg-surface-muted border-divider rounded-lg p-spacing-md mb-spacing-md">
    <div className="font-semibold text-primary mb-spacing-xs">
      Field Settings
    </div>
    <div className="flex flex-col gap-spacing-xs">
      <label className="flex items-center gap-spacing-xs cursor-pointer">
        <input
          type="radio"
          name="field-context"
          value="midfield"
          checked={value === "midfield"}
          onChange={() => onChange("midfield")}
          className="accent-jade-600"
        />
        Midfield
      </label>
      <label className="flex items-center gap-spacing-xs cursor-pointer">
        <input
          type="radio"
          name="field-context"
          value="redzone"
          checked={value === "redzone"}
          onChange={() => onChange("redzone")}
          className="accent-jade-600"
        />
        Redzone
      </label>
      <label className="flex items-center gap-spacing-xs cursor-pointer">
        <input
          type="radio"
          name="field-context"
          value="goalline"
          checked={value === "goalline"}
          onChange={() => onChange("goalline")}
          className="accent-jade-600"
        />
        Goalline
      </label>
      <label className="flex items-center gap-spacing-xs cursor-pointer">
        <input
          type="radio"
          name="field-context"
          value="backed_up"
          checked={value === "backed_up"}
          onChange={() => onChange("backed_up")}
          className="accent-jade-600"
        />
        Backed Up
      </label>
    </div>
  </div>
);
