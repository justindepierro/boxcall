/**
 * AutocompleteDropdown Component
 * Advanced dropdown with autocomplete, "add new" functionality, and toast notifications
 */

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../ui/Button/Button";
import { Plus, Check, ChevronDown } from "lucide-react";
import { useToast } from "./useToast";
import { Typography } from "@components/design-system/Typography";

interface AutocompleteDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  label: string;
  className?: string;
  required?: boolean;
  onAddNew?: (newValue: string) => void;
}

export const AutocompleteDropdown: React.FC<AutocompleteDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder,
  label,
  className = "",
  required = false,
  onAddNew,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { success } = useToast();

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter options based on input
  useEffect(() => {
    if (inputValue) {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
      setHighlightedIndex(-1);
    } else {
      setFilteredOptions(options);
    }
  }, [inputValue, options]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // If input doesn't match any option and has content, keep the custom value
        if (inputValue && !options.includes(inputValue)) {
          onChange(inputValue);
        } else if (!inputValue) {
          // Reset to original value if input is empty
          setInputValue(value);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue, options, onChange, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);

    // Update parent immediately for controlled input behavior
    onChange(newValue);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleOptionClick = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleAddNew = () => {
    if (inputValue.trim() && !options.includes(inputValue.trim())) {
      const newValue = inputValue.trim();
      onAddNew?.(newValue);
      onChange(newValue);
      setIsOpen(false);

      // Show success toast
      success(
        `Added "${newValue}" to ${label.toLowerCase()} options`,
        `New ${label} Added`
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        } else if (inputValue && !options.includes(inputValue)) {
          handleAddNew();
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  const showAddNewOption =
    inputValue &&
    inputValue.trim().length > 0 &&
    !options.some(
      (option) => option.toLowerCase() === inputValue.toLowerCase()
    );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Typography
        variant="body-sm"
        as="label"
        className="block font-medium text-slate-700 mb-2"
      >
        {label} {required && "*"}
      </Typography>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500 bg-white"
          autoComplete="off"
        />

        {/* Dropdown arrow */}
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 px-2 h-auto text-slate-400 hover:text-slate-600"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>

        {/* Add new button - shows when typing something new */}
        {showAddNewOption && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleAddNew}
            className="absolute inset-y-0 right-8 px-1 h-auto text-jade-500 hover:text-jade-600 z-10"
            title={`Add new ${label.toLowerCase()}: "${inputValue}"`}
          >
            <Plus className="h-4 w-4 bg-white rounded-full border border-jade-500" />
          </Button>
        )}
      </div>

      {/* Dropdown options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            <>
              {filteredOptions.map((option, index) => (
                <Button
                  key={option}
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => handleOptionClick(option)}
                  className={`w-full justify-start px-3 py-2 h-auto hover:bg-jade-50 focus:bg-jade-50 focus:outline-none ${
                    index === highlightedIndex ? "bg-jade-50" : ""
                  }`}
                >
                  {option}
                </Button>
              ))}

              {/* Add new option at bottom if applicable */}
              {showAddNewOption && (
                <>
                  <div className="border-t border-slate-200"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleAddNew}
                    className="w-full justify-start px-3 py-2 h-auto text-jade-600 hover:bg-jade-50 focus:bg-jade-50 focus:outline-none font-medium flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add "{inputValue}"
                  </Button>
                </>
              )}
            </>
          ) : (
            <div className="px-3 py-2 text-slate-500 text-sm">
              {showAddNewOption ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleAddNew}
                  className="w-full justify-start text-jade-600 hover:text-jade-700 font-medium flex items-center h-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add "{inputValue}"
                </Button>
              ) : (
                "No options found"
              )}
            </div>
          )}
        </div>
      )}

      {/* Show current custom value indicator */}
      {value && !options.includes(value) && (
        <p className="text-xs text-jade-600 mt-1 flex items-center">
          <Check className="h-3 w-3 mr-1" />
          Custom {label.toLowerCase()}: "{value}"
        </p>
      )}
    </div>
  );
};
