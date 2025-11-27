import React, { useState } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "@components/design-system/Typography";
import { Tooltip } from "../ui/Tooltip/Tooltip";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";

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
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectedCount === 0) return null;

  const handleAction = (action: string) => {
    triggerHapticFeedback("light");
    onBulkAction(action);
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    triggerHapticFeedback("light");
    onClearSelection();
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  const toggleExpanded = () => {
    triggerHapticFeedback("light");
    setIsExpanded(!isExpanded);
  };

  // Mobile: Floating Action Button with Expandable Menu
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/20 z-40 animate-in fade-in-0 duration-200"
            onClick={toggleExpanded}
          />
        )}

        {/* FAB Container */}
        <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3">
          {/* Expanded Action Menu */}
          {isExpanded && (
            <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
              {/* Action Buttons */}
              <button
                onClick={() => handleAction("add-tags")}
                className="flex items-center justify-end gap-3 group"
              >
                <span className="px-3 py-2 bg-surface-primary rounded-lg shadow-md text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Add Tags
                </span>
                <div className="w-12 h-12 bg-surface-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
                  <Icon name="tag" className="w-5 h-5 text-accent" />
                </div>
              </button>

              <button
                onClick={() => handleAction("duplicate")}
                className="flex items-center justify-end gap-3 group"
              >
                <span className="px-3 py-2 bg-surface-primary rounded-lg shadow-md text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Duplicate
                </span>
                <div className="w-12 h-12 bg-surface-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
                  <Icon name="copy" className="w-5 h-5 text-secondary" />
                </div>
              </button>

              <button
                onClick={() => handleAction("add-to-practice")}
                className="flex items-center justify-end gap-3 group"
              >
                <span className="px-3 py-2 bg-surface-primary rounded-lg shadow-md text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Add to Practice
                </span>
                <div className="w-12 h-12 bg-brand-jade rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
                  <Icon name="plus" className="w-5 h-5 text-white" />
                </div>
              </button>

              <button
                onClick={() => handleAction("batch-edit")}
                className="flex items-center justify-end gap-3 group"
              >
                <span className="px-3 py-2 bg-surface-primary rounded-lg shadow-md text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Edit Properties
                </span>
                <div className="w-12 h-12 bg-surface-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
                  <Icon name="edit" className="w-5 h-5 text-secondary" />
                </div>
              </button>

              <button
                onClick={() => handleAction("export")}
                className="flex items-center justify-end gap-3 group"
              >
                <span className="px-3 py-2 bg-surface-primary rounded-lg shadow-md text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Export
                </span>
                <div className="w-12 h-12 bg-surface-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
                  <Icon
                    name="download"
                    className="w-5 h-5 text-secondary"
                  />
                </div>
              </button>

              <button
                onClick={() => handleAction("delete")}
                className="flex items-center justify-end gap-3 group"
              >
                <span className="px-3 py-2 bg-surface-primary rounded-lg shadow-md text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Delete
                </span>
                <div className="w-12 h-12 bg-error-500 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
                  <Icon name="delete" className="w-5 h-5 text-white" />
                </div>
              </button>

              <button
                onClick={handleClear}
                className="flex items-center justify-end gap-3 group"
              >
                <span className="px-3 py-2 bg-surface-primary rounded-lg shadow-md text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Clear Selection
                </span>
                <div className="w-12 h-12 bg-surface-primary rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
                  <Icon name="close" className="w-5 h-5 text-muted" />
                </div>
              </button>
            </div>
          )}

          {/* Main FAB Button */}
          <button
            onClick={toggleExpanded}
            className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-all ${
              isExpanded ? "bg-error-500 rotate-45" : "bg-accent"
            }`}
          >
            {isExpanded ? (
              <Icon name="close" className="w-6 h-6 text-white" />
            ) : (
              <div className="flex flex-col items-center">
                <Icon name="menu" className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-error-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {selectedCount}
                </span>
              </div>
            )}
          </button>
        </div>
      </>
    );
  }

  // Desktop: Horizontal Toolbar
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-surface-primary rounded-lg shadow-lg border border-medium p-3 z-50">
      <div className="flex items-center space-x-4">
        {/* Selection Count */}
        <div className="flex items-center space-x-2">
          <Typography
            variant="body-sm"
            as="span"
            className="font-medium text-primary"
          >
            {selectedCount} play{selectedCount !== 1 ? "s" : ""} selected
          </Typography>
          <Tooltip content="Clear selection">
            <Button
              onClick={onClearSelection}
              variant="ghost"
              size="xs"
              icon={<Icon name="close" className="w-4 h-4" />}
              iconPosition="only"
              aria-label="Clear selection"
              className="text-muted hover:text-secondary [&_svg]:w-4 [&_svg]:h-4"
            />
          </Tooltip>
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
            className="text-secondary hover:text-primary"
            title="Add tags to selected plays"
          >
            Tag
          </Button>

          <Button
            onClick={() => onBulkAction("duplicate")}
            variant="ghost"
            size="sm"
            icon={<Icon name="copy" className="w-4 h-4" />}
            className="text-secondary hover:text-primary"
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
            className="text-secondary hover:text-primary"
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
