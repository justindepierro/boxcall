import React from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "@components/design-system/Typography";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkAction,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 surface-card rounded-lg shadow-lg border border-border-medium p-3 z-50">
      <div className="flex items-center space-x-4">
        {/* Selection Count */}
        <div className="flex items-center space-x-2">
          <Typography
            variant="body-sm"
            as="span"
            className="font-medium text-text-primary"
          >
            {selectedCount} play{selectedCount !== 1 ? "s" : ""} selected
          </Typography>
          <Button
            onClick={onClearSelection}
            variant="ghost"
            size="xs"
            icon={<Icon name="close" className="w-4 h-4" />}
            iconPosition="only"
            aria-label="Clear selection"
            className="text-text-muted hover:text-text-secondary [&_svg]:w-4 [&_svg]:h-4"
            title="Clear selection"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border-medium"></div>

        {/* Bulk Actions */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onBulkAction("add-tags")}
            variant="ghost"
            size="sm"
            icon={<Icon name="tag" className="w-4 h-4" />}
            className="text-text-secondary hover:text-text-primary"
            title="Add tags to selected plays"
          >
            Tag
          </Button>

          <Button
            onClick={() => onBulkAction("duplicate")}
            variant="ghost"
            size="sm"
            icon={<Icon name="copy" className="w-4 h-4" />}
            className="text-text-secondary hover:text-text-primary"
            title="Duplicate selected plays"
          >
            Duplicate
          </Button>

          <Button
            onClick={() => onBulkAction("add-to-practice")}
            variant="success"
            size="sm"
            icon={<Icon name="plus" className="w-4 h-4" />}
            title="Add to practice script"
          >
            Practice
          </Button>

          <Button
            onClick={() => onBulkAction("batch-edit")}
            variant="ghost"
            size="sm"
            icon={<Icon name="edit" className="w-4 h-4" />}
            title="Batch edit properties"
          >
            Edit
          </Button>

          <Button
            onClick={() => onBulkAction("export")}
            variant="ghost"
            size="sm"
            icon={<Icon name="download" className="w-4 h-4" />}
            className="text-text-secondary hover:text-text-primary"
            title="Export selected plays"
          >
            Export
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-border-medium"></div>

          <Button
            onClick={() => onBulkAction("delete")}
            variant="danger"
            size="sm"
            icon={<Icon name="delete" className="w-4 h-4" />}
            title="Delete selected plays"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
