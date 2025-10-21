import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Typography } from "../../design-system/Typography";
import { Card } from "../../ui/Card";

/**
 * Play Type Distribution Chart - Phase 14.1
 * Shows pie/donut chart of play type distribution
 */

interface PlayTypeData {
  type: string;
  count: number;
  percentage: number;
  successRate: number;
  avgYards: number;
}

interface PlayTypeDistributionChartProps {
  data: PlayTypeData[];
  title?: string;
  className?: string;
}

const COLORS = {
  Run: "#3b82f6", // Blue
  Pass: "#8b5cf6", // Purple
  "Play Action": "#ec4899", // Pink
  Screen: "#14b8a6", // Teal
  RPO: "#f59e0b", // Orange
  Special: "#ef4444", // Red
};

export const PlayTypeDistributionChart: React.FC<
  PlayTypeDistributionChartProps
> = ({ data, title = "Play Type Distribution", className = "" }) => {
  // Format data for Recharts
  const chartData = data.map((item) => ({
    name: item.type,
    value: item.percentage,
    count: item.count,
    successRate: item.successRate,
    avgYards: item.avgYards,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-surface-primary border border-border rounded-sm shadow-elevation-lg p-spacing-sm">
          <Typography variant="body-sm" className="font-semibold mb-spacing-xs">
            {data.name}
          </Typography>
          <div className="space-y-spacing-2xs">
            <Typography variant="body-xs">
              {data.payload.count} plays ({data.value}%)
            </Typography>
            <Typography variant="body-xs" className="text-text-secondary">
              Success: {data.payload.successRate}%
            </Typography>
            <Typography variant="body-xs" className="text-text-secondary">
              Avg: {data.payload.avgYards} yards
            </Typography>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label renderer
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label if < 5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (data.length === 0) {
    return (
      <Card className={className}>
        <div className="p-spacing-lg text-center">
          <Typography variant="body-sm" className="text-text-muted">
            No play type data available
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
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    COLORS[entry.name as keyof typeof COLORS] ||
                    "var(--color-jade-600)"
                  }
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Detailed breakdown */}
        <div className="mt-spacing-md space-y-spacing-xs">
          {data.map((item) => (
            <div
              key={item.type}
              className="flex items-center justify-between p-spacing-sm bg-surface-secondary rounded-sm"
            >
              <div className="flex items-center gap-spacing-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      COLORS[item.type as keyof typeof COLORS] ||
                      "var(--color-jade-600)",
                  }}
                />
                <Typography variant="body-sm">{item.type}</Typography>
              </div>
              <div className="text-right">
                <Typography variant="body-sm" className="font-semibold">
                  {item.count} plays
                </Typography>
                <Typography variant="body-xs" className="text-text-secondary">
                  {item.successRate}% success
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
