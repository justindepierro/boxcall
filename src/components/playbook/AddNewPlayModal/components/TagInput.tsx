import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";

interface TagInputProps {
  label: string;
  tags: string[];
  newTagValue: string;
  onNewTagChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag?: (tag: string) => void;
  placeholder?: string;
  icon?: string;
  tagColor?: "info" | "success" | "warning" | "error";
  maxTags?: number;
  className?: string;
}

/**
 * TagInput - Reusable component for managing string arrays/tags
 *
 * Features:
 * - Display existing tags as badges
 * - Add new tags with Enter key or button
 * - Optional remove functionality
 * - Customizable tag colors
 * - Max tags limit
 * - Keyboard support (Enter, Escape)
 *
 * Used by: AdvancedOptionsSection (positions, players, flags)
 */
export const TagInput: React.FC<TagInputProps> = ({
  label,
  tags,
  newTagValue,
  onNewTagChange,
  onAddTag,
  onRemoveTag,
  placeholder = "Add...",
  icon,
  tagColor = "info",
  maxTags,
  className = "",
}) => {
  const getTagColorClasses = () => {
    const colors = {
      info: "bg-text-info/10 text-text-info border-text-info/20",
      success: "bg-text-success/10 text-text-success border-text-success/20",
      warning: "bg-text-warning/10 text-text-warning border-text-warning/20",
      error: "bg-text-error/10 text-text-error border-text-error/20",
    };
    return colors[tagColor];
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddTag();
    } else if (e.key === "Escape") {
      onNewTagChange("");
    }
  };

  const canAddMore = !maxTags || tags.length < maxTags;

  return (
    <div className={className}>
      <Typography
        variant="label-md"
        className="block mb-spacing-xs text-text-secondary"
      >
        {icon && (
          <Icon name={icon as any} className="h-4 w-4 mr-spacing-xs inline" />
        )}
        {label}
        {maxTags && (
          <Typography
            variant="caption"
            as="span"
            color="muted"
            className="ml-spacing-xs"
          >
            ({tags.length}/{maxTags})
          </Typography>
        )}
      </Typography>

      {/* Display existing tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-spacing-xs mb-spacing-xs">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`inline-flex items-center gap-spacing-xs px-spacing-xs py-spacing-xs text-xs rounded-full border ${getTagColorClasses()}`}
            >
              {tag}
              {onRemoveTag && (
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="hover:opacity-70 transition-opacity"
                  aria-label={`Remove ${tag}`}
                >
                  <Icon name="close" className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Add new tag input */}
      {canAddMore && (
        <div className="flex gap-spacing-xs">
          <input
            value={newTagValue}
            onChange={(e) => onNewTagChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-spacing-sm py-spacing-xs text-sm border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={onAddTag}
            disabled={!newTagValue.trim()}
          >
            Add
          </Button>
        </div>
      )}

      {!canAddMore && (
        <Typography variant="caption" color="muted" className="italic">
          Maximum {maxTags} tags reached
        </Typography>
      )}
    </div>
  );
};
