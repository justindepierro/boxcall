import React from "react";
import { Icon, type IconName } from "../../ui/Icon/Icon";
import { Typography } from "../../design-system/Typography";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";

interface MobilePracticeCardProps {
  id: string;
  name: string;
  description?: string;
  playsCount: number;
  duration?: number;
  tags?: string[];
  updatedAt: Date | string;
  isArchived?: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onRestore?: () => void;
}

/**
 * Mobile-optimized Practice Script card
 * 
 * Features:
 * - Large touch targets (min 44px)
 * - Clear visual hierarchy
 * - Swipe actions for quick operations
 * - Compact but readable layout
 */
export const MobilePracticeCard: React.FC<MobilePracticeCardProps> = ({
  name,
  description,
  playsCount,
  duration = 120,
  tags = [],
  updatedAt,
  isArchived,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onRestore,
}) => {
  const handleAction = (action: () => void) => {
    triggerHapticFeedback("light");
    action();
  };

  if (isArchived) {
    return (
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 opacity-70">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Typography variant="body-md" className="text-secondary font-medium truncate">
              {name}
            </Typography>
            <Typography variant="body-sm" className="text-muted mt-1">
              {playsCount} plays • Archived
            </Typography>
          </div>
          <button
            onClick={() => handleAction(onRestore || onArchive)}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-neutral-700 active:scale-95 transition-transform"
            aria-label="Restore script"
          >
            <Icon name="inbox" className="w-5 h-5 text-brand-jade" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm active:shadow-md transition-shadow"
      onClick={() => handleAction(onEdit)}
    >
      {/* Main Content - Tappable */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <Icon name="file" className="w-6 h-6 text-white" />
          </div>
          
          {/* Title & Description */}
          <div className="flex-1 min-w-0">
            <Typography variant="body-lg" className="text-primary font-semibold line-clamp-1">
              {name}
            </Typography>
            {description && (
              <Typography variant="body-sm" className="text-secondary line-clamp-2 mt-0.5">
                {description}
              </Typography>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mt-3 text-sm text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="play" className="w-4 h-4" />
            {playsCount} plays
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" className="w-4 h-4" />
            {duration} min
          </span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 dark:border-neutral-800">
        <Typography variant="body-sm" className="text-muted">
          {new Date(updatedAt).toLocaleDateString()}
        </Typography>
        
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleAction(onEdit); }}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all"
            aria-label="Edit"
          >
            <Icon name="edit" className="w-5 h-5 text-neutral-500" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleAction(onDuplicate); }}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all"
            aria-label="Duplicate"
          >
            <Icon name="copy" className="w-5 h-5 text-neutral-500" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleAction(onArchive); }}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all"
            aria-label="Archive"
          >
            <Icon name="folder" className="w-5 h-5 text-neutral-500" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleAction(onDelete); }}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-error-50 dark:hover:bg-error-900/30 active:scale-95 transition-all"
            aria-label="Delete"
          >
            <Icon name="delete" className="w-5 h-5 text-error-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobilePracticeCard;
