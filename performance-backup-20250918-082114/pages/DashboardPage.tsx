// import React from "react"; // Not needed for React 17+
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
  return <ResponsiveDashboardLayout />;
}
