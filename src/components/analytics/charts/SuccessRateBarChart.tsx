import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Typography } from "../../design-system/Typography";
import { Card } from "../../ui/Card";

interface SuccessRateData {
  name: string;
  successRate: number;
  totalPlays: number;
  successfulPlays: number;
}

interface SuccessRateBarChartProps {
  data?: SuccessRateData[];
  title?: string;
  className?: string;
}

/**
 * SuccessRateBarChart - Bar chart showing success rates
 *
 * Visual representation of success rates across different categories
 * like formations, play types, or time periods.
 */
export const SuccessRateBarChart: React.FC<SuccessRateBarChartProps> = ({
  data,
  title = "Success Rate Analysis",
  className = "",
}) => {
  // Default data if none provided
  const defaultData: SuccessRateData[] = [
    { name: "Spread", successRate: 78, totalPlays: 45, successfulPlays: 35 },
    {
      name: "I-Formation",
      successRate: 65,
      totalPlays: 32,
      successfulPlays: 21,
    },
    { name: "Shotgun", successRate: 82, totalPlays: 28, successfulPlays: 23 },
    { name: "Pistol", successRate: 71, totalPlays: 24, successfulPlays: 17 },
    { name: "Wildcat", successRate: 58, totalPlays: 12, successfulPlays: 7 },
  ];

  const chartData = data || defaultData;

  const getBarColor = (successRate: number) => {
    if (successRate >= 75) return "#10b981"; // green
    if (successRate >= 60) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-primary rounded-lg p-3 shadow-xl">
          <Typography variant="body-sm" className="font-medium mb-1">
            {label}
          </Typography>
          <Typography variant="body-xs" className="text-secondary">
            Success Rate: {data.successRate}%
          </Typography>
          <Typography variant="body-xs" className="text-secondary">
            {data.successfulPlays}/{data.totalPlays} plays successful
          </Typography>
        </div>
      );
    }
    return null;
  };

  const formatYAxisTick = (value: number) => `${value}%`;

  return (
    <Card className={`p-6 ${className}`}>
      <Typography variant="headline-sm" className="mb-4">
        {title}
      </Typography>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              className="text-secondary"
            />
            <YAxis
              tickFormatter={formatYAxisTick}
              tick={{ fontSize: 12 }}
              className="text-secondary"
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="successRate" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.successRate)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Typography variant="body-xs" className="text-secondary mt-2">
        Success rates by formation (higher is better)
      </Typography>
    </Card>
  );
};
