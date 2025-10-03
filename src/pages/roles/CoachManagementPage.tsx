import React from "react";
import { PageLayout } from "../../components/layout/PageLayout";

// ...existing code...
// Legacy RoleProtectedRoute removed — route access is now enforced via Data Router loaders

/**
 * Coach Management Page - Only accessible by coaches and admins
 */

const CoachManagementContent: React.FC = () => (
  <PageLayout
    variant="dashboard"
    title="Coach Management"
    subtitle="Manage coaching staff and permissions"
  >
    <div className="text-center py-12">
      <p className="text-muted-foreground">
        Coach management functionality coming soon.
      </p>
    </div>
  </PageLayout>
);

export default CoachManagementContent;
