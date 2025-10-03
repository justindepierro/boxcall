import React, { useState, useEffect, useCallback } from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon";
import {
  GamePlanningAnalyticsService,
  type GamePlanningAnalyticsData,
} from "../../services/playAnalyticsService";

interface GamePlanningDashboardProps {
  teamId: string;
}

export const GamePlanningDashboard: React.FC<GamePlanningDashboardProps> = ({
  teamId,
}) => {
  const [analyticsData, setAnalyticsData] =
    useState<GamePlanningAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const service = new GamePlanningAnalyticsService();
      const data = await service.getGamePlanningAnalytics(teamId);
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon
          name="refresh-cw"
          size="lg"
          className="animate-spin text-primary-600"
        />
        <Typography variant="body-sm" className="ml-2">
          Loading game planning analytics...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Icon
            name="alert-triangle"
            size="lg"
            className="text-danger-600 mx-auto mb-4"
          />
          <Typography variant="headline-sm" className="mb-2">
            Error Loading Analytics
          </Typography>
          <Typography variant="body-sm" className="text-text-secondary mb-4">
            {error}
          </Typography>
          <Button onClick={loadAnalytics} variant="outline">
            <Icon name="refresh-cw" size="sm" className="mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const { metrics, insights } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="headline-lg">Game Planning Analytics</Typography>
          <Typography variant="body-sm" className="text-text-secondary mt-1">
            Brian Billick methodology insights and optimization opportunities
          </Typography>
        </div>
        <Button onClick={loadAnalytics} variant="outline" size="sm">
          <Icon name="refresh-cw" size="sm" className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="body-xs"
                className="text-text-secondary uppercase tracking-wide"
              >
                Total Game Plans
              </Typography>
              <Typography variant="headline-sm" className="font-semibold">
                {metrics.totalGamePlans}
              </Typography>
            </div>
            <Icon name="file" size="lg" className="text-primary-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="body-xs"
                className="text-text-secondary uppercase tracking-wide"
              >
                Active Plans
              </Typography>
              <Typography variant="headline-sm" className="font-semibold">
                {metrics.activeGamePlans}
              </Typography>
            </div>
            <Icon name="activity" size="lg" className="text-success-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="body-xs"
                className="text-text-secondary uppercase tracking-wide"
              >
                Situation Coverage
              </Typography>
              <Typography variant="headline-sm" className="font-semibold">
                {metrics.situationCoverage.coveragePercentage.toFixed(0)}%
              </Typography>
            </div>
            <Icon name="target" size="lg" className="text-warning-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="body-xs"
                className="text-text-secondary uppercase tracking-wide"
              >
                Play Assignments
              </Typography>
              <Typography variant="headline-sm" className="font-semibold">
                {metrics.playAssignments.totalAssignments}
              </Typography>
            </div>
            <Icon name="users" size="lg" className="text-info-600" />
          </div>
        </Card>
      </div>

      {/* Preparation Status */}
      <Card className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Preparation Status
        </Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-text-secondary">
              {insights.preparationStatus.draft}
            </div>
            <Typography
              variant="body-xs"
              className="text-text-secondary uppercase tracking-wide"
            >
              Draft
            </Typography>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-600">
              {insights.preparationStatus.inProgress}
            </div>
            <Typography
              variant="body-xs"
              className="text-text-secondary uppercase tracking-wide"
            >
              In Progress
            </Typography>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-info-600">
              {insights.preparationStatus.complete}
            </div>
            <Typography
              variant="body-xs"
              className="text-text-secondary uppercase tracking-wide"
            >
              Complete
            </Typography>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600">
              {insights.preparationStatus.gameReady}
            </div>
            <Typography
              variant="body-xs"
              className="text-text-secondary uppercase tracking-wide"
            >
              Game Ready
            </Typography>
          </div>
        </div>
      </Card>

      {/* Situational Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Typography variant="headline-sm" className="mb-4">
            Strengths
          </Typography>
          {insights.situationalAnalysis.strengths.length > 0 ? (
            <ul className="space-y-2">
              {insights.situationalAnalysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <Icon
                    name="check"
                    size="sm"
                    className="text-success-600 mt-0.5 mr-2 flex-shrink-0"
                  />
                  <Typography variant="body-sm">{strength}</Typography>
                </li>
              ))}
            </ul>
          ) : (
            <Typography
              variant="body-sm"
              className="text-text-secondary italic"
            >
              No significant strengths identified yet
            </Typography>
          )}
        </Card>

        <Card className="p-6">
          <Typography variant="headline-sm" className="mb-4">
            Areas for Improvement
          </Typography>
          {insights.situationalAnalysis.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {insights.situationalAnalysis.weaknesses.map(
                (weakness, index) => (
                  <li key={index} className="flex items-start">
                    <Icon
                      name="alert-triangle"
                      size="sm"
                      className="text-warning-600 mt-0.5 mr-2 flex-shrink-0"
                    />
                    <Typography variant="body-sm">{weakness}</Typography>
                  </li>
                )
              )}
            </ul>
          ) : (
            <Typography
              variant="body-sm"
              className="text-text-secondary italic"
            >
              No significant weaknesses identified
            </Typography>
          )}
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Recommendations
        </Typography>
        {insights.situationalAnalysis.recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.situationalAnalysis.recommendations.map(
              (recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 bg-primary-50 rounded-lg"
                >
                  <Icon
                    name="lightbulb"
                    size="sm"
                    className="text-primary-600 mt-0.5 mr-2 flex-shrink-0"
                  />
                  <Typography variant="body-sm">{recommendation}</Typography>
                </div>
              )
            )}
          </div>
        ) : (
          <Typography variant="body-sm" className="text-text-secondary italic">
            No specific recommendations at this time
          </Typography>
        )}
      </Card>

      {/* Coaching Effectiveness */}
      <Card className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Coaching Effectiveness
        </Typography>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Typography variant="body-sm" className="font-medium mb-2">
              Average Execution Quality
            </Typography>
            <div className="flex items-center">
              <div className="text-2xl font-bold mr-2">
                {insights.coachingEffectiveness.averageExecutionQuality.toFixed(
                  1
                )}
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    size="sm"
                    className={`${
                      i <
                      Math.round(
                        insights.coachingEffectiveness.averageExecutionQuality /
                          2
                      )
                        ? "text-text-warning fill-current"
                        : "text-text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <Typography variant="body-sm" className="font-medium mb-2">
              Adjustment Frequency
            </Typography>
            <Typography variant="headline-sm" className="font-semibold">
              {insights.coachingEffectiveness.adjustmentFrequency} adjustments
              made
            </Typography>
          </div>
        </div>

        {insights.coachingEffectiveness.coachingAssessmentTrends.length > 0 && (
          <div className="mt-4">
            <Typography variant="body-sm" className="font-medium mb-2">
              Recent Coaching Assessments
            </Typography>
            <ul className="space-y-1">
              {insights.coachingEffectiveness.coachingAssessmentTrends.map(
                (assessment, index) => (
                  <li key={index} className="flex items-start">
                    <Icon
                      name="message"
                      size="sm"
                      className="text-text-secondary mt-0.5 mr-2 flex-shrink-0"
                    />
                    <Typography
                      variant="body-xs"
                      className="text-text-secondary"
                    >
                      {assessment}
                    </Typography>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </Card>

      {/* Optimization Opportunities */}
      {insights.optimizationOpportunities.length > 0 && (
        <Card className="p-6">
          <Typography variant="headline-sm" className="mb-4">
            Optimization Opportunities
          </Typography>
          <div className="space-y-4">
            {insights.optimizationOpportunities.map((opportunity, index) => (
              <div
                key={index}
                className="border border-border-medium rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Typography variant="body-sm" className="font-medium">
                      Priority Adjustment Suggested
                    </Typography>
                    <Typography
                      variant="body-xs"
                      className="text-text-secondary"
                    >
                      Situation: {opportunity.situationId}
                    </Typography>
                  </div>
                  <Badge
                    variant={
                      opportunity.confidence > 0.8
                        ? "success"
                        : opportunity.confidence > 0.6
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {Math.round(opportunity.confidence * 100)}% confidence
                  </Badge>
                </div>

                <Typography variant="body-sm" className="mb-2">
                  {opportunity.reasoning}
                </Typography>

                <div className="flex items-center justify-between text-sm">
                  <span>
                    Current: {opportunity.currentPriority} → Suggested:{" "}
                    {opportunity.suggestedPriority}
                  </span>
                  <div className="text-text-secondary">
                    Success Rate:{" "}
                    {opportunity.historicalData.successRate.toFixed(1)}% |
                    Executions: {opportunity.historicalData.executionCount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
