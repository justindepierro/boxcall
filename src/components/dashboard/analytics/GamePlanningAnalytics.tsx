import React, { useEffect, useState } from "react";
import {
  GamePlanningAnalyticsService,
  type GamePlanningAnalyticsData,
} from "../../../services/playAnalyticsService";
import { Card } from "../../ui";
import { Typography } from "../../design-system";
import { Icon } from "../../ui/Icon";
import { useAuth } from "../../../app/auth-store";
import { useUserTeamMemberships } from "../../../hooks/useUserTeamMemberships";

interface GamePlanningAnalyticsProps {
  teamId?: string;
}

/**
 * Game Planning Analytics Dashboard Component
 * Shows comprehensive analytics for game planning and strategy
 */
export const GamePlanningAnalytics: React.FC<GamePlanningAnalyticsProps> = ({
  teamId,
}) => {
  const { user } = useAuth();
  const { data: teamMemberships } = useUserTeamMemberships(user?.id);
  const [analytics, setAnalytics] = useState<GamePlanningAnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the primary team ID from user's team memberships
  const primaryTeamId = teamId || teamMemberships?.[0]?.team_id;

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!primaryTeamId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const service = new GamePlanningAnalyticsService();
        const data = await service.getGamePlanningAnalytics(primaryTeamId);
        setAnalytics(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [primaryTeamId]);

  if (loading) {
    return (
      <Card variant="elevated" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-border rounded w-3/4"></div>
          <div className="h-4 bg-border rounded w-1/2"></div>
          <div className="h-4 bg-border rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated" className="p-6">
        <div className="text-center text-error">
          <Icon name="alert-triangle" className="w-8 h-8 mx-auto mb-2" />
          <Typography variant="body-sm">Analytics unavailable</Typography>
          <Typography variant="body-xs" color="muted">
            {error}
          </Typography>
        </div>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card variant="elevated" className="p-6">
        <div className="text-center text-muted">
          <Icon name="bar-chart" className="w-8 h-8 mx-auto mb-2" />
          <Typography variant="body-sm">No analytics data available</Typography>
        </div>
      </Card>
    );
  }

  const { metrics, insights } = analytics;

  return (
    <Card variant="elevated" className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="bar-chart" className="w-5 h-5 text-primary" />
        <Typography variant="headline-sm">Game Planning Analytics</Typography>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <Typography variant="headline-md" className="text-primary">
            {metrics.totalGamePlans}
          </Typography>
          <Typography variant="body-xs" color="muted">
            Total Plans
          </Typography>
        </div>
        <div className="text-center">
          <Typography variant="headline-md" className="text-success">
            {metrics.activeGamePlans}
          </Typography>
          <Typography variant="body-xs" color="muted">
            Active Plans
          </Typography>
        </div>
        <div className="text-center">
          <Typography variant="headline-md" className="text-warning">
            {Math.round(metrics.situationCoverage.coveragePercentage)}%
          </Typography>
          <Typography variant="body-xs" color="muted">
            Coverage
          </Typography>
        </div>
        <div className="text-center">
          <Typography variant="headline-md" className="text-info">
            {Math.round(metrics.averagePreparationTime)}min
          </Typography>
          <Typography variant="body-xs" color="muted">
            Avg Prep Time
          </Typography>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        <Typography variant="body-sm" className="font-medium">
          Key Insights:
        </Typography>

        {insights.situationalAnalysis.strengths.length > 0 && (
          <div className="flex items-start gap-2">
            <Icon
              name="check-circle"
              className="w-4 h-4 text-success mt-0.5 flex-shrink-0"
            />
            <div>
              <Typography
                variant="body-xs"
                className="font-medium text-success"
              >
                Strengths:
              </Typography>
              <Typography variant="body-xs" color="muted">
                {insights.situationalAnalysis.strengths.join(", ")}
              </Typography>
            </div>
          </div>
        )}

        {insights.situationalAnalysis.weaknesses.length > 0 && (
          <div className="flex items-start gap-2">
            <Icon
              name="alert-triangle"
              className="w-4 h-4 text-warning mt-0.5 flex-shrink-0"
            />
            <div>
              <Typography
                variant="body-xs"
                className="font-medium text-warning"
              >
                Areas for Improvement:
              </Typography>
              <Typography variant="body-xs" color="muted">
                {insights.situationalAnalysis.weaknesses.join(", ")}
              </Typography>
            </div>
          </div>
        )}

        {insights.optimizationOpportunities.length > 0 && (
          <div className="flex items-start gap-2">
            <Icon
              name="lightbulb"
              className="w-4 h-4 text-info mt-0.5 flex-shrink-0"
            />
            <div>
              <Typography variant="body-xs" className="font-medium text-info">
                Optimization Opportunities:
              </Typography>
              <Typography variant="body-xs" color="muted">
                {insights.optimizationOpportunities
                  .slice(0, 2)
                  .map((opp) => opp.reasoning)
                  .join(", ")}
              </Typography>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
