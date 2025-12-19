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

        {/* Play Type (simple display, no validation yet) */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-secondary">
            Play Type
          </label>
          <div className="px-3 py-2 rounded-lg text-sm font-medium bg-subtle text-primary border border-border">
            {preview.data.p_type || "-"}
          </div>
        </div>
      </div>

      {/* Warnings List */}
      <WarningsList warnings={preview.warnings} />

      {/* Errors List */}
      <ErrorsList errors={preview.errors} />
    </div>
  );
}
