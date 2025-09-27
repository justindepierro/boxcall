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
  onSave: (value: string) => void;
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

  const handleSave = () => {
    setIsEditing(false);
    onSave(editValue);
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
      <div className="relative">
        <select
          ref={selectRef}
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`w-full px-2 py-1 text-sm border border-electric-500 rounded bg-white focus:outline-none focus:ring-2 focus:ring-electric-500 focus:border-transparent appearance-none ${className}`}
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
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Icon name="chevron-down" className="h-4 w-4 text-gray-400" />
        </div>

        {/* Action buttons */}
        <div className="absolute right-8 top-1 flex gap-1" data-inline-action>
          <button
            onClick={handleSave}
            className="p-1 text-electric-600 hover:text-electric-800 hover:bg-electric-50 rounded"
            title="Save (Enter)"
            data-inline-action
          >
            <Icon name="check" className="h-3 w-3" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
            title="Cancel (Escape)"
            data-inline-action
          >
            <Icon name="close" className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleStartEdit}
      className={`group cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 -mx-1 -my-0.5 transition-colors inline-flex items-center gap-1 ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
      title={disabled ? "Editing disabled" : "Click to edit"}
    >
      <span className="text-sm flex-1 truncate">
        {displayValue || (
          <span className="text-gray-400 italic">{placeholder}</span>
        )}
      </span>
      {isSaving ? (
        <Icon
          name="refresh-cw"
          className="h-3 w-3 flex-shrink-0 animate-spin text-gray-500"
        />
      ) : (
        !disabled && (
          <Icon
            name="edit"
            className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-50 transition-opacity"
          />
        )
      )}
    </div>
  );
};
