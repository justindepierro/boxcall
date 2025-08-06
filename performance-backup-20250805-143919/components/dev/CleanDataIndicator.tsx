/**
 * Clean Data Indicator - Phase 3 Implementation
 *
 * Simple, clear indicator that shows users what data they're currently viewing.
 * Removes confusion about whether they're seeing real or mock data.
 *
 * @version 3.0.0 - Phase 3 Clean Dev Modes
 * @author BoxCall Development Team
 */

import React from "react";
import {
  useCleanTeamDataSource,
  useCleanRoleContext,
  useCleanDevTools,
} from "../../app/dev-mode-hooks-clean";

interface CleanDataIndicatorProps {
  className?: string;
}

export const CleanDataIndicator: React.FC<CleanDataIndicatorProps> = ({
  className = "",
}) => {
  const { getDataSourceIndicator, description } = useCleanTeamDataSource();
  const roleContext = useCleanRoleContext();
  const { shouldShowDataIndicator, isProductionMode } = useCleanDevTools();

  // Don't show in production mode
  if (isProductionMode || !shouldShowDataIndicator) {
    return null;
  }

  // Don't show in actual production builds
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div
      className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 ${className}`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
          🔍 Development Mode Active
        </span>
      </div>

      <div className="mt-2 space-y-1 text-xs text-blue-700 dark:text-blue-300">
        <div className="flex items-center justify-between">
          <span>Data Source:</span>
          <span className="font-medium">{getDataSourceIndicator()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Testing Role:</span>
          <span className="font-medium">{roleContext.displayName}</span>
        </div>

        <div className="text-blue-600 dark:text-blue-400 mt-2 italic">
          {description}
        </div>
      </div>
    </div>
  );
};
