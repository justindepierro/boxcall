import React, { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon/Icon";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface InlineSelectFieldProps {
  value: string;
  options: SelectOption[];
  onSave: (value: string) => Promise<void> | void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  isSaving?: boolean;
}

export const InlineSelectField: React.FC<InlineSelectFieldProps> = ({
  value,
  options,
  onSave,
  placeholder = "Select...",
  className = "",
  disabled = false,
  allowEmpty = true,
  emptyLabel = "None",
  isSaving = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = async () => {
    setIsEditing(false);
    try {
      await onSave(editValue);
    } catch (error) {
      console.error("Failed to save select field:", error);
      // Could add error handling here if needed
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
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

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue =
    selectedOption?.label || (allowEmpty && !value ? emptyLabel : value);

  if (isEditing) {
    return (
      <div className="relative w-full">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              ref={selectRef}
              value={editValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-electric-500/20 focus:border-electric-500 appearance-none pr-10 ${className}`}
            >
              {allowEmpty && <option value="">{emptyLabel}</option>}
              {options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
            </select>

            {/* Custom dropdown arrow */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Icon name="chevron-down" className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleSave}
              className="flex items-center justify-center w-8 h-8 text-electric-600 hover:text-electric-700 hover:bg-electric-50 rounded-lg transition-colors"
              title="Save (Enter)"
            >
              <Icon name="check" className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              title="Cancel (Escape)"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleStartEdit}
      className={`group cursor-pointer rounded-lg p-3 -m-3 transition-all duration-200 hover:bg-surface-hover hover:shadow-sm border-2 border-transparent hover:border-gray-200 ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
      title={disabled ? "Editing disabled" : "Click to edit"}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm flex-1 truncate pr-2">
          {displayValue || (
            <span className="text-gray-400 italic">{placeholder}</span>
          )}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSaving && (
            <Icon
              name="refresh-cw"
              className="h-4 w-4 animate-spin text-electric-600"
            />
          )}
          {!disabled && !isSaving && (
            <div className="flex items-center gap-1">
              <Icon
                name="edit"
                className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity text-gray-500"
              />
              <Icon name="chevron-down" className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
