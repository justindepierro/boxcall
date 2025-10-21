/**
 * StreakIndicator Component
 * Phase 12.3: Visual streak indicators for play performance
 */

import React from "react";
import { Typography } from "../design-system";
import type { ExecutionResult } from "../../types/session";

interface StreakIndicatorProps {
  current: number; // Positive = success streak, negative = failure streak
  isHot: boolean; // 3+ consecutive successes
  isCold: boolean; // 3+ consecutive failures
  last5Results?: ExecutionResult[];
  compact?: boolean;
  className?: string;
}

/**
 * StreakIndicator - Shows hot/cold streaks with visual flair
 *
 * Features:
 * - 🔥 Fire emoji for hot streaks (3+ successes)
 * - ❄️ Snowflake emoji for cold streaks (3+ failures)
 * - Last 5 results display (optional)
 * - Compact mode for inline display
 */
export const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  current,
  isHot,
  isCold,
  last5Results = [],
  compact = false,
  className = "",
}) => {
  // Don't render if no significant streak
  if (!isHot && !isCold) {
    return null;
  }

  // Get result icon
  const getResultIcon = (result: ExecutionResult): string => {
    switch (result) {
      case "success":
        return "✓";
      case "failure":
        return "✗";
      case "neutral":
        return "−";
      case "skipped":
        return "⊘";
      default:
        return "?";
    }
  };

  // Get result color
  const getResultColor = (result: ExecutionResult): string => {
    switch (result) {
      case "success":
        return "text-success";
      case "failure":
        return "text-error";
      case "neutral":
        return "text-text-muted";
      case "skipped":
        return "text-text-muted";
      default:
        return "text-text-muted";
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        {isHot && (
          <span className="text-lg" title={`${current} in a row!`}>
            🔥
          </span>
        )}
        {isCold && (
          <span
            className="text-lg"
            title={`${Math.abs(current)} failures in a row`}
          >
            ❄️
          </span>
        )}
        <Typography variant="body-xs" className="font-medium">
          {Math.abs(current)} in a row
        </Typography>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Streak Badge */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
          isHot
            ? "bg-success/10 border-success/30 text-success"
            : "bg-error/10 border-error/30 text-error"
        }`}
      >
        <span className="text-xl">{isHot ? "🔥" : "❄️"}</span>
        <div>
          <Typography
            variant="body-sm"
            className={`font-bold ${isHot ? "text-success" : "text-error"}`}
          >
            {isHot ? "Hot Streak!" : "Cold Streak"}
          </Typography>
          <Typography variant="body-xs" className="opacity-80">
            {Math.abs(current)} {isHot ? "successes" : "failures"} in a row
          </Typography>
        </div>
      </div>

      {/* Last 5 Results */}
      {last5Results.length > 0 && (
        <div className="flex items-center gap-2">
          <Typography variant="body-xs" className="text-text-muted">
            Last {last5Results.length}:
          </Typography>
          <div className="flex items-center gap-1">
            {last5Results.map((result, index) => (
              <span
                key={index}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${getResultColor(
                  result
                )} ${
                  result === "success"
                    ? "bg-success/10 border-success/30"
                    : result === "failure"
                      ? "bg-error/10 border-error/30"
                      : "bg-surface-secondary border-border"
                }`}
                title={result}
              >
                {getResultIcon(result)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
