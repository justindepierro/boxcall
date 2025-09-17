import React from "react";
import { Typography } from "../components/design-system/Typography";
import { Icon } from "../components/ui/Icon";

/**
 * AnalyticsPage
 * Premium analytics landing for team-level insights. This mirrors the legacy
 * route content and allows reuse in both legacy and Data Router setups.
 */
const AnalyticsPage: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <Typography
        variant="headline-md"
        as="h1"
        className="mb-4 flex items-center justify-center"
      >
        <Icon name="bar-chart" size="lg" className="mr-2" />
        Premium Analytics
      </Typography>
      <p className="text-text-secondary">
        Advanced team analytics and reporting tools.
      </p>
    </div>
  );
};

export default AnalyticsPage;
