/**
 * PlayQualityIndicator Component
 *
 * Shows real-time data quality feedback for a play
 * Displays score, grade, and top recommendations
 *
 * Phase 2: Data Quality & Validation System
 */

import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Typography } from "../../design-system/Typography";
import type { DataQualityScore } from "../../../utils/dataQualityScoring";

interface PlayQualityIndicatorProps {
  score: DataQualityScore;
  className?: string;
  compact?: boolean; // Compact mode for modal footer
}

export const PlayQualityIndicator: React.FC<PlayQualityIndicatorProps> = ({
  score,
  className = "",
  compact = false,
}) => {
  // Determine color based on score
  const getScoreColor = () => {
    if (score.total >= 90) return "text-green-600";
    if (score.total >= 75) return "text-emerald-600";
    if (score.total >= 50) return "text-yellow-600";
    if (score.total >= 30) return "text-orange-600";
    return "text-red-600";
  };

  // Determine background color for score badge
  const getBadgeColor = () => {
    if (score.total >= 90)
      return "bg-green-100 text-green-800 border-green-300";
    if (score.total >= 75)
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (score.total >= 50)
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (score.total >= 30)
      return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  // Determine icon based on score
  const getIcon = ():
    | "check-circle"
    | "star"
    | "info"
    | "alert-triangle"
    | "warning" => {
    if (score.total >= 90) return "check-circle";
    if (score.total >= 75) return "star";
    if (score.total >= 50) return "info";
    if (score.total >= 30) return "alert-triangle";
    return "warning";
  };

  if (compact) {
    return (
      <div
        className={`flex items-center gap-sm ${className}`}
        role="status"
        aria-label={`Data quality score: ${score.total} out of 100, Grade ${score.grade}`}
      >
        <Icon
          name={getIcon()}
          size="sm"
          className={getScoreColor()}
          aria-hidden="true"
        />
        <Typography
          variant="body-sm"
          className="text-primary"
          data-testid="quality-score-label"
        >
          Data Quality:
        </Typography>
        <span
          className={`px-sm py-xs rounded-md border font-semibold text-sm ${getBadgeColor()}`}
          data-testid="quality-score-badge"
        >
          {score.total}/100 ({score.grade})
        </span>
        {score.completeness && (
          <Typography
            variant="body-xs"
            className="text-muted"
            data-testid="quality-completeness"
          >
            {score.completeness}
          </Typography>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-secondary border border-default rounded-lg p-md ${className}`}
      role="region"
      aria-label="Play data quality analysis"
    >
      {/* Header with Score */}
      <div className="flex items-center justify-between mb-sm">
        <div className="flex items-center gap-sm">
          <Icon
            name={getIcon()}
            size="md"
            className={getScoreColor()}
            aria-hidden="true"
          />
          <Typography variant="headline-sm" className="text-primary">
            Data Quality Score
          </Typography>
        </div>
        <div className="flex items-center gap-sm">
          <span
            className={`px-md py-sm rounded-md border font-bold text-lg ${getBadgeColor()}`}
            data-testid="quality-score-full"
          >
            {score.total}/100
          </span>
          <span
            className={`px-sm py-xs rounded-md bg-muted text-primary font-semibold text-sm`}
          >
            Grade: {score.grade}
          </span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-3 gap-sm mb-md">
        <div className="text-center">
          <Typography
            variant="body-sm"
            className="text-secondary mb-xs"
          >
            Required
          </Typography>
          <Typography
            variant="body-lg"
            className="font-semibold text-primary"
            data-testid="score-required"
          >
            {score.breakdown.required}/40
          </Typography>
        </div>
        <div className="text-center">
          <Typography
            variant="body-sm"
            className="text-secondary mb-xs"
          >
            Metadata
          </Typography>
          <Typography
            variant="body-lg"
            className="font-semibold text-primary"
            data-testid="score-metadata"
          >
            {score.breakdown.metadata}/30
          </Typography>
        </div>
        <div className="text-center">
          <Typography
            variant="body-sm"
            className="text-secondary mb-xs"
          >
            Advanced
          </Typography>
          <Typography
            variant="body-lg"
            className="font-semibold text-primary"
            data-testid="score-advanced"
          >
            {score.breakdown.advanced}/30
          </Typography>
        </div>
      </div>

      {/* Recommendations */}
      {score.recommendations.length > 0 && (
        <div className="border-t border-default pt-sm">
          <Typography
            variant="body-sm"
            className="text-primary font-semibold mb-xs"
          >
            💡 Suggestions to improve quality:
          </Typography>
          <ul className="space-y-xs">
            {score.recommendations.map((rec, index) => (
              <li
                key={index}
                className="flex items-start gap-xs text-sm text-secondary"
              >
                <Icon
                  name="chevron-right"
                  size="xs"
                  className="text-muted mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completeness Label */}
      <div className="mt-sm">
        <Typography variant="body-xs" className="text-muted text-center">
          Completeness: <strong>{score.completeness}</strong>
        </Typography>
      </div>
    </div>
  );
};
