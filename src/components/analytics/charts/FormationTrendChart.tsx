import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Typography } from "../../design-system/Typography";
import { Card } from "../../ui/Card";
import { CHART_COLORS } from "../../../design-system/chartColors";

interface FormationTrendDataPoint {
  weekLabel: string;
  weekStart: string;
  attempts: number;
  successRate: number;
  avgYards: number;
}

interface FormationTrendChartProps {
  data: FormationTrendDataPoint[];
  formationName: string;
  className?: string;
  targetSuccessRate?: number;
  showAvgYards?: boolean;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const point = payload[0].payload as FormationTrendDataPoint;

  const getSuccessColor = (rate: number) => {
    if (rate >= 75) return "text-success-600";
    if (rate >= 60) return "text-warning-600";
    return "text-error-600";
  };

  return (
    <Card className="shadow-lg">
      <div className="p-3 space-y-1">
        <Typography variant="body-sm" className="font-semibold">
          {point.weekLabel}
        </Typography>
        <div className="space-y-0.5">
          <div className="flex justify-between gap-4">
            <Typography variant="body-xs" className="text-secondary">
              Success Rate:
            </Typography>
            <Typography
              variant="body-xs"
              className={`font-semibold ${getSuccessColor(point.successRate)}`}
            >
              {point.successRate}%
            </Typography>
          </div>
          <div className="flex justify-between gap-4">
            <Typography variant="body-xs" className="text-secondary">
              Avg Yards:
            </Typography>
            <Typography variant="body-xs" className="font-semibold">
              {point.avgYards.toFixed(1)}
            </Typography>
          </div>
          <div className="flex justify-between gap-4">
            <Typography variant="body-xs" className="text-secondary">
              Attempts:
            </Typography>
            <Typography variant="body-xs" className="font-semibold">
              {point.attempts}
            </Typography>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Calculate trend statistics
const calculateStats = (data: FormationTrendDataPoint[]) => {
  const latestPoint = data[data.length - 1];
  const firstPoint = data[0];
  const successChange = latestPoint.successRate - firstPoint.successRate;
  const totalAttempts = data.reduce((sum, point) => sum + point.attempts, 0);
  const avgSuccess =
    data.reduce((sum, point) => sum + point.successRate, 0) / data.length;
  const avgYards =
    data.reduce((sum, point) => sum + point.avgYards, 0) / data.length;

  return {
    latestPoint,
    firstPoint,
    successChange,
    totalAttempts,
    avgSuccess,
    avgYards,
  };
};

// Calculate Y-axis domains
const calculateAxisDomains = (data: FormationTrendDataPoint[]) => {
  const minSuccess = Math.min(...data.map((d) => d.successRate));
  const maxSuccess = Math.max(...data.map((d) => d.successRate));
  const successMin = Math.max(0, Math.floor((minSuccess - 10) / 10) * 10);
  const successMax = Math.min(100, Math.ceil((maxSuccess + 10) / 10) * 10);

  const minYards = Math.min(...data.map((d) => d.avgYards));
  const maxYards = Math.max(...data.map((d) => d.avgYards));
  const yardsMin = Math.max(-5, Math.floor(minYards - 2));
  const yardsMax = Math.ceil(maxYards + 2);

  return { successMin, successMax, yardsMin, yardsMax };
};

// Summary stats display
const SummaryStats: React.FC<{
  avgSuccess: number;
  avgYards: number;
  successChange: number;
}> = ({ avgSuccess, avgYards, successChange }) => {
  const getTrendColor = (change: number) => {
    if (change > 0) return "text-success-600";
    if (change < 0) return "text-error-600";
    return "text-secondary";
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return "↑ ";
    if (change < 0) return "↓ ";
    return "→ ";
  };

  return (
    <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
      <div>
        <Typography variant="body-xs" className="text-secondary mb-1">
          Avg Success Rate
        </Typography>
        <Typography variant="body-sm" className="font-semibold">
          {avgSuccess.toFixed(1)}%
        </Typography>
      </div>
      <div>
        <Typography variant="body-xs" className="text-secondary mb-1">
          Avg Yards/Play
        </Typography>
        <Typography variant="body-sm" className="font-semibold">
          {avgYards.toFixed(1)}
        </Typography>
      </div>
      <div>
        <Typography variant="body-xs" className="text-secondary mb-1">
          Trend
        </Typography>
        <Typography
          variant="body-sm"
          className={`font-semibold ${getTrendColor(successChange)}`}
        >
          {getTrendIcon(successChange)}
          {Math.abs(successChange).toFixed(1)}%
        </Typography>
      </div>
    </div>
  );
};

export const FormationTrendChart: React.FC<FormationTrendChartProps> = ({
  data,
  formationName,
  className = "",
  targetSuccessRate = 70,
  showAvgYards = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <div className="p-6">
          <Typography variant="headline-md" className="mb-4">
            {formationName} Performance Trend
          </Typography>
          <Typography variant="body-sm" className="text-secondary">
            No trend data available for this formation
          </Typography>
        </div>
      </Card>
    );
  }

  const stats = calculateStats(data);
  const { successMin, successMax, yardsMin, yardsMax } =
    calculateAxisDomains(data);

  const getSuccessColor = (rate: number) => {
    if (rate >= targetSuccessRate) return "text-success-600";
    if (rate >= 60) return "text-warning-600";
    return "text-error-600";
  };

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <Typography variant="headline-md" className="mb-1">
              {formationName} Performance
            </Typography>
            <Typography variant="body-xs" className="text-secondary">
              {data.length} weeks • {stats.totalAttempts} total attempts
            </Typography>
          </div>
          <div className="text-right">
            <Typography variant="body-xs" className="text-secondary mb-1">
              Current Success Rate
            </Typography>
            <Typography
              variant="headline-md"
              className={getSuccessColor(stats.latestPoint.successRate)}
            >
              {stats.latestPoint.successRate}%
            </Typography>
            {stats.successChange !== 0 && (
              <Typography
                variant="body-xs"
                className={
                  stats.successChange > 0
                    ? "text-success-600"
                    : "text-error-600"
                }
              >
                {stats.successChange > 0 ? "+" : ""}
                {stats.successChange.toFixed(1)}% from start
              </Typography>
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 12 }}
              stroke={CHART_COLORS.axis}
            />
            <YAxis
              yAxisId="success"
              domain={[successMin, successMax]}
              tick={{ fontSize: 12 }}
              stroke={CHART_COLORS.axis}
              label={{
                value: "Success Rate %",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: CHART_COLORS.axisText },
              }}
            />
            {showAvgYards && (
              <YAxis
                yAxisId="yards"
                orientation="right"
                domain={[yardsMin, yardsMax]}
                tick={{ fontSize: 12 }}
                stroke={CHART_COLORS.axis}
                label={{
                  value: "Avg Yards",
                  angle: 90,
                  position: "insideRight",
                  style: { fontSize: 12, fill: CHART_COLORS.axisText },
                }}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconType="line"
              iconSize={16}
            />

            {/* Target success rate line */}
            {targetSuccessRate && (
              <ReferenceLine
                yAxisId="success"
                y={targetSuccessRate}
                stroke={CHART_COLORS.axis}
                strokeDasharray="5 5"
                label={{
                  value: `Target: ${targetSuccessRate}%`,
                  position: "right",
                  style: { fontSize: 11, fill: CHART_COLORS.axisText },
                }}
              />
            )}

            {/* Success rate line */}
            <Line
              yAxisId="success"
              type="monotone"
              dataKey="successRate"
              name="Success Rate"
              stroke={CHART_COLORS.emerald}
              strokeWidth={3}
              dot={{ fill: CHART_COLORS.emerald, r: 4 }}
              activeDot={{ r: 6 }}
            />

            {/* Avg yards line */}
            {showAvgYards && (
              <Line
                yAxisId="yards"
                type="monotone"
                dataKey="avgYards"
                name="Avg Yards"
                stroke={CHART_COLORS.blue}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: CHART_COLORS.blue, r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <SummaryStats
          avgSuccess={stats.avgSuccess}
          avgYards={stats.avgYards}
          successChange={stats.successChange}
        />
      </div>
    </Card>
  );
};
