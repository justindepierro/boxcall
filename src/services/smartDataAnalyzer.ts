/**
 * Smart Data Analyzer Service
 * Phase 2A Sprint 3: Intelligent data analysis and trend detection
 *
 * Provides automatic data pattern recognition, trend analysis, and intelligent
 * insights generation for the adaptive dashboard system.
 */

export interface DataPoint {
  timestamp: number;
  value: number;
  label: string;
  metadata?: Record<string, unknown>;
}

export interface DataSeries {
  id: string;
  name: string;
  data: DataPoint[];
  type: "performance" | "attendance" | "progress" | "engagement";
  context: "team" | "individual" | "game" | "practice";
}

export interface TrendAnalysis {
  direction: "increasing" | "decreasing" | "stable" | "volatile";
  strength: number; // 0-1, confidence in trend direction
  rate: number; // rate of change per time unit
  significance: "high" | "medium" | "low";
  timeframe: "daily" | "weekly" | "monthly" | "seasonal";
}

export interface DataInsight {
  id: string;
  type: "trend" | "anomaly" | "achievement" | "concern" | "opportunity";
  title: string;
  description: string;
  confidence: number; // 0-1
  priority: "urgent" | "high" | "medium" | "low";
  actionable: boolean;
  recommendations?: string[];
  visualizationType: "line" | "bar" | "area" | "scatter" | "gauge";
}

export interface SmartAggregation {
  timeframe: "hour" | "day" | "week" | "month";
  method: "average" | "sum" | "count" | "max" | "min" | "median";
  confidence: number;
  sampleSize: number;
}

export class SmartDataAnalyzer {
  /**
   * Analyze data series for trends and patterns
   */
  static analyzeTrends(series: DataSeries): TrendAnalysis {
    const { data } = series;

    if (data.length < 3) {
      return {
        direction: "stable",
        strength: 0,
        rate: 0,
        significance: "low",
        timeframe: "daily",
      };
    }

    // Calculate linear regression for trend direction
    const n = data.length;
    const sumX = data.reduce((sum, _, index) => sum + index, 0);
    const sumY = data.reduce((sum, point) => sum + point.value, 0);
    const sumXY = data.reduce(
      (sum, point, index) => sum + index * point.value,
      0
    );
    const sumX2 = data.reduce((sum, _, index) => sum + index * index, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const strength = this.calculateCorrelation(data);

    // Determine trend direction and significance
    const direction = (() => {
      if (slope > 0.01) return "increasing";
      if (slope < -0.01) return "decreasing";
      return "stable";
    })();
    const significance = (() => {
      if (strength > 0.7) return "high";
      if (strength > 0.4) return "medium";
      return "low";
    })();

    // Determine optimal timeframe based on data density
    const timeSpan = data[data.length - 1].timestamp - data[0].timestamp;
    const daySpan = timeSpan / (1000 * 60 * 60 * 24);
    const timeframe = (() => {
      if (daySpan > 30) return "monthly";
      if (daySpan > 7) return "weekly";
      return "daily";
    })();

    return {
      direction,
      strength,
      rate: slope,
      significance,
      timeframe,
    };
  }

  /**
   * Generate intelligent insights from data analysis
   */
  static generateInsights(series: DataSeries[]): DataInsight[] {
    const insights: DataInsight[] = [];

    for (const dataSeries of series) {
      const trend = this.analyzeTrends(dataSeries);
      const anomalies = this.detectAnomalies(dataSeries);
      const achievements = this.detectAchievements(dataSeries);

      // Generate trend insights
      if (trend.significance !== "low") {
        insights.push(this.createTrendInsight(dataSeries, trend));
      }

      // Generate anomaly insights
      anomalies.forEach((anomaly) => {
        insights.push(this.createAnomalyInsight(dataSeries, anomaly));
      });

      // Generate achievement insights
      achievements.forEach((achievement) => {
        insights.push(this.createAchievementInsight(dataSeries, achievement));
      });
    }

    // Sort by priority and confidence
    return insights.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];

      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Recommend optimal chart type based on data characteristics
   */
  static recommendChartType(
    series: DataSeries
  ): DataInsight["visualizationType"] {
    const { data, type, context } = series;

    // Single value or very few points -> gauge
    if (data.length <= 2) {
      return "gauge";
    }

    // Time series with many points -> line chart
    if (data.length > 10 && this.isTimeSeries(data)) {
      return "line";
    }

    // Categorical data -> bar chart
    if (this.isCategoricalData(data)) {
      return "bar";
    }

    // Performance metrics with volatility -> area chart
    if (type === "performance" && this.hasVolatility(data)) {
      return "area";
    }

    // Correlation analysis -> scatter plot
    if (context === "individual" && data.length > 5) {
      return "scatter";
    }

    // Default to line chart for time-based data
    return "line";
  }

  /**
   * Suggest optimal data aggregation method
   */
  static suggestAggregation(series: DataSeries): SmartAggregation {
    const { data, type } = series;
    const dataSpan = this.getDataTimeSpan(data);

    // Determine optimal timeframe
    let timeframe: SmartAggregation["timeframe"];
    if (dataSpan < 7) timeframe = "day";
    else if (dataSpan < 30) timeframe = "week";
    else timeframe = "month";

    // Determine aggregation method based on data type
    let method: SmartAggregation["method"];
    switch (type) {
      case "performance":
        method = data.length > 20 ? "average" : "median";
        break;
      case "attendance":
        method = "count";
        break;
      case "progress":
        method = "sum";
        break;
      default:
        method = "average";
    }

    const confidence = Math.min(0.9, data.length / 10);

    return {
      timeframe,
      method,
      confidence,
      sampleSize: data.length,
    };
  }

  /**
   * Calculate correlation coefficient for trend strength
   */
  private static calculateCorrelation(data: DataPoint[]): number {
    const n = data.length;
    const indices = data.map((_, index) => index);
    const values = data.map((point) => point.value);

    const meanX = indices.reduce((sum, val) => sum + val, 0) / n;
    const meanY = values.reduce((sum, val) => sum + val, 0) / n;

    const numerator = indices.reduce((sum, x, i) => {
      return sum + (x - meanX) * (values[i] - meanY);
    }, 0);

    const denominatorX = Math.sqrt(
      indices.reduce((sum, x) => sum + Math.pow(x - meanX, 2), 0)
    );
    const denominatorY = Math.sqrt(
      values.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0)
    );

    return numerator / (denominatorX * denominatorY) || 0;
  }

  /**
   * Detect anomalies in data series
   */
  private static detectAnomalies(series: DataSeries): DataPoint[] {
    const { data } = series;
    if (data.length < 5) return [];

    const values = data.map((point) => point.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        values.length
    );

    const threshold = 2 * stdDev; // 2 standard deviations

    return data.filter((point) => Math.abs(point.value - mean) > threshold);
  }

  /**
   * Detect achievements and milestones
   */
  private static detectAchievements(series: DataSeries): DataPoint[] {
    const { data } = series;
    const achievements: DataPoint[] = [];

    // Look for new highs, significant improvements, or milestone values
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data.slice(0, i);
      const maxPrevious = Math.max(...previous.map((p) => p.value));

      // New high achieved
      if (current.value > maxPrevious * 1.1) {
        // 10% improvement
        achievements.push(current);
      }

      // Milestone values (round numbers, significant thresholds)
      if (this.isMilestoneValue(current.value)) {
        achievements.push(current);
      }
    }

    return achievements;
  }

  /**
   * Create trend insight from analysis
   */
  private static createTrendInsight(
    series: DataSeries,
    trend: TrendAnalysis
  ): DataInsight {
    const trendWords = {
      increasing: "improving",
      decreasing: "declining",
      stable: "steady",
      volatile: "inconsistent",
    };

    const title = `${series.name} is ${trendWords[trend.direction]}`;
    const description = `${trend.significance} confidence ${trend.direction} trend over ${trend.timeframe} timeframe`;

    return {
      id: `trend-${series.id}-${Date.now()}`,
      type: "trend",
      title,
      description,
      confidence: trend.strength,
      priority: trend.significance === "high" ? "high" : "medium",
      actionable: trend.direction === "decreasing",
      recommendations:
        trend.direction === "decreasing"
          ? ["Review recent changes", "Identify improvement opportunities"]
          : undefined,
      visualizationType: this.recommendChartType(series),
    };
  }

  /**
   * Create anomaly insight
   */
  private static createAnomalyInsight(
    series: DataSeries,
    anomaly: DataPoint
  ): DataInsight {
    return {
      id: `anomaly-${series.id}-${anomaly.timestamp}`,
      type: "anomaly",
      title: `Unusual ${series.name} value detected`,
      description: `${anomaly.label}: ${anomaly.value} (${new Date(anomaly.timestamp).toLocaleDateString()})`,
      confidence: 0.8,
      priority: "medium",
      actionable: true,
      recommendations: ["Investigate cause", "Review context"],
      visualizationType: "scatter",
    };
  }

  /**
   * Create achievement insight
   */
  private static createAchievementInsight(
    series: DataSeries,
    achievement: DataPoint
  ): DataInsight {
    return {
      id: `achievement-${series.id}-${achievement.timestamp}`,
      type: "achievement",
      title: `New ${series.name} milestone reached!`,
      description: `${achievement.label}: ${achievement.value} (${new Date(achievement.timestamp).toLocaleDateString()})`,
      confidence: 0.9,
      priority: "high",
      actionable: false,
      visualizationType: "gauge",
    };
  }

  /**
   * Helper methods
   */
  private static isTimeSeries(data: DataPoint[]): boolean {
    // Check if timestamps are sequential and evenly spaced
    if (data.length < 3) return false;

    const intervals = [];
    for (let i = 1; i < data.length; i++) {
      intervals.push(data[i].timestamp - data[i - 1].timestamp);
    }

    const avgInterval =
      intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance =
      intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) /
      intervals.length;

    // Low variance indicates regular time series
    return variance < avgInterval * 0.5;
  }

  private static isCategoricalData(data: DataPoint[]): boolean {
    // Check if labels represent categories rather than time
    const uniqueLabels = new Set(data.map((point) => point.label));
    return uniqueLabels.size === data.length && data.length < 10;
  }

  private static hasVolatility(data: DataPoint[]): boolean {
    const values = data.map((point) => point.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;

    return coefficientOfVariation > 0.2; // 20% volatility threshold
  }

  private static getDataTimeSpan(data: DataPoint[]): number {
    if (data.length < 2) return 0;
    const timeSpan = data[data.length - 1].timestamp - data[0].timestamp;
    return timeSpan / (1000 * 60 * 60 * 24); // Convert to days
  }

  private static isMilestoneValue(value: number): boolean {
    // Check for round numbers, percentages, or significant thresholds
    const roundNumbers = [10, 25, 50, 75, 100, 250, 500, 1000];
    const percentages = [25, 50, 75, 90, 95, 100];

    return (
      roundNumbers.includes(Math.floor(value)) ||
      percentages.includes(Math.floor(value)) ||
      value % 100 === 0
    );
  }
}
