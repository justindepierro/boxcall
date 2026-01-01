import { memo, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Icon } from "../../ui/Icon/Icon";
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
 * - Memoized for performance
 */
function MobilePracticeCardInner({
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
}: MobilePracticeCardProps) {
  // Memoized action handler with haptic feedback
  const handleAction = useCallback(
    (e: React.MouseEvent | undefined, action: () => void) => {
      e?.stopPropagation();
      triggerHapticFeedback("light");
      action();
    },
    []
  );

  // Memoized handlers for each action
  const handleEdit = useCallback(
    (e?: React.MouseEvent) => handleAction(e, onEdit),
    [handleAction, onEdit]
  );
  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => handleAction(e, onDuplicate),
    [handleAction, onDuplicate]
  );
  const handleArchive = useCallback(
    (e: React.MouseEvent) => handleAction(e, onArchive),
    [handleAction, onArchive]
  );
  const handleDelete = useCallback(
    (e: React.MouseEvent) => handleAction(e, onDelete),
    [handleAction, onDelete]
  );
  const handleRestore = useCallback(
    (e?: React.MouseEvent) => handleAction(e, onRestore || onArchive),
    [handleAction, onRestore, onArchive]
  );

  // Memoized formatted date
  const formattedDate = useMemo(
    () => new Date(updatedAt).toLocaleDateString(),
    [updatedAt]
  );

  // Memoized visible tags (max 3)
  const visibleTags = useMemo(() => tags.slice(0, 3), [tags]);
  const extraTagCount = useMemo(
    () => (tags.length > 3 ? tags.length - 3 : 0),
    [tags.length]
  );

  if (isArchived) {
    return (
      <motion.div
        className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 opacity-70"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Typography
              variant="body-md"
              className="text-secondary font-medium truncate"
            >
              {name}
            </Typography>
            <Typography variant="body-sm" className="text-muted mt-1">
              {playsCount} plays • Archived
            </Typography>
          </div>
          <motion.button
            onClick={handleRestore}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-neutral-700 transition-transform touch-manipulation"
            aria-label="Restore script"
          >
            <Icon
              name="inbox"
              className="w-5 h-5 text-brand-jade"
              aria-hidden="true"
            />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-surface-primary dark:bg-neutral-900 rounded-xl border border-border shadow-sm active:shadow-md transition-shadow"
      onClick={() => handleEdit()}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      role="article"
      aria-label={`Practice script: ${name}`}
    >
      {/* Main Content - Tappable */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-jade-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-jade-500/25">
            <Icon
              name="file"
              className="w-6 h-6 text-white"
              aria-hidden="true"
            />
          </div>

          {/* Title & Description */}
          <div className="flex-1 min-w-0">
            <Typography
              variant="body-lg"
              className="text-primary font-semibold line-clamp-1"
            >
              {name}
            </Typography>
            {description && (
              <Typography
                variant="body-sm"
                className="text-secondary line-clamp-2 mt-0.5"
              >
                {description}
              </Typography>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mt-3 text-sm text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="play" className="w-4 h-4" aria-hidden="true" />
            {playsCount} plays
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" className="w-4 h-4" aria-hidden="true" />
            {duration} min
          </span>
        </div>

        {/* Tags */}
        {visibleTags.length > 0 && (
          <div
            className="flex flex-wrap gap-2 mt-3"
            role="list"
            aria-label="Tags"
          >
            {visibleTags.map((tag, idx) => (
              <span
                key={idx}
                role="listitem"
                className="px-2 py-0.5 text-xs rounded-full bg-jade-50 dark:bg-jade-900/30 text-jade-700 dark:text-jade-400"
              >
                {tag}
              </span>
            ))}
            {extraTagCount > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted">
                +{extraTagCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <Typography variant="body-sm" className="text-muted">
          {formattedDate}
        </Typography>

        <div
          className="flex items-center gap-0.5"
          role="group"
          aria-label="Card actions"
        >
          <motion.button
            onClick={handleEdit}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all touch-manipulation"
            aria-label="Edit script"
          >
            <Icon
              name="edit"
              className="w-5 h-5 text-neutral-500"
              aria-hidden="true"
            />
          </motion.button>
          <motion.button
            onClick={handleDuplicate}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all touch-manipulation"
            aria-label="Duplicate script"
          >
            <Icon
              name="copy"
              className="w-5 h-5 text-neutral-500"
              aria-hidden="true"
            />
          </motion.button>
          <motion.button
            onClick={handleArchive}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all touch-manipulation"
            aria-label="Archive script"
          >
            <Icon
              name="folder"
              className="w-5 h-5 text-neutral-500"
              aria-hidden="true"
            />
          </motion.button>
          <motion.button
            onClick={handleDelete}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-error-50 dark:hover:bg-error-900/30 transition-all touch-manipulation"
            aria-label="Delete script"
          >
            <Icon
              name="delete"
              className="w-5 h-5 text-error-500"
              aria-hidden="true"
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Export memoized component for performance
export const MobilePracticeCard = memo(MobilePracticeCardInner);
