/**
 * AddNewDropdown Component
 * A dropdown with the ability to add new options dynamically
 */

import React, { useState } from "react";
import { X, Check } from "lucide-react";

interface AddNewDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  label: string;
  allowCustom?: boolean;
  className?: string;
  required?: boolean;
}

export const AddNewDropdown: React.FC<AddNewDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder,
  label,
  allowCustom = true,
  className = "",
  required = false,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue === "__ADD_NEW__") {
      setShowCustomInput(true);
      setCustomValue("");
    } else {
      onChange(selectedValue);
      setShowCustomInput(false);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
      setShowCustomInput(false);
      setCustomValue("");
    }
  };

  const handleCustomCancel = () => {
    setShowCustomInput(false);
    setCustomValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomSubmit();
    } else if (e.key === "Escape") {
      handleCustomCancel();
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && "*"}
      </label>

      {showCustomInput ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Enter new ${label.toLowerCase()}...`}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCustomSubmit}
            className="p-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500"
            title="Add"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleCustomCancel}
            className="p-2 bg-slate-400 text-white rounded-md hover:bg-slate-500 focus:ring-2 focus:ring-slate-500"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <select
          value={value}
          onChange={handleSelectChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          {allowCustom && (
            <option
              value="__ADD_NEW__"
              className="border-t border-slate-200 font-medium text-emerald-600"
            >
              + Add New {label}...
            </option>
          )}
        </select>
      )}

      {/* Show current custom value if it's not in the predefined options */}
      {value && !options.includes(value) && !showCustomInput && (
        <p className="text-xs text-emerald-600 mt-1">
          Custom {label.toLowerCase()}: "{value}"
        </p>
      )}
    </div>
  );
};
