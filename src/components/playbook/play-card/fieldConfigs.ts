/**
 * Declarative Field Configuration System
 *
 * Reduces 535 lines of verbose render functions to ~100 lines of configs.
 * Each field is defined by its type and props, not by JSX code.
 */

import type { Play as PlayType } from "../../../types/play";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type FieldType =
  | "text" // InlineEditField with string value
  | "select" // InlineSelectField
  | "checkbox-pair" // Two checkboxes (back_position)
  | "tags" // Comma-separated array (tags, ftags, ptags)
  | "badge-list" // Read-only badge display (key_positions, key_players)
  | "number"; // InlineEditField with numeric validation

interface BaseFieldConfig {
  type: FieldType;
  label: string;
  field: keyof PlayType;
  placeholder?: string;
}

interface TextFieldConfig extends BaseFieldConfig {
  type: "text";
  /** Use suggestions from factory options (e.g., "formation", "playName") */
  suggestionsKey?: "formation" | "personnel" | "playName" | "playType";
  /** Static suggestions to merge */
  staticSuggestions?: string[];
  /** Validation type for InlineEditField */
  validationType?:
    | "formationType"
    | "backfieldAlignment"
    | "shift"
    | "motion"
    | "protection"
    | "wristbandNumber";
  /** Key in factory options for existing values (validation) */
  existingValuesKey?:
    | "formationTypeValues"
    | "backfieldAlignmentValues"
    | "shiftValues"
    | "motionValues"
    | "protectionValues"
    | "wristbandValues";
  /** Custom validation function name */
  validation?: "formation" | "personnel" | "playName" | "confidence";
  /** Whether to enable suggestion mode */
  enableSuggestions?: boolean;
  /** Whether to normalize value */
  normalize?: boolean;
}

interface SelectFieldConfig extends BaseFieldConfig {
  type: "select";
  /** Key in factory options for options array */
  optionsKey: "direction";
  allowEmpty?: boolean;
  emptyLabel?: string;
}

interface CheckboxPairConfig extends BaseFieldConfig {
  type: "checkbox-pair";
  fields: [keyof PlayType, keyof PlayType];
  labels: [string, string];
}

interface TagsFieldConfig extends BaseFieldConfig {
  type: "tags";
  /** Source fields to combine (e.g., ["ftag1", "ftag2"]) */
  sourceFields: Array<keyof PlayType>;
}

interface BadgeListConfig extends BaseFieldConfig {
  type: "badge-list";
  emptyText: string;
  badgeClassName: string;
}

interface NumberFieldConfig extends BaseFieldConfig {
  type: "number";
  min?: number;
  max?: number;
}

export type FieldConfig =
  | TextFieldConfig
  | SelectFieldConfig
  | CheckboxPairConfig
  | TagsFieldConfig
  | BadgeListConfig
  | NumberFieldConfig;

// ============================================================================
// FORMATION FIELD CONFIGS (Base, Personnel, Type, Direction, etc.)
// ============================================================================

export const FORMATION_FIELD_CONFIGS: FieldConfig[] = [
  // Basic Formation Fields
  {
    type: "text",
    field: "formation",
    label: "Base",
    placeholder: "Enter formation (e.g., Trips, Shotgun)",
    suggestionsKey: "formation",
    enableSuggestions: true,
    normalize: true,
    validation: "formation",
  },
  {
    type: "text",
    field: "personnel",
    label: "Personnel",
    placeholder: "Personnel grouping",
    suggestionsKey: "personnel",
    enableSuggestions: true,
    normalize: true,
    validation: "personnel",
  },
  {
    type: "text",
    field: "f_type",
    label: "Type",
    placeholder: "Formation type",
    normalize: true,
    validationType: "formationType",
    existingValuesKey: "formationTypeValues",
  },
  {
    type: "select",
    field: "f_dir",
    label: "Direction",
    placeholder: "Direction",
    optionsKey: "direction",
    allowEmpty: true,
    emptyLabel: "None",
  },

  // Backfield Fields
  {
    type: "text",
    field: "back_align",
    label: "Back Align",
    placeholder: "e.g., Near, Far, Flip, Same, 1, 2",
    validationType: "backfieldAlignment",
    existingValuesKey: "backfieldAlignmentValues",
  },
  {
    type: "checkbox-pair",
    field: "back_position" as keyof PlayType, // Virtual field
    label: "Back Position",
    fields: ["back_left_of_qb", "back_right_of_qb"],
    labels: ["← Left of QB", "Right of QB →"],
  },
  {
    type: "text",
    field: "shift",
    label: "Shift",
    placeholder: "Pre-snap shift",
    validationType: "shift",
    existingValuesKey: "shiftValues",
  },
  {
    type: "text",
    field: "motion",
    label: "Motion",
    placeholder: "Pre-snap motion",
    validationType: "motion",
    existingValuesKey: "motionValues",
  },

  // Additional Formation Fields
  {
    type: "tags",
    field: "ftag1", // Primary field for saving state
    label: "Formation Tags",
    placeholder: "Formation tags",
    sourceFields: ["ftag1", "ftag2"],
  },
  {
    type: "select",
    field: "r_str",
    label: "Run Strength",
    placeholder: "Run strength",
    optionsKey: "direction",
    allowEmpty: true,
    emptyLabel: "None",
  },
  {
    type: "select",
    field: "p_str",
    label: "Pass Strength",
    placeholder: "Pass strength",
    optionsKey: "direction",
    allowEmpty: true,
    emptyLabel: "None",
  },
];

// ============================================================================
// PLAY DETAILS FIELD CONFIGS (Name, Type, Protection, Tags, etc.)
// ============================================================================

export const PLAY_DETAILS_FIELD_CONFIGS: FieldConfig[] = [
  // Basic Play Fields
  {
    type: "text",
    field: "play_name",
    label: "Name",
    placeholder: "Play name",
    suggestionsKey: "playName",
    enableSuggestions: true,
    normalize: true,
    validation: "playName",
  },
  {
    type: "select",
    field: "p_dir",
    label: "Direction",
    placeholder: "Pass direction",
    optionsKey: "direction",
    allowEmpty: true,
    emptyLabel: "None",
  },
  {
    type: "text",
    field: "p_type",
    label: "Type",
    placeholder: "Play type (e.g., Pass, Run, RPO)",
    suggestionsKey: "playType",
    enableSuggestions: true,
    normalize: true,
  },
  {
    type: "text",
    field: "protection",
    label: "Protection",
    placeholder: "Pass protection scheme",
    validationType: "protection",
    existingValuesKey: "protectionValues",
  },
  {
    type: "text",
    field: "check_into",
    label: "Check Into",
    placeholder: "Audible/check play",
  },

  // Play Metadata
  {
    type: "tags",
    field: "p_tag1", // Primary field for saving state
    label: "Play Tags",
    placeholder: "Play tags",
    sourceFields: ["p_tag1", "p_tag2"],
  },
  {
    type: "tags",
    field: "tags",
    label: "Variations",
    placeholder: "e.g., Bubble, Read, Screen",
    sourceFields: ["tags"],
  },
  {
    type: "badge-list",
    field: "key_positions",
    label: "Key Positions",
    emptyText: "No key positions",
    badgeClassName:
      "inline-flex items-center px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200",
  },
  {
    type: "badge-list",
    field: "key_players",
    label: "Key Players",
    emptyText: "No key players",
    badgeClassName:
      "inline-flex items-center px-2 py-1 text-xs rounded-full bg-success/20/10 text-success border border-success",
  },
  {
    type: "text",
    field: "one_word_play",
    label: "Code",
    placeholder: "One-word call",
  },
  {
    type: "text",
    field: "wristband_number",
    label: "Wristband #",
    placeholder: "Wristband number",
    validationType: "wristbandNumber",
    existingValuesKey: "wristbandValues",
  },
  {
    type: "number",
    field: "confidence_base",
    label: "Confidence",
    placeholder: "0-100",
    min: 0,
    max: 100,
  },
];

// ============================================================================
// FIELD CONFIG LOOKUP MAPS (for efficient access by field key)
// ============================================================================

export const FORMATION_FIELDS_BY_KEY = new Map(
  FORMATION_FIELD_CONFIGS.map((config) => [config.field, config])
);

export const PLAY_DETAILS_FIELDS_BY_KEY = new Map(
  PLAY_DETAILS_FIELD_CONFIGS.map((config) => [config.field, config])
);
