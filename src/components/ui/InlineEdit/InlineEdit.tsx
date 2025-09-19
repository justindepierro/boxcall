import React, { useState, useRef, useEffect, useCallback } from "react";
import { Check, X } from "lucide-react";
import { Input } from "../Input";
import { IconButton } from "../IconButton/IconButton";
import { Typography } from "../../design-system";
import type { InlineEditProps, ValidationState } from "./InlineEdit.types";

/**
 * BoxCall InlineEdit Component
 *
 * Click-to-edit inline text component with jade/navy theme
 * Allows users to click on text to edit it inline, then confirm or cancel changes
 * Includes validation, animations, and mobile highlighting
 */
export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onChange,
  placeholder = "Click to edit...",
  disabled = false,
  size = "md",
  className = "",
  displayClassName = "",
  inputClassName = "",
  showButtons = false,
  confirmButton,
  cancelButton,
  onEditStart,
  onEditEnd,
  startOnClick = true,
  saveOnBlur = false,
  inputProps = {},
  validate,
  showMobileHighlight = false,
  onValidationChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [validationState, setValidationState] =
    useState<ValidationState>("default");
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<
    "success" | "error" | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update edit value when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Validate current edit value
  const validateValue = useCallback(
    (val: string) => {
      if (!validate) return true;
      return validate(val);
    },
    [validate]
  );

  // Update validation state when edit value changes
  useEffect(() => {
    if (isEditing && validate) {
      const isValid = validateValue(editValue);
      const newState: ValidationState = isValid ? "valid" : "invalid";
      setValidationState(newState);
      onValidationChange?.(isValid);
    } else {
      setValidationState("default");
    }
  }, [editValue, isEditing, validate, validateValue, onValidationChange]);

  const startEditing = useCallback(() => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
    setValidationState("default");
    setIsAnimating(false);
    setAnimationType(null);
    onEditStart?.();
  }, [disabled, value, onEditStart]);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
    setValidationState("default");
    onEditEnd?.();
  }, [onEditEnd]);

  const handleSave = useCallback(async () => {
    const isValid = validateValue(editValue);
    if (!isValid) {
      // Show error animation
      setAnimationType("error");
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationType(null);
      }, 500);
      return;
    }

    try {
      onChange(editValue);
      // Show success animation
      setAnimationType("success");
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationType(null);
        stopEditing();
      }, 600);
    } catch (_error) {
      // Show error animation
      setAnimationType("error");
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationType(null);
      }, 500);
    }
  }, [editValue, onChange, validateValue, stopEditing]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setValidationState("default");
    stopEditing();
  }, [value, stopEditing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  const handleBlur = useCallback(() => {
    if (saveOnBlur) {
      handleSave();
    } else {
      handleCancel();
    }
  }, [saveOnBlur, handleSave, handleCancel]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Get validation border classes
  const getValidationClasses = () => {
    switch (validationState) {
      case "valid":
        return "border-green-500 focus:border-green-600";
      case "invalid":
        return "border-red-500 focus:border-red-600";
      default:
        return "";
    }
  };

  // Get animation classes
  const getAnimationClasses = () => {
    if (!isAnimating) return "";

    switch (animationType) {
      case "success":
        return "animate-pulse bg-yellow-50 border-yellow-300";
      case "error":
        return "animate-bounce";
      default:
        return "";
    }
  };

  // Get mobile highlight classes
  const getMobileHighlightClasses = () => {
    if (!showMobileHighlight) return "";
    return "md:bg-transparent bg-gray-50 md:border-transparent border-gray-200";
  };

  if (isEditing) {
    return (
      <div
        className={`inline-flex items-center gap-2 ${className} ${getAnimationClasses()}`}
      >
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEditValue(e.target.value)
          }
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          size={size}
          className={`${inputClassName} ${getValidationClasses()}`}
          {...inputProps}
        />
        {showButtons && (
          <>
            {confirmButton || (
              <IconButton
                size="sm"
                variant="ghost"
                onClick={handleSave}
                disabled={validationState === "invalid"}
                className="text-green-600 hover:text-green-700"
                aria-label="Confirm changes"
              >
                <Check size={16} />
              </IconButton>
            )}
            {cancelButton || (
              <IconButton
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="text-red-600 hover:text-red-700"
                aria-label="Cancel changes"
              >
                <X size={16} />
              </IconButton>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-block cursor-pointer rounded px-1 py-0.5 transition-colors ${getMobileHighlightClasses()} ${className}`}
      onClick={startOnClick ? startEditing : undefined}
      role="button"
      tabIndex={startOnClick ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startEditing();
        }
      }}
    >
      <Typography variant="body" className={`select-none ${displayClassName}`}>
        {value || placeholder}
      </Typography>
    </div>
  );
};
