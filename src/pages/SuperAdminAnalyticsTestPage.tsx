import React, { useState } from "react";
import { Typography } from "../components/design-system/Typography";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Icon } from "../components/ui/Icon";
import { PlaySuccessHeatmap } from "../components/analytics/charts/PlaySuccessHeatmap";
import { ConfidenceTrendChart } from "../components/analytics/charts/ConfidenceTrendChart";
import { FormationTrendChart } from "../components/analytics/charts/FormationTrendChart";

/**
 * SuperAdmin Analytics Test Page
 *
 * This page is for testing all Phase 14 visualization components with mock data.
 * Route: /superadmin/analytics-test
 *
 * Components tested:
 * - SessionAnalyticsDashboard (requires real session ID)
 * - TrendAnalyticsDashboard (requires real play/formation ID)
 * - PlaySuccessHeatmap
 * - ConfidenceTrendChart
 * - FormationTrendChart
 */

// Mock data for testing
const mockFieldZoneData = [
  {
    zone: "Own End Zone",
    yardLine: 5,
    attempts: 3,
    successRate: 33.3,
    avgYards: 2.1,
  },
  {
    zone: "Own 10-25",
    yardLine: 18,
    attempts: 12,
    successRate: 58.3,
    avgYards: 4.2,
  },
  {
    zone: "Own 25-40",
    yardLine: 33,
    attempts: 18,
    successRate: 72.2,
    avgYards: 5.8,
  },
  {
    zone: "Own 40-50",
    yardLine: 45,
    attempts: 15,
    successRate: 80.0,
    avgYards: 6.4,
  },
  {
    zone: "Opp 50-40",
    yardLine: 55,
    attempts: 14,
    successRate: 85.7,
    avgYards: 7.1,
  },
  {
    zone: "Opp 40-25",
    yardLine: 67,
    attempts: 16,
    successRate: 81.3,
    avgYards: 6.8,
  },
  {
    zone: "Opp 25-10",
    yardLine: 82,
    attempts: 20,
    successRate: 90.0,
    avgYards: 8.2,
  },
  {
    zone: "Red Zone",
    yardLine: 95,
    attempts: 22,
    successRate: 95.5,
    avgYards: 9.8,
  },
];

const mockConfidenceTrendData = [
  {
    weekLabel: "Sep 1",
    weekStart: "2024-09-01",
    confidence: 45,
    reps: 8,
    successRate: 37.5,
    avgYards: 3.2,
  },
  {
    weekLabel: "Sep 8",
    weekStart: "2024-09-08",
    confidence: 58,
    reps: 12,
    successRate: 50.0,
    avgYards: 4.1,
  },
  {
    weekLabel: "Sep 15",
    weekStart: "2024-09-15",
    confidence: 67,
    reps: 15,
    successRate: 60.0,
    avgYards: 5.3,
  },
  {
    weekLabel: "Sep 22",
    weekStart: "2024-09-22",
    confidence: 73,
    reps: 18,
    successRate: 72.2,
    avgYards: 6.1,
  },
  {
    weekLabel: "Sep 29",
    weekStart: "2024-09-29",
    confidence: 82,
    reps: 20,
    successRate: 80.0,
    avgYards: 6.8,
  },
  {
    weekLabel: "Oct 6",
    weekStart: "2024-10-06",
    confidence: 88,
    reps: 16,
    successRate: 87.5,
    avgYards: 7.5,
  },
];

const mockFormationTrendData = [
  {
    weekLabel: "Sep 1",
    weekStart: "2024-09-01",
    attempts: 15,
    successRate: 60.0,
    avgYards: 4.8,
  },
  {
    weekLabel: "Sep 8",
    weekStart: "2024-09-08",
    attempts: 18,
    successRate: 66.7,
    avgYards: 5.2,
  },
  {
    weekLabel: "Sep 15",
    weekStart: "2024-09-15",
    attempts: 22,
    successRate: 72.7,
    avgYards: 5.9,
  },
  {
    weekLabel: "Sep 22",
    weekStart: "2024-09-22",
    attempts: 20,
    successRate: 80.0,
    avgYards: 6.4,
  },
  {
    weekLabel: "Sep 29",
    weekStart: "2024-09-29",
    attempts: 24,
    successRate: 83.3,
    avgYards: 6.8,
  },
  {
    weekLabel: "Oct 6",
    weekStart: "2024-10-06",
    attempts: 19,
    successRate: 89.5,
    avgYards: 7.3,
  },
];

export const SuperAdminAnalyticsTestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "heatmap" | "confidence" | "formation" | "session" | "trends"
  >("heatmap");

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="settings" className="text-brand-600" size={32} />
            <Typography variant="headline-lg">
              SuperAdmin: Analytics Test Lab
            </Typography>
          </div>
          <Typography variant="body-sm" className="text-secondary">
            Phase 14: Visualization & Dashboards - Component Testing
          </Typography>
        </div>

        {/* Tab Navigation */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={activeTab === "heatmap" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setActiveTab("heatmap")}
              >
                <Icon name="map" className="mr-2" size={16} />
                Heatmap
              </Button>
              <Button
                variant={activeTab === "confidence" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setActiveTab("confidence")}
              >
                <Icon name="trending-up" className="mr-2" size={16} />
                Confidence Trends
              </Button>
              <Button
                variant={activeTab === "formation" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setActiveTab("formation")}
              >
                <Icon name="grid" className="mr-2" size={16} />
                Formation Trends
              </Button>
              <Button
                variant={activeTab === "session" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setActiveTab("session")}
              >
                <Icon name="bar-chart" className="mr-2" size={16} />
                Session Dashboard
              </Button>
              <Button
                variant={activeTab === "trends" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setActiveTab("trends")}
              >
                <Icon name="activity" className="mr-2" size={16} />
                Trend Dashboard
              </Button>
            </div>
          </div>
        </Card>

        {/* Component Display Area */}
        <div className="space-y-6">
          {/* Heatmap Tab */}
          {activeTab === "heatmap" && (
            <div>
              <Card className="mb-4 p-4">
                <Typography variant="headline-sm" className="mb-2">
                  Play Success Heatmap (14.2)
                </Typography>
                <Typography variant="body-sm" className="text-secondary">
                  Interactive SVG football field with 8 zones, color-coded by
                  success rate. Click zones for details.
                </Typography>
              </Card>
              <PlaySuccessHeatmap
                data={mockFieldZoneData}
                title="Field Position Success Rate - Mock Data"
              />
            </div>
          )}

          {/* Confidence Trends Tab */}
          {activeTab === "confidence" && (
            <div>
              <Card className="mb-4 p-4">
                <Typography variant="headline-sm" className="mb-2">
                  Confidence Trend Chart (14.3)
                </Typography>
                <Typography variant="body-sm" className="text-secondary">
                  LineChart showing play confidence evolution over 6 weeks. Dual
                  Y-axis with confidence % and success rate %.
                </Typography>
              </Card>
              <ConfidenceTrendChart
                data={mockConfidenceTrendData}
                title="Power Right - Confidence Trend (Mock Data)"
                showSuccessRate={true}
                showReps={true}
                targetConfidence={80}
              />
            </div>
          )}

          {/* Formation Trends Tab */}
          {activeTab === "formation" && (
            <div>
              <Card className="mb-4 p-4">
                <Typography variant="headline-sm" className="mb-2">
                  Formation Trend Chart (14.3)
                </Typography>
                <Typography variant="body-sm" className="text-secondary">
                  Formation performance over time with success rate and avg
                  yards tracking.
                </Typography>
              </Card>
              <FormationTrendChart
                data={mockFormationTrendData}
                formationName="Spread (Mock Data)"
                targetSuccessRate={70}
                showAvgYards={true}
              />
            </div>
          )}

          {/* Session Dashboard Tab */}
          {activeTab === "session" && (
            <div>
              <Card className="mb-4 p-4">
                <Typography variant="headline-sm" className="mb-2">
                  Session Analytics Dashboard (14.1)
                </Typography>
                <Typography variant="body-sm" className="text-secondary mb-2">
                  Comprehensive post-session analytics with charts. Requires
                  real session ID.
                </Typography>
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon
                      name="alert-triangle"
                      className="text-warning-600"
                      size={20}
                    />
                    <div>
                      <Typography
                        variant="body-sm"
                        className="font-semibold mb-1"
                      >
                        Real Data Required
                      </Typography>
                      <Typography variant="body-sm" className="text-secondary">
                        This component needs a valid session ID from your
                        database. Create a practice or game session first, then
                        use:{" "}
                        <code className="px-1 py-0.5 bg-muted rounded text-xs">
                          &lt;SessionAnalyticsDashboard
                          sessionId="your-session-id" /&gt;
                        </code>
                      </Typography>
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="p-8 text-center">
                <Icon
                  name="database"
                  className="text-secondary mx-auto mb-4"
                  size={48}
                />
                <Typography variant="headline-md" className="mb-2">
                  Session Dashboard Demo
                </Typography>
                <Typography variant="body-sm" className="text-secondary mb-4">
                  To test with real data, pass a session ID from your database
                </Typography>
                <code className="text-sm text-secondary">
                  {`<SessionAnalyticsDashboard sessionId="uuid-here" />`}
                </code>
              </Card>
            </div>
          )}

          {/* Trend Dashboard Tab */}
          {activeTab === "trends" && (
            <div>
              <Card className="mb-4 p-4">
                <Typography variant="headline-sm" className="mb-2">
                  Trend Analytics Dashboard (14.3)
                </Typography>
                <Typography variant="body-sm" className="text-secondary mb-2">
                  Comprehensive trend analysis dashboard. Requires play ID or
                  formation ID.
                </Typography>
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon
                      name="alert-triangle"
                      className="text-warning-600"
                      size={20}
                    />
                    <div>
                      <Typography
                        variant="body-sm"
                        className="font-semibold mb-1"
                      >
                        Real Data Required
                      </Typography>
                      <Typography variant="body-sm" className="text-secondary">
                        This component needs a valid play ID or formation ID.
                        Use:{" "}
                        <code className="px-1 py-0.5 bg-muted rounded text-xs">
                          &lt;TrendAnalyticsDashboard playId="uuid"
                          teamId="uuid" /&gt;
                        </code>
                      </Typography>
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="p-8 text-center">
                <Icon
                  name="trending-up"
                  className="text-secondary mx-auto mb-4"
                  size={48}
                />
                <Typography variant="headline-md" className="mb-2">
                  Trend Dashboard Demo
                </Typography>
                <Typography variant="body-sm" className="text-secondary mb-4">
                  To test with real data, pass play/formation IDs and team ID
                </Typography>
                <code className="text-sm text-secondary">
                  {`<TrendAnalyticsDashboard playId="uuid" teamId="uuid" />`}
                </code>
              </Card>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <Card className="mt-8 p-6 bg-brand-50 border-brand-200">
          <div className="flex items-start gap-3">
            <Icon name="info" className="text-brand-600 mt-1" size={20} />
            <div>
              <Typography variant="body-sm" className="font-semibold mb-2">
                Phase 14 Complete - All Components Built
              </Typography>
              <ul className="space-y-1 text-sm text-secondary">
                <li>
                  ✅ SessionAnalyticsDashboard - Comprehensive session analytics
                </li>
                <li>✅ PlaySuccessHeatmap - Interactive field visualization</li>
                <li>✅ ConfidenceTrendChart - Play confidence over time</li>
                <li>✅ FormationTrendChart - Formation performance trends</li>
                <li>✅ TrendAnalyticsDashboard - Full trend analysis</li>
                <li>✅ Recharts integration with custom tooltips</li>
                <li>✅ Phase 13 integration (coverage + hash data)</li>
                <li>✅ Mobile-responsive design</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
