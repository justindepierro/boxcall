/**
 * PlayRecommendations Component
 * Phase 13.1: "What should I call right now?" display
 * Phase 13.2: Added coverage-specific stats display
 *
 * Shows top recommended plays for current game situation with:
 * - Overall recommendation score
 * - AI confidence + situation match breakdown
 * - Human-readable reasoning
 * - Quick stats (if available)
 * - Coverage-specific performance (Phase 13.2)
 */

import React from "react";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";
import type { PlayRecommendation } from "../../services/situationalRecommender";

interface PlayRecommendationsProps {
  recommendations: PlayRecommendation[];
  onSelectPlay?: (playId: string) => void;
  loading?: boolean;
  className?: string;
}

/**
 * PlayRecommendations - Display AI-powered play recommendations
 */
export const PlayRecommendations: React.FC<PlayRecommendationsProps> = ({
  recommendations,
  onSelectPlay,
  loading = false,
  className = "",
}) => {
  if (loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Icon name="loader" size="lg" className="animate-spin text-primary" />
        <Typography variant="body-sm" className="text-text-muted mt-2">
          Analyzing plays...
        </Typography>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div
        className={`text-center py-8 bg-surface-secondary rounded-lg border border-border ${className}`}
      >
        <Icon
          name="alert-circle"
          size="lg"
          className="text-text-muted mx-auto mb-2"
        />
        <Typography variant="body-sm" className="text-text-muted">
          No plays match this situation.
        </Typography>
        <Typography variant="body-xs" className="text-text-muted mt-1">
          Try adjusting your game plan or filters.
        </Typography>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Typography variant="headline-sm">Recommended Plays</Typography>
        <Typography variant="body-xs" className="text-text-muted">
          Top {recommendations.length} for this situation
        </Typography>
      </div>

      {recommendations.map((rec, index) => (
        <button
          key={rec.play.id}
          onClick={() => onSelectPlay?.(rec.play.id)}
          className="w-full text-left bg-surface-primary border border-border rounded-lg p-4 hover:bg-surface-secondary hover:border-primary transition-all cursor-pointer"
        >
          {/* Rank + Overall Score */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Rank Badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0
                    ? "bg-success text-white"
                    : index === 1
                      ? "bg-primary text-white"
                      : "bg-surface-secondary text-text-muted border border-border"
                }`}
              >
                {index + 1}
              </div>

              {/* Play Name */}
              <div>
                <Typography variant="body-md" className="font-medium">
                  {(rec.play as any).play_name ||
                    rec.play.formation ||
                    "Unknown Play"}
                </Typography>
                <div className="flex flex-wrap gap-2 mt-1">
                  {rec.play.formation && (
                    <span className="px-2 py-0.5 bg-surface-secondary border border-border rounded text-xs">
                      {rec.play.formation}
                    </span>
                  )}
                  {rec.play.play_type && (
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        rec.play.play_type === "pass"
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-success/20 text-success border border-success/30"
                      }`}
                    >
                      {rec.play.play_type.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <div className="text-right">
              <Typography variant="headline-sm" className="text-primary">
                {rec.overallScore}%
              </Typography>
              <Typography variant="body-xs" className="text-text-muted">
                Match Score
              </Typography>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 gap-3 mb-3 pt-3 border-t border-border">
            <div className="bg-surface-secondary rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <Typography variant="body-xs" className="text-text-muted">
                  AI Confidence
                </Typography>
                <Typography variant="body-xs" className="font-medium">
                  {rec.confidenceScore}%
                </Typography>
              </div>
              <div className="w-full bg-surface-primary rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    rec.confidenceScore >= 70
                      ? "bg-success"
                      : rec.confidenceScore >= 40
                        ? "bg-warning"
                        : "bg-error"
                  }`}
                  style={{ width: `${rec.confidenceScore}%` }}
                />
              </div>
            </div>

            <div className="bg-surface-secondary rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <Typography variant="body-xs" className="text-text-muted">
                  Situation Fit
                </Typography>
                <Typography variant="body-xs" className="font-medium">
                  {rec.situationMatchScore}%
                </Typography>
              </div>
              <div className="w-full bg-surface-primary rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    rec.situationMatchScore >= 70
                      ? "bg-success"
                      : rec.situationMatchScore >= 40
                        ? "bg-warning"
                        : "bg-error"
                  }`}
                  style={{ width: `${rec.situationMatchScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Reasoning */}
          {rec.reasoning.length > 0 && (
            <div className="space-y-1 mb-3">
              {rec.reasoning.map((reason, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Icon
                    name="check-circle"
                    size="sm"
                    className="text-success mt-0.5"
                  />
                  <Typography variant="body-xs" className="text-text-secondary">
                    {reason}
                  </Typography>
                </div>
              ))}
            </div>
          )}

          {/* Stats (if available) */}
          {rec.stats && rec.stats.executionCount > 0 && (
            <div className="flex items-center gap-4 pt-3 border-t border-border">
              <div>
                <Typography variant="body-xs" className="text-text-muted">
                  Success Rate
                </Typography>
                <Typography variant="body-sm" className="font-medium">
                  {rec.stats.successRate}%
                </Typography>
              </div>
              <div>
                <Typography variant="body-xs" className="text-text-muted">
                  Avg Yards
                </Typography>
                <Typography variant="body-sm" className="font-medium">
                  {rec.stats.avgYardsGained.toFixed(1)}
                </Typography>
              </div>
              <div>
                <Typography variant="body-xs" className="text-text-muted">
                  Executions
                </Typography>
                <Typography variant="body-sm" className="font-medium">
                  {rec.stats.executionCount}
                </Typography>
              </div>
            </div>
          )}

          {/* Phase 13.2: Coverage-Specific Stats */}
          {rec.coverageStats && rec.coverageStats.executionCount > 0 && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="shield" size="sm" className="text-primary" />
                <Typography
                  variant="body-xs"
                  className="text-text-muted font-medium"
                >
                  vs {rec.coverageStats.coverage}
                </Typography>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <Typography variant="body-xs" className="text-text-muted">
                    Success Rate
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className={`font-medium ${
                      rec.coverageStats.successRate >= 75
                        ? "text-success"
                        : rec.coverageStats.successRate >= 50
                          ? "text-warning"
                          : "text-error"
                    }`}
                  >
                    {rec.coverageStats.successRate.toFixed(0)}%
                  </Typography>
                </div>
                <div>
                  <Typography variant="body-xs" className="text-text-muted">
                    Avg Yards
                  </Typography>
                  <Typography variant="body-sm" className="font-medium">
                    {rec.coverageStats.avgYardsGained.toFixed(1)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body-xs" className="text-text-muted">
                    Plays
                  </Typography>
                  <Typography variant="body-sm" className="font-medium">
                    {rec.coverageStats.executionCount}
                  </Typography>
                </div>
              </div>

              {/* Warning for limited data */}
              {rec.coverageStats.executionCount < 3 && (
                <div className="flex items-center gap-1 mt-2">
                  <Icon
                    name="alert-triangle"
                    size="xs"
                    className="text-warning"
                  />
                  <Typography variant="body-xs" className="text-warning">
                    Limited data vs this coverage
                  </Typography>
                </div>
              )}
            </div>
          )}

          {/* Phase 13.3: Hash Preference Stats */}
          {rec.hashStats && rec.hashStats.bestHash && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="map-pin" size="sm" className="text-primary" />
                <Typography
                  variant="body-xs"
                  className="text-text-muted font-medium"
                >
                  Hash Preference
                </Typography>
              </div>

              {/* Current hash indicator */}
              {rec.hashStats.currentHash && (
                <div className="mb-2">
                  <Typography variant="body-xs" className="text-text-tertiary">
                    Current:{" "}
                    {rec.hashStats.currentHash.charAt(0).toUpperCase() +
                      rec.hashStats.currentHash.slice(1)}{" "}
                    Hash
                  </Typography>
                </div>
              )}

              {/* Hash stats grid */}
              <div className="grid grid-cols-3 gap-2">
                {(["left", "middle", "right"] as const).map((hash) => {
                  const stats = rec.hashStats![hash];
                  const isBest = rec.hashStats!.bestHash === hash;
                  const isCurrent = rec.hashStats!.currentHash === hash;

                  if (stats.executionCount === 0) return null;

                  return (
                    <div
                      key={hash}
                      className={`p-2 rounded border ${
                        isBest
                          ? "bg-success/10 border-success"
                          : isCurrent
                            ? "bg-primary/10 border-primary"
                            : "bg-surface-secondary border-border"
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Typography
                          variant="body-xs"
                          className={`font-medium ${
                            isBest ? "text-success" : "text-text-secondary"
                          }`}
                        >
                          {hash.charAt(0).toUpperCase() + hash.slice(1)}
                        </Typography>
                        {isBest && (
                          <Icon
                            name="star"
                            size="xs"
                            className="text-success"
                          />
                        )}
                      </div>
                      <Typography
                        variant="body-xs"
                        className={`font-medium ${
                          stats.successRate >= 75
                            ? "text-success"
                            : stats.successRate >= 50
                              ? "text-warning"
                              : "text-error"
                        }`}
                      >
                        {stats.successRate.toFixed(0)}%
                      </Typography>
                      <Typography
                        variant="body-xs"
                        className="text-text-tertiary"
                      >
                        ({stats.executionCount})
                      </Typography>
                    </div>
                  );
                })}
              </div>

              {/* Best hash indicator */}
              {rec.hashStats.bestHash &&
                rec.hashStats.currentHash &&
                rec.hashStats.bestHash !== rec.hashStats.currentHash &&
                rec.hashStats[rec.hashStats.bestHash].executionCount >= 3 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Icon name="info" size="xs" className="text-primary" />
                    <Typography variant="body-xs" className="text-primary">
                      Works best from {rec.hashStats.bestHash} hash (
                      {rec.hashStats[
                        rec.hashStats.bestHash
                      ].successRate.toFixed(0)}
                      %)
                    </Typography>
                  </div>
                )}
            </div>
          )}
        </button>
      ))}

      {/* Info Footer */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mt-4">
        <div className="flex items-start gap-2">
          <Icon name="lightbulb" size="sm" className="text-primary mt-0.5" />
          <Typography variant="body-xs" className="text-text-secondary">
            <strong>How it works:</strong> Recommendations combine AI confidence
            (70%) with situation fit (30%). Higher scores mean better match for
            this exact game context.
          </Typography>
        </div>
      </div>
    </div>
  );
};
