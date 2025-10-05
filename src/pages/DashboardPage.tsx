// import React from "react"; // Not needed for React 17+
import { Aurora } from "../components/ui/Aurora";
import { PageLayout } from "../components/layout/PageLayout";
import { ResponsiveDashboardLayout } from "../components/dashboard/ResponsiveDashboardLayout";

/**
 * Dashboard Page - Complete Feature-Rich Dashboard
 *
 * Features:
 * - PersonalCalendar - Your schedule and upcoming events
 * - PersonalTrophyShelf - Achievements and milestones
 * - TeamFeeds - Activity feed from your teams
 * - ProfileCard - User profile and role information
 * - DatabaseDataDisplay - Connected data from Supabase
 * - Mobile-first responsive design
 * - Progressive loading with skeletons
 */
export default function DashboardPage() {
  return (
    <Aurora variant="shell" fullHeight>
      <PageLayout
        title="Dashboard"
        subtitle="Your command center awaits • Quote of the day coming soon"
        variant="dashboard"
      >
        <ResponsiveDashboardLayout />
      </PageLayout>
    </Aurora>
  );
}
