import React from "react";

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
export const DashboardPage: React.FC = () => {
  return <ResponsiveDashboardLayout />;
};

export default DashboardPage;
