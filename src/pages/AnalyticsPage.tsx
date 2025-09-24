import React from "react";
import { AnalyticsDashboard } from "../components/analytics/AnalyticsDashboard";

/**
 * AnalyticsPage
 * Advanced analytics landing with comprehensive playbook insights
 */
const AnalyticsPage: React.FC = () => {
  // For now, we'll show the dashboard without a specific playbook
  // In a real implementation, this would come from route params or context
  return (
    <div className="container mx-auto px-4 py-8">
      <AnalyticsDashboard />
    </div>
  );
};

export default AnalyticsPage;
