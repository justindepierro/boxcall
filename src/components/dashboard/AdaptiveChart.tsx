/**
 * Adaptive Chart Component
 * Phase 2A Sprint 3: Smart chart selection and responsive visualization
 *
 * Automatically selects optimal chart types and configurations based on
 * data characteristics, screen size, and user context.
 */

import React, { useMemo } from "react";
import type { DataSeries, DataInsight } from "@services/smartDataAnalyzer";
import { SmartDataAnalyzer } from "@services/smartDataAnalyzer";

// Chart library components (placeholder - replace with actual chart library)
interface ChartProps {
  data: DataSeries;
  width?: number;
  height?: number;
  responsive?: boolean;
  theme?: "light" | "dark";
}

// Placeholder chart components - replace with actual implementation
const LineChart: React.FC<ChartProps> = ({ data, ...props }) => (
  <div className="chart-container" {...props}>
    Line Chart: {data.name}
  </div>
);

const BarChart: React.FC<ChartProps> = ({ data, ...props }) => (
  <div className="chart-container" {...props}>
    Bar Chart: {data.name}
  </div>
);

const AreaChart: React.FC<ChartProps> = ({ data, ...props }) => (
  <div className="chart-container" {...props}>
    Area Chart: {data.name}
  </div>
);

const ScatterChart: React.FC<ChartProps> = ({ data, ...props }) => (
  <div className="chart-container" {...props}>
    Scatter Chart: {data.name}
  </div>
);

const GaugeChart: React.FC<ChartProps> = ({ data, ...props }) => (
  <div className="chart-container" {...props}>
    Gauge Chart: {data.name}
  </div>
);

export interface AdaptiveChartProps {
  data: DataSeries;
  className?: string;
  autoResize?: boolean;
  showInsights?: boolean;
  interactionLevel?: "minimal" | "standard" | "advanced";
  context?: "dashboard" | "detail" | "fullscreen";
}

export interface ChartConfig {
  type: DataInsight["visualizationType"];
  responsive: boolean;
  height: number;
  showLegend: boolean;
  showTooltips: boolean;
  animationDuration: number;
  colorScheme: string[];
}

export const AdaptiveChart: React.FC<AdaptiveChartProps> = ({
  data,
  className = "",
  autoResize = true,
  showInsights = true,
  interactionLevel = "standard",
  context = "dashboard",
}) => {
  /**
   * Generate smart chart configuration based on data and context
   */
  const chartConfig = useMemo<ChartConfig>(() => {
    const recommendedType = SmartDataAnalyzer.recommendChartType(data);

    // Adjust configuration based on context
    const contextConfigs = {
      dashboard: { height: 200, showLegend: false, animationDuration: 300 },
      detail: { height: 300, showLegend: true, animationDuration: 500 },
      fullscreen: { height: 400, showLegend: true, animationDuration: 700 },
    };

    const baseConfig = contextConfigs[context];

    return {
      type: recommendedType,
      responsive: autoResize,
      height: baseConfig.height,
      showLegend: baseConfig.showLegend,
      showTooltips: interactionLevel !== "minimal",
      animationDuration: baseConfig.animationDuration,
      colorScheme: getColorScheme(data.type),
    };
  }, [data, autoResize, interactionLevel, context]);

  /**
   * Generate insights for current data
   */
  const insights = useMemo<DataInsight[]>(() => {
    if (!showInsights) return [];
    return SmartDataAnalyzer.generateInsights([data]);
  }, [data, showInsights]);

  /**
   * Handle chart interactions (placeholder for future implementation)
   */
  // const handleChartInteraction = useCallback((eventType: string, eventData: unknown) => {
  //   // Analytics tracking for chart interactions
  //   console.log(`Chart interaction: ${eventType}`, eventData);
  //
  //   // Could trigger adaptive recommendations or drill-down views
  //   if (eventType === "dataPoint:click" && context === "dashboard") {
  //     // Navigate to detail view
  //   }
  // }, [context]);

  /**
   * Render appropriate chart component based on configuration
   */
  const renderChart = () => {
    const chartProps: ChartProps = {
      data,
      height: chartConfig.height,
      responsive: chartConfig.responsive,
      theme: "light", // Could be derived from user preferences
    };

    switch (chartConfig.type) {
      case "line":
        return <LineChart {...chartProps} />;
      case "bar":
        return <BarChart {...chartProps} />;
      case "area":
        return <AreaChart {...chartProps} />;
      case "scatter":
        return <ScatterChart {...chartProps} />;
      case "gauge":
        return <GaugeChart {...chartProps} />;
      default:
        return <LineChart {...chartProps} />;
    }
  };

  /**
   * Render insights panel if enabled
   */
  const renderInsights = () => {
    if (!showInsights || insights.length === 0) return null;

    return (
      <div className="chart-insights mt-3 p-3 bg-surface-secondary rounded-lg">
        <h4 className="text-sm font-medium text-text-primary mb-2">
          Smart Insights
        </h4>
        <div className="space-y-2">
          {insights.slice(0, 2).map((insight) => (
            <InsightBadge key={insight.id} insight={insight} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`adaptive-chart ${className}`}>
      {/* Chart header with metadata */}
      <div className="chart-header mb-2">
        <h3 className="text-lg font-medium text-text-primary">{data.name}</h3>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>Type: {chartConfig.type}</span>
          <span>•</span>
          <span>{data.data.length} data points</span>
          {insights.length > 0 && (
            <>
              <span>•</span>
              <span className="text-blue-600">{insights.length} insights</span>
            </>
          )}
        </div>
      </div>

      {/* Chart visualization */}
      <div className="chart-visualization">{renderChart()}</div>

      {/* Insights panel */}
      {renderInsights()}

      {/* Chart configuration debug info (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-2 text-xs text-gray-400">
          <summary>Chart Config (Dev)</summary>
          <pre>{JSON.stringify(chartConfig, null, 2)}</pre>
        </details>
      )}
    </div>
  );
};

/**
 * Insight Badge Component
 */
interface InsightBadgeProps {
  insight: DataInsight;
}

const InsightBadge: React.FC<InsightBadgeProps> = ({ insight }) => {
  const getInsightColor = (type: DataInsight["type"]) => {
    const colors = {
      trend: "bg-blue-100 text-blue-800",
      anomaly: "bg-yellow-100 text-yellow-800",
      achievement: "bg-green-100 text-green-800",
      concern: "bg-red-100 text-red-800",
      opportunity: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getPriorityIcon = (priority: DataInsight["priority"]) => {
    const icons = {
      urgent: "🚨",
      high: "⚡",
      medium: "📊",
      low: "💡",
    };
    return icons[priority];
  };

  return (
    <div
      className={`insight-badge inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getInsightColor(
        insight.type
      )}`}
    >
      <span>{getPriorityIcon(insight.priority)}</span>
      <span>{insight.title}</span>
      <span className="text-xs opacity-70">
        {Math.round(insight.confidence * 100)}%
      </span>
    </div>
  );
};

/**
 * Helper Functions
 */

function getColorScheme(dataType: DataSeries["type"]): string[] {
  const schemes = {
    performance: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
    attendance: ["#8B5CF6", "#06B6D4", "#84CC16", "#F97316"],
    progress: ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B"],
    engagement: ["#EC4899", "#8B5CF6", "#06B6D4", "#10B981"],
  };

  return schemes[dataType] || schemes.performance;
}

export default AdaptiveChart;
