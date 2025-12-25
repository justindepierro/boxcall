/**
 * InlineEditFieldEditing - Edit mode component for InlineEditField
 */
import React, { useRef, useEffect } from "react";
import { Icon } from "../Icon/Icon";
import { getInputBorderClass } from "./utils";

interface InlineEditFieldEditingProps {
  editValue: string;
  type: "text" | "textarea";
  rows: number;
  maxLength?: number;
  placeholder: string;
  className: string;
  saveStatus: "idle" | "saving" | "success" | "error";
  error: string | null;
  filteredSuggestions: string[];
  showSuggestions: boolean;
  onInputChange: (value: string) => void;
  onInputFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onBlur: (e: React.FocusEvent) => void;
  onSave: () => void;
  onCancel: () => void;
  onSuggestionSelect: (suggestion: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  suggestionsRef: React.RefObject<HTMLDivElement | null>;
}

export const InlineEditFieldEditing: React.FC<InlineEditFieldEditingProps> = ({
  editValue,
  type,
  rows,
  maxLength,
  placeholder,
  className,
  saveStatus,
  error,
  filteredSuggestions,
  showSuggestions,
  onInputChange,
  onInputFocus,
  onKeyDown,
  onBlur,
  onSave,
  onCancel,
  onSuggestionSelect,
  containerRef,
  suggestionsRef,
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const inputClassName = `flex-1 px-3 py-2 text-sm border-2 rounded-lg bg-white shadow-sm transition-colors ${getInputBorderClass(
    saveStatus
  )} focus:outline-none focus:ring-4 ${className}`;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2">
        {type === "textarea" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => onInputChange(e.target.value)}
            onFocus={onInputFocus}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={rows}
            className={inputClassName}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => onInputChange(e.target.value)}
            onFocus={onInputFocus}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            className={inputClassName}
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
              <Icon name="check-circle" className="h-4 w-4 text-success-600" />
            </div>
          )}
          {saveStatus === "idle" && (
            <>
              <button
                onClick={onSave}
                className="flex items-center justify-center w-8 h-8 text-electric-600 hover:text-electric-700 hover:bg-electric-50 rounded-lg transition-colors"
                title="Save (Enter)"
              >
                <Icon name="check" className="h-4 w-4" />
              </button>
              <button
                onClick={onCancel}
                className="flex items-center justify-center w-8 h-8 text-muted hover:text-primary hover:bg-secondary rounded-lg transition-colors"
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
        <div
          ref={suggestionsRef}
          className="absolute left-0 top-full mt-2 w-full bg-primary/95 dark:bg-secondary/95 backdrop-blur-md border border-stroke rounded-lg shadow-2xl z-50 max-h-72 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onMouseDown={(e) => {
                e.preventDefault();
                onSuggestionSelect(suggestion);
              }}
              className="w-full text-left px-4 py-3 text-sm text-content-primary hover:bg-secondary/50 focus:bg-secondary/50 focus:outline-none border-b border-muted last:border-b-0 transition-colors"
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
};
