import React from "react";
import { InlineEditField } from "../../ui/InlineEditField";
import { InlineSelectField } from "../../ui/InlineSelectField";
import type { Play as PlayType } from "../../../types/play";
import {
  DIRECTION_RL_OPTIONS,
  FORMATION_OPTIONS,
  PLAY_TYPE_OPTIONS,
} from "./constants";
import {
  validateFormationName,
  validatePersonnelValue,
} from "../../../utils/playFieldValidation";

type SaveHandler = (
  field: keyof PlayType,
  value: string | number | boolean
) => Promise<void>;

type FieldRenderer = (
  optimisticPlay: PlayType,
  handleInlineSave: SaveHandler,
  savingFields: Set<string>
) => React.ReactNode;

export interface FieldDefinition {
  label: string;
  render: FieldRenderer;
}

export type FieldDefinitionMap = Record<string, FieldDefinition>;

interface FormationFieldFactoryOptions {
  normalizeValue: (value: string) => string;
  formationSuggestions: string[];
  personnelSuggestions: string[];
  directionOptions: Array<{ value: string; label: string }>;
  // NEW: For validation
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
  // NEW: For validation
  protectionValues?: string[];
  wristbandValues?: string[];
}

export const createFormationFields = ({
  normalizeValue,
  formationSuggestions,
  personnelSuggestions,
  directionOptions,
  formationTypeValues = [],
  backfieldAlignmentValues = [],
  shiftValues = [],
  motionValues = [],
  _protectionValues = [],
}: FormationFieldFactoryOptions): FieldDefinitionMap => ({
  formation: {
    label: "Base",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={optimisticPlay.formation}
        onSave={(value) => handleInlineSave("formation", value)}
        placeholder="Enter formation (e.g., Trips, Shotgun)"
        suggestions={[
          ...FORMATION_OPTIONS.map((option) => option.label),
          ...formationSuggestions,
        ]}
        enableSuggestions={true}
        normalizeValue={normalizeValue}
        validation={(value) => {
          const result = validateFormationName(value);
          return result.isValid ? null : result.error || "Invalid formation";
        }}
        isSaving={savingFields.has("formation")}
      />
    ),
  },
  personnel: {
    label: "Personnel",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={optimisticPlay.personnel || ""}
        onSave={(value) => handleInlineSave("personnel", value)}
        placeholder="Personnel grouping"
        suggestions={personnelSuggestions}
        enableSuggestions={true}
        normalizeValue={normalizeValue}
        validation={(value) => {
          const result = validatePersonnelValue(value);
          return result.isValid ? null : result.error || "Invalid personnel";
        }}
        isSaving={savingFields.has("personnel")}
      />
    ),
  },
  f_type: {
    label: "Type",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={optimisticPlay.f_type || ""}
        onSave={(value) => handleInlineSave("f_type", value)}
        placeholder="Formation type"
        normalizeValue={normalizeValue}
        validationType="formationType"
        existingValues={formationTypeValues}
        isSaving={savingFields.has("f_type")}
      />
    ),
  },
  f_dir: {
    label: "Direction",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineSelectField
        value={optimisticPlay.f_dir || ""}
        options={directionOptions}
        onSave={(value) => handleInlineSave("f_dir", value)}
        placeholder="Direction"
        allowEmpty={true}
        emptyLabel="None"
        isSaving={savingFields.has("f_dir")}
      />
    ),
  },
  back_align: {
    label: "Back Align",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={optimisticPlay.back_align || ""}
        onSave={(value) => handleInlineSave("back_align", value)}
        placeholder="e.g., Near, Far, Flip, Same, 1, 2"
        validationType="backfieldAlignment"
        existingValues={backfieldAlignmentValues}
        isSaving={savingFields.has("back_align")}
      />
    ),
  },
  back_position: {
    label: "Back Position",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <div className="flex items-center gap-sm">
        <label className="flex items-center gap-xs cursor-pointer group">
          <input
            type="checkbox"
            checked={optimisticPlay.back_left_of_qb || false}
            onChange={(e) =>
              handleInlineSave("back_left_of_qb", e.target.checked)
            }
            disabled={savingFields.has("back_left_of_qb")}
            className="w-4 h-4 text-primary-500 border-border rounded focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm group-hover:text-primary-600">
            ← Left of QB
          </span>
        </label>
        <label className="flex items-center gap-xs cursor-pointer group">
          <input
            type="checkbox"
            checked={optimisticPlay.back_right_of_qb || false}
            onChange={(e) =>
              handleInlineSave("back_right_of_qb", e.target.checked)
            }
            disabled={savingFields.has("back_right_of_qb")}
            className="w-4 h-4 text-primary-500 border-border rounded focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm group-hover:text-primary-600">
            Right of QB →
          </span>
        </label>
      </div>
    ),
  },
  shift: {
    label: "Shift",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={optimisticPlay.shift || ""}
        onSave={(value) => handleInlineSave("shift", value)}
        placeholder="Pre-snap shift"
        validationType="shift"
        existingValues={shiftValues}
        isSaving={savingFields.has("shift")}
      />
    ),
  },
  motion: {
    label: "Motion",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={optimisticPlay.motion || ""}
        onSave={(value) => handleInlineSave("motion", value)}
        placeholder="Pre-snap motion"
        validationType="motion"
        existingValues={motionValues}
        isSaving={savingFields.has("motion")}
      />
    ),
  },
  ftags: {
    label: "Tags",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={[optimisticPlay.ftag1, optimisticPlay.ftag2]
          .filter(Boolean)
          .join(", ")}
        onSave={(value) => {
          const tags = value
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          void handleInlineSave("ftag1", tags[0] || "");
          if (tags[1]) void handleInlineSave("ftag2", tags[1]);
        }}
        placeholder="Formation tags"
        isSaving={savingFields.has("ftag1") || savingFields.has("ftag2")}
      />
    ),
  },
  r_str: {
    label: "Run Strength",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineSelectField
        value={optimisticPlay.r_str || ""}
        options={DIRECTION_RL_OPTIONS}
        onSave={(value) => handleInlineSave("r_str", value)}
        placeholder="Run strength"
        allowEmpty={true}
        emptyLabel="None"
        isSaving={savingFields.has("r_str")}
      />
    ),
  },
  p_str: {
    label: "Pass Strength",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineSelectField
        value={optimisticPlay.p_str || ""}
        options={DIRECTION_RL_OPTIONS}
        onSave={(value) => handleInlineSave("p_str", value)}
        placeholder="Pass strength"
        allowEmpty={true}
        emptyLabel="None"
        isSaving={savingFields.has("p_str")}
      />
    ),
  },
});

export const createPlayDetailsFields = ({
  normalizeValue,
  playNameSuggestions,
  playTypeSuggestions,
  directionOptions,
  protectionValues = [],
  wristbandValues = [],
}: PlayDetailsFieldFactoryOptions): FieldDefinitionMap => ({
  play_name: {
    label: "Name",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={optimisticPlay.play_name}
        onSave={(value) => handleInlineSave("play_name", value)}
        placeholder="Play name"
        suggestions={playNameSuggestions}
        enableSuggestions={true}
        normalizeValue={normalizeValue}
        validation={(value) => {
          if (!value.trim()) return "Play name is required";
          return null;
        }}
        isSaving={savingFields.has("play_name")}
      />
    ),
  },
  p_dir: {
    label: "Direction",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineSelectField
        value={optimisticPlay.p_dir || ""}
        options={directionOptions}
        onSave={(value) => handleInlineSave("p_dir", value)}
        placeholder="Pass direction"
        allowEmpty={true}
        emptyLabel="None"
        isSaving={savingFields.has("p_dir")}
      />
    ),
  },
  p_type: {
    label: "Type",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={optimisticPlay.p_type}
        onSave={(value) => handleInlineSave("p_type", value)}
        placeholder="Play type (e.g., Pass, Run, RPO)"
        suggestions={[
          ...PLAY_TYPE_OPTIONS.map((option) => option.label),
          ...playTypeSuggestions,
        ]}
        enableSuggestions={true}
        normalizeValue={normalizeValue}
        isSaving={savingFields.has("p_type")}
      />
    ),
  },
  protection: {
    label: "Protection",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={optimisticPlay.protection || ""}
        onSave={(value) => handleInlineSave("protection", value)}
        placeholder="Pass protection scheme"
        validationType="protection"
        existingValues={protectionValues}
        isSaving={savingFields.has("protection")}
      />
    ),
  },
  check_into: {
    label: "Check Into",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={optimisticPlay.check_into || ""}
        onSave={(value) => handleInlineSave("check_into", value)}
        placeholder="Audible/check play"
        isSaving={savingFields.has("check_into")}
      />
    ),
  },
  ptags: {
    label: "Tags",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={[optimisticPlay.p_tag1, optimisticPlay.p_tag2]
          .filter(Boolean)
          .join(", ")}
        onSave={(value) => {
          const tags = value
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          void handleInlineSave("p_tag1", tags[0] || "");
          if (tags[1]) void handleInlineSave("p_tag2", tags[1]);
        }}
        placeholder="Play tags"
        isSaving={savingFields.has("p_tag1") || savingFields.has("p_tag2")}
      />
    ),
  },
  tags: {
    label: "Variations",
    render: (optimisticPlay, _handleInlineSave, _savingFields) => (
      <div className="flex flex-wrap gap-1">
        {optimisticPlay.tags && optimisticPlay.tags.length > 0 ? (
          optimisticPlay.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-sm text-secondary italic">No variations</span>
        )}
      </div>
    ),
  },
  key_positions: {
    label: "Key Positions",
    render: (optimisticPlay, _handleInlineSave, _savingFields) => (
      <div className="flex flex-wrap gap-1">
        {optimisticPlay.key_positions &&
        optimisticPlay.key_positions.length > 0 ? (
          optimisticPlay.key_positions.map((position, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200"
            >
              {position}
            </span>
          ))
        ) : (
          <span className="text-sm text-secondary italic">
            No key positions
          </span>
        )}
      </div>
    ),
  },
  key_players: {
    label: "Key Players",
    render: (optimisticPlay, _handleInlineSave, _savingFields) => (
      <div className="flex flex-wrap gap-1">
        {optimisticPlay.key_players && optimisticPlay.key_players.length > 0 ? (
          optimisticPlay.key_players.map((_playerId, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-success/20/10 text-success border border-success"
            >
              Player {index + 1}
            </span>
          ))
        ) : (
          <span className="text-sm text-secondary italic">No key players</span>
        )}
      </div>
    ),
  },
  one_word_play: {
    label: "Code",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={optimisticPlay.one_word_play || ""}
        onSave={(value) => handleInlineSave("one_word_play", value)}
        placeholder="One-word call"
        isSaving={savingFields.has("one_word_play")}
      />
    ),
  },
  wristband_number: {
    label: "Wristband #",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={optimisticPlay.wristband_number || ""}
        onSave={(value) => handleInlineSave("wristband_number", value)}
        placeholder="Wristband number"
        validationType="wristbandNumber"
        existingValues={wristbandValues}
        isSaving={savingFields.has("wristband_number")}
      />
    ),
  },
  confidence_base: {
    label: "Confidence",
    render: (optimisticPlay, handleInlineSave, savingFields) => (
      <InlineEditField
        value={
          optimisticPlay.confidence_base
            ? optimisticPlay.confidence_base.toString()
            : ""
        }
        onSave={(value) => {
          const numValue = parseInt(value, 10);
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
            handleInlineSave("confidence_base", numValue);
          }
        }}
        placeholder="0-100"
        validation={(value) => {
          if (!value.trim()) return null; // Allow empty
          const num = parseInt(value, 10);
          if (isNaN(num) || num < 0 || num > 100) {
            return "Must be 0-100";
          }
          return null;
        }}
        isSaving={savingFields.has("confidence_base")}
      />
    ),
  },
});
