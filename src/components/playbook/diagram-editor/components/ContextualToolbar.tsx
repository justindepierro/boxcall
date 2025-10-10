import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@components/ui/Icon";
import type { Player } from "@components/playbook/diagram-editor/types/Player";

interface ContextualToolbarProps {
  /** Selected players */
  selectedPlayers: Player[];

  /** Called when "Select All" is clicked (0 selected) */
  onSelectAll?: () => void;

  /** Called when "Flip Side" is clicked (1+ selected) */
  onFlipSide?: () => void;

  /** Called when "Align" is clicked (2+ selected) */
  onAlign?: () => void;

  /** Called when "Distribute" is clicked (3+ selected) */
  onDistribute?: () => void;

  /** Called when "Copy" is clicked (1+ selected) */
  onCopy?: () => void;

  /** Called when "Delete" is clicked (1+ selected) */
  onDelete?: () => void;

  /** Called when "Deselect All" is clicked (1+ selected) */
  onDeselectAll?: () => void;
}

/**
 * ContextualToolbar - Smart toolbar that adapts to selection state
 *
 * Selection States:
 * - 0 selected: Show "Select All"
 * - 1 selected: Show Flip, Copy, Delete, Deselect
 * - 2+ selected: Show Flip, Align, Copy, Delete, Deselect
 * - 3+ selected: Add "Distribute" action
 *
 * Features:
 * - Appears above keyboard safe area
 * - Smooth slide-up animation
 * - Context-aware actions
 * - Touch-optimized 44px targets
 */
export const ContextualToolbar: React.FC<ContextualToolbarProps> = ({
  selectedPlayers,
  onSelectAll,
  onFlipSide,
  onAlign,
  onDistribute,
  onCopy,
  onDelete,
  onDeselectAll,
}) => {
  const selectedCount = selectedPlayers.length;
  const isVisible = selectedCount >= 0; // Always visible for now

  // Different toolbar configs based on selection count
  const getToolbarConfig = () => {
    if (selectedCount === 0) {
      return {
        title: "No Selection",
        actions: [
          {
            icon: "target" as const,
            label: "Select All",
            onClick: onSelectAll,
            variant: "default" as const,
          },
        ],
      };
    }

    if (selectedCount === 1) {
      return {
        title: "1 Player Selected",
        actions: [
          {
            icon: "move" as const,
            label: "Flip",
            onClick: onFlipSide,
            variant: "default" as const,
          },
          {
            icon: "copy" as const,
            label: "Copy",
            onClick: onCopy,
            variant: "default" as const,
          },
          {
            icon: "delete" as const,
            label: "Delete",
            onClick: onDelete,
            variant: "danger" as const,
          },
          {
            icon: "close" as const,
            label: "Deselect",
            onClick: onDeselectAll,
            variant: "default" as const,
          },
        ],
      };
    }

    if (selectedCount === 2) {
      return {
        title: "2 Players Selected",
        actions: [
          {
            icon: "move" as const,
            label: "Flip",
            onClick: onFlipSide,
            variant: "default" as const,
          },
          {
            icon: "grid" as const,
            label: "Align",
            onClick: onAlign,
            variant: "default" as const,
          },
          {
            icon: "copy" as const,
            label: "Copy",
            onClick: onCopy,
            variant: "default" as const,
          },
          {
            icon: "delete" as const,
            label: "Delete",
            onClick: onDelete,
            variant: "danger" as const,
          },
          {
            icon: "close" as const,
            label: "Deselect",
            onClick: onDeselectAll,
            variant: "default" as const,
          },
        ],
      };
    }

    // 3+ selected
    return {
      title: `${selectedCount} Players Selected`,
      actions: [
        {
          icon: "move" as const,
          label: "Flip",
          onClick: onFlipSide,
          variant: "default" as const,
        },
        {
          icon: "grid" as const,
          label: "Align",
          onClick: onAlign,
          variant: "default" as const,
        },
        {
          icon: "arrow-right" as const,
          label: "Distribute",
          onClick: onDistribute,
          variant: "default" as const,
        },
        {
          icon: "copy" as const,
          label: "Copy",
          onClick: onCopy,
          variant: "default" as const,
        },
        {
          icon: "delete" as const,
          label: "Delete",
          onClick: onDelete,
          variant: "danger" as const,
        },
        {
          icon: "close" as const,
          label: "Deselect",
          onClick: onDeselectAll,
          variant: "default" as const,
        },
      ],
    };
  };

  const config = getToolbarConfig();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
          }}
          className="fixed bottom-20 left-0 right-0 z-30 px-4 pb-4 pointer-events-none"
        >
          <div className="max-w-lg mx-auto pointer-events-auto">
            {/* Toolbar Card */}
            <div className="bg-surface-primary border border-border rounded-2xl shadow-xl overflow-hidden">
              {/* Title Bar */}
              <div className="px-4 py-2 bg-surface-secondary border-b border-border">
                <p className="text-xs font-medium text-secondary text-center">
                  {config.title}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-around px-2 py-3">
                {config.actions.map((action, index) => {
                  const isDisabled = !action.onClick;
                  const isDanger = action.variant === "danger";

                  return (
                    <button
                      key={`${action.label}-${index}`}
                      onClick={action.onClick}
                      disabled={isDisabled}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors touch-manipulation min-w-15
                        ${
                          isDisabled
                            ? "opacity-40 cursor-not-allowed"
                            : isDanger
                              ? "hover:bg-error-bg/20 active:bg-error-bg/40"
                              : "hover:bg-surface-secondary active:bg-surface-tertiary"
                        }
                      `}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDanger
                            ? "bg-error-bg"
                            : "bg-primary/10"
                        }`}
                      >
                        <Icon
                          name={action.icon}
                          size="sm"
                          className={
                            isDanger ? "text-error-fg" : "text-primary"
                          }
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isDanger ? "text-error-fg" : "text-primary"
                        }`}
                      >
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
