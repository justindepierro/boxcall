import React from "react";
import type { ValidatedInputType } from "../playbook/ValidatedInput";
import {
  InlineEditFieldEditing,
  InlineEditFieldDisplay,
  useInlineEdit,
} from "./InlineEditField/index";

interface InlineEditFieldProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: "text" | "textarea";
  rows?: number;
  maxLength?: number;
  validation?: (value: string) => string | null;
  suggestions?: string[];
  enableSuggestions?: boolean;
  normalizeValue?: (value: string) => string;
  isSaving?: boolean;
  validationType?: ValidatedInputType;
  existingValues?: string[];
}

export const InlineEditField: React.FC<InlineEditFieldProps> = ({
  value,
  onSave,
  placeholder = "Click to edit...",
  className = "",
  disabled = false,
  type = "text",
  rows = 3,
  maxLength,
  validation,
  suggestions = [],
  enableSuggestions = false,
  normalizeValue,
  isSaving = false,
  validationType,
  existingValues,
}) => {
  const {
    isEditing,
    editValue,
    error,
    saveStatus,
    showSuggestions,
    filteredSuggestions,
    containerRef,
    suggestionsRef,
    handleStartEdit,
    handleSave,
    handleInputChange,
    handleInputFocus,
    handleSuggestionSelect,
    handleCancel,
    handleKeyDown,
    handleBlur,
  } = useInlineEdit({
    value,
    onSave,
    validation,
    normalizeValue,
    suggestions,
    enableSuggestions,
    validationType,
    existingValues,
    disabled,
    type,
  });

  if (isEditing) {
    return (
      <InlineEditFieldEditing
        editValue={editValue}
        type={type}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        className={className}
        saveStatus={saveStatus}
        error={error}
        filteredSuggestions={filteredSuggestions}
        showSuggestions={showSuggestions}
        onInputChange={handleInputChange}
        onInputFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onSave={handleSave}
        onCancel={handleCancel}
        onSuggestionSelect={handleSuggestionSelect}
        containerRef={containerRef}
        suggestionsRef={suggestionsRef}
      />
    );
  }

  return (
    <InlineEditFieldDisplay
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      isSaving={isSaving}
      className={className}
      onStartEdit={handleStartEdit}
    />
  );
};
