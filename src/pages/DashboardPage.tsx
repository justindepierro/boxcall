import React from "react";
import { ResponsiveDashboardLayout } from "../components/dashboard/ResponsiveDashboardLayout";

/**
 * Dashboard Page - Responsive Across All Devices
 *
 * Features:
 * - CSS-only responsive design (no JavaScript mobile detection)
 * - Mobile-first progressive enhancement 
 * - Touch-friendly interactions on mobile
 * - Desktop optimization for larger screens
 * - Unified component architecture
 * - Cross-device optimized experience
 */
export const DashboardPage: React.FC = () => {
  return <ResponsiveDashboardLayout />;
};

export default DashboardPage;
