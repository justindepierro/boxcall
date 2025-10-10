import React, { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon/Icon";

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
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
    setError(null);
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();
    const normalizedValue = normalizeValue
      ? normalizeValue(trimmedValue)
      : trimmedValue;

    // Validation
    if (validation) {
      const validationError = validation(normalizedValue);
      if (validationError) {
        setError(validationError);
        setSaveStatus("error");
        // Shake animation
        if (containerRef.current) {
          containerRef.current.classList.add("animate-shake");
          setTimeout(
            () => containerRef.current?.classList.remove("animate-shake"),
            500
          );
        }
        return;
      }
    }

    setError(null);
    setSaveStatus("saving");
    setIsEditing(false);
    setShowSuggestions(false);

    try {
      await onSave(normalizedValue);
      setSaveStatus("success");
      // Show success feedback briefly
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      setSaveStatus("error");
      setError(err instanceof Error ? err.message : "Failed to save");
      // Shake animation
      if (containerRef.current) {
        containerRef.current.classList.add("animate-shake");
        setTimeout(
          () => containerRef.current?.classList.remove("animate-shake"),
          500
        );
      }
      // Reset to editing state on error
      setIsEditing(true);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const filterSuggestions = (input: string) => {
    if (!enableSuggestions || !suggestions.length) return [];

    const normalizedInput = input.toLowerCase().trim();
    if (!normalizedInput) return suggestions.slice(0, 5);

    // Exact matches first
    const exactMatches = suggestions.filter(
      (s) => s.toLowerCase() === normalizedInput
    );

    // Fuzzy matches (contains input)
    const fuzzyMatches = suggestions.filter(
      (s) =>
        s.toLowerCase().includes(normalizedInput) && !exactMatches.includes(s)
    );

    // Levenshtein distance for typos (simple implementation)
    const levenshteinMatches = suggestions.filter((s) => {
      if (exactMatches.includes(s) || fuzzyMatches.includes(s)) return false;
      const distance = levenshteinDistance(normalizedInput, s.toLowerCase());
      return distance <= Math.max(2, Math.floor(normalizedInput.length * 0.3));
    });

    return [...exactMatches, ...fuzzyMatches, ...levenshteinMatches].slice(
      0,
      5
    );
  };

  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[b.length][a.length];
  };

  const handleInputChange = (newValue: string) => {
    setEditValue(newValue);
    setError(null);

    if (enableSuggestions) {
      const filtered = filterSuggestions(newValue);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && newValue.trim().length > 0);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setEditValue(suggestion);
    setShowSuggestions(false);
    // Auto-save on suggestion select
    setTimeout(() => handleSave(), 100);
  };

  const handleCancel = () => {
    setEditValue(value);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type === "text") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't save if focus is moving to save/cancel buttons
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (
      relatedTarget &&
      (relatedTarget.closest("[data-inline-action]") ||
        relatedTarget.tagName === "BUTTON")
    ) {
      return;
    }

    // Small delay to allow other interactions to complete
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 200);
  };

  if (isEditing) {
    return (
      <div ref={containerRef} className="relative w-full">
        <div className="flex items-center gap-2">
          {type === "textarea" ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={placeholder}
              maxLength={maxLength}
              rows={rows}
              className={`flex-1 px-3 py-2 text-sm border-2 rounded-lg bg-white shadow-sm transition-colors ${
                saveStatus === "error"
                  ? "border-error-300 focus:border-error-500 focus:ring-error-500/20"
                  : saveStatus === "success"
                    ? "border-success-300 focus:border-success-500 focus:ring-success-500/20"
                    : "border focus:border-electric-500 focus:ring-electric-500/20"
              } focus:outline-none focus:ring-4 ${className}`}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={editValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={placeholder}
              maxLength={maxLength}
              className={`flex-1 px-3 py-2 text-sm border-2 rounded-lg bg-white shadow-sm transition-colors ${
                saveStatus === "error"
                  ? "border-error-300 focus:border-error-500 focus:ring-error-500/20"
                  : saveStatus === "success"
                    ? "border-success-300 focus:border-success-500 focus:ring-success-500/20"
                    : "border focus:border-electric-500 focus:ring-electric-500/20"
              } focus:outline-none focus:ring-4 ${className}`}
            />
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {saveStatus === "saving" && (
              <div className="flex items-center justify-center w-8 h-8">
                <Icon
                  name="refresh-cw"
                  className="h-4 w-4 animate-spin text-electric-600"
                />
              </div>
            )}
            {saveStatus === "success" && (
              <div className="flex items-center justify-center w-8 h-8">
                <Icon
                  name="check-circle"
                  className="h-4 w-4 text-success-600"
                />
              </div>
            )}
            {saveStatus === "idle" && (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center w-8 h-8 text-electric-600 hover:text-electric-700 hover:bg-electric-50 rounded-lg transition-colors"
                  title="Save (Enter)"
                >
                  <Icon name="check" className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center w-8 h-8 text-muted hover:text-primary hover:bg-surface-secondary rounded-lg transition-colors"
                  title="Cancel (Escape)"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 top-full mt-2 w-full bg-surface-primary/95 dark:bg-surface-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full text-left px-4 py-3 text-sm text-content-primary hover:bg-surface-secondary/50 focus:bg-surface-secondary/50 focus:outline-none border-b border-subtle last:border-b-0 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-2 text-sm text-error-600 bg-error-bg px-3 py-2 rounded-lg border border-error-200">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleStartEdit}
      className={`group cursor-pointer rounded-lg p-3 -m-3 transition-all duration-200 hover:bg-surface-hover hover:shadow-sm border-2 border-transparent hover:border ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
      title={disabled ? "Editing disabled" : "Click to edit"}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm flex-1 truncate pr-2">
          {value || <span className="text-muted italic">{placeholder}</span>}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSaving && (
            <Icon
              name="refresh-cw"
              className="h-4 w-4 animate-spin text-electric-600"
            />
          )}
          {!disabled && !isSaving && (
            <Icon
              name="edit"
              className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity text-muted"
            />
          )}
        </div>
      </div>
    </div>
  );
};
