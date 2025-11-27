/**
 * ExecutionNotes Component
 * Display notes and tags for a play execution (Phase 12.1)
 */

import React from "react";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";

interface ExecutionNotesProps {
  notes?: string;
  tags?: string[];
  className?: string;
  compact?: boolean; // For inline/condensed display
}

/**
 * ExecutionNotes - Shows notes and quick tags for an execution
 *
 * Features:
 * - Tag chips with consistent styling
 * - Optional compact mode for lists
 * - Icon indicator when notes exist
 */
export const ExecutionNotes: React.FC<ExecutionNotesProps> = ({
  notes,
  tags,
  className = "",
  compact = false,
}) => {
  // Don't render if no notes or tags
  if (!notes && (!tags || tags.length === 0)) {
    return null;
  }

  // Tag display names (convert kebab-case to Title Case)
  const formatTagLabel = (tagId: string): string => {
    return tagId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {notes && (
          <div className="flex items-center gap-1 text-muted">
            <Icon name="message-circle" size="sm" />
            <Typography variant="body-xs" className="italic line-clamp-1">
              {notes}
            </Typography>
          </div>
        )}
        {tags && tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Icon name="tag" size="sm" className="text-muted" />
            <Typography variant="body-xs" color="muted">
              {tags.length} tag{tags.length !== 1 ? "s" : ""}
            </Typography>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Tags */}
      {tags && tags.length > 0 && (
        <div>
          <Typography variant="body-xs" color="muted" className="mb-1">
            Tags:
          </Typography>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-surface-secondary border border-border rounded-full text-xs"
              >
                {formatTagLabel(tag)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div>
          <Typography variant="body-xs" color="muted" className="mb-1">
            Notes:
          </Typography>
          <div className="bg-surface-secondary border border-border rounded-lg p-2">
            <Typography variant="body-xs" className="text-secondary">
              {notes}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};
