/**
 * ValidatedInput Component
 * 
 * Smart input field with:
 * - Real-time validation
 * - Visual feedback (green/yellow/red borders)
 * - Keyboard shortcuts (Enter to confirm)
 * - Fuzzy matching suggestions
 * - Confirmation dialogs for similar matches
 * - Auto-normalization
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  validateFormation,
  validatePlayName,
  validatePersonnel,
  type ValidationResult,
} from '../../utils/dataValidation';

interface ValidatedInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  type: 'formation' | 'playName' | 'personnel';
  existingValues: string[];
  className?: string;
  disabled?: boolean;
  onEnterPress?: () => void; // Callback when Enter is pressed
  autoFocus?: boolean;
  helperText?: string; // Additional help text below input
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder = '',
  required = false,
  type,
  existingValues,
  className = '',
  disabled = false,
  onEnterPress,
  autoFocus = false,
  helperText,
}) => {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Internal onChange handler to convert string to event
  const handleChange = (newValue: string) => {
    // Create a synthetic event to match parent's onChange signature
    const syntheticEvent = {
      target: { value: newValue },
      currentTarget: { value: newValue },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // Validate on value change (debounced)
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't validate empty input immediately
    if (!value) {
      setValidation(null);
      setShowSuggestions(false);
      return;
    }

    // INSTANT validation (no debounce) to encourage reusing existing values
    // This keeps our database Clean AF for analytics
    let result: ValidationResult;
    
    switch (type) {
      case 'formation':
        result = validateFormation(value, existingValues);
        break;
      case 'playName':
        result = validatePlayName(value, existingValues);
        break;
      case 'personnel':
        result = validatePersonnel(value, existingValues);
        break;
      default:
        return;
    }
    
    setValidation(result);
    
    // Show dropdown if there are suggestions (even with 1 character)
    if (result.suggestions && result.suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, existingValues, type]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If dropdown is open and has suggestions, apply first suggestion
      if (showSuggestions && validation?.suggestions && validation.suggestions.length > 0) {
        handleAcceptSuggestion(validation.suggestions[0].value);
        return;
      }
      
      // Otherwise, simulate save with visual feedback if valid
      if (value && validation?.state !== 'error') {
        handleSave();
      }
      
      // Call parent's onEnterPress if provided (move to next field)
      if (onEnterPress && validation?.state !== 'error') {
        onEnterPress();
      }
    }
    
    // Escape key - close dropdown or clear input
    if (e.key === 'Escape') {
      if (showSuggestions) {
        setShowSuggestions(false);
      } else {
        handleChange('');
        inputRef.current?.blur();
      }
    }
  };

  // Handle save with visual feedback
  const handleSave = () => {
    setIsSaving(true);
    
    // Show green pulse for 800ms
    setTimeout(() => {
      setIsSaving(false);
    }, 800);
  };

  // Accept suggestion from dropdown
  const handleAcceptSuggestion = (suggestion: string) => {
    handleChange(suggestion);
    setShowSuggestions(false);
    handleSave();
    
    // Move to next field after accepting suggestion
    if (onEnterPress) {
      setTimeout(() => onEnterPress(), 100);
    }
  };

  // Get border color based on validation state
  const getBorderColor = () => {
    if (isSaving) return 'border-green-500 ring-2 ring-green-500/50';
    if (!validation) return 'border-secondary';
    return validation.borderColor;
  };

  // Get message color
  const getMessageColor = () => {
    if (!validation) return 'text-muted';
    switch (validation.state) {
      case 'valid':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-muted';
    }
  };

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
          {required && ' *'}
        </label>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full border rounded-lg px-sm py-xs transition-all duration-200 ${getBorderColor()} focus:ring-2 focus:ring-text-info focus:border-bg-primary/0 disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        
        {/* Saving Indicator */}
        {isSaving && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-success-dark font-medium">Saved</span>
            </div>
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && validation?.suggestions && validation.suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-border-secondary rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            <div className="p-2">
              <p className="text-xs font-medium text-muted px-2 py-1 mb-1">
                {validation.state === 'warning' ? 'Similar matches found:' : 'Suggestions:'}
              </p>
              {validation.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAcceptSuggestion(suggestion.value)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-secondary transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium group-hover:text-text-accent transition-colors">
                      {suggestion.value}
                    </span>
                    <span className="text-xs text-muted bg-bg-muted px-2 py-0.5 rounded">
                      {suggestion.confidence}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && !validation?.message && (
        <p className="mt-1 text-xs text-muted">
          {helperText}
        </p>
      )}

      {/* Validation Message */}
      {validation?.message && !isSaving && !showSuggestions && (
        <p className={`mt-1 text-xs ${getMessageColor()} flex items-center gap-1`}>
          {validation.state === 'error' && '❌ '}
          {validation.state === 'warning' && '⚠️ '}
          {validation.state === 'valid' && '✅ '}
          {validation.message}
        </p>
      )}

      {/* Keyboard Hints (only when not showing validation message) */}
      {!disabled && !validation?.message && !helperText && (
        <p className="mt-1 text-xs text-muted">
          <kbd className="px-1 py-0.5 bg-bg-secondary rounded text-xs">Enter</kbd> to continue
          {' · '}
          <kbd className="px-1 py-0.5 bg-bg-secondary rounded text-xs">Esc</kbd> to clear
        </p>
      )}
    </div>
  );
};
