/**
 * PracticeToGameInsight Component
 * Phase 12.4: Shows practice-to-game transfer analytics
 */

import React from "react";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";

interface PracticeToGameInsightProps {
  practiceStats: {
    executions: number;
    successRate: number; // 0-100
  };
  gameStats: {
    executions: number;
    successRate: number; // 0-100
  };
  transferRate: number; // -100 to +100
  needsMorePractice: boolean;
  className?: string;
}

/**
 * PracticeToGameInsight - Compares practice vs game performance
 *
 * Features:
 * - Side-by-side practice/game stats
 * - Transfer rate indicator (positive/negative)
 * - Coaching recommendations
 * - Practice flags when needed
 */
export const PracticeToGameInsight: React.FC<PracticeToGameInsightProps> = ({
  practiceStats,
  gameStats,
  transferRate,
  needsMorePractice,
  className = "",
}) => {
  // Determine transfer quality
  const getTransferQuality = () => {
    if (transferRate >= 10) return "excellent";
    if (transferRate >= 0) return "good";
    if (transferRate >= -10) return "fair";
    return "poor";
  };

  const transferQuality = getTransferQuality();

  // Get coaching recommendation
  const getRecommendation = () => {
    if (practiceStats.executions < 10) {
      return "Run this play in more practice sessions to build consistency.";
    }
    if (transferRate < -20) {
      return "This play struggles in games despite practice success. Review game situations and player comfort.";
    }
    if (gameStats.successRate < 50 && practiceStats.successRate > 70) {
      return "Practice looks great, but game execution needs work. Focus on game-speed reps and situational awareness.";
    }
    if (transferRate >= 10) {
      return "Excellent transfer! Players execute this well under pressure.";
    }
    if (gameStats.executions === 0) {
      return "No game data yet. Use this in upcoming games to test real-world performance.";
    }
    return "Keep practicing and monitoring performance in both contexts.";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Typography variant="body-sm" className="font-medium">
          Practice ↔ Game Transfer
        </Typography>
        {needsMorePractice && (
          <span className="px-2 py-1 bg-warning/20 text-warning border border-warning/30 rounded text-xs font-medium">
            Needs Practice
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Practice Stats */}
        <div className="bg-secondary border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="target" size="sm" className="text-primary" />
            <Typography variant="body-xs" className="text-muted">
              Practice
            </Typography>
          </div>
          <Typography variant="headline-sm" className="mb-1">
            {practiceStats.successRate}%
          </Typography>
          <Typography variant="body-xs" className="text-muted">
            {practiceStats.executions} rep
            {practiceStats.executions !== 1 ? "s" : ""}
          </Typography>
        </div>

        {/* Game Stats */}
        <div className="bg-secondary border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="zap" size="sm" className="text-warning" />
            <Typography variant="body-xs" className="text-muted">
              Games
            </Typography>
          </div>
          <Typography variant="headline-sm" className="mb-1">
            {gameStats.successRate}%
          </Typography>
          <Typography variant="body-xs" className="text-muted">
            {gameStats.executions} play{gameStats.executions !== 1 ? "s" : ""}
          </Typography>
        </div>
      </div>

      {/* Transfer Rate */}
      {practiceStats.executions > 0 && gameStats.executions > 0 && (
        <div
          className={(() => {
            const base = "p-3 rounded-lg border ";
            if (transferQuality === "excellent")
              return `${base}bg-success/10 border-success/30`;
            if (transferQuality === "good")
              return `${base}bg-primary/10 border-primary/30`;
            if (transferQuality === "fair")
              return `${base}bg-warning/10 border-warning/30`;
            return `${base}bg-error/10 border-error/30`;
          })()}
        >
          <div className="flex items-center justify-between mb-2">
            <Typography variant="body-xs" className="font-medium">
              Transfer Rate
            </Typography>
            <Typography
              variant="body-xs"
              className={`font-bold ${
                transferRate >= 0 ? "text-success" : "text-error"
              }`}
            >
              {transferRate > 0 ? "+" : ""}
              {transferRate}%
            </Typography>
          </div>
          <div className="w-full bg-primary rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                transferRate >= 0 ? "bg-success" : "bg-error"
              }`}
              style={{
                width: `${Math.min(Math.abs(transferRate), 100)}%`,
              }}
            />
          </div>
          <Typography variant="body-xs" className="text-muted mt-2">
            {(() => {
              if (transferRate >= 10)
                return "🎯 Game performance exceeds practice";
              if (transferRate >= 0) return "✓ Good practice-to-game transfer";
              if (transferRate >= -10)
                return "⚠️ Slight drop in game situations";
              return "❌ Significant game execution gap";
            })()}
          </Typography>
        </div>
      )}

      {/* Coaching Recommendation */}
      <div className="bg-secondary border border-border rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Icon name="lightbulb" size="sm" className="text-warning mt-0.5" />
          <Typography variant="body-xs" className="text-secondary">
            <strong>Recommendation:</strong> {getRecommendation()}
          </Typography>
        </div>
      </div>
    </div>
  );
};
