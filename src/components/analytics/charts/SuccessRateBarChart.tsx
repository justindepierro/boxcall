import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Typography } from "../../design-system/Typography";
import { Card } from "../../ui/Card";

/**
 * Success Rate Bar Chart - Phase 14.1
 * Shows success rate breakdown by down
 */

interface SuccessRateData {
  down: number;
  attempts: number;
  successes: number;
  successRate: number;
  avgYards: number;
}

interface SuccessRateBarChartProps {
  data: SuccessRateData[];
  title?: string;
  className?: string;
}

export const SuccessRateBarChart: React.FC<SuccessRateBarChartProps> = ({
  data,
  title = "Success Rate by Down",
  className = "",
}) => {
  // Format data for Recharts
  const chartData = data.map((item) => ({
    name: `${getDownLabel(item.down)} Down`,
    successRate: item.successRate,
    attempts: item.attempts,
    avgYards: item.avgYards,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-primary border border-border rounded-sm shadow-elevation-lg p-spacing-sm">
          <Typography variant="body-sm" className="font-semibold mb-spacing-xs">
            {data.name}
          </Typography>
          <div className="space-y-spacing-xs">
            <div className="flex items-center gap-spacing-xs">
              <div className="w-3 h-3 rounded-sm bg-success-500" />
              <Typography variant="body-xs">
                Success Rate: {data.successRate}%
              </Typography>
            </div>
            <Typography variant="body-xs" className="text-text-secondary">
              {data.attempts} attempts • {data.avgYards} avg yards
            </Typography>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get bar color based on success rate
  const getBarColor = (value: number) => {
    if (value >= 75) return "var(--color-success-500)"; // Green
    if (value >= 60) return "var(--color-warning-500)"; // Yellow
    return "var(--color-error-500)"; // Red
  };

  if (data.length === 0) {
    return (
      <Card className={className}>
        <div className="p-spacing-lg text-center">
          <Typography variant="body-sm" className="text-text-muted">
            No down data available
          </Typography>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-spacing-lg">
        <Typography variant="headline-sm" className="mb-spacing-md">
          {title}
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
            />
            <YAxis
              label={{
                value: "Success Rate (%)",
                angle: -90,
                position: "insideLeft",
                style: {
                  fill: "var(--color-text-secondary)",
                  fontSize: 12,
                },
              }}
              tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="successRate"
              fill="var(--color-jade-600)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Summary stats */}
        <div className="mt-spacing-md grid grid-cols-2 md:grid-cols-4 gap-spacing-sm">
          {data.map((item) => (
            <div
              key={item.down}
              className="text-center p-spacing-sm bg-surface-secondary rounded-sm"
            >
              <Typography variant="body-xs" className="text-text-secondary">
                {getDownLabel(item.down)} Down
              </Typography>
              <Typography
                variant="body-lg"
                className="font-semibold"
                style={{
                  color: getBarColor(item.successRate),
                }}
              >
                {item.successRate}%
              </Typography>
              <Typography variant="body-xs" className="text-text-muted">
                {item.attempts} plays
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Helper function
function getDownLabel(down: number): string {
  const labels: Record<number, string> = {
    1: "1st",
    2: "2nd",
    3: "3rd",
    4: "4th",
  };
  return labels[down] || `${down}th`;
}
