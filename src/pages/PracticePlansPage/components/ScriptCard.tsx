/**
 * ScriptCard Component
 *
 * Card displaying a practice script with actions
 */

import React from "react";
import Icon from "../../../components/ui/Icon/Icon";
import { Typography } from "../../../components/design-system/Typography";
import type { ScriptCardProps } from "../types";

export const ScriptCard: React.FC<ScriptCardProps> = ({
  script,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  isArchived = false,
}) => {
  if (isArchived) {
    return (
      <div className="bg-muted/50 rounded-lg border border-border p-4 opacity-60">
        <div className="flex items-start justify-between mb-2">
          <Typography
            variant="body-md"
            className="text-secondary truncate flex-1"
          >
            {script.title || script.name || "Untitled Script"}
          </Typography>
          <button
            onClick={() => onArchive(script)}
            className="p-1 text-muted hover:text-primary rounded transition-colors"
            title="Restore script"
          >
            <Icon name="inbox" className="h-4 w-4" />
          </button>
        </div>
        <Typography variant="body-sm" className="text-muted">
          {script.plays?.length || 0} plays • Archived
        </Typography>
      </div>
    );
  }

  return (
    <div className="bg-primary rounded-2xl border border-border p-5 shadow-orange-md hover:shadow-orange-lg hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 hover:border-hover cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <Typography
            variant="headline-sm"
            className="text-primary font-semibold leading-tight line-clamp-2"
          >
            {script.title || script.name || "Untitled Script"}
          </Typography>
          {script.description && (
            <Typography
              variant="body-sm"
              className="text-secondary line-clamp-2"
            >
              {script.description}
            </Typography>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-secondary">
        <span className="inline-flex items-center gap-2">
          <Icon name="play" className="h-4 w-4" />
          {script.plays?.length || 0} plays
        </span>
        <span className="inline-flex items-center gap-2">
          <Icon name="clock" className="h-4 w-4" />
          {script.duration || 120} min
        </span>
      </div>

      {/* Tags */}
      {script.tags && script.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {script.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-orange-50 to-orange-100 text-orange-900 border border-orange-200"
            >
              {tag}
            </span>
          ))}
          {script.tags.length > 3 && (
            <span className="px-2 py-1 text-xs rounded bg-secondary text-muted">
              +{script.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Typography variant="body-sm" className="text-muted">
          {new Date(script.updatedAt).toLocaleDateString()}
        </Typography>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(script)}
            className="p-2 text-muted hover:text-primary hover:bg-secondary rounded transition-colors"
            title="Edit script"
          >
            <Icon name="edit" className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDuplicate(script)}
            className="p-2 text-muted hover:text-primary hover:bg-secondary rounded transition-colors"
            title="Duplicate script"
          >
            <Icon name="copy" className="h-4 w-4" />
          </button>
          <button
            onClick={() => onArchive(script)}
            className="p-2 text-muted hover:text-primary hover:bg-secondary rounded transition-colors"
            title="Archive script"
          >
            <Icon name="folder" className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(script.id)}
            className="p-2 text-muted hover:text-error-600 hover:bg-error-50 rounded transition-colors"
            title="Delete script"
          >
            <Icon name="delete" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

ScriptCard.displayName = "ScriptCard";
