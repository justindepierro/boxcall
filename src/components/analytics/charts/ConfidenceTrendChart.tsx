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
import { Typography } from "../../ui/Typography";
import { Card } from "../../ui/Card";

interface TrendDataPoint {
  weekLabel: string;
  weekStart: string;
  confidence: number;
  reps: number;
  successRate: number;
  avgYards: number;
}

interface ConfidenceTrendChartProps {
  data: TrendDataPoint[];
  title?: string;
  className?: string;
  showSuccessRate?: boolean;
  showReps?: boolean;
  targetConfidence?: number; // e.g., 80 for 80% target
}

export const ConfidenceTrendChart: React.FC<ConfidenceTrendChartProps> = ({
  data,
  title = "Confidence Trend",
  className = "",
  showSuccessRate = false,
  showReps = false,
  targetConfidence = 80,
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <div className="p-6">
          <Typography variant="headline-md" className="mb-4">
            {title}
          </Typography>
          <Typography variant="body-sm" className="text-secondary">
            No trend data available
          </Typography>
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const point = payload[0].payload as TrendDataPoint;

    return (
      <Card className="shadow-lg">
        <div className="p-3 space-y-1">
          <Typography variant="body-sm" className="font-semibold">
            {point.weekLabel}
          </Typography>
          <div className="space-y-0.5">
            <div className="flex justify-between gap-4">
              <Typography variant="body-xs" className="text-secondary">
                Confidence:
              </Typography>
              <Typography variant="body-xs" className="font-semibold text-brand-600">
                {point.confidence}%
              </Typography>
            </div>
            {showSuccessRate && (
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
            )}
            {showReps && (
              <div className="flex justify-between gap-4">
                <Typography variant="body-xs" className="text-secondary">
                  Reps:
                </Typography>
                <Typography variant="body-xs" className="font-semibold">
                  {point.reps}
                </Typography>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <Typography variant="body-xs" className="text-secondary">
                Avg Yards:
              </Typography>
              <Typography variant="body-xs" className="font-semibold">
                {point.avgYards.toFixed(1)}
              </Typography>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Calculate domain for Y-axis
  const minConfidence = Math.min(...data.map((d) => d.confidence));
  const maxConfidence = Math.max(...data.map((d) => d.confidence));
  const yAxisMin = Math.max(0, Math.floor((minConfidence - 10) / 10) * 10);
  const yAxisMax = Math.min(100, Math.ceil((maxConfidence + 10) / 10) * 10);

  const minSuccess = showSuccessRate
    ? Math.min(...data.map((d) => d.successRate))
    : 0;
  const maxSuccess = showSuccessRate
    ? Math.max(...data.map((d) => d.successRate))
    : 100;

  // Calculate summary stats
  const latestPoint = data[data.length - 1];
  const firstPoint = data[0];
  const confidenceChange = latestPoint.confidence - firstPoint.confidence;
  const totalReps = data.reduce((sum, point) => sum + point.reps, 0);
  const avgConfidence =
    data.reduce((sum, point) => sum + point.confidence, 0) / data.length;

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <Typography variant="headline-md" className="mb-1">
              {title}
            </Typography>
            <Typography variant="body-xs" className="text-secondary">
              {data.length} weeks of data • {totalReps} total reps
            </Typography>
          </div>
          <div className="text-right">
            <Typography variant="body-xs" className="text-secondary mb-1">
              Current
            </Typography>
            <Typography
              variant="headline-md"
              className={
                latestPoint.confidence >= targetConfidence
                  ? "text-success-600"
                  : "text-warning-600"
              }
            >
              {latestPoint.confidence}%
            </Typography>
            {confidenceChange !== 0 && (
              <Typography
                variant="body-xs"
                className={
                  confidenceChange > 0 ? "text-success-600" : "text-error-600"
                }
              >
                {confidenceChange > 0 ? "+" : ""}
                {confidenceChange.toFixed(1)}% from start
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
              yAxisId="confidence"
              domain={[yAxisMin, yAxisMax]}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              label={{
                value: "Confidence %",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: "#6b7280" },
              }}
            />
            {showSuccessRate && (
              <YAxis
                yAxisId="success"
                orientation="right"
                domain={[
                  Math.max(0, Math.floor((minSuccess - 10) / 10) * 10),
                  Math.min(100, Math.ceil((maxSuccess + 10) / 10) * 10),
                ]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{
                  value: "Success %",
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

            {/* Target confidence line */}
            {targetConfidence && (
              <ReferenceLine
                yAxisId="confidence"
                y={targetConfidence}
                stroke="#9ca3af"
                strokeDasharray="5 5"
                label={{
                  value: `Target: ${targetConfidence}%`,
                  position: "right",
                  style: { fontSize: 11, fill: "#6b7280" },
                }}
              />
            )}

            {/* Confidence trend line */}
            <Line
              yAxisId="confidence"
              type="monotone"
              dataKey="confidence"
              name="Confidence"
              stroke="#7c3aed"
              strokeWidth={3}
              dot={{ fill: "#7c3aed", r: 4 }}
              activeDot={{ r: 6 }}
            />

            {/* Success rate trend line */}
            {showSuccessRate && (
              <Line
                yAxisId="success"
                type="monotone"
                dataKey="successRate"
                name="Success Rate"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#10b981", r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
          <div>
            <Typography variant="body-xs" className="text-secondary mb-1">
              Avg Confidence
            </Typography>
            <Typography variant="body-sm" className="font-semibold">
              {avgConfidence.toFixed(1)}%
            </Typography>
          </div>
          <div>
            <Typography variant="body-xs" className="text-secondary mb-1">
              Total Reps
            </Typography>
            <Typography variant="body-sm" className="font-semibold">
              {totalReps}
            </Typography>
          </div>
          <div>
            <Typography variant="body-xs" className="text-secondary mb-1">
              Trend
            </Typography>
            <Typography
              variant="body-sm"
              className={`font-semibold ${
                confidenceChange > 0
                  ? "text-success-600"
                  : confidenceChange < 0
                    ? "text-error-600"
                    : "text-secondary"
              }`}
            >
              {confidenceChange > 0 ? "↑ " : confidenceChange < 0 ? "↓ " : "→ "}
              {Math.abs(confidenceChange).toFixed(1)}%
            </Typography>
          </div>
        </div>
      </div>
    </Card>
  );
};
