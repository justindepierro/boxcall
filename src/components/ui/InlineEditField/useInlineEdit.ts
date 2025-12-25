/**
 * useInlineEdit - State management hook for InlineEditField
 */
import { useState, useRef, useEffect, useCallback } from "react";
import type { ValidatedInputType } from "../../playbook/ValidatedInput";
import { logError } from "../../../utils/logger";
import { getValidationResult, filterSuggestions } from "./utils";

const DEFAULT_SUGGESTION_LIMIT = 50;

export type SaveStatus = "idle" | "saving" | "success" | "error";

interface UseInlineEditProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  validation?: (value: string) => string | null;
  normalizeValue?: (value: string) => string;
  suggestions?: string[];
  enableSuggestions?: boolean;
  validationType?: ValidatedInputType;
  existingValues?: string[];
  disabled?: boolean;
  type?: "text" | "textarea";
}

export function useInlineEdit({
  value,
  onSave,
  validation,
  normalizeValue,
  suggestions = [],
  enableSuggestions = false,
  validationType,
  existingValues,
  disabled = false,
  type = "text",
}: UseInlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Click outside handler for suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSuggestions &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions]);

  const updateSuggestions = useCallback(
    (inputValue: string) => {
      const result = getValidationResult(
        validationType,
        inputValue,
        existingValues
      );
      if (result.suggestions && result.suggestions.length > 0) {
        setFilteredSuggestions(result.suggestions);
        setShowSuggestions(true);
        return;
      }
      if (enableSuggestions && suggestions.length > 0) {
        const filtered = filterSuggestions(inputValue, suggestions);
        setFilteredSuggestions(
          filtered.length > 0
            ? filtered
            : suggestions.slice(0, DEFAULT_SUGGESTION_LIMIT)
        );
        setShowSuggestions(true);
      }
    },
    [validationType, existingValues, enableSuggestions, suggestions]
  );

  const handleStartEdit = useCallback(() => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
    setError(null);
  }, [disabled, value]);

  const performSave = useCallback(
    async (valueToSave: string): Promise<boolean> => {
      const trimmedValue = valueToSave.trim();
      const normalizedValue = normalizeValue
        ? normalizeValue(trimmedValue)
        : trimmedValue;

      if (validation) {
        const validationError = validation(normalizedValue);
        if (validationError) {
          setError(validationError);
          setSaveStatus("error");
          containerRef.current?.classList.add("animate-shake");
          setTimeout(
            () => containerRef.current?.classList.remove("animate-shake"),
            500
          );
          return false;
        }
      }

      setError(null);
      setSaveStatus("saving");
      setIsEditing(false);
      setShowSuggestions(false);

      try {
        await onSave(normalizedValue);
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2000);
        return true;
      } catch (err) {
        logError("[InlineEditField] Save failed:", err);
        setSaveStatus("error");
        setError(err instanceof Error ? err.message : "Failed to save");
        containerRef.current?.classList.add("animate-shake");
        setTimeout(
          () => containerRef.current?.classList.remove("animate-shake"),
          500
        );
        setIsEditing(true);
        setTimeout(() => setSaveStatus("idle"), 3000);
        return false;
      }
    },
    [normalizeValue, validation, onSave]
  );

  const handleSave = useCallback(
    () => performSave(editValue),
    [performSave, editValue]
  );

  const handleInputChange = useCallback(
    (newValue: string) => {
      setEditValue(newValue);
      setError(null);
      updateSuggestions(newValue);
    },
    [updateSuggestions]
  );

  const handleInputFocus = useCallback(() => {
    updateSuggestions(editValue);
  }, [updateSuggestions, editValue]);

  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      setEditValue(suggestion);
      setShowSuggestions(false);
      performSave(suggestion);
    },
    [performSave]
  );

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setError(null);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && type === "text") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    },
    [type, handleSave, handleCancel]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (
        relatedTarget &&
        (relatedTarget.closest("[data-inline-action]") ||
          relatedTarget.tagName === "BUTTON")
      ) {
        return;
      }
      setTimeout(() => {
        if (isEditing) handleSave();
      }, 200);
    },
    [isEditing, handleSave]
  );

  return {
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
  };
}
