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
  // Icon-only variant (minimal for toolbars/mobile)
  if (variant === "icon-only") {
    return (
      <motion.button
        onClick={onToggle}
        className={`relative p-2.5 rounded-lg transition-all ${
          isActive
            ? "bg-success-bg text-success-text"
            : "bg-surface-muted text-secondary hover:bg-surface-subtle hover:text-primary"
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

  // Compact variant (smaller, inline with other controls)
  if (variant === "compact") {
    return (
      <motion.button
        onClick={onToggle}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-semibold ${
          isActive
            ? "bg-gradient-to-r from-green-500 to-green-600 text-white ring-2 ring-green-500/30 shadow-lg"
            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-600"
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

  // Default variant (prominent, standalone)
  return (
    <motion.button
      onClick={onToggle}
      className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
        isActive
          ? "bg-gradient-to-br from-green-500 to-green-600 text-white ring-4 ring-green-500/30 shadow-xl shadow-green-500/20"
          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md border-2 border-slate-200 dark:border-slate-600"
      } ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      aria-label={isActive ? "Exit selection mode" : "Enter selection mode"}
      aria-pressed={isActive}
    >
      {/* Checkbox Icon */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
          isActive
            ? "bg-white/20 text-white backdrop-blur-sm"
            : "bg-slate-100 dark:bg-slate-700 text-slate-400"
        }`}
      >
        <Icon name={isActive ? "check-circle" : "circle"} className="w-6 h-6" />
      </div>

      {/* Label & Count */}
      <div className="flex flex-col items-start">
        <Typography
          variant="body-sm"
          className={`font-bold ${
            isActive ? "text-white" : "text-slate-700 dark:text-slate-200"
          }`}
        >
          {isActive ? "Selection Mode ON" : label}
        </Typography>
        <Typography
          variant="body-xs"
          className={`${isActive ? "text-white/90" : "text-slate-500 dark:text-slate-400"}`}
        >
          {isActive && selectedCount > 0
            ? `${selectedCount} ${selectedCount === 1 ? "play" : "plays"} selected`
            : isActive
              ? "Tap plays to select them"
              : "Enable to select plays"}
        </Typography>
      </div>

      {/* Active Indicator Pulse */}
      {isActive && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow-lg"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
    </motion.button>
  );
};
