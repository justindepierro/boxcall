import React from "react";
import { Icon } from "../../ui/Icon";
import { Typography } from "../../design-system/Typography";
import { motion } from "framer-motion";

export interface SelectionModeToggleProps {
  /**
   * Whether selection mode is currently active
   */
  isActive: boolean;

  /**
   * Callback when selection mode is toggled
   */
  onToggle: () => void;

  /**
   * Optional: Number of items currently selected
   */
  selectedCount?: number;

  /**
   * Optional: Custom label text
   */
  label?: string;

  /**
   * Optional: Variant style
   */
  variant?: "default" | "compact" | "icon-only";

  /**
   * Optional: Custom className
   */
  className?: string;
}

function IconOnlyToggle(props: {
  isActive: boolean;
  onToggle: () => void;
  selectedCount: number;
  className: string;
}) {
  const { isActive, onToggle, selectedCount, className } = props;
  return (
    <motion.button
      onClick={onToggle}
      className={`relative p-2.5 rounded-lg transition-all ${
        isActive
          ? "bg-success-bg text-success-text"
          : "bg-muted text-secondary hover:bg-subtle hover:text-primary"
      } ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isActive ? "Exit selection mode" : "Enter selection mode"}
      aria-pressed={isActive}
    >
      <Icon name={isActive ? "check-circle" : "circle"} className="w-5 h-5" />
      {selectedCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-success-text text-white text-xs font-semibold rounded-full flex items-center justify-center">
          {selectedCount > 9 ? "9+" : selectedCount}
        </span>
      )}
    </motion.button>
  );
}

function CompactToggle(props: {
  isActive: boolean;
  onToggle: () => void;
  selectedCount: number;
  label: string;
  className: string;
}) {
  const { isActive, onToggle, selectedCount, label, className } = props;
  return (
    <motion.button
      onClick={onToggle}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-semibold ${
        isActive
          ? "bg-gradient-to-r from-green-500 to-green-600 text-white ring-2 ring-green-500/30 shadow-lg"
          : "bg-white dark:bg-navy-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-navy-700 border-2 border-neutral-200 dark:border-navy-600"
      } ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      aria-label={isActive ? "Exit selection mode" : "Enter selection mode"}
      aria-pressed={isActive}
    >
      <Icon name={isActive ? "check-circle" : "circle"} className="w-5 h-5" />
      <Typography variant="body-sm" className="font-bold">
        {isActive && selectedCount > 0 ? `${selectedCount} selected` : label}
      </Typography>
      {isActive && selectedCount === 0 && (
        <motion.div
          className="w-2 h-2 bg-white rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
    </motion.button>
  );
}

function DefaultToggle(props: {
  isActive: boolean;
  onToggle: () => void;
  selectedCount: number;
  label: string;
  className: string;
}) {
  const { isActive, onToggle, selectedCount, label, className } = props;
  return (
    <motion.button
      onClick={onToggle}
      className={`relative flex items-center justify-between w-full px-5 py-4 rounded-xl transition-all ${
        isActive
          ? "bg-gradient-to-br from-jade-500 via-jade-600 to-emerald-600 text-white shadow-lg shadow-jade-500/30 hover:shadow-xl hover:shadow-jade-500/40"
          : "bg-white text-primary hover:bg-secondary shadow-md hover:shadow-lg border border-secondary hover:border-jade-300"
      } ${className}`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      aria-label={isActive ? "Exit selection mode" : "Enter selection mode"}
      aria-pressed={isActive}
    >
      <div className="flex items-center space-x-3 flex-1">
        {/* Checkbox Icon */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            isActive
              ? "bg-white/25 text-white shadow-lg"
              : "bg-gradient-to-br from-jade-50 to-jade-100 text-jade-600 border-2 border-jade-200"
          }`}
        >
          <Icon
            name={isActive ? "check-circle" : "circle"}
            className="w-6 h-6"
          />
        </div>

        {/* Label & Count */}
        <div className="flex flex-col items-start">
          <Typography
            variant="body-md"
            className={`font-bold ${isActive ? "text-white" : "text-primary"}`}
          >
            {label}
          </Typography>
          {isActive && selectedCount > 0 && (
            <Typography
              variant="body-xs"
              className="text-white/90 mt-0.5 font-medium"
            >
              Click to exit selection
            </Typography>
          )}
          {!isActive && (
            <Typography variant="body-xs" className="text-muted mt-0.5">
              Select multiple plays
            </Typography>
          )}
        </div>
      </div>

      {/* Selection Count Badge */}
      {isActive && selectedCount > 0 && (
        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
          <Typography variant="headline-sm" className="text-white font-bold">
            {selectedCount}
          </Typography>
          <Typography
            variant="body-xs"
            className="text-white/80 uppercase tracking-wider"
          >
            Selected
          </Typography>
        </div>
      )}
    </motion.button>
  );
}

/**
 * SelectionModeToggle - Standalone component to enable/disable selection mode
 *
 * Features:
 * - Clear visual indication of active/inactive state
 * - Shows selection count when active
 * - Multiple variants (default, compact, icon-only)
 * - Smooth animations
 * - Accessible with proper ARIA labels
 *
 * @example Default variant
 * ```tsx
 * <SelectionModeToggle
 *   isActive={enableBulkOperations}
 *   onToggle={() => dispatch({ type: "TOGGLE_BULK" })}
 *   selectedCount={selectedPlayIds.size}
 * />
 * ```
 *
 * @example Compact variant
 * ```tsx
 * <SelectionModeToggle
 *   isActive={isSelecting}
 *   onToggle={toggleSelectionMode}
 *   variant="compact"
 * />
 * ```
 *
 * @example Icon-only variant (for mobile)
 * ```tsx
 * <SelectionModeToggle
 *   isActive={isSelecting}
 *   onToggle={toggleSelectionMode}
 *   variant="icon-only"
 * />
 * ```
 */
export const SelectionModeToggle: React.FC<SelectionModeToggleProps> = ({
  isActive,
  onToggle,
  selectedCount = 0,
  label = "Select Plays",
  variant = "default",
  className = "",
}) => {
  switch (variant) {
    case "icon-only":
      return (
        <IconOnlyToggle
          isActive={isActive}
          onToggle={onToggle}
          selectedCount={selectedCount}
          className={className}
        />
      );
    case "compact":
      return (
        <CompactToggle
          isActive={isActive}
          onToggle={onToggle}
          selectedCount={selectedCount}
          label={label}
          className={className}
        />
      );
    default:
      return (
        <DefaultToggle
          isActive={isActive}
          onToggle={onToggle}
          selectedCount={selectedCount}
          label={label}
          className={className}
        />
      );
  }
};
