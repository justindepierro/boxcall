import React, { useState } from "react";
import { useAuth } from "../../app/auth-store";
import { PersonalCalendar } from "../dashboard/PersonalCalendar";
import { PersonalTrophyShelf } from "../dashboard/PersonalTrophyShelf";
import { ProfileCard } from "../dashboard/ProfileCard";
import { TeamFeeds } from "../dashboard/TeamFeeds";
import { Typography } from "../design-system";
import { MobileBottomNavigation } from "../mobile/MobileBottomNavigation";
import { MobileQuickActions, FloatingActionButton } from "../mobile/MobileQuickActions";
import type { QuickAction } from "../mobile/MobileQuickActions";
import { useMobileNavigation } from "../../hooks/useMobileNavigation";

/**
 * Responsive Dashboard Layout
 * 
 * Unified responsive component that replaces both DashboardPage and MobileDashboardLayout
 * Uses CSS-only responsive behavior, no JavaScript mobile detection
 * 
 * Features:
 * - Mobile-first progressive enhancement
 * - CSS Grid/Flexbox responsive layout
 * - Touch-friendly interactions on mobile
 * - Desktop optimization for larger screens
 * - Consistent experience across all breakpoints
 * - Bottom navigation on mobile, sidebar on desktop
 */
export const ResponsiveDashboardLayout: React.FC = () => {
  const { user, profile, loading, error } = useAuth();
  const { items } = useMobileNavigation(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  
  // Mobile view state (only for mobile bottom nav switching)
  const [activeView, setActiveView] = useState<
    "overview" | "quick-actions" | "calendar"
  >("overview");

  // Quick actions for mobile FAB
  const quickActions: QuickAction[] = [
    {
      id: "new-event",
      label: "New Event",
      icon: "Calendar",
      onClick: () => {
        // TODO: Implement create event
        console.log("Create event clicked");
      },
      color: "jade",
    },
    {
      id: "message-team", 
      label: "Message Team",
      icon: "MessageSquare",
      onClick: () => {
        // TODO: Implement message team
        console.log("Message team clicked");
      },
      color: "blue",
    },
    {
      id: "quick-note",
      label: "Quick Note",
      icon: "FileText",
      onClick: () => {
        // TODO: Implement quick note
        console.log("Quick note clicked");
      },
      color: "gray",
    },
  ];

  // Early returns for loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-jade border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Typography variant="body-md" color="muted">
            Loading your dashboard...
          </Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md px-4">
          <Typography variant="headline-lg" className="text-red-600 mb-4">
            Authentication Error
          </Typography>
          <Typography variant="body-lg" color="muted">
            {error}
          </Typography>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md px-4">
          <Typography variant="headline-lg" className="text-red-600 mb-4">
            Failed to load dashboard
          </Typography>
          <Typography variant="body-lg" color="muted">
            User profile not found
          </Typography>
        </div>
      </div>
    );
  }

  const userRole = profile.role || "player";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 
        ============================================================================
        WELCOME HEADER - Responsive across all breakpoints
        ============================================================================ 
      */}
      <div className="responsive-welcome-header bg-gradient-to-r from-surface-jade to-surface-jade dark:from-surface-jade-dark dark:to-surface-jade-dark border-b border-surface-jade-dark dark:border-brand-jade-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-left">
          <Typography
            variant="headline-md"
            className="text-brand-jade-dark dark:text-brand-jade-light"
          >
            Welcome back,{" "}
            {profile.full_name?.split(" ")[0] ||
              profile.display_name ||
              user.email}
            !
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-1">
            Your command center awaits • Quote of the day coming soon
          </Typography>
        </div>
      </div>

      {/* 
        ============================================================================
        RESPONSIVE LAYOUT CONTAINER
        Mobile: Stack layout with view switching
        Tablet: 2-column grid  
        Desktop: 3-column grid
        ============================================================================ 
      */}
      <div className="responsive-dashboard-container">
        {/* Mobile View Switcher (hidden on tablet+) */}
        <div className="mobile-view-switcher lg:hidden">
          <div className="flex justify-center space-x-1 bg-white dark:bg-gray-800 mx-4 mt-4 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveView("overview")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 touch-target ${
                activeView === "overview"
                  ? "bg-brand-jade text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView("quick-actions")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 touch-target ${
                activeView === "quick-actions"
                  ? "bg-brand-jade text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Actions
            </button>
            <button
              onClick={() => setActiveView("calendar")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 touch-target ${
                activeView === "calendar"
                  ? "bg-brand-jade text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Calendar
            </button>
          </div>
        </div>

        {/* 
          ============================================================================
          MAIN CONTENT GRID - Fully Responsive
          Mobile: Single column with view switching
          Tablet: 2x2 grid layout
          Desktop: 3-column layout
          ============================================================================ 
        */}
        <div className="responsive-content-grid">
          {/* Profile Card */}
          <div className={`profile-section ${activeView !== "overview" ? "mobile-hidden" : ""}`}>
            <ProfileCard
              profile={profile}
              userRole={userRole}
              onEditClick={() => {
                // TODO: Implement edit functionality
              }}
            />
          </div>

          {/* Trophy Shelf */}
          <div className={`trophy-section ${activeView !== "overview" ? "mobile-hidden" : ""}`}>
            <PersonalTrophyShelf userId={user.id} userRole={userRole} />
          </div>

          {/* Team Feeds */}
          <div className={`feeds-section ${activeView !== "overview" ? "mobile-hidden" : ""}`}>
            <TeamFeeds userId={user.id} />
          </div>

          {/* Calendar */}
          <div className={`calendar-section ${activeView === "quick-actions" ? "mobile-hidden" : ""}`}>
            <PersonalCalendar userId={user.id} />
          </div>

          {/* Quick Actions (Mobile Only) */}
          <div className={`quick-actions-section ${activeView !== "quick-actions" ? "mobile-hidden" : ""}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <Typography variant="headline-sm" className="mb-2">Quick Actions</Typography>
              <Typography variant="body-sm" color="muted" className="mb-4">Tap any action to get started</Typography>
              <MobileQuickActions actions={quickActions} />
            </div>
          </div>
        </div>
      </div>

      {/* 
        ============================================================================
        MOBILE BOTTOM NAVIGATION - Hidden on desktop
        ============================================================================ 
      */}
      <div className="mobile-bottom-nav lg:hidden">
        <MobileBottomNavigation items={items} />
      </div>

      {/* 
        ============================================================================
        FLOATING ACTION BUTTON - Mobile only, hidden on desktop
        ============================================================================ 
      */}
      <div className="mobile-fab lg:hidden">
        <FloatingActionButton
          icon="Plus"
          label="Quick Actions"
          onClick={() => setActiveView("quick-actions")}
          position="bottom-right"
          className="mb-20" // Account for bottom navigation
        />
      </div>
    </div>
  );
};

export default ResponsiveDashboardLayout;
