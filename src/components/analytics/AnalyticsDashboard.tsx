import React, { useState, useEffect, useCallback } from "react";
import { Typography } from "../design-system/Typography";
import { Icon, type IconName } from "../ui/Icon";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { AuroraTile } from "../ui/AuroraTile";
import {
  PlaybookAnalyticsService,
  type PlaybookAnalyticsSummary,
  type FormationAnalytics,
} from "../../services/playAnalyticsService";
import { PlayerPerformanceDashboard } from "./PlayerPerformanceDashboard";
import { GamePlanningDashboard } from "./GamePlanningDashboard";

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
  | "game-planning";

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
        await PlaybookAnalyticsService.getPlaybookAnalytics(playbookId);
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
      <div
        className={`flex items-center justify-center p-spacing-2xl ${className}`}
      >
        <div className="text-center">
          <Icon
            name="refresh-cw"
            className="h-8 w-8 animate-spin text-jade-600 mx-auto mb-spacing-md"
          />
          <Typography variant="body-lg">Loading analytics...</Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-spacing-2xl text-center ${className}`}>
        <Icon
          name="alert-triangle"
          className="h-12 w-12 text-text-error mx-auto mb-spacing-md"
        />
        <Typography
          variant="headline-sm"
          className="text-text-error mb-spacing-xs"
        >
          Analytics Error
        </Typography>
        <Typography variant="body-sm" className="text-text-error mb-spacing-md">
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
      <div className={`p-spacing-2xl text-center ${className}`}>
        <Icon
          name="bar-chart"
          className="h-12 w-12 text-text-muted mx-auto mb-spacing-md"
        />
        <Typography
          variant="headline-sm"
          className="text-text-secondary mb-spacing-xs"
        >
          No Analytics Data
        </Typography>
        <Typography variant="body-sm" className="text-text-secondary">
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
  const complexityFocus = totalComplexityCount
    ? (
        Object.entries(complexityTotals) as Array<
          ["low" | "medium" | "high", number]
        >
      ).reduce((best, entry) => (entry[1] > best[1] ? entry : best), [
        "low",
        complexityTotals.low || 0,
      ] as ["low" | "medium" | "high", number])
    : ["low", 0];

  const complexityCopy: Record<"low" | "medium" | "high", string> = {
    low: "Install ready",
    medium: "Balanced attack",
    high: "Advanced package",
  };

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
        <div className="grid gap-spacing-xs text-sm text-text-secondary">
          <div className="flex items-center justify-between">
            <span>Total plays</span>
            <span className="font-semibold text-text-primary">
              {analytics.totalPlays}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Avg success</span>
            <span className="font-semibold text-text-primary">
              {formatPercent(analytics.averageSuccessRate)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Avg complexity</span>
            <span className="font-semibold text-text-primary">
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
        <div className="space-y-spacing-xs text-sm">
          <div className="text-text-secondary">Top formation</div>
          <div className="flex items-baseline justify-between gap-spacing-md">
            <span className="font-semibold text-text-primary truncate">
              {bestFormation?.formation ?? "No data"}
            </span>
            <span className="text-text-secondary">
              {bestFormation ? formatPercent(bestFormation.successRate) : "0%"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Avg complexity</span>
            <span className="font-semibold text-text-primary">
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
        <div className="space-y-spacing-xs text-sm">
          <div className="text-text-secondary">Best down & distance</div>
          <div className="flex items-baseline justify-between gap-spacing-md">
            <span className="font-semibold text-text-primary truncate">
              {bestDown ? bestDown[0] : "No data"}
            </span>
            <span className="text-text-secondary">
              {bestDown ? formatPercent(bestDown[1].rate) : "0%"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Calls tracked</span>
            <span className="font-semibold text-text-primary">
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
        <div className="space-y-spacing-xs text-sm">
          <div className="text-text-secondary">Focus</div>
          <div className="flex items-baseline justify-between gap-spacing-md">
            <span className="font-semibold text-text-primary capitalize">
              {complexityCopy[complexityFocus[0]]}
            </span>
            <span className="text-text-secondary">
              {totalComplexityCount
                ? `${Math.round(
                    (complexityFocus[1] / totalComplexityCount) * 100
                  )}% share`
                : "0% share"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Install balance</span>
            <span className="font-semibold text-text-primary">
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
        <div className="space-y-spacing-xs text-sm">
          <div className="text-text-secondary">Top performing play</div>
          <div className="flex items-baseline justify-between gap-spacing-md">
            <span className="font-semibold text-text-primary truncate">
              {topPlay?.playName ?? "No data"}
            </span>
            <span className="text-text-secondary">
              {topPlay ? formatPercent(topPlay.successRate) : "0%"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Calls / success</span>
            <span className="font-semibold text-text-primary">
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
        <div className="space-y-spacing-xs text-sm">
          <div className="text-text-secondary">Personnel advantage</div>
          <div className="flex items-baseline justify-between gap-spacing-md">
            <span className="font-semibold text-text-primary truncate">
              {bestPersonnel ? bestPersonnel[0] : "No data"}
            </span>
            <span className="text-text-secondary">
              {bestPersonnel ? formatPercent(bestPersonnel[1].rate) : "0%"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Calls tagged</span>
            <span className="font-semibold text-text-primary">
              {bestPersonnel ? bestPersonnel[1].called : 0}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={`space-y-spacing-2xl ${className}`}>
      <div className="rounded-glass-lg border border/40 bg-aurora-shell p-5 shadow-md shadow-slate-200/40 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-slate-900/40 sm:p-6 xl:p-7">
        <div className="mb-spacing-lg flex flex-col gap-spacing-xs">
          <Typography
            variant="headline-md"
            className="flex items-center gap-3 text-text-primary"
          >
            <Icon name="bar-chart" className="h-6 w-6 text-jade-600" />
            Advanced Analytics
          </Typography>
          <Typography variant="body-sm" className="text-text-secondary">
            Choose a workspace to dive deeper into your playbook trends.
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-spacing-md sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
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

      <div className="flex flex-wrap items-center justify-end gap-spacing-xs">
        {heroTiles.map(({ key, buttonLabel, icon }) => (
          <Button
            key={key}
            variant={selectedView === key ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedView(key)}
            className="flex items-center gap-spacing-xs"
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
    </div>
  );
};

// Overview View Component
const OverviewView: React.FC<{ analytics: PlaybookAnalyticsSummary }> = ({
  analytics,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-spacing-lg">
    {/* Key Metrics */}
    <Card className="p-spacing-lg">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="body-sm" className="text-text-secondary">
            Total Plays
          </Typography>
          <Typography variant="headline-lg" className="text-text-primary">
            {analytics.totalPlays}
          </Typography>
        </div>
        <Icon name="file" className="h-8 w-8 text-text-info" />
      </div>
    </Card>

    <Card className="p-spacing-lg">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="body-sm" className="text-text-secondary">
            Avg Success Rate
          </Typography>
          <Typography variant="headline-lg" className="text-text-primary">
            {analytics.averageSuccessRate}%
          </Typography>
        </div>
        <Icon name="target" className="h-8 w-8 text-text-success" />
      </div>
    </Card>

    <Card className="p-spacing-lg">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="body-sm" className="text-text-secondary">
            Avg Complexity
          </Typography>
          <Typography variant="headline-lg" className="text-text-primary">
            {analytics.averageComplexity}/10
          </Typography>
        </div>
        <Icon name="zap" className="h-8 w-8 text-text-warning" />
      </div>
    </Card>

    <Card className="p-spacing-lg">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="body-sm" className="text-text-secondary">
            Formations
          </Typography>
          <Typography variant="headline-lg" className="text-text-primary">
            {analytics.formationsCount}
          </Typography>
        </div>
        <Icon name="grid" className="h-8 w-8 text-text-primary" />
      </div>
    </Card>

    {/* Complexity Distribution */}
    <Card className="p-spacing-lg md:col-span-2">
      <Typography variant="headline-sm" className="mb-spacing-md">
        Complexity Distribution
      </Typography>
      <div className="space-y-spacing-sm">
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Low (1-3)</span>
          <div className="flex items-center space-x-spacing-xs">
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
          <span className="text-sm text-text-secondary">Medium (4-7)</span>
          <div className="flex items-center space-x-spacing-xs">
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
          <span className="text-sm text-text-secondary">High (8-10)</span>
          <div className="flex items-center space-x-spacing-xs">
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
    <Card className="p-spacing-lg md:col-span-2">
      <Typography variant="headline-sm" className="mb-spacing-md">
        Top Performing Plays
      </Typography>
      <div className="space-y-spacing-sm">
        {analytics.topPerformingPlays.slice(0, 5).map((play, index) => (
          <div
            key={play.playId}
            className="flex items-center justify-between p-spacing-sm bg-surface-secondary rounded-lg"
          >
            <div className="flex items-center space-x-spacing-sm">
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
                <Typography variant="body-xs" className="text-text-secondary">
                  {play.formation} • {play.playType}
                </Typography>
              </div>
            </div>
            <div className="text-right">
              <Typography
                variant="body-sm"
                className="font-medium text-text-success"
              >
                {play.successRate}%
              </Typography>
              <Typography variant="body-xs" className="text-text-secondary">
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
  <div className="space-y-spacing-lg">
    <Typography variant="headline-sm">Formation Analysis</Typography>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-lg">
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
  <Card className="p-spacing-lg">
    <div className="flex items-center justify-between mb-spacing-md">
      <Typography variant="headline-sm">{formation.formation}</Typography>
      <Badge
        variant={
          formation.successRate >= 70
            ? "success"
            : formation.successRate >= 50
              ? "warning"
              : "danger"
        }
      >
        {formation.successRate}%
      </Badge>
    </div>

    <div className="space-y-spacing-sm">
      <div className="flex justify-between">
        <span className="text-sm text-text-secondary">Total Plays</span>
        <span className="font-medium">{formation.totalPlays}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-text-secondary">Avg Complexity</span>
        <span className="font-medium">{formation.averageComplexity}/10</span>
      </div>
    </div>

    <div className="mt-spacing-md">
      <Typography
        variant="body-xs"
        className="text-text-secondary mb-spacing-xs"
      >
        Personnel Usage
      </Typography>
      <div className="flex flex-wrap gap-spacing-xs">
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
  <div className="space-y-spacing-lg">
    <Typography variant="headline-sm">Situational Performance</Typography>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-spacing-lg">
      {/* By Down */}
      <Card className="p-spacing-lg">
        <Typography variant="headline-sm" className="mb-spacing-md">
          By Down & Distance
        </Typography>
        <div className="space-y-spacing-sm">
          {Object.entries(analytics.situationalPerformance.byDown).map(
            ([down, stats]) => (
              <div key={down} className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">{down}</span>
                <div className="text-right">
                  <span className="font-medium">{stats.rate.toFixed(1)}%</span>
                  <span className="text-xs text-text-muted ml-2">
                    ({stats.called})
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </Card>

      {/* By Field Position */}
      <Card className="p-spacing-lg">
        <Typography variant="headline-sm" className="mb-spacing-md">
          By Field Position
        </Typography>
        <div className="space-y-spacing-sm">
          {Object.entries(analytics.situationalPerformance.byFieldPosition).map(
            ([position, stats]) => (
              <div key={position} className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">{position}</span>
                <div className="text-right">
                  <span className="font-medium">{stats.rate.toFixed(1)}%</span>
                  <span className="text-xs text-text-muted ml-spacing-xs">
                    ({stats.called})
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </Card>

      {/* By Personnel */}
      <Card className="p-spacing-lg">
        <Typography variant="headline-sm" className="mb-spacing-md">
          By Personnel
        </Typography>
        <div className="space-y-spacing-sm">
          {Object.entries(analytics.situationalPerformance.byPersonnel).map(
            ([personnel, stats]) => (
              <div
                key={personnel}
                className="flex justify-between items-center"
              >
                <span className="text-sm text-text-secondary">{personnel}</span>
                <div className="text-right">
                  <span className="font-medium">{stats.rate.toFixed(1)}%</span>
                  <span className="text-xs text-text-muted ml-spacing-xs">
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
  <div className="space-y-spacing-lg">
    <Typography variant="headline-sm">Performance Insights</Typography>

    <div className="grid grid-cols-1 gap-spacing-lg">
      {/* Success Rate Trends */}
      <Card className="p-spacing-lg">
        <Typography variant="headline-sm" className="mb-spacing-md">
          Success Rate Analysis
        </Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-spacing-md">
          <div className="text-center p-spacing-md bg-surface-success rounded-lg">
            <Typography variant="headline-md" className="text-text-success">
              {analytics.topPerformingPlays.length > 0
                ? Math.max(
                    ...analytics.topPerformingPlays.map((p) => p.successRate)
                  ).toFixed(1)
                : 0}
              %
            </Typography>
            <Typography variant="body-xs" className="text-text-success">
              Best Play
            </Typography>
          </div>
          <div className="text-center p-spacing-md bg-surface-info rounded-lg">
            <Typography variant="headline-md" className="text-text-info">
              {analytics.averageSuccessRate.toFixed(1)}%
            </Typography>
            <Typography variant="body-xs" className="text-text-info">
              Average
            </Typography>
          </div>
          <div className="text-center p-spacing-md bg-surface-warning rounded-lg">
            <Typography variant="headline-md" className="text-text-warning">
              {analytics.averageComplexity.toFixed(1)}/10
            </Typography>
            <Typography variant="body-xs" className="text-text-warning">
              Complexity
            </Typography>
          </div>
          <div className="text-center p-spacing-md bg-surface-secondary rounded-lg">
            <Typography variant="headline-md" className="text-text-primary">
              {analytics.formationsCount}
            </Typography>
            <Typography variant="body-xs" className="text-text-primary">
              Formations
            </Typography>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-spacing-lg">
        <Typography variant="headline-sm" className="mb-spacing-md">
          Strategic Recommendations
        </Typography>
        <div className="space-y-spacing-sm">
          {analytics.averageSuccessRate < 60 && (
            <div className="p-spacing-sm bg-surface-warning border border-text-warning rounded-lg">
              <Typography variant="body-sm" className="text-text-warning">
                <Icon
                  name="alert-triangle"
                  className="h-4 w-4 inline mr-spacing-xs"
                />
                Consider simplifying play calls - average success rate is below
                60%.
              </Typography>
            </div>
          )}
          {analytics.averageComplexity > 7 && (
            <div className="p-spacing-sm bg-surface-error border border-text-error rounded-lg">
              <Typography variant="body-sm" className="text-text-error">
                <Icon name="zap" className="h-4 w-4 inline mr-spacing-xs" />
                High complexity plays may be causing execution issues.
              </Typography>
            </div>
          )}
          {analytics.formationsCount < 3 && (
            <div className="p-spacing-sm bg-surface-info border border-text-info rounded-lg">
              <Typography variant="body-sm" className="text-text-info">
                <Icon name="grid" className="h-4 w-4 inline mr-spacing-xs" />
                Consider adding more formations for situational variety.
              </Typography>
            </div>
          )}
          {analytics.topPerformingPlays.length > 0 &&
            analytics.topPerformingPlays[0].successRate > 80 && (
              <div className="p-spacing-sm bg-surface-success border border-text-success rounded-lg">
                <Typography variant="body-sm" className="text-text-success">
                  <Icon
                    name="check-circle"
                    className="h-4 w-4 inline mr-spacing-xs"
                  />
                  Excellent performance! Focus on replicating success patterns.
                </Typography>
              </div>
            )}
        </div>
      </Card>
    </div>
  </div>
);
