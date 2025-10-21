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

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const point = payload[0].payload as FormationTrendDataPoint;

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
                className={`font-semibold ${
                  point.successRate >= 75
                    ? "text-success-600"
                    : point.successRate >= 60
                      ? "text-warning-600"
                      : "text-error-600"
                }`}
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

  // Calculate stats
  const latestPoint = data[data.length - 1];
  const firstPoint = data[0];
  const successChange = latestPoint.successRate - firstPoint.successRate;
  const totalAttempts = data.reduce((sum, point) => sum + point.attempts, 0);
  const avgSuccess =
    data.reduce((sum, point) => sum + point.successRate, 0) / data.length;
  const avgYards =
    data.reduce((sum, point) => sum + point.avgYards, 0) / data.length;

  // Calculate Y-axis domains
  const minSuccess = Math.min(...data.map((d) => d.successRate));
  const maxSuccess = Math.max(...data.map((d) => d.successRate));
  const successMin = Math.max(0, Math.floor((minSuccess - 10) / 10) * 10);
  const successMax = Math.min(100, Math.ceil((maxSuccess + 10) / 10) * 10);

  const minYards = Math.min(...data.map((d) => d.avgYards));
  const maxYards = Math.max(...data.map((d) => d.avgYards));
  const yardsMin = Math.max(-5, Math.floor(minYards - 2));
  const yardsMax = Math.ceil(maxYards + 2);

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <Typography variant="headline-md" className="mb-1">
              {formationName} Performance
            </Typography>
            <Typography variant="body-xs" className="text-secondary">
              {data.length} weeks • {totalAttempts} total attempts
            </Typography>
          </div>
          <div className="text-right">
            <Typography variant="body-xs" className="text-secondary mb-1">
              Current Success Rate
            </Typography>
            <Typography
              variant="headline-md"
              className={
                latestPoint.successRate >= targetSuccessRate
                  ? "text-success-600"
                  : latestPoint.successRate >= 60
                    ? "text-warning-600"
                    : "text-error-600"
              }
            >
              {latestPoint.successRate}%
            </Typography>
            {successChange !== 0 && (
              <Typography
                variant="body-xs"
                className={
                  successChange > 0 ? "text-success-600" : "text-error-600"
                }
              >
                {successChange > 0 ? "+" : ""}
                {successChange.toFixed(1)}% from start
              </Typography>
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              yAxisId="success"
              domain={[successMin, successMax]}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              label={{
                value: "Success Rate %",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: "#6b7280" },
              }}
            />
            {showAvgYards && (
              <YAxis
                yAxisId="yards"
                orientation="right"
                domain={[yardsMin, yardsMax]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{
                  value: "Avg Yards",
                  angle: 90,
                  position: "insideRight",
                  style: { fontSize: 12, fill: "#6b7280" },
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
                stroke="#9ca3af"
                strokeDasharray="5 5"
                label={{
                  value: `Target: ${targetSuccessRate}%`,
                  position: "right",
                  style: { fontSize: 11, fill: "#6b7280" },
                }}
              />
            )}

            {/* Success rate line */}
            <Line
              yAxisId="success"
              type="monotone"
              dataKey="successRate"
              name="Success Rate"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
            />

            {/* Avg yards line */}
            {showAvgYards && (
              <Line
                yAxisId="yards"
                type="monotone"
                dataKey="avgYards"
                name="Avg Yards"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#3b82f6", r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
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
              className={`font-semibold ${
                successChange > 0
                  ? "text-success-600"
                  : successChange < 0
                    ? "text-error-600"
                    : "text-secondary"
              }`}
            >
              {successChange > 0 ? "↑ " : successChange < 0 ? "↓ " : "→ "}
              {Math.abs(successChange).toFixed(1)}%
            </Typography>
          </div>
        </div>
      </div>
    </Card>
  );
};
