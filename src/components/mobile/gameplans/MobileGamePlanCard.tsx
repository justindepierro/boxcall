import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Typography } from "../../design-system/Typography";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";

interface GamePlanSituation {
  id: string;
  situationType: string;
  plays: { id: string; playId: string; playName: string }[];
}

interface MobileGamePlanCardProps {
  id: string;
  name: string;
  opponent?: string;
  gameDate?: Date | string;
  gameLocation?: "Home" | "Away" | "Neutral";
  situations: GamePlanSituation[];
  updatedAt: Date | string;
  isArchived?: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onExportPDF: () => void;
  onRestore?: () => void;
}

/**
 * Mobile-optimized Game Plan card
 *
 * Features:
 * - Large touch targets (min 44px)
 * - Clear visual hierarchy with opponent/date prominent
 * - Quick access to PDF export
 * - Situation/play count summary
 */
export const MobileGamePlanCard: React.FC<MobileGamePlanCardProps> = ({
  name,
  opponent,
  gameDate,
  gameLocation,
  situations,
  updatedAt,
  isArchived,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onExportPDF,
  onRestore,
}) => {
  const handleAction = (action: () => void, e?: React.MouseEvent) => {
    e?.stopPropagation();
    triggerHapticFeedback("light");
    action();
  };

  const totalPlays = situations.reduce((sum, sit) => sum + sit.plays.length, 0);
  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleDateString()
    : null;

  // Get location color
  const getLocationColor = () => {
    switch (gameLocation) {
      case "Home":
        return "bg-brand-jade text-white";
      case "Away":
        return "bg-purple-600 text-white";
      case "Neutral":
        return "bg-neutral-500 text-white";
      default:
        return "bg-neutral-200 dark:bg-neutral-700 text-secondary";
    }
  };

  if (isArchived) {
    return (
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 opacity-70">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Typography
              variant="body-md"
              className="text-secondary font-medium truncate"
            >
              {name}
            </Typography>
            <Typography variant="body-sm" className="text-muted mt-1">
              {totalPlays} plays • {opponent ? `vs ${opponent}` : "No opponent"}{" "}
              • Archived
            </Typography>
          </div>
          <button
            onClick={() => handleAction(onRestore || onArchive)}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-neutral-700 active:scale-95 transition-transform"
            aria-label="Restore plan"
          >
            <Icon name="inbox" className="w-5 h-5 text-brand-jade" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden active:shadow-md transition-shadow"
      onClick={() => handleAction(onEdit)}
    >
      {/* Main Content */}
      <div className="p-4">
        {/* Header with opponent badge */}
        <div className="flex items-start gap-3">
          {/* Plan Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Icon name="target" className="w-6 h-6 text-white" />
          </div>

          {/* Title & Opponent */}
          <div className="flex-1 min-w-0">
            <Typography
              variant="body-lg"
              className="text-primary font-semibold line-clamp-1"
            >
              {name}
            </Typography>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {opponent && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                  vs {opponent}
                </span>
              )}
              {gameLocation && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getLocationColor()}`}
                >
                  {gameLocation}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Date & Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="calendar" className="w-4 h-4" />
            {gameDate ? new Date(gameDate).toLocaleDateString() : "Date TBD"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="list" className="w-4 h-4" />
            {totalPlays} plays
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="grid" className="w-4 h-4" />
            {situations.length} situations
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800">
        {/* PDF Export - Primary Action + Updated timestamp */}
        <div className="flex flex-col">
          <button
            onClick={(e) => handleAction(onExportPDF, e)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-jade text-white font-medium text-sm active:scale-95 transition-transform"
            aria-label="Export PDF"
          >
            <Icon name="download" className="w-4 h-4" />
            Call Sheet
          </button>
          {updatedLabel && (
            <span className="mt-1 text-xs text-secondary text-left">
              Updated {updatedLabel}
            </span>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => handleAction(onEdit, e)}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all"
            aria-label="Edit"
          >
            <Icon name="edit" className="w-5 h-5 text-neutral-500" />
          </button>
          <button
            onClick={(e) => handleAction(onDuplicate, e)}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all"
            aria-label="Duplicate"
          >
            <Icon name="copy" className="w-5 h-5 text-neutral-500" />
          </button>
          <button
            onClick={(e) => handleAction(onArchive, e)}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all"
            aria-label="Archive"
          >
            <Icon name="folder" className="w-5 h-5 text-neutral-500" />
          </button>
          <button
            onClick={(e) => handleAction(onDelete, e)}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-error-50 dark:hover:bg-error-900/30 active:scale-95 transition-all"
            aria-label="Delete"
          >
            <Icon name="delete" className="w-5 h-5 text-error-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
