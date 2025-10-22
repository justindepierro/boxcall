import React, { useEffect, useState } from "react";
import { Typography } from "../design-system/Typography";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ConfidenceTrendChart } from "./charts/ConfidenceTrendChart";
import { FormationTrendChart } from "./charts/FormationTrendChart";
import { SessionAnalyticsService } from "../../services/sessionAnalyticsService";
import type {
  PlayTrendData,
  FormationTrendData,
} from "../../services/sessionAnalyticsService";

interface TrendAnalyticsDashboardProps {
  playId?: string;
  formationId?: string;
  teamId: string;
  startDate?: string;
  endDate?: string;
  className?: string;
  onExport?: () => void;
}

export const TrendAnalyticsDashboard: React.FC<
  TrendAnalyticsDashboardProps
> = ({
  playId,
  formationId,
  teamId,
  startDate,
  endDate,
  className = "",
  onExport,
}) => {
  const [playTrend, setPlayTrend] = useState<PlayTrendData[]>([]);
  const [formationTrend, setFormationTrend] = useState<FormationTrendData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrends = async () => {
      try {
        setLoading(true);
        setError(null);

        const promises: Promise<any>[] = [];

        if (playId) {
          promises.push(
            SessionAnalyticsService.getPlayTrend(
              playId,
              teamId,
              startDate,
              endDate
            )
          );
        }

        if (formationId) {
          promises.push(
            SessionAnalyticsService.getFormationTrend(
              formationId,
              teamId,
              startDate,
              endDate
            )
          );
        }

        const results = await Promise.all(promises);

        if (playId && results.length > 0) {
          setPlayTrend(results[0]);
        }

        if (formationId) {
          setFormationTrend(results[playId ? 1 : 0]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load trend data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (playId || formationId) {
      loadTrends();
    }
  }, [playId, formationId, teamId, startDate, endDate]);

  if (loading) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="mx-auto mb-4">Loading...</div>
        <Typography variant="body-sm" className="text-secondary">
          Loading trend analytics...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="text-error-500 mx-auto mb-4">⚠️</div>
        <Typography variant="body-sm" className="text-error-600 mb-4">
          {error}
        </Typography>
        <Button
          onClick={() => window.location.reload()}
          variant="secondary"
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (playTrend.length === 0 && formationTrend.length === 0) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="text-secondary mx-auto mb-4">📊</div>
        <Typography variant="body-sm" className="text-secondary">
          No trend data available
        </Typography>
      </div>
    );
  }

  // Format date range for display
  const dateRangeText =
    startDate && endDate
      ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      : "All time";

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Typography variant="headline-lg" className="mb-2">
            Trend Analytics
          </Typography>
          <Typography variant="body-sm" className="text-secondary">
            {dateRangeText}
          </Typography>
        </div>
        {onExport && (
          <Button onClick={onExport} variant="secondary" size="sm">
            <Icon name="download" className="mr-2" size={16} />
            Export
          </Button>
        )}
      </div>

      {/* Play Confidence Trend */}
      {playTrend.length > 0 && (
        <div className="mb-6">
          <ConfidenceTrendChart
            data={playTrend.map((p) => ({
              weekLabel: new Date(p.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              weekStart: p.date,
              confidence: p.confidence,
              reps: p.executions,
              successRate: p.successRate,
              avgYards: p.avgYards,
            }))}
            title="Play Confidence Trend"
            showSuccessRate={true}
            showReps={true}
            targetConfidence={80}
          />

          {/* Play Insights */}
          {(() => {
            const latestPoint = playTrend[playTrend.length - 1];
            const bestWeek = [...playTrend].sort(
              (a, b) => b.successRate - a.successRate
            )[0];
            const mostPracticed = [...playTrend].sort(
              (a, b) => b.executions - a.executions
            )[0];

            return (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-surface-secondary rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      name="trending-up"
                      className="text-brand-600"
                      size={20}
                    />
                    <Typography variant="body-sm" className="font-semibold">
                      Best Week
                    </Typography>
                  </div>
                  <Typography variant="headline-md" className="mb-1">
                    {new Date(bestWeek.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    {bestWeek.successRate}% success •{" "}
                    {bestWeek.avgYards.toFixed(1)} avg yards
                  </Typography>
                </div>

                <div className="p-4 bg-surface-secondary rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      name="activity"
                      className="text-success-600"
                      size={20}
                    />
                    <Typography variant="body-sm" className="font-semibold">
                      Most Practiced
                    </Typography>
                  </div>
                  <Typography variant="headline-md" className="mb-1">
                    {new Date(mostPracticed.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    {mostPracticed.executions} reps
                  </Typography>
                </div>

                <div className="p-4 bg-surface-secondary rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      name="target"
                      className="text-warning-600"
                      size={20}
                    />
                    <Typography variant="body-sm" className="font-semibold">
                      Current Status
                    </Typography>
                  </div>
                  <Typography variant="headline-md" className="mb-1">
                    {latestPoint.confidence}%
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    {latestPoint.confidence >= 80
                      ? "Game ready"
                      : latestPoint.confidence >= 60
                        ? "Needs more practice"
                        : "Not ready"}
                  </Typography>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Formation Performance Trend */}
      {formationTrend.length > 0 && (
        <div className="mb-6">
          <FormationTrendChart
            data={formationTrend.map((f) => ({
              weekLabel: new Date(f.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              weekStart: f.date,
              attempts: f.totalPlays,
              successRate: f.successRate,
              avgYards: 0, // Not available in FormationTrendData
            }))}
            formationName={formationTrend[0]?.formationName || "Formation"}
            targetSuccessRate={70}
            showAvgYards={false}
          />

          {/* Formation Insights */}
          {(() => {
            const bestWeek = [...formationTrend].sort(
              (a, b) => b.successRate - a.successRate
            )[0];
            const totalAttempts = formationTrend.reduce(
              (sum, f) => sum + f.totalPlays,
              0
            );
            const avgSuccess =
              formationTrend.reduce((sum, f) => sum + f.successRate, 0) /
              formationTrend.length;

            return (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-surface-secondary rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      name="trending-up"
                      className="text-brand-600"
                      size={20}
                    />
                    <Typography variant="body-sm" className="font-semibold">
                      Best Week
                    </Typography>
                  </div>
                  <Typography variant="headline-md" className="mb-1">
                    {new Date(bestWeek.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    {bestWeek.successRate}% success
                  </Typography>
                </div>

                <div className="p-4 bg-surface-secondary rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      name="bar-chart"
                      className="text-success-600"
                      size={20}
                    />
                    <Typography variant="body-sm" className="font-semibold">
                      Total Usage
                    </Typography>
                  </div>
                  <Typography variant="headline-md" className="mb-1">
                    {totalAttempts}
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    Attempts across all weeks
                  </Typography>
                </div>

                <div className="p-4 bg-surface-secondary rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      name="trending-up"
                      className="text-warning-600"
                      size={20}
                    />
                    <Typography variant="body-sm" className="font-semibold">
                      Avg Success Rate
                    </Typography>
                  </div>
                  <Typography variant="headline-md" className="mb-1">
                    {avgSuccess.toFixed(1)}%
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    Overall performance
                  </Typography>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Practice Recommendations */}
      {playTrend.length > 0 &&
        playTrend[playTrend.length - 1].confidence < 80 && (
          <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon
                name="alert-triangle"
                className="text-warning-600 mt-0.5"
                size={20}
              />
              <div>
                <Typography variant="body-sm" className="font-semibold mb-1">
                  Practice Recommendation
                </Typography>
                <Typography variant="body-sm" className="text-secondary">
                  {playTrend[playTrend.length - 1].confidence < 60
                    ? `This play needs significant practice. Schedule ${Math.ceil((80 - playTrend[playTrend.length - 1].confidence) / 5)} more practice sessions with 5-10 reps each to reach game-ready confidence.`
                    : `This play is close to game-ready. Schedule 2-3 more practice sessions with 5-7 reps each to reach 80% confidence.`}
                </Typography>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
