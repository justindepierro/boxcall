/**
 * ComplexityBadge Component
 *
 * Week 3 Gamification: Displays play complexity analysis with achievement psychology
 * Shows coaches their skill progression and encourages them to attempt more complex designs
 */

import React from "react";
import { Badge } from "./Badge";
import {
  analyzePlayComplexity,
  getComplexityBadgeInfo,
  type ComplexityMetrics,
} from "../../../utils/playComplexity";
import type { Play } from "../../../types/play";

interface ComplexityBadgeProps {
  /** Play to analyze for complexity */
  play?: Play;

  /** Pre-calculated metrics (for performance) */
  metrics?: ComplexityMetrics;

  /** Show detailed breakdown on hover */
  showDetails?: boolean;

  /** Size variant */
  size?: "sm" | "md" | "lg";

  /** Custom click handler */
  onClick?: () => void;
}

export const ComplexityBadge: React.FC<ComplexityBadgeProps> = ({
  play,
  metrics,
  showDetails = true,
  size = "md",
  onClick,
}) => {
  // Calculate complexity if not provided
  const complexity = metrics || (play ? analyzePlayComplexity(play) : null);

  if (!complexity) return null;

  const badgeInfo = getComplexityBadgeInfo(complexity.badge);

  return (
    <div className="relative group">
      <Badge
        variant={
          badgeInfo.color as
            | "urgency"
            | "achievement"
            | "information"
            | "attention"
            | "premium"
        }
        size={size}
        onClick={onClick}
        className="cursor-pointer hover:scale-105 transition-transform"
      >
        <span className="flex items-center gap-1">
          {badgeInfo.icon}
          {badgeInfo.title}
        </span>
      </Badge>

      {showDetails && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="bg-gray-900 text-text-inverse text-xs rounded-lg p-3 shadow-lg min-w-48">
            <div className="text-center mb-2">
              <div className="font-semibold">{badgeInfo.title}</div>
              <div className="text-gray-300">{badgeInfo.description}</div>
            </div>

            <div className="border-t border-gray-700 pt-2 space-y-1">
              <div className="flex justify-between">
                <span>Routes/Concept:</span>
                <span className="font-mono">{complexity.routeCount}pts</span>
              </div>
              <div className="flex justify-between">
                <span>Formation:</span>
                <span className="font-mono">
                  {complexity.formationComplexity}pts
                </span>
              </div>
              <div className="flex justify-between">
                <span>Personnel:</span>
                <span className="font-mono">
                  {complexity.personnelVariety}pts
                </span>
              </div>
              <div className="flex justify-between">
                <span>Execution:</span>
                <span className="font-mono">
                  {complexity.conceptDifficulty}pts
                </span>
              </div>
              <div className="border-t border-gray-700 pt-1 flex justify-between font-semibold">
                <span>Total Score:</span>
                <span className="font-mono">{complexity.totalScore}pts</span>
              </div>
            </div>

            {/* Progress indicator for next level */}
            <ComplexityProgress complexity={complexity} />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Shows progress toward next complexity level
 */
const ComplexityProgress: React.FC<{ complexity: ComplexityMetrics }> = ({
  complexity,
}) => {
  const levelThresholds = [
    { min: 0, max: 25, next: 26, name: "Intermediate" },
    { min: 26, max: 50, next: 51, name: "Advanced" },
    { min: 51, max: 75, next: 76, name: "Expert" },
    { min: 76, max: 90, next: 91, name: "Innovative" },
    { min: 91, max: 100, next: null, name: "Master" },
  ];

  const currentLevel = levelThresholds.find(
    (level) =>
      complexity.totalScore >= level.min && complexity.totalScore <= level.max
  );

  if (!currentLevel || !currentLevel.next) return null;

  const pointsToNext = currentLevel.next - complexity.totalScore;
  const progressPercent =
    ((complexity.totalScore - currentLevel.min) /
      (currentLevel.next - currentLevel.min)) *
    100;

  return (
    <div className="border-t border-gray-700 pt-2 mt-2">
      <div className="text-xs text-gray-300 mb-1">
        Next: {currentLevel.name} ({pointsToNext} points to go)
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div
          className="bg-jade-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>
    </div>
  );
};
