/**
 * Playbook Health Modal
 *
 * Displays comprehensive playbook health score with:
 * - Overall score with visual indicator
 * - Score breakdown by category
 * - Issues list with severity badges
 * - Actionable recommendations
 *
 * Helps coaches understand data quality and what to improve
 * for better analytics and insights.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "../ui/Modal";
import { Typography } from "../design-system/Typography";
import { Icon, type IconName } from "../ui/Icon";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { SquareLoadingSpinner } from "../ui/Animations/SquareAnimations";
import {
  calculatePlaybookHealth,
  getHealthColor,
  getHealthEmoji,
  getHealthGrade,
  type PlaybookHealthScore,
  type HealthIssue,
} from "../../utils/playbookHealthScore";
import { cn } from "../../lib/utils/cn";
import { info, error as logError } from "../../utils/logger";

export interface PlaybookHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
}

/**
 * PlaybookHealthModal
 *
 * Comprehensive health dashboard for playbook data quality
 */
export const PlaybookHealthModal: React.FC<PlaybookHealthModalProps> = ({
  isOpen,
  onClose,
  playbookId,
}) => {
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState<PlaybookHealthScore | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const loadHealthScore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      info("[PlaybookHealthModal] Loading health score for:", playbookId);

      const score = await calculatePlaybookHealth(playbookId);
      setHealthScore(score);
    } catch (err) {
      logError("[PlaybookHealthModal] Failed to load health score:", err);
      setError("Failed to load playbook health. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [playbookId]);

  useEffect(() => {
    if (isOpen && playbookId) {
      loadHealthScore();
    }
  }, [isOpen, playbookId, loadHealthScore]);

  const getSeverityColor = (
    severity: HealthIssue["severity"]
  ): "danger" | "warning" | "info" | "default" => {
    switch (severity) {
      case "critical":
        return "danger";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "default";
    }
  };

  const getSeverityIcon = (severity: HealthIssue["severity"]): IconName => {
    switch (severity) {
      case "critical":
        return "alert";
      case "warning":
        return "alert-triangle";
      case "info":
        return "info";
      default:
        return "info";
    }
  };

  const getCategoryScore = (
    category: keyof PlaybookHealthScore["breakdown"]
  ) => {
    if (!healthScore) return 0;
    return healthScore.breakdown[category];
  };

  const getCategoryMax = (category: keyof PlaybookHealthScore["breakdown"]) => {
    const maxPoints = {
      formationLinking: 30,
      formationCompleteness: 20,
      playCompleteness: 25,
      dataConsistency: 15,
      organizationQuality: 10,
    };
    return maxPoints[category];
  };

  const getCategoryIcon = (
    category: keyof PlaybookHealthScore["breakdown"]
  ): IconName => {
    const icons: Record<keyof PlaybookHealthScore["breakdown"], IconName> = {
      formationLinking: "link",
      formationCompleteness: "check-circle",
      playCompleteness: "file",
      dataConsistency: "shield",
      organizationQuality: "folder",
    };
    return icons[category];
  };

  const getCategoryLabel = (
    category: keyof PlaybookHealthScore["breakdown"]
  ) => {
    const labels = {
      formationLinking: "Formation Linking",
      formationCompleteness: "Formation Completeness",
      playCompleteness: "Play Completeness",
      dataConsistency: "Data Consistency",
      organizationQuality: "Organization Quality",
    };
    return labels[category];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Playbook Health" size="lg">
      <div className="space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <SquareLoadingSpinner size="lg" variant="jade" />
          </div>
        )}

        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="alert" className="h-5 w-5 text-danger-500 mt-0.5" />
              <div>
                <Typography variant="body-md" className="text-danger-700">
                  {error}
                </Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadHealthScore}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {healthScore && !loading && (
          <>
            {/* Overall Score Card */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6 border border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <Typography
                    variant="label-md"
                    className="text-secondary mb-2"
                  >
                    Overall Health Score
                  </Typography>
                  <div className="flex items-baseline space-x-3">
                    <Typography
                      variant="headline-xl"
                      className="text-primary-700"
                    >
                      {healthScore.overall}
                      <span className="text-2xl text-tertiary">/100</span>
                    </Typography>
                    <Badge
                      variant={getHealthColor(healthScore.overall) as any}
                      size="lg"
                    >
                      Grade {getHealthGrade(healthScore.overall)}
                    </Badge>
                    <span className="text-4xl">
                      {getHealthEmoji(healthScore.overall)}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="text-right space-y-1">
                  <Typography variant="label-md" className="text-tertiary">
                    {healthScore.stats.totalPlays} plays (
                    {healthScore.stats.uniquePlayNames} unique)
                  </Typography>
                  <Typography variant="label-md" className="text-tertiary">
                    {healthScore.stats.totalFormations} formations
                  </Typography>
                  <Typography variant="label-md" className="text-accent-600">
                    {healthScore.stats.playsWithFormationLink}/
                    {healthScore.stats.totalPlays} linked
                  </Typography>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      healthScore.overall >= 80 && "bg-success-500",
                      healthScore.overall >= 60 &&
                        healthScore.overall < 80 &&
                        "bg-warning-500",
                      healthScore.overall < 60 && "bg-danger-500"
                    )}
                    style={{ width: `${healthScore.overall}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div>
              <Typography variant="headline-sm" className="mb-4">
                Score Breakdown
              </Typography>
              <div className="space-y-3">
                {(
                  Object.keys(
                    healthScore.breakdown
                  ) as (keyof PlaybookHealthScore["breakdown"])[]
                ).map((category) => {
                  const score = getCategoryScore(category);
                  const max = getCategoryMax(category);
                  const percentage = (score / max) * 100;

                  return (
                    <div
                      key={category}
                      className="bg-secondary rounded-lg p-4 hover:bg-tertiary transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Icon
                            name={getCategoryIcon(category)}
                            className="h-5 w-5 text-primary-500"
                          />
                          <Typography variant="body-md" className="font-medium">
                            {getCategoryLabel(category)}
                          </Typography>
                        </div>
                        <Typography
                          variant="body-sm"
                          className="text-secondary"
                        >
                          {score}/{max}
                        </Typography>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-300 rounded-full",
                            percentage >= 80 && "bg-success-500",
                            percentage >= 60 &&
                              percentage < 80 &&
                              "bg-warning-500",
                            percentage < 60 && "bg-danger-500"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            {healthScore.recommendations.length > 0 && (
              <div>
                <Typography variant="headline-sm" className="mb-3">
                  Recommendations
                </Typography>
                <div className="space-y-2">
                  {healthScore.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 bg-accent-50 rounded-lg p-3"
                    >
                      <Icon
                        name="lightbulb"
                        className="h-5 w-5 text-accent-500 mt-0.5 flex-shrink-0"
                      />
                      <Typography
                        variant="body-sm"
                        className="text-primary"
                      >
                        {rec}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues List */}
            {healthScore.issues.length > 0 && (
              <div>
                <Typography variant="headline-sm" className="mb-3">
                  Issues to Fix ({healthScore.issues.length})
                </Typography>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {healthScore.issues.map((issue, index) => (
                    <div
                      key={index}
                      className={cn(
                        "border rounded-lg p-4 hover:shadow-sm transition-shadow",
                        issue.severity === "critical" &&
                          "bg-danger-50 border-danger-200",
                        issue.severity === "warning" &&
                          "bg-warning-50 border-warning-200",
                        issue.severity === "info" &&
                          "bg-info-50 border-info-200"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start space-x-3 flex-1">
                          <Icon
                            name={getSeverityIcon(issue.severity)}
                            className={cn(
                              "h-5 w-5 mt-0.5 flex-shrink-0",
                              issue.severity === "critical" &&
                                "text-danger-500",
                              issue.severity === "warning" &&
                                "text-warning-500",
                              issue.severity === "info" && "text-info-500"
                            )}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge
                                variant={
                                  getSeverityColor(issue.severity) as any
                                }
                                size="sm"
                              >
                                {issue.severity.toUpperCase()}
                              </Badge>
                              <Typography
                                variant="label-md"
                                className="text-tertiary"
                              >
                                {issue.category}
                              </Typography>
                            </div>
                            <Typography
                              variant="body-md"
                              className="text-primary font-medium mb-1"
                            >
                              {issue.description}
                            </Typography>
                            <Typography
                              variant="body-sm"
                              className="text-secondary"
                            >
                              {issue.howToFix}
                            </Typography>
                            {issue.affectedItems.length > 0 && (
                              <Typography
                                variant="label-md"
                                className="text-tertiary mt-2 text-xs"
                              >
                                Affects {issue.affectedItems.length} item(s)
                              </Typography>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <Typography
                            variant="label-md"
                            className="text-accent-600 font-bold"
                          >
                            +{issue.pointsToGain} pts
                          </Typography>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Issues State */}
            {healthScore.issues.length === 0 && (
              <div className="bg-success-50 border border-success-200 rounded-lg p-6 text-center">
                <Icon
                  name="check-circle"
                  className="h-12 w-12 text-success-500 mx-auto mb-3"
                />
                <Typography
                  variant="headline-sm"
                  className="text-success-700 mb-2"
                >
                  Perfect Health! 🎉
                </Typography>
                <Typography variant="body-sm" className="text-success-600">
                  Your playbook has no issues. Keep up the great work!
                </Typography>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <Button variant="ghost" size="sm" onClick={loadHealthScore}>
          <Icon name="refresh-cw" className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
