import React from "react";
import { AnalyticsDashboard } from "../components/analytics/AnalyticsDashboard";
import { Typography } from "../components/design-system";

/**
 * AnalyticsPage
 * Advanced analytics landing with comprehensive playbook insights
 */
const AnalyticsPage: React.FC = React.memo(() => {
  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            Analytics
          </Typography>
          <Typography variant="body" className="text-secondary">
            Comprehensive playbook insights and performance metrics
          </Typography>
        </header>
        <AnalyticsDashboard />
      </div>
    </div>
  );
});

AnalyticsPage.displayName = "AnalyticsPage";

export default AnalyticsPage;
