/**
 * Field Definitions - Legacy API with Declarative Implementation
 *
 * This file provides the same API as the original fieldDefinitions.tsx
 * but uses the new declarative config system under the hood.
 *
 * Original: 535 lines of verbose render functions
 * New: ~100 lines using FieldRenderer + configs
 *
 * @see fieldConfigs.ts - Declarative field configurations
 * @see FieldRenderer.tsx - Generic field rendering component
 */

import React from "react";
import type { Play as PlayType } from "../../../types/play";
import {
  FORMATION_FIELD_CONFIGS,
  PLAY_DETAILS_FIELD_CONFIGS,
} from "./fieldConfigs";
import {
  FieldRenderer,
  type SaveHandler,
  type FieldRenderOptions,
} from "./FieldRenderer";
import { DIRECTION_RL_OPTIONS } from "./constants";

// ============================================================================
// LEGACY TYPE DEFINITIONS (Preserved for API compatibility)
// ============================================================================

type FieldRendererFn = (
  optimisticPlay: PlayType,
  handleInlineSave: SaveHandler,
  savingFields: Set<string>
) => React.ReactNode;

export interface FieldDefinition {
  label: string;
  render: FieldRendererFn;
}

export type FieldDefinitionMap = Record<string, FieldDefinition>;

// ============================================================================
// FACTORY OPTIONS INTERFACES (Preserved for API compatibility)
// ============================================================================

interface FormationFieldFactoryOptions {
  normalizeValue: (value: string) => string;
  formationSuggestions: string[];
  personnelSuggestions: string[];
  directionOptions: Array<{ value: string; label: string }>;
  formationTypeValues?: string[];
  backfieldAlignmentValues?: string[];
  shiftValues?: string[];
  motionValues?: string[];
  protectionValues?: string[];
}

interface PlayDetailsFieldFactoryOptions {
  normalizeValue: (value: string) => string;
  playNameSuggestions: string[];
  playTypeSuggestions: string[];
  directionOptions: Array<{ value: string; label: string }>;
  protectionValues?: string[];
  wristbandValues?: string[];
}

// ============================================================================
// FACTORY FUNCTIONS (Same API as before, declarative implementation)
// ============================================================================

/**
 * Creates formation field definitions.
 * Same API as the original, but uses declarative configs internally.
 */
export const createFormationFields = ({
  normalizeValue,
  formationSuggestions,
  personnelSuggestions,
  directionOptions,
  formationTypeValues = [],
  backfieldAlignmentValues = [],
  shiftValues = [],
  motionValues = [],
  protectionValues = [],
}: FormationFieldFactoryOptions): FieldDefinitionMap => {
  const options: FieldRenderOptions = {
    normalizeValue,
    directionOptions,
    formationSuggestions,
    personnelSuggestions,
    playNameSuggestions: [],
    playTypeSuggestions: [],
    formationTypeValues,
    backfieldAlignmentValues,
    shiftValues,
    motionValues,
    protectionValues,
    wristbandValues: [],
  };

  const map: FieldDefinitionMap = {};

  // Helper to determine field key from config
  const getFieldKey = (config: typeof FORMATION_FIELD_CONFIGS[number]): string => {
    if (config.type === "checkbox-pair") return "back_position";
    if (config.type === "tags" && config.sourceFields.includes("ftag1")) return "ftags";
    return String(config.field);
  };

  for (const config of FORMATION_FIELD_CONFIGS) {
    const fieldKey = getFieldKey(config);

    map[fieldKey] = {
      label: config.label,
      render: (play, onSave, savingFields) => (
        <FieldRenderer
          config={config}
          play={play}
          onSave={onSave}
          savingFields={savingFields}
          options={options}
        />
      ),
    };
  }

  return map;
};

/**
 * Creates play details field definitions.
 * Same API as the original, but uses declarative configs internally.
 */
export const createPlayDetailsFields = ({
  normalizeValue,
  playNameSuggestions,
  playTypeSuggestions,
  directionOptions,
  protectionValues = [],
  wristbandValues = [],
}: PlayDetailsFieldFactoryOptions): FieldDefinitionMap => {
  const options: FieldRenderOptions = {
    normalizeValue,
    directionOptions: directionOptions || DIRECTION_RL_OPTIONS,
    formationSuggestions: [],
    personnelSuggestions: [],
    playNameSuggestions,
    playTypeSuggestions,
    formationTypeValues: [],
    backfieldAlignmentValues: [],
    shiftValues: [],
    motionValues: [],
    protectionValues,
    wristbandValues,
  };

  const map: FieldDefinitionMap = {};

  for (const config of PLAY_DETAILS_FIELD_CONFIGS) {
    const fieldKey =
      config.type === "tags" && config.sourceFields.includes("p_tag1")
        ? "ptags"
        : String(config.field);

    map[fieldKey] = {
      label: config.label,
      render: (play, onSave, savingFields) => (
        <FieldRenderer
          config={config}
          play={play}
          onSave={onSave}
          savingFields={savingFields}
          options={options}
        />
      ),
    };
  }

  return map;
};

// Re-export types for consumers
export type { SaveHandler, FieldRenderOptions };
