/**
 * InlineEditFieldDisplay - Display mode component for InlineEditField
 */
import React from "react";
import { Icon } from "../Icon/Icon";

interface InlineEditFieldDisplayProps {
  value: string;
  placeholder: string;
  disabled: boolean;
  isSaving: boolean;
  className: string;
  onStartEdit: () => void;
}

export const InlineEditFieldDisplay: React.FC<InlineEditFieldDisplayProps> = ({
  value,
  placeholder,
  disabled,
  isSaving,
  className,
  onStartEdit,
}) => {
  return (
    <div
      onClick={onStartEdit}
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
