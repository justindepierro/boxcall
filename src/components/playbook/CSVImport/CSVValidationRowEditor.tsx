import React, { useState } from "react";
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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Validate formation
  const formationValidation = validateFormation(
    preview.data.formation || "",
    existingFormations
  );

  // Validate play name
  const playNameValidation = validatePlayName(
    preview.data.play_name || "",
    existingPlayNames
  );

  // Validate personnel
  const personnelValidation = validatePersonnel(
    preview.data.personnel || "",
    existingPersonnel
  );

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveEdit = (field: string) => {
    if (editValue.trim()) {
      onUpdate(preview.rowNumber, field, editValue.trim());
    }
    setEditingField(null);
    setEditValue("");
  };

  const renderFieldWithValidation = (
    field: string,
    label: string,
    value: string,
    validation: ValidationResult,
    existingValues: string[]
  ) => {
    const isEditing = editingField === field;
    const hasWarnings = validation.state === "warning";
    const hasErrors = validation.state === "error";
    const isValid = validation.state === "valid";

    // Find similar matches for suggestions
    const similarMatches: SimilarMatch[] = hasWarnings || hasErrors
      ? findSimilarMatches(value, existingValues, 3)
      : [];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-secondary">
            {label}
          </label>
          <div className="flex items-center space-x-2">
            {isValid && !isEditing && (
              <Icon name="check-circle" className="h-4 w-4 text-success" />
            )}
            {hasWarnings && !isEditing && (
              <Icon name="alert-triangle" className="h-4 w-4 text-warning" />
            )}
            {hasErrors && !isEditing && (
              <Icon name="x-circle" className="h-4 w-4 text-error" />
            )}
            {!isEditing && (
              <Button
                onClick={() => startEditing(field, value)}
                variant="neutralLink"
                size="xs"
                icon={<Icon name="edit-2" className="h-3 w-3" />}
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
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit(field);
                if (e.key === "Escape") cancelEditing();
              }}
              className="flex-1 px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent"
              autoFocus
            />
            <Button
              onClick={() => saveEdit(field)}
              variant="primary"
              size="xs"
              icon={<Icon name="check" className="h-3 w-3" />}
              iconPosition="only"
              aria-label="Save"
            />
            <Button
              onClick={cancelEditing}
              variant="outline"
              size="xs"
              icon={<Icon name="x" className="h-3 w-3" />}
              iconPosition="only"
              aria-label="Cancel"
            />
          </div>
        ) : (
          <div
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              isValid
                ? "bg-success/10 text-success border border-success/20"
                : hasWarnings
                  ? "bg-warning/10 text-warning border border-warning/20"
                  : hasErrors
                    ? "bg-error/10 text-error border border-error/20"
                    : "bg-subtle text-primary border border-border"
            }`}
          >
            {value || "-"}
          </div>
        )}

        {/* Validation Message */}
        {validation.message && !isEditing && (
          <p
            className={`text-xs flex items-center space-x-1 ${
              isValid
                ? "text-success"
                : hasWarnings
                  ? "text-warning"
                  : "text-error"
            }`}
          >
            {hasWarnings && <span>⚠️</span>}
            {hasErrors && <span>❌</span>}
            <span>{validation.message}</span>
          </p>
        )}

        {/* Fuzzy Match Suggestions */}
        {!isEditing && similarMatches.length > 0 && (hasWarnings || hasErrors) && (
          <div className="bg-subtle border border-muted rounded-lg p-2 space-y-1">
            <p className="text-xs font-medium text-secondary mb-1">
              💡 Did you mean:
            </p>
            {similarMatches.map((match, idx) => (
              <button
                key={idx}
                onClick={() =>
                  onAcceptSuggestion(preview.rowNumber, field, match.value)
                }
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
        )}

        {/* Auto-Correction Suggestion */}
        {validation.normalizedValue && 
         validation.normalizedValue !== value && 
         !isEditing && 
         validation.state !== "error" && (
          <div className="bg-info/10 border border-info/20 rounded-lg p-2 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-info mb-1">
                🔧 Auto-correction available
              </p>
              <p className="text-xs text-secondary">
                Normalize to: <span className="font-mono font-medium">{validation.normalizedValue}</span>
              </p>
            </div>
            <Button
              onClick={() =>
                onAcceptSuggestion(preview.rowNumber, field, validation.normalizedValue)
              }
              variant="infoLink"
              size="xs"
            >
              Apply
            </Button>
          </div>
        )}
      </div>
    );
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
        {renderFieldWithValidation(
          "formation",
          "Formation",
          preview.data.formation || "",
          formationValidation,
          existingFormations
        )}

        {renderFieldWithValidation(
          "play_name",
          "Play Name",
          preview.data.play_name || "",
          playNameValidation,
          existingPlayNames
        )}

        {renderFieldWithValidation(
          "personnel",
          "Personnel",
          preview.data.personnel || "",
          personnelValidation,
          existingPersonnel
        )}

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
      {preview.warnings.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <p className="text-xs font-medium text-warning mb-2 flex items-center space-x-1">
            <Icon name="alert-triangle" className="h-4 w-4" />
            <span>Warnings ({preview.warnings.length})</span>
          </p>
          <ul className="space-y-1">
            {preview.warnings.map((warning, idx) => (
              <li key={idx} className="text-xs text-secondary">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Errors List */}
      {preview.errors.length > 0 && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-3">
          <p className="text-xs font-medium text-error mb-2 flex items-center space-x-1">
            <Icon name="x-circle" className="h-4 w-4" />
            <span>Errors ({preview.errors.length})</span>
          </p>
          <ul className="space-y-1">
            {preview.errors.map((error, idx) => (
              <li key={idx} className="text-xs text-secondary">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
