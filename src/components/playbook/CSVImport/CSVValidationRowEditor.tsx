import { useState } from "react";
import { Button } from "../../ui/Button/Button";
import { Icon } from "../../ui/Icon";
import { Typography } from "../../design-system/Typography";
import type { CSVPlayPreview } from "../../../services/csv/types";
import {
  validateFormation,
  validatePlayName,
  validatePersonnel,
  findSimilarMatches,
  type ValidationResult,
  type SimilarMatch,
} from "../../../utils/dataValidation";

// Helper to get validation state styling
const getValidationStateClass = (state: ValidationResult["state"]) => {
  switch (state) {
    case "valid":
      return "bg-success/10 text-success border border-success/20";
    case "warning":
      return "bg-warning/10 text-warning border border-warning/20";
    case "error":
      return "bg-error/10 text-error border border-error/20";
    default:
      return "bg-subtle text-primary border border-border";
  }
};

const getValidationTextClass = (state: ValidationResult["state"]) => {
  switch (state) {
    case "valid":
      return "text-success";
    case "warning":
      return "text-warning";
    default:
      return "text-error";
  }
};

// Warnings List Component
interface WarningsListProps {
  warnings: string[];
}

const WarningsList: React.FC<WarningsListProps> = ({ warnings }) => {
  if (warnings.length === 0) return null;

  return (
    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
      <p className="text-xs font-medium text-warning mb-2 flex items-center space-x-1">
        <Icon name="alert-triangle" className="h-4 w-4" />
        <span>Warnings ({warnings.length})</span>
      </p>
      <ul className="space-y-1">
        {warnings.map((warning, idx) => (
          <li key={idx} className="text-xs text-secondary">
            • {warning}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Errors List Component
interface ErrorsListProps {
  errors: string[];
}

const ErrorsList: React.FC<ErrorsListProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="bg-error/10 border border-error/20 rounded-lg p-3">
      <p className="text-xs font-medium text-error mb-2 flex items-center space-x-1">
        <Icon name="x-circle" className="h-4 w-4" />
        <span>Errors ({errors.length})</span>
      </p>
      <ul className="space-y-1">
        {errors.map((error, idx) => (
          <li key={idx} className="text-xs text-secondary">
            • {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Fuzzy Match Suggestions Component
interface FuzzyMatchSuggestionsProps {
  matches: SimilarMatch[];
  onAccept: (value: string) => void;
}

const FuzzyMatchSuggestions: React.FC<FuzzyMatchSuggestionsProps> = ({
  matches,
  onAccept,
}) => {
  if (matches.length === 0) return null;

  return (
    <div className="bg-subtle border border-muted rounded-lg p-2 space-y-1">
      <p className="text-xs font-medium text-secondary mb-1">
        💡 Did you mean:
      </p>
      {matches.map((match, idx) => (
        <button
          key={idx}
          onClick={() => onAccept(match.value)}
          className="w-full text-left px-2 py-1 rounded hover:bg-bg-secondary transition-colors group flex items-center justify-between"
        >
          <span className="text-sm font-medium group-hover:text-accent transition-colors">
            {match.value}
          </span>
          <span className="text-xs text-muted bg-bg-muted px-2 py-0.5 rounded">
            {match.confidence}% match
          </span>
        </button>
      ))}
    </div>
  );
};

// Auto-correction Suggestion Component
interface AutoCorrectionProps {
  normalizedValue: string;
  onAccept: () => void;
}

const AutoCorrectionSuggestion: React.FC<AutoCorrectionProps> = ({
  normalizedValue,
  onAccept,
}) => (
  <div className="bg-info/10 border border-info/20 rounded-lg p-2 flex items-start justify-between">
    <div className="flex-1">
      <p className="text-xs font-medium text-info mb-1">
        🔧 Auto-correction available
      </p>
      <p className="text-xs text-secondary">
        Normalize to:{" "}
        <span className="font-mono font-medium">{normalizedValue}</span>
      </p>
    </div>
    <Button onClick={onAccept} variant="infoLink" size="xs">
      Apply
    </Button>
  </div>
);

// Validation State Icon Component
interface ValidationStateIconProps {
  state: ValidationResult["state"];
  isEditing: boolean;
}

const ValidationStateIcon: React.FC<ValidationStateIconProps> = ({
  state,
  isEditing,
}) => {
  if (isEditing) return null;
  if (state === "valid")
    return <Icon name="check-circle" className="h-4 w-4 text-success" />;
  if (state === "warning")
    return <Icon name="alert-triangle" className="h-4 w-4 text-warning" />;
  if (state === "error")
    return <Icon name="x-circle" className="h-4 w-4 text-error" />;
  return null;
};

type CSVEditableField = "formation" | "play_name" | "personnel";

type CSVAnyField =
  | "formation"
  | "play_name"
  | "personnel"
  | "p_type"
  | "one_word_play"
  | "p_dir"
  | "protection"
  | "check_into"
  | "r_str"
  | "p_str"
  | "f_type"
  | "f_dir"
  | "ftag1"
  | "ftag2"
  | "p_tag1"
  | "p_tag2"
  | "key_player1"
  | "key_player2"
  | "back_align"
  | "shift"
  | "motion"
  | "pref_down"
  | "pref_dis"
  | "pref_hash"
  | "pref_cov"
  | "pref_front"
  | "pref_field_pos"
  | "pref_situation"
  | "notes";

interface CSVValidationFieldEditorProps {
  rowNumber: number;
  field: CSVEditableField;
  label: string;
  value: string;
  validation: ValidationResult;
  existingValues: string[];
  editingField: CSVEditableField | null;
  editValue: string;
  onStartEditing: (field: CSVEditableField, currentValue: string) => void;
  onCancelEditing: () => void;
  onSaveEdit: (field: CSVEditableField) => void;
  onEditValueChange: (value: string) => void;
  onAcceptSuggestion: (
    rowNumber: number,
    field: string,
    suggestedValue: string
  ) => void;
}

const CSVValidationFieldEditor: React.FC<CSVValidationFieldEditorProps> = ({
  rowNumber,
  field,
  label,
  value,
  validation,
  existingValues,
  editingField,
  editValue,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  onEditValueChange,
  onAcceptSuggestion,
}) => {
  const isEditing = editingField === field;
  const hasWarnings = validation.state === "warning";
  const hasErrors = validation.state === "error";

  const similarMatches: SimilarMatch[] =
    hasWarnings || hasErrors
      ? findSimilarMatches(value, existingValues, 3)
      : [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-secondary">{label}</label>
        <div className="flex items-center space-x-2">
          <ValidationStateIcon state={validation.state} isEditing={isEditing} />
          {!isEditing && (
            <Button
              onClick={() => onStartEditing(field, value)}
              variant="neutralLink"
              size="xs"
              icon={<Icon name="edit" className="h-3 w-3" />}
              iconPosition="only"
              aria-label={`Edit ${label}`}
            />
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit(field);
              if (e.key === "Escape") onCancelEditing();
            }}
            className="flex-1 px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            autoFocus
          />
          <Button
            onClick={() => onSaveEdit(field)}
            variant="primary"
            size="xs"
            icon={<Icon name="check" className="h-3 w-3" />}
            iconPosition="only"
            aria-label="Save"
          />
          <Button
            onClick={onCancelEditing}
            variant="outline"
            size="xs"
            icon={<Icon name="x-circle" className="h-3 w-3" />}
            iconPosition="only"
            aria-label="Cancel"
          />
        </div>
      ) : (
        <div
          className={`px-3 py-2 rounded-lg text-sm font-medium ${getValidationStateClass(validation.state)}`}
        >
          {value || "-"}
        </div>
      )}

      {validation.message && !isEditing && (
        <p
          className={`text-xs flex items-center space-x-1 ${getValidationTextClass(validation.state)}`}
        >
          {hasWarnings && <span>⚠️</span>}
          {hasErrors && <span>❌</span>}
          <span>{validation.message}</span>
        </p>
      )}

      {!isEditing && (hasWarnings || hasErrors) && (
        <FuzzyMatchSuggestions
          matches={similarMatches}
          onAccept={(matchValue) =>
            onAcceptSuggestion(rowNumber, field, matchValue)
          }
        />
      )}

      {validation.normalizedValue &&
        validation.normalizedValue !== value &&
        !isEditing &&
        validation.state !== "error" && (
          <AutoCorrectionSuggestion
            normalizedValue={validation.normalizedValue}
            onAccept={() =>
              onAcceptSuggestion(rowNumber, field, validation.normalizedValue)
            }
          />
        )}
    </div>
  );
};

interface CSVValidationRowEditorProps {
  preview: CSVPlayPreview;
  existingFormations: string[];
  existingPlayNames: string[];
  existingPersonnel: string[];
  onUpdate: (rowNumber: number, field: string, value: string) => void;
  onAcceptSuggestion: (
    rowNumber: number,
    field: string,
    suggestedValue: string
  ) => void;
}

/**
 * CSVValidationRowEditor
 *
 * Inline editor for CSV import rows with:
 * - Real-time validation using dataValidation.ts
 * - Fuzzy matching suggestions for similar existing values
 * - One-click correction buttons
 * - Visual feedback (green checkmark, yellow warning, red error)
 */
export function CSVValidationRowEditor({
  preview,
  existingFormations,
  existingPlayNames,
  existingPersonnel,
  onUpdate,
  onAcceptSuggestion,
}: CSVValidationRowEditorProps) {
  const [editingField, setEditingField] = useState<CSVEditableField | null>(
    null
  );
  const [editValue, setEditValue] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Validate fields
  const formationValidation = validateFormation(
    preview.data.formation || "",
    existingFormations
  );
  const playNameValidation = validatePlayName(
    preview.data.play_name || "",
    existingPlayNames
  );
  const personnelValidation = validatePersonnel(
    preview.data.personnel || "",
    existingPersonnel
  );

  const startEditing = (field: CSVEditableField, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveEdit = (field: CSVEditableField) => {
    if (editValue.trim()) {
      onUpdate(preview.rowNumber, field, editValue.trim());
    }
    setEditingField(null);
    setEditValue("");
  };

  const getFieldValue = (field: CSVAnyField): string => {
    const value = preview.data[field];
    if (value === null || value === undefined) return "";
    return String(value);
  };

  const handleFieldChange = (field: CSVAnyField, value: string) => {
    onUpdate(preview.rowNumber, field, value);
  };

  return (
    <div className="space-y-4 p-4 bg-primary border border-muted rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <Typography variant="body-sm" className="font-medium text-primary">
          Row {preview.rowNumber} - Validation Details
        </Typography>
        {preview.isValid ? (
          <span className="text-xs font-medium text-success flex items-center space-x-1">
            <Icon name="check-circle" className="h-4 w-4" />
            <span>Valid</span>
          </span>
        ) : (
          <span className="text-xs font-medium text-error flex items-center space-x-1">
            <Icon name="alert-circle" className="h-4 w-4" />
            <span>Needs Attention</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CSVValidationFieldEditor
          rowNumber={preview.rowNumber}
          field="formation"
          label="Formation"
          value={preview.data.formation || ""}
          validation={formationValidation}
          existingValues={existingFormations}
          editingField={editingField}
          editValue={editValue}
          onStartEditing={startEditing}
          onCancelEditing={cancelEditing}
          onSaveEdit={saveEdit}
          onEditValueChange={setEditValue}
          onAcceptSuggestion={onAcceptSuggestion}
        />

        <CSVValidationFieldEditor
          rowNumber={preview.rowNumber}
          field="play_name"
          label="Play Name"
          value={preview.data.play_name || ""}
          validation={playNameValidation}
          existingValues={existingPlayNames}
          editingField={editingField}
          editValue={editValue}
          onStartEditing={startEditing}
          onCancelEditing={cancelEditing}
          onSaveEdit={saveEdit}
          onEditValueChange={setEditValue}
          onAcceptSuggestion={onAcceptSuggestion}
        />

        <CSVValidationFieldEditor
          rowNumber={preview.rowNumber}
          field="personnel"
          label="Personnel"
          value={preview.data.personnel || ""}
          validation={personnelValidation}
          existingValues={existingPersonnel}
          editingField={editingField}
          editValue={editValue}
          onStartEditing={startEditing}
          onCancelEditing={cancelEditing}
          onSaveEdit={saveEdit}
          onEditValueChange={setEditValue}
          onAcceptSuggestion={onAcceptSuggestion}
        />

        {/* Play Type */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-secondary">Play Type</label>
          <input
            type="text"
            value={getFieldValue("p_type")}
            onChange={(e) => handleFieldChange("p_type", e.target.value)}
            className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Pass, Run, RPO, Play Action…"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Typography variant="body-sm" className="font-medium text-primary">
          Advanced Fields
        </Typography>
        <Button
          onClick={() => setShowAdvanced((v) => !v)}
          variant="neutralLink"
          size="xs"
          icon={
            showAdvanced ? (
              <Icon name="chevron-up" className="h-4 w-4" />
            ) : (
              <Icon name="chevron-down" className="h-4 w-4" />
            )
          }
        >
          {showAdvanced ? "Hide" : "Show"}
        </Button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">
              One Word Play
            </label>
            <input
              type="text"
              value={getFieldValue("one_word_play")}
              onChange={(e) => handleFieldChange("one_word_play", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Signal / Audible"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">Play Dir</label>
            <input
              type="text"
              value={getFieldValue("p_dir")}
              onChange={(e) => handleFieldChange("p_dir", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Left / Right / Middle"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">
              Protection
            </label>
            <input
              type="text"
              value={getFieldValue("protection")}
              onChange={(e) => handleFieldChange("protection", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Slide / Man / Full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">F Type</label>
            <input
              type="text"
              value={getFieldValue("f_type")}
              onChange={(e) => handleFieldChange("f_type", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">F Dir</label>
            <input
              type="text"
              value={getFieldValue("f_dir")}
              onChange={(e) => handleFieldChange("f_dir", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Left / Right"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">Check Into</label>
            <input
              type="text"
              value={getFieldValue("check_into")}
              onChange={(e) => handleFieldChange("check_into", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Check / Audible to"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">F Tag 1</label>
            <input
              type="text"
              value={getFieldValue("ftag1")}
              onChange={(e) => handleFieldChange("ftag1", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">F Tag 2</label>
            <input
              type="text"
              value={getFieldValue("ftag2")}
              onChange={(e) => handleFieldChange("ftag2", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">P Tag 1</label>
            <input
              type="text"
              value={getFieldValue("p_tag1")}
              onChange={(e) => handleFieldChange("p_tag1", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">P Tag 2</label>
            <input
              type="text"
              value={getFieldValue("p_tag2")}
              onChange={(e) => handleFieldChange("p_tag2", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">R Str</label>
            <input
              type="text"
              value={getFieldValue("r_str")}
              onChange={(e) => handleFieldChange("r_str", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Left / Right"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">P Str</label>
            <input
              type="text"
              value={getFieldValue("p_str")}
              onChange={(e) => handleFieldChange("p_str", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Left / Right"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">
              Key Player 1
            </label>
            <input
              type="text"
              value={getFieldValue("key_player1")}
              onChange={(e) => handleFieldChange("key_player1", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">
              Key Player 2
            </label>
            <input
              type="text"
              value={getFieldValue("key_player2")}
              onChange={(e) => handleFieldChange("key_player2", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">Back Align</label>
            <input
              type="text"
              value={getFieldValue("back_align")}
              onChange={(e) => handleFieldChange("back_align", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">Shift</label>
            <input
              type="text"
              value={getFieldValue("shift")}
              onChange={(e) => handleFieldChange("shift", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">Motion</label>
            <input
              type="text"
              value={getFieldValue("motion")}
              onChange={(e) => handleFieldChange("motion", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">Pref Down</label>
            <input
              type="text"
              value={getFieldValue("pref_down")}
              onChange={(e) => handleFieldChange("pref_down", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="1st / 2nd / 3rd"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">Pref Dis</label>
            <input
              type="text"
              value={getFieldValue("pref_dis")}
              onChange={(e) => handleFieldChange("pref_dis", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Short / Medium / Long"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">Pref Hash</label>
            <input
              type="text"
              value={getFieldValue("pref_hash")}
              onChange={(e) => handleFieldChange("pref_hash", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Left / Middle / Right"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">Pref Cov</label>
            <input
              type="text"
              value={getFieldValue("pref_cov")}
              onChange={(e) => handleFieldChange("pref_cov", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Cover 1 / Cover 3 / Quarters"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">Pref Front</label>
            <input
              type="text"
              value={getFieldValue("pref_front")}
              onChange={(e) => handleFieldChange("pref_front", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">Pref Field Pos</label>
            <input
              type="text"
              value={getFieldValue("pref_field_pos")}
              onChange={(e) => handleFieldChange("pref_field_pos", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-secondary">Pref Situation</label>
            <input
              type="text"
              value={getFieldValue("pref_situation")}
              onChange={(e) => handleFieldChange("pref_situation", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-medium text-secondary">Notes</label>
            <textarea
              value={getFieldValue("notes")}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              className="w-full px-2 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent min-h-20"
              placeholder="Optional notes"
            />
          </div>
        </div>
      )}

      {/* Warnings List */}
      <WarningsList warnings={preview.warnings} />

      {/* Errors List */}
      <ErrorsList errors={preview.errors} />
    </div>
  );
}
