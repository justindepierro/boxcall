import React from "react";
import { AnalyticsDashboard } from "../components/analytics/AnalyticsDashboard";
import { PageLayout } from "../components/layout/PageLayout";

/**
 * AnalyticsPage
 * Advanced analytics landing with comprehensive playbook insights
 */
const AnalyticsPage: React.FC = () => {
  // For now, we'll show the dashboard without a specific playbook
  // In a real implementation, this would come from route params or context
  return (
    <PageLayout
      title="Analytics"
      subtitle="Comprehensive playbook insights and performance metrics"
    >
      <AnalyticsDashboard />
    </PageLayout>
  );
};

export default AnalyticsPage;
