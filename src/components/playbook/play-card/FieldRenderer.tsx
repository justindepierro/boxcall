/**
 * FieldRenderer - Renders form fields from declarative configs
 *
 * Converts FieldConfig objects into actual React components.
 * Replaces ~400 lines of repetitive render functions.
 */

import React from "react";
import { InlineEditField } from "../../ui/InlineEditField";
import { InlineSelectField } from "../../ui/InlineSelectField";
import type { Play as PlayType } from "../../../types/play";
import type { FieldConfig } from "./fieldConfigs";
import { DIRECTION_RL_OPTIONS } from "./constants";
import { getFormationDirSelectValue } from "../../../utils/leftRight";
import {
  getValidationFn,
  getSuggestions,
  getExistingValues,
} from "./fieldRendererHelpers";

// ============================================================================
// TYPES
// ============================================================================

export type SaveHandler = (
  field: keyof PlayType,
  value: string | number | boolean | null | string[]
) => Promise<void>;

export interface FieldRenderOptions {
  normalizeValue: (value: string) => string;
  directionOptions: Array<{ value: string; label: string }>;
  formationSuggestions: string[];
  personnelSuggestions: string[];
  playNameSuggestions: string[];
  playTypeSuggestions: string[];
  formationTypeValues: string[];
  backfieldAlignmentValues: string[];
  shiftValues: string[];
  motionValues: string[];
  protectionValues: string[];
  wristbandValues: string[];
}

interface FieldRendererProps {
  config: FieldConfig;
  play: PlayType;
  onSave: SaveHandler;
  savingFields: Set<string>;
  options: FieldRenderOptions;
}

// ============================================================================
// FIELD TYPE RENDERERS
// ============================================================================

const renderTextField = (
  config: Extract<FieldConfig, { type: "text" }>,
  play: PlayType,
  onSave: SaveHandler,
  savingFields: Set<string>,
  options: FieldRenderOptions
): React.ReactNode => {
  const fieldValue = play[config.field];
  const value = typeof fieldValue === "string" ? fieldValue : "";

  return (
    <InlineEditField
      value={value}
      onSave={(v) => onSave(config.field, v)}
      placeholder={config.placeholder}
      suggestions={
        config.enableSuggestions
          ? getSuggestions(config.suggestionsKey, options)
          : undefined
      }
      enableSuggestions={config.enableSuggestions}
      normalizeValue={config.normalize ? options.normalizeValue : undefined}
      validation={
        config.validation ? getValidationFn(config.validation) : undefined
      }
      validationType={config.validationType}
      existingValues={getExistingValues(config.existingValuesKey, options)}
      isSaving={savingFields.has(config.field)}
    />
  );
};

const renderSelectField = (
  config: Extract<FieldConfig, { type: "select" }>,
  play: PlayType,
  onSave: SaveHandler,
  savingFields: Set<string>,
  options: FieldRenderOptions
): React.ReactNode => {
  // Special handling for f_dir which uses getFormationDirSelectValue
  const value =
    config.field === "f_dir"
      ? getFormationDirSelectValue(play)
      : (play[config.field] as string) || "";

  const selectOptions =
    config.optionsKey === "direction"
      ? options.directionOptions || DIRECTION_RL_OPTIONS
      : DIRECTION_RL_OPTIONS;

  return (
    <InlineSelectField
      value={value}
      options={selectOptions}
      onSave={(v) => onSave(config.field, v)}
      placeholder={config.placeholder}
      allowEmpty={config.allowEmpty}
      emptyLabel={config.emptyLabel}
      isSaving={savingFields.has(config.field)}
    />
  );
};

const renderCheckboxPairField = (
  config: Extract<FieldConfig, { type: "checkbox-pair" }>,
  play: PlayType,
  onSave: SaveHandler,
  savingFields: Set<string>
): React.ReactNode => {
  const [field1, field2] = config.fields;
  const [label1, label2] = config.labels;

  return (
    <div className="flex items-center gap-sm">
      <label className="flex items-center gap-xs cursor-pointer group">
        <input
          type="checkbox"
          checked={Boolean(play[field1])}
          onChange={(e) => onSave(field1, e.target.checked)}
          disabled={savingFields.has(field1)}
          className="w-4 h-4 text-primary-500 border-border rounded focus:ring-2 focus:ring-primary-500"
        />
        <span className="text-sm group-hover:text-primary-600">{label1}</span>
      </label>
      <label className="flex items-center gap-xs cursor-pointer group">
        <input
          type="checkbox"
          checked={Boolean(play[field2])}
          onChange={(e) => onSave(field2, e.target.checked)}
          disabled={savingFields.has(field2)}
          className="w-4 h-4 text-primary-500 border-border rounded focus:ring-2 focus:ring-primary-500"
        />
        <span className="text-sm group-hover:text-primary-600">{label2}</span>
      </label>
    </div>
  );
};

const renderTagsField = (
  config: Extract<FieldConfig, { type: "tags" }>,
  play: PlayType,
  onSave: SaveHandler,
  savingFields: Set<string>
): React.ReactNode => {
  // Combine values from source fields
  let value: string;
  if (config.sourceFields.length === 1 && config.field === "tags") {
    // Array field like tags
    const arr = play[config.field] as string[] | null;
    value = (arr || []).filter(Boolean).join(", ");
  } else {
    // Multiple fields like ftag1, ftag2
    value = config.sourceFields
      .map((f) => play[f] as string)
      .filter(Boolean)
      .join(", ");
  }

  const isSaving = config.sourceFields.some((f) => savingFields.has(f));

  const handleSave = (newValue: string) => {
    const tags = newValue
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (config.field === "tags") {
      // Array field
      void onSave("tags", tags);
    } else {
      // Split into individual fields (ftag1, ftag2 or p_tag1, p_tag2)
      void onSave(config.sourceFields[0], tags[0] || "");
      if (config.sourceFields[1] && tags[1]) {
        void onSave(config.sourceFields[1], tags[1]);
      }
    }
  };

  return (
    <InlineEditField
      value={value}
      onSave={handleSave}
      placeholder={config.placeholder}
      isSaving={isSaving}
    />
  );
};

const renderBadgeListField = (
  config: Extract<FieldConfig, { type: "badge-list" }>,
  play: PlayType
): React.ReactNode => {
  const items = play[config.field] as string[] | null;
  const hasItems = items && items.length > 0;

  if (!hasItems) {
    return (
      <span className="text-sm text-secondary italic">{config.emptyText}</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, index) => (
        <span key={index} className={config.badgeClassName}>
          {config.field === "key_players" ? `Player ${index + 1}` : item}
        </span>
      ))}
    </div>
  );
};

const renderNumberField = (
  config: Extract<FieldConfig, { type: "number" }>,
  play: PlayType,
  onSave: SaveHandler,
  savingFields: Set<string>
): React.ReactNode => {
  const numValue = play[config.field] as number | null;
  const value =
    numValue !== null && numValue !== undefined ? numValue.toString() : "";

  const handleSave = (newValue: string) => {
    const num = parseInt(newValue, 10);
    const min = config.min ?? -Infinity;
    const max = config.max ?? Infinity;

    if (!isNaN(num) && num >= min && num <= max) {
      void onSave(config.field, num);
    }
  };

  const validation = (v: string) => {
    if (!v.trim()) return null;
    const num = parseInt(v, 10);
    const min = config.min ?? -Infinity;
    const max = config.max ?? Infinity;

    if (isNaN(num) || num < min || num > max) {
      return `Must be ${min}-${max}`;
    }
    return null;
  };

  return (
    <InlineEditField
      value={value}
      onSave={handleSave}
      placeholder={config.placeholder}
      validation={validation}
      isSaving={savingFields.has(config.field)}
    />
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Renders a single field based on its configuration.
 * This component handles all field types defined in fieldConfigs.ts.
 */
export const FieldRenderer: React.FC<FieldRendererProps> = ({
  config,
  play,
  onSave,
  savingFields,
  options,
}) => {
  switch (config.type) {
    case "text":
      return renderTextField(config, play, onSave, savingFields, options);
    case "select":
      return renderSelectField(config, play, onSave, savingFields, options);
    case "checkbox-pair":
      return renderCheckboxPairField(config, play, onSave, savingFields);
    case "tags":
      return renderTagsField(config, play, onSave, savingFields);
    case "badge-list":
      return renderBadgeListField(config, play);
    case "number":
      return renderNumberField(config, play, onSave, savingFields);
    default:
      return null;
  }
};

// ============================================================================
// FIELD ROW COMPONENT (Label + Field)
// ============================================================================

interface FieldRowProps {
  config: FieldConfig;
  play: PlayType;
  onSave: SaveHandler;
  savingFields: Set<string>;
  options: FieldRenderOptions;
  className?: string;
}

/**
 * Renders a complete field row with label and input.
 */
export const FieldRow: React.FC<FieldRowProps> = ({
  config,
  play,
  onSave,
  savingFields,
  options,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-xs ${className}`}>
      <label className="text-sm font-medium text-secondary">
        {config.label}
      </label>
      <FieldRenderer
        config={config}
        play={play}
        onSave={onSave}
        savingFields={savingFields}
        options={options}
      />
    </div>
  );
};
