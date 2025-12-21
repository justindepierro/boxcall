/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

import React, { useState, useEffect, useCallback } from "react";
import { Typography } from "../design-system/Typography";
import { Icon, type IconName } from "../ui/Icon";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { AuroraTile } from "../ui/AuroraTile";
import {
  PlayAnalyticsService,
  type PlaybookAnalyticsSummary,
  type FormationAnalytics,
} from "../../services/playAnalyticsService";
import { PlayerPerformanceDashboard } from "./PlayerPerformanceDashboard";
import { GamePlanningDashboard } from "./GamePlanningDashboard";
import { SessionAnalyticsDashboard } from "./SessionAnalyticsDashboard";
import { TrendAnalyticsDashboard } from "./TrendAnalyticsDashboard";

/**
 * Advanced Analytics Dashboard - Phase 4
 * Comprehensive playbook analytics with performance insights
 */

interface AnalyticsDashboardProps {
  playbookId?: string;
  className?: string;
}

type AnalyticsView =
  | "overview"
  | "formations"
  | "situational"
  | "performance"
  | "player-performance"
  | "game-planning"
  | "session-analytics"
  | "trend-analytics";

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  playbookId,
  className = "",
}) => {
  const [analytics, setAnalytics] = useState<PlaybookAnalyticsSummary | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<AnalyticsView>("overview");

  const loadAnalytics = useCallback(async () => {
    if (!playbookId) return;

    try {
      setLoading(true);
      setError(null);
      const data =
        await PlayAnalyticsService.getPlaybookAnalytics(playbookId);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [playbookId]);

  useEffect(() => {
    if (playbookId) {
      loadAnalytics();
    } else {
      setLoading(false);
    }
  }, [playbookId, loadAnalytics]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-2xl ${className}`}>
        <div className="text-center">
          <Icon
            name="refresh-cw"
            className="h-8 w-8 animate-spin text-jade-600 mx-auto mb-md"
          />
          <Typography variant="body-lg">Loading analytics...</Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-2xl text-center ${className}`}>
        <Icon
          name="alert-triangle"
          className="h-12 w-12 text-error mx-auto mb-md"
        />
        <Typography variant="headline-sm" className="text-error mb-xs">
          Analytics Error
        </Typography>
        <Typography variant="body-sm" className="text-error mb-md">
          {error}
        </Typography>
        <Button onClick={loadAnalytics} variant="secondary">
          Try Again
        </Button>
      </div>
    );
  }

  if (!analytics || analytics.totalPlays === 0) {
    return (
      <div className={`p-2xl text-center ${className}`}>
        <Icon name="bar-chart" className="h-12 w-12 text-muted mx-auto mb-md" />
        <Typography variant="headline-sm" className="text-secondary mb-xs">
          No Analytics Data
        </Typography>
        <Typography variant="body-sm" className="text-secondary">
          {playbookId
            ? "No plays found in this playbook yet."
            : "Select a playbook to view analytics."}
        </Typography>
      </div>
    );
  }

  const formatPercent = (value?: number) => {
    if (value == null || Number.isNaN(value)) return "0%";
    return `${Number(value).toFixed(1)}%`;
  };

  const formatDecimal = (value?: number, fractionDigits = 1) => {
    if (value == null || Number.isNaN(value))
      return `0.${"0".repeat(fractionDigits)}`;
    return Number(value).toFixed(fractionDigits);
  };

  const bestFormation = analytics.formationAnalytics.length
    ? analytics.formationAnalytics.reduce<FormationAnalytics | null>(
        (best, item) => {
          if (!best) return item;
          return item.successRate > best.successRate ? item : best;
        },
        null
      )
    : null;

  const situationalEntries = Object.entries(
    analytics.situationalPerformance.byDown || {}
  ) as Array<[string, { called: number; successful: number; rate: number }]>;
  const bestDown = situationalEntries.length
    ? situationalEntries.reduce((best, entry) => {
        if (!best) return entry;
        return entry[1].rate > best[1].rate ? entry : best;
      }, situationalEntries[0])
    : null;

  const personnelEntries = Object.entries(
    analytics.situationalPerformance.byPersonnel || {}
  ) as Array<[string, { called: number; successful: number; rate: number }]>;
  const bestPersonnel = personnelEntries.length
    ? personnelEntries.reduce((best, entry) => {
        if (!best) return entry;
        return entry[1].rate > best[1].rate ? entry : best;
      }, personnelEntries[0])
    : null;

  const topPlay = analytics.topPerformingPlays[0] ?? null;

  const complexityTotals = analytics.complexityDistribution;
  const totalComplexityCount =
    (complexityTotals.low || 0) +
    (complexityTotals.medium || 0) +
    (complexityTotals.high || 0);
  const complexityFocus: ["low" | "medium" | "high", number] =
    totalComplexityCount
      ? (
          Object.entries(complexityTotals) as Array<
            ["low" | "medium" | "high", number]
          >
        ).reduce((best, entry) => (entry[1] > best[1] ? entry : best), [
          "low",
          complexityTotals.low || 0,
        ] as ["low" | "medium" | "high", number])
      : (["low", 0] as ["low" | "medium" | "high", number]);

  const complexityCopy: Record<"low" | "medium" | "high", string> = {
    low: "Install ready",
    medium: "Balanced attack",
    high: "Advanced package",
  };

  // Extract values for use in closures
  const complexityFocusLevel: "low" | "medium" | "high" = complexityFocus[0];
  const complexityFocusCount: number = complexityFocus[1];

  const heroTiles: Array<{
    key: AnalyticsView;
    title: string;
    description: string;
    icon: IconName;
    accentOverlayClass: string;
    glowClassName: string;
    statusBadge: string;
    iconClassName: string;
    footnote: string;
    renderContent: () => React.ReactNode;
    buttonLabel: string;
  }> = [
    {
      key: "overview",
      title: "Play Overview",
      description: "Snapshot of usage, success, and complexity.",
      icon: "grid",
      accentOverlayClass: "bg-aurora-emerald",
      glowClassName: "glow-aurora-emerald",
      statusBadge: "Summary",
      iconClassName: "text-emerald-600",
      footnote: selectedView === "overview" ? "Active view" : "Tap to open",
      buttonLabel: "Overview",
      renderContent: () => (
        <div className="grid gap-xs text-sm text-secondary">
          <div className="flex items-center justify-between">
            <span>Total plays</span>
            <span className="font-semibold text-primary">
              {analytics.totalPlays}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Avg success</span>
            <span className="font-semibold text-primary">
              {formatPercent(analytics.averageSuccessRate)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Avg complexity</span>
            <span className="font-semibold text-primary">
              {formatDecimal(analytics.averageComplexity)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "formations",
      title: "Formations Lab",
      description: "See which looks are stretching defenses most.",
      icon: "flag",
      accentOverlayClass: "bg-aurora-amber",
      glowClassName: "glow-aurora-amber",
      statusBadge: "Formations",
      iconClassName: "text-warning-600",
      footnote: selectedView === "formations" ? "Active view" : "Tap to open",
      buttonLabel: "Formations",
      renderContent: () => (
        <div className="space-y-xs text-sm">
          <div className="text-secondary">Top formation</div>
          <div className="flex items-baseline justify-between gap-md">
            <span className="font-semibold text-primary truncate">
              {bestFormation?.formation ?? "No data"}
            </span>
            <span className="text-secondary">
              {bestFormation ? formatPercent(bestFormation.successRate) : "0%"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>Avg complexity</span>
            <span className="font-semibold text-primary">
              {bestFormation
                ? formatDecimal(bestFormation.averageComplexity)
                : "0.0"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "situational",
      title: "Situational Edge",
      description: "Dial up the right call by down & distance.",
      icon: "target",
      accentOverlayClass: "bg-aurora-indigo",
      glowClassName: "glow-aurora-indigo",
      statusBadge: "Situational",
      iconClassName: "text-sky-600",
      footnote: selectedView === "situational" ? "Active view" : "Tap to open",
      buttonLabel: "Situational",
      renderContent: () => (
        <div className="space-y-xs text-sm">
          <div className="text-secondary">Best down & distance</div>
          <div className="flex items-baseline justify-between gap-md">
            <span className="font-semibold text-primary truncate">
              {bestDown ? bestDown[0] : "No data"}
            </span>
            <span className="text-secondary">
              {bestDown ? formatPercent(bestDown[1].rate) : "0%"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>Calls tracked</span>
            <span className="font-semibold text-primary">
              {bestDown ? bestDown[1].called : 0}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "performance",
      title: "Performance Pulse",
      description: "Identify the packages delivering right now.",
      icon: "trending-up",
      accentOverlayClass: "bg-aurora-violet",
      glowClassName: "glow-aurora-violet",
      statusBadge: "Performance",
      iconClassName: "text-purple-600",
      footnote: selectedView === "performance" ? "Active view" : "Tap to open",
      buttonLabel: "Performance",
      renderContent: () => (
        <div className="space-y-xs text-sm">
          <div className="text-secondary">Focus</div>
          <div className="flex items-baseline justify-between gap-md">
            <span className="font-semibold text-primary capitalize">
              {complexityCopy[complexityFocusLevel]}
            </span>
            <span className="text-secondary">
              {totalComplexityCount
                ? `${Math.round(
                    (complexityFocusCount / totalComplexityCount) * 100
                  )}% share`
                : "0% share"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>Install balance</span>
            <span className="font-semibold text-primary">
              {`${complexityTotals.low}/${complexityTotals.medium}/${complexityTotals.high}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "player-performance",
      title: "Player Spotlight",
      description: "Track which calls juice your roster most.",
      icon: "users",
      accentOverlayClass: "bg-aurora-teal",
      glowClassName: "glow-aurora-teal",
      statusBadge: "Players",
      iconClassName: "text-teal-600",
      footnote:
        selectedView === "player-performance" ? "Active view" : "Tap to open",
      buttonLabel: "Players",
      renderContent: () => (
        <div className="space-y-xs text-sm">
          <div className="text-secondary">Top performing play</div>
          <div className="flex items-baseline justify-between gap-md">
            <span className="font-semibold text-primary truncate">
              {topPlay?.playName ?? "No data"}
            </span>
            <span className="text-secondary">
              {topPlay ? formatPercent(topPlay.successRate) : "0%"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>Calls / success</span>
            <span className="font-semibold text-primary">
              {topPlay
                ? `${topPlay.timesCalled}/${topPlay.timesSuccessful}`
                : "0/0"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "game-planning",
      title: "Game Planning",
      description: "Prep your next opponent with confidence cues.",
      icon: "file",
      accentOverlayClass: "bg-aurora-slatewave",
      glowClassName: "glow-aurora-slate",
      statusBadge: "Strategy",
      iconClassName: "text-secondary",
      footnote:
        selectedView === "game-planning" ? "Active view" : "Tap to open",
      buttonLabel: "Game Planning",
      renderContent: () => (
        <div className="space-y-xs text-sm">
          <div className="text-secondary">Personnel advantage</div>
          <div className="flex items-baseline justify-between gap-md">
            <span className="font-semibold text-primary truncate">
              {bestPersonnel ? bestPersonnel[0] : "No data"}
            </span>
            <span className="text-secondary">
              {bestPersonnel ? formatPercent(bestPersonnel[1].rate) : "0%"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>Calls tagged</span>
            <span className="font-semibold text-primary">
              {bestPersonnel ? bestPersonnel[1].called : 0}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "session-analytics",
      title: "Session Analytics",
      description: "Deep dive into practice session performance metrics.",
      icon: "activity",
      accentOverlayClass: "bg-aurora-rose",
      glowClassName: "glow-aurora-rose",
      statusBadge: "Sessions",
      iconClassName: "text-rose-600",
      footnote:
        selectedView === "session-analytics" ? "Active view" : "Tap to open",
      buttonLabel: "Sessions",
      renderContent: () => (
        <div className="space-y-xs text-sm">
          <div className="text-secondary">Session insights</div>
          <div className="flex items-baseline justify-between gap-md">
            <span className="font-semibold text-primary">
              Performance tracking
            </span>
            <span className="text-secondary">Coming soon</span>
          </div>
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>Advanced metrics</span>
            <span className="font-semibold text-primary">Ready</span>
          </div>
        </div>
      ),
    },
    {
      key: "trend-analytics",
      title: "Trend Analytics",
      description: "Track performance trends over time and seasons.",
      icon: "trending-up",
      accentOverlayClass: "bg-aurora-cyan",
      glowClassName: "glow-aurora-cyan",
      statusBadge: "Trends",
      iconClassName: "text-cyan-600",
      footnote:
        selectedView === "trend-analytics" ? "Active view" : "Tap to open",
      buttonLabel: "Trends",
      renderContent: () => (
        <div className="space-y-xs text-sm">
          <div className="text-secondary">Trend analysis</div>
          <div className="flex items-baseline justify-between gap-md">
            <span className="font-semibold text-primary">Historical data</span>
            <span className="text-secondary">Coming soon</span>
          </div>
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>Season insights</span>
            <span className="font-semibold text-primary">Ready</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={`space-y-2xl ${className}`}>
      <div className="rounded-lg bg-primary p-5 shadow-lg backdrop-blur-sm sm:p-6 xl:p-7">
        <div className="mb-lg flex flex-col gap-xs">
          <Typography
            variant="headline-md"
            className="flex items-center gap-3 text-primary"
          >
            <Icon name="bar-chart" className="h-6 w-6 text-jade-600" />
            Advanced Analytics
          </Typography>
          <Typography variant="body-sm" className="text-secondary">
            Choose a workspace to dive deeper into your playbook trends.
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
          {heroTiles.map((tile) => (
            <AuroraTile
              key={tile.key}
              title={tile.title}
              description={tile.description}
              icon={tile.icon}
              accentOverlayClass={tile.accentOverlayClass}
              glowClassName={tile.glowClassName}
              statusBadge={tile.statusBadge}
              iconClassName={tile.iconClassName}
              footnote={tile.footnote}
              onOpen={() => setSelectedView(tile.key)}
            >
              {tile.renderContent()}
            </AuroraTile>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-xs">
        {heroTiles.map(({ key, buttonLabel, icon }) => (
          <Button
            key={key}
            variant={selectedView === key ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedView(key)}
            className="flex items-center gap-xs"
            aria-pressed={selectedView === key}
          >
            <Icon name={icon} className="h-4 w-4" />
            {buttonLabel}
          </Button>
        ))}
      </div>

      {/* Content based on selected view */}
      {selectedView === "overview" && <OverviewView analytics={analytics} />}
      {selectedView === "formations" && (
        <FormationsView analytics={analytics} />
      )}
      {selectedView === "situational" && (
        <SituationalView analytics={analytics} />
      )}
      {selectedView === "performance" && (
        <PerformanceView analytics={analytics} />
      )}
      {selectedView === "player-performance" && (
        <PlayerPerformanceDashboard teamId="demo-team-id" />
      )}
      {selectedView === "game-planning" && (
        <GamePlanningDashboard teamId="demo-team-id" />
      )}
      {selectedView === "session-analytics" && <SessionAnalyticsView />}
      {selectedView === "trend-analytics" && <TrendAnalyticsView />}
    </div>
  );
};

// Overview View Component
const OverviewView: React.FC<{ analytics: PlaybookAnalyticsSummary }> = ({
  analytics,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
    {/* Key Metrics */}
    <Card className="p-lg">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="body-sm" className="text-secondary">
            Total Plays
          </Typography>
          <Typography variant="headline-lg" className="text-primary">
            {analytics.totalPlays}
          </Typography>
        </div>
        <Icon name="file" className="h-8 w-8 text-info" />
      </div>
    </Card>

    <Card className="p-lg">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="body-sm" className="text-secondary">
            Avg Success Rate
          </Typography>
          <Typography variant="headline-lg" className="text-primary">
            {analytics.averageSuccessRate}%
          </Typography>
        </div>
        <Icon name="target" className="h-8 w-8 text-success" />
      </div>
    </Card>

    <Card className="p-lg">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="body-sm" className="text-secondary">
            Avg Complexity
          </Typography>
          <Typography variant="headline-lg" className="text-primary">
            {analytics.averageComplexity}/10
          </Typography>
        </div>
        <Icon name="zap" className="h-8 w-8 text-warning" />
      </div>
    </Card>

    <Card className="p-lg">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="body-sm" className="text-secondary">
            Formations
          </Typography>
          <Typography variant="headline-lg" className="text-primary">
            {analytics.formationsCount}
          </Typography>
        </div>
        <Icon name="grid" className="h-8 w-8 text-primary" />
      </div>
    </Card>

    {/* Complexity Distribution */}
    <Card className="p-lg md:col-span-2">
      <Typography variant="headline-sm" className="mb-md">
        Complexity Distribution
      </Typography>
      <div className="space-y-sm">
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary">Low (1-3)</span>
          <div className="flex items-center space-x-xs">
            <div className="w-24 bg-border rounded-full h-2">
              <div
                className="bg-text-success h-2 rounded-full"
                style={{
                  width: `${(analytics.complexityDistribution.low / analytics.totalPlays) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium w-8">
              {analytics.complexityDistribution.low}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary">Medium (4-7)</span>
          <div className="flex items-center space-x-xs">
            <div className="w-24 bg-border rounded-full h-2">
              <div
                className="bg-text-warning h-2 rounded-full"
                style={{
                  width: `${(analytics.complexityDistribution.medium / analytics.totalPlays) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium w-8">
              {analytics.complexityDistribution.medium}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary">High (8-10)</span>
          <div className="flex items-center space-x-xs">
            <div className="w-24 bg-border rounded-full h-2">
              <div
                className="bg-text-error h-2 rounded-full"
                style={{
                  width: `${(analytics.complexityDistribution.high / analytics.totalPlays) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium w-8">
              {analytics.complexityDistribution.high}
            </span>
          </div>
        </div>
      </div>
    </Card>

    {/* Top Performing Plays */}
    <Card className="p-lg md:col-span-2">
      <Typography variant="headline-sm" className="mb-md">
        Top Performing Plays
      </Typography>
      <div className="space-y-sm">
        {analytics.topPerformingPlays.slice(0, 5).map((play, index) => (
          <div
            key={play.playId}
            className="flex items-center justify-between p-sm bg-secondary rounded-lg"
          >
            <div className="flex items-center space-x-sm">
              <Badge
                variant={index === 0 ? "success" : "neutral"}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              >
                {index + 1}
              </Badge>
              <div>
                <Typography variant="body-sm" className="font-medium">
                  {play.playName}
                </Typography>
                <Typography variant="body-xs" className="text-secondary">
                  {play.formation} • {play.playType}
                </Typography>
              </div>
            </div>
            <div className="text-right">
              <Typography
                variant="body-sm"
                className="font-medium text-success"
              >
                {play.successRate}%
              </Typography>
              <Typography variant="body-xs" className="text-secondary">
                {play.timesCalled} calls
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// Formations View Component
const FormationsView: React.FC<{ analytics: PlaybookAnalyticsSummary }> = ({
  analytics,
}) => (
  <div className="space-y-lg">
    <Typography variant="headline-sm">Formation Analysis</Typography>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
      {analytics.formationAnalytics.map((formation) => (
        <FormationCard key={formation.formation} formation={formation} />
      ))}
    </div>
  </div>
);

// Formation Card Component
const FormationCard: React.FC<{ formation: FormationAnalytics }> = ({
  formation,
}) => (
  <Card className="p-lg">
    <div className="flex items-center justify-between mb-md">
      <Typography variant="headline-sm">{formation.formation}</Typography>
      <Badge
        variant={(() => {
          if (formation.successRate >= 70) return "success";
          if (formation.successRate >= 50) return "warning";
          return "danger";
        })()}
      >
        {formation.successRate}%
      </Badge>
    </div>

    <div className="space-y-sm">
      <div className="flex justify-between">
        <span className="text-sm text-secondary">Total Plays</span>
        <span className="font-medium">{formation.totalPlays}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-secondary">Avg Complexity</span>
        <span className="font-medium">{formation.averageComplexity}/10</span>
      </div>
    </div>

    <div className="mt-md">
      <Typography variant="body-xs" className="text-secondary mb-xs">
        Personnel Usage
      </Typography>
      <div className="flex flex-wrap gap-xs">
        {Object.entries(formation.personnelBreakdown).map(
          ([personnel, count]) => (
            <Badge key={personnel} variant="neutral" className="text-xs">
              {personnel}: {count}
            </Badge>
          )
        )}
      </div>
    </div>
  </Card>
);

// Situational View Component
const SituationalView: React.FC<{ analytics: PlaybookAnalyticsSummary }> = ({
  analytics,
}) => (
  <div className="space-y-lg">
    <Typography variant="headline-sm">Situational Performance</Typography>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
      {/* By Down */}
      <Card className="p-lg">
        <Typography variant="headline-sm" className="mb-md">
          By Down & Distance
        </Typography>
        <div className="space-y-sm">
          {Object.entries(analytics.situationalPerformance.byDown).map(
            ([down, stats]) => (
              <div key={down} className="flex justify-between items-center">
                <span className="text-sm text-secondary">{down}</span>
                <div className="text-right">
                  <span className="font-medium">{stats.rate.toFixed(1)}%</span>
                  <span className="text-xs text-muted ml-2">
                    ({stats.called})
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </Card>

      {/* By Field Position */}
      <Card className="p-lg">
        <Typography variant="headline-sm" className="mb-md">
          By Field Position
        </Typography>
        <div className="space-y-sm">
          {Object.entries(analytics.situationalPerformance.byFieldPosition).map(
            ([position, stats]) => (
              <div key={position} className="flex justify-between items-center">
                <span className="text-sm text-secondary">{position}</span>
                <div className="text-right">
                  <span className="font-medium">{stats.rate.toFixed(1)}%</span>
                  <span className="text-xs text-muted ml-xs">
                    ({stats.called})
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </Card>

      {/* By Personnel */}
      <Card className="p-lg">
        <Typography variant="headline-sm" className="mb-md">
          By Personnel
        </Typography>
        <div className="space-y-sm">
          {Object.entries(analytics.situationalPerformance.byPersonnel).map(
            ([personnel, stats]) => (
              <div
                key={personnel}
                className="flex justify-between items-center"
              >
                <span className="text-sm text-secondary">{personnel}</span>
                <div className="text-right">
                  <span className="font-medium">{stats.rate.toFixed(1)}%</span>
                  <span className="text-xs text-muted ml-xs">
                    ({stats.called})
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </Card>
    </div>
  </div>
);

// Performance View Component
const PerformanceView: React.FC<{ analytics: PlaybookAnalyticsSummary }> = ({
  analytics,
}) => (
  <div className="space-y-lg">
    <Typography variant="headline-sm">Performance Insights</Typography>

    <div className="grid grid-cols-1 gap-lg">
      {/* Success Rate Trends */}
      <Card className="p-lg">
        <Typography variant="headline-sm" className="mb-md">
          Success Rate Analysis
        </Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <div className="text-center p-md bg-success/20 rounded-lg">
            <Typography variant="headline-md" className="text-success">
              {analytics.topPerformingPlays.length > 0
                ? Math.max(
                    ...analytics.topPerformingPlays.map((p) => p.successRate)
                  ).toFixed(1)
                : 0}
              %
            </Typography>
            <Typography variant="body-xs" className="text-success">
              Best Play
            </Typography>
          </div>
          <div className="text-center p-md bg-info/20 rounded-lg">
            <Typography variant="headline-md" className="text-info">
              {analytics.averageSuccessRate.toFixed(1)}%
            </Typography>
            <Typography variant="body-xs" className="text-info">
              Average
            </Typography>
          </div>
          <div className="text-center p-md bg-warning/20 rounded-lg">
            <Typography variant="headline-md" className="text-warning">
              {analytics.averageComplexity.toFixed(1)}/10
            </Typography>
            <Typography variant="body-xs" className="text-warning">
              Complexity
            </Typography>
          </div>
          <div className="text-center p-md bg-secondary rounded-lg">
            <Typography variant="headline-md" className="text-primary">
              {analytics.formationsCount}
            </Typography>
            <Typography variant="body-xs" className="text-primary">
              Formations
            </Typography>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-lg">
        <Typography variant="headline-sm" className="mb-md">
          Strategic Recommendations
        </Typography>
        <div className="space-y-sm">
          {analytics.averageSuccessRate < 60 && (
            <div className="p-sm bg-warning/20 border border-text-warning rounded-lg">
              <Typography variant="body-sm" className="text-warning">
                <Icon name="alert-triangle" className="h-4 w-4 inline mr-xs" />
                Consider simplifying play calls - average success rate is below
                60%.
              </Typography>
            </div>
          )}
          {analytics.averageComplexity > 7 && (
            <div className="p-sm bg-surface-error border border-text-error rounded-lg">
              <Typography variant="body-sm" className="text-error">
                <Icon name="zap" className="h-4 w-4 inline mr-xs" />
                High complexity plays may be causing execution issues.
              </Typography>
            </div>
          )}
          {analytics.formationsCount < 3 && (
            <div className="p-sm bg-info/20 border border-text-info rounded-lg">
              <Typography variant="body-sm" className="text-info">
                <Icon name="grid" className="h-4 w-4 inline mr-xs" />
                Consider adding more formations for situational variety.
              </Typography>
            </div>
          )}
          {analytics.topPerformingPlays.length > 0 &&
            analytics.topPerformingPlays[0].successRate > 80 && (
              <div className="p-sm bg-success/20 border border-text-success rounded-lg">
                <Typography variant="body-sm" className="text-success">
                  <Icon name="check-circle" className="h-4 w-4 inline mr-xs" />
                  Excellent performance! Focus on replicating success patterns.
                </Typography>
              </div>
            )}
        </div>
      </Card>
    </div>
  </div>
);

// Session Analytics View Component
const SessionAnalyticsView: React.FC = () => (
  <SessionAnalyticsDashboard sessionId="demo-session-id" />
);

// Trend Analytics View Component
const TrendAnalyticsView: React.FC = () => (
  <TrendAnalyticsDashboard playId="demo-play-id" teamId="demo-team-id" />
);
