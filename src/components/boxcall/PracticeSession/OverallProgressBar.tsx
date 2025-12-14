/**
 * OverallProgressBar Component
 *
 * Displays overall session progress with enhanced styling
 *
 * NOTE: This component intentionally uses raw Tailwind colors for:
 * - Gradient effects (jade-*, emerald-*)
 * - Visual polish
 */

import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import type { OverallProgressBarProps } from "./types";

/**
 * Progress bar showing overall session completion
 */
export const OverallProgressBar: React.FC<OverallProgressBarProps> = ({
  progress,
}) => (
  <div className="mb-8 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-jade-100 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon name="trending-up" size="sm" className="text-jade-600" />
        <span className="text-secondary text-sm font-semibold uppercase tracking-wider">
          Overall Progress
        </span>
      </div>
      <span className="text-2xl font-black text-jade-600">
        {Math.round(progress)}%
      </span>
    </div>
    <div className="w-full bg-jade-100 rounded-full h-3 overflow-hidden">
      <div
        className="bg-gradient-to-r from-jade-500 via-emerald-400 to-jade-500 rounded-full h-3 transition-all duration-500 shadow-sm relative"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent" />
      </div>
    </div>
  </div>
);
