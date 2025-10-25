import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Typography } from "../../design-system/Typography";
import { Card } from "../../ui/Card";

interface PlayTypeData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // Allow additional properties for Recharts compatibility
}

interface PlayTypeDistributionChartProps {
  data?: PlayTypeData[];
  className?: string;
}

/**
 * PlayTypeDistributionChart - Shows distribution of play types
 *
 * Visual representation of how different play types are distributed
 * in the playbook or across sessions.
 */
export const PlayTypeDistributionChart: React.FC<
  PlayTypeDistributionChartProps
> = ({ data, className = "" }) => {
  // Default data if none provided
  const defaultData: PlayTypeData[] = [
    { name: "Run", value: 45, color: "#3b82f6" },
    { name: "Pass", value: 35, color: "#ef4444" },
    { name: "Special Teams", value: 15, color: "#10b981" },
    { name: "Screen", value: 5, color: "#f59e0b" },
  ];

  const chartData = data || defaultData;

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-surface-primary rounded-lg p-3 shadow-xl">
          <Typography variant="body-sm" className="font-medium">
            {data.name}
          </Typography>
          <Typography variant="body-xs" className="text-text-secondary">
            {data.value} plays (
            {(
              (data.value /
                chartData.reduce((sum, item) => sum + item.value, 0)) *
              100
            ).toFixed(1)}
            %)
          </Typography>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`p-6 ${className}`}>
      <Typography variant="headline-sm" className="mb-4">
        Play Type Distribution
      </Typography>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>
                  {value} ({entry.payload.value})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <Typography variant="body-xs" className="text-text-secondary mt-2">
        Distribution of play types in your playbook
      </Typography>
    </Card>
  );
};
