/**
 * ConfidenceBreakdown Component
 * Phase 12.2: Shows detailed explanation of AI confidence scores
 */

import React from "react";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";
import type { ConfidenceScore } from "../../services/playConfidenceService";
import { StreakIndicator } from "./StreakIndicator";
import { PracticeToGameInsight } from "./PracticeToGameInsight";

interface ConfidenceBreakdownProps {
  confidence: ConfidenceScore;
  playName: string;
  onClose: () => void;
}

/**
 * ConfidenceBreakdown - Modal that explains how confidence score was calculated
 *
 * Shows:
 * - Overall score with recommendation
 * - Each component (historical, situational, recent, practice)
 * - Weights applied to each component
 * - Execution count and data quality warnings
 */
export const ConfidenceBreakdown: React.FC<ConfidenceBreakdownProps> = ({
  confidence,
  playName,
  onClose,
}) => {
  const { overallScore, breakdown, executionCount, recommendation } =
    confidence;

  // Component definitions with weights
  const components = [
    {
      name: "Historical Success",
      score: breakdown.historicalSuccess,
      weight: 40,
      description: "All-time success rate across all situations",
      icon: "bar-chart" as const,
    },
    {
      name: "Situational Success",
      score: breakdown.situationalSuccess,
      weight: 30,
      description: "Success rate in similar game situations",
      icon: "target" as const,
    },
    {
      name: "Recent Trend",
      score: breakdown.recentTrend,
      weight: 20,
      description: "Performance in last 10-20 executions",
      icon: "trending-up" as const,
    },
    {
      name: "Practice Quality",
      score: breakdown.practiceQuality,
      weight: 10,
      description: "Quality of practice reps",
      icon: "check-circle" as const,
    },
  ];

  // Calculate weighted contributions
  const contributions = components.map((c) => ({
    ...c,
    contribution: (c.score * c.weight) / 100,
  }));

  // Data quality assessment
  const hasLowData = executionCount < 5;
  const hasModerateData = executionCount >= 5 && executionCount < 15;
  const hasGoodData = executionCount >= 15;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-backdrop p-4">
      <div className="bg-primary border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primary border-b border-border p-4 flex items-start justify-between">
          <div className="flex-1">
            <Typography variant="headline-sm" className="mb-1">
              AI Confidence Breakdown
            </Typography>
            <Typography variant="body-sm" color="muted">
              {playName}
            </Typography>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary transition-colors"
          >
            <Icon name="x-circle" size="md" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Score */}
          <div className="bg-secondary border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <Typography variant="body-md" className="font-medium">
                Overall Confidence
              </Typography>
              <div className="flex items-center gap-2">
                <Typography variant="headline-lg" className="font-bold">
                  {overallScore}%
                </Typography>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    recommendation === "high"
                      ? "bg-success/20 text-success"
                      : recommendation === "medium"
                        ? "bg-warning/20 text-warning"
                        : "bg-error/20 text-error"
                  }`}
                >
                  {recommendation.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="w-full bg-primary rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  overallScore >= 70
                    ? "bg-success"
                    : overallScore >= 40
                      ? "bg-warning"
                      : "bg-error"
                }`}
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>

          {/* Data Quality Warning */}
          {hasLowData && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon
                  name="alert-circle"
                  size="md"
                  className="text-warning mt-0.5"
                />
                <div>
                  <Typography variant="body-sm" className="font-medium mb-1">
                    Limited Data Available
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    This play has only been executed {executionCount} time
                    {executionCount !== 1 ? "s" : ""}. Confidence scores improve
                    with more data. Run this play 10-15+ times for reliable
                    recommendations.
                  </Typography>
                </div>
              </div>
            </div>
          )}

          {hasModerateData && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="info" size="md" className="text-primary mt-0.5" />
                <div>
                  <Typography variant="body-sm" className="font-medium mb-1">
                    Moderate Data Quality
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    Based on {executionCount} executions. Confidence will
                    improve with 5-10 more runs.
                  </Typography>
                </div>
              </div>
            </div>
          )}

          {/* Component Breakdown */}
          <div>
            <Typography variant="body-md" className="font-medium mb-4">
              How We Calculated This Score
            </Typography>

            <div className="space-y-4">
              {contributions.map((component) => (
                <div
                  key={component.name}
                  className="bg-secondary border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon
                        name={component.icon}
                        size="sm"
                        className="text-primary"
                      />
                      <Typography variant="body-sm" className="font-medium">
                        {component.name}
                      </Typography>
                      <span className="px-2 py-0.5 bg-primary border border-border rounded text-xs">
                        {component.weight}% weight
                      </span>
                    </div>
                    <Typography variant="body-sm" className="font-medium">
                      {component.score}%
                    </Typography>
                  </div>

                  <Typography variant="body-xs" className="text-secondary mb-2">
                    {component.description}
                  </Typography>

                  {/* Progress bar */}
                  <div className="w-full bg-primary rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${
                        component.score >= 70
                          ? "bg-success"
                          : component.score >= 40
                            ? "bg-warning"
                            : "bg-error"
                      }`}
                      style={{ width: `${component.score}%` }}
                    />
                  </div>

                  {/* Contribution calculation */}
                  <Typography variant="body-xs" className="text-muted">
                    Contributes: {component.score}% × {component.weight}% weight
                    ={" "}
                    <span className="font-medium text-primary">
                      {component.contribution.toFixed(1)} points
                    </span>
                  </Typography>
                </div>
              ))}
            </div>
          </div>

          {/* Math Summary */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <Typography variant="body-sm" className="font-medium mb-2">
              Final Calculation
            </Typography>
            <div className="space-y-1">
              {contributions.map((c, i) => (
                <Typography
                  key={c.name}
                  variant="body-xs"
                  className="text-secondary"
                >
                  {i > 0 && "+ "}
                  {c.contribution.toFixed(1)} ({c.name})
                </Typography>
              ))}
              <div className="border-t border-border my-2" />
              <Typography variant="body-sm" className="font-medium">
                = {overallScore}% Overall Confidence
              </Typography>
            </div>
          </div>

          {/* Streak Tracker (Phase 12.3) */}
          {confidence.streak &&
            (confidence.streak.isHot || confidence.streak.isCold) && (
              <div className="bg-secondary border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="activity" size="sm" className="text-muted" />
                  <Typography variant="body-sm" className="font-medium">
                    Current Streak
                  </Typography>
                </div>
                <StreakIndicator
                  current={confidence.streak.current}
                  isHot={confidence.streak.isHot}
                  isCold={confidence.streak.isCold}
                  last5Results={confidence.streak.last5Results}
                />
                <Typography variant="body-xs" className="text-muted mt-3">
                  {confidence.streak.isHot && (
                    <>
                      This play is{" "}
                      <strong className="text-success">riding momentum</strong>!
                      Consider using it to capitalize on recent success.
                    </>
                  )}
                  {confidence.streak.isCold && (
                    <>
                      This play is{" "}
                      <strong className="text-error">struggling lately</strong>.
                      Consider extra practice or situational adjustments.
                    </>
                  )}
                </Typography>
              </div>
            )}

          {/* Practice-to-Game Analytics (Phase 12.4) */}
          {confidence.practiceToGame && (
            <div className="bg-secondary border border-border rounded-lg p-4">
              <PracticeToGameInsight
                practiceStats={confidence.practiceToGame.practiceStats}
                gameStats={confidence.practiceToGame.gameStats}
                transferRate={confidence.practiceToGame.transferRate}
                needsMorePractice={confidence.practiceToGame.needsMorePractice}
              />
            </div>
          )}

          {/* Execution History */}
          <div className="bg-secondary border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="database" size="sm" className="text-muted" />
              <Typography variant="body-sm" className="font-medium">
                Data Source
              </Typography>
            </div>
            <Typography variant="body-xs" className="text-secondary">
              Based on {executionCount} execution
              {executionCount !== 1 ? "s" : ""} across practice and game
              sessions.
              {confidence.lastExecutedAt && (
                <>
                  {" "}
                  Last executed:{" "}
                  {confidence.lastExecutedAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </>
              )}
            </Typography>
            {hasGoodData && (
              <Typography variant="body-xs" className="text-success mt-2">
                ✓ High-quality data: {executionCount}+ executions
              </Typography>
            )}
          </div>

          {/* Help Text */}
          <div className="bg-secondary border border-border rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Icon
                name="lightbulb"
                size="sm"
                className="text-warning mt-0.5"
              />
              <Typography variant="body-xs" className="text-secondary">
                <strong>Tip:</strong> The AI learns from every execution you
                log. Run plays in practice and games to improve confidence
                accuracy. High-confidence plays (70%+) have proven success in
                your system.
              </Typography>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-primary border-t border-border p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
