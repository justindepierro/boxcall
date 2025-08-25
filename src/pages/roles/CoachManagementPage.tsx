import React from "react";

// ...existing code...
// Legacy RoleProtectedRoute removed — route access is now enforced via Data Router loaders

/**
 * Coach Management Page - Only accessible by coaches and admins
 */
import { Layout } from "../../components/layout/Layout";

const CoachManagementContent: React.FC = () => (
  <Layout>
    <div className="min-h-screen surface-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {/* ...existing code... */}
      </div>
    </div>
  </Layout>
);

export default CoachManagementContent;
