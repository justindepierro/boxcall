import React, { useState } from "react";
import { useAuth } from "../../app/auth-store";
import { PersonalCalendar } from "../dashboard/PersonalCalendar";
import { PersonalTrophyShelf } from "../dashboard/PersonalTrophyShelf";
import { ProfileCard } from "../dashboard/ProfileCard";
import { TeamFeeds } from "../dashboard/TeamFeeds";
import { Typography } from "../design-system";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { MobileQuickActions, FloatingActionButton } from "./MobileQuickActions";
import type { QuickAction } from "./MobileQuickActions";
import { useMobileNavigation } from "../../hooks/useMobileNavigation";

/**
 * Mobile-First Dashboard Layout
 *
 * Features:
 * - Mobile-first responsive design
 * - Touch-friendly interactions
 * - Bottom navigation for mobile
 * - Quick action shortcuts
 * - Swipe-friendly card layout
 * - Progressive disclosure of content
 */
export const MobileDashboardLayout: React.FC = () => {
  const { user, profile, loading, error } = useAuth();
  const { items } = useMobileNavigation(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  const [activeView, setActiveView] = useState<
    "overview" | "quick-actions" | "calendar"
  >("overview");

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
          <Typography variant="body-lg" color="muted">
            {error}
          </Typography>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const userRole = profile.role || "player";

  // Quick actions for mobile
  const quickActions: QuickAction[] = [
    {
      id: "new-practice",
      label: "Start Practice",
      icon: "play",
      color: "jade",
      onClick: () => (window.location.href = "/practice/new"),
    },
    {
      id: "schedule-event",
      label: "Add Event",
      icon: "calendar",
      color: "blue",
      onClick: () => (window.location.href = "/calendar?action=create"),
    },
    {
      id: "team-message",
      label: "Team Chat",
      icon: "message",
      color: "yellow",
      onClick: () => (window.location.href = "/team/1/bulletin?action=message"),
      badge: 3,
    },
    {
      id: "edit-profile",
      label: "Edit Profile",
      icon: "edit",
      color: "gray",
      onClick: () => (window.location.href = "/profile?edit=true"),
    },
  ];

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile-First Header */}
      <div className="bg-gradient-to-r from-surface-jade to-surface-jade dark:from-surface-jade-dark dark:to-surface-jade-dark border-b border-surface-jade-dark dark:border-brand-jade-dark">
        <div className="px-4 sm:px-6 py-4 text-left">
          <Typography
            variant="headline-md"
            className="text-brand-jade-dark dark:text-brand-jade-light truncate"
          >
            Welcome back,{" "}
            {profile!.full_name?.split(" ")[0] ||
              profile!.display_name ||
              user!.email}
            !
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-1">
            Your command center •{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </Typography>
        </div>
      </div>

      {/* Mobile View Switcher */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex space-x-1">
          {[
            { id: "overview", label: "Overview" },
            { id: "quick-actions", label: "Actions" },
            { id: "calendar", label: "Calendar" },
          ].map((view) => {
            return (
              <button
                key={view.id}
                onClick={() =>
                  setActiveView(
                    view.id as "overview" | "quick-actions" | "calendar"
                  )
                }
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === view.id
                    ? "bg-brand-jade text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20 md:pb-4">
        {" "}
        {/* Extra padding for mobile bottom nav */}
        {/* Mobile Views */}
        <div className="md:hidden">
          {activeView === "overview" && (
            <div className="px-4 py-4 space-y-4">
              {/* Profile Card - Compact Mobile Version */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-jade rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {(profile!.full_name ||
                        profile!.display_name ||
                        user!.email ||
                        "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {profile!.full_name ||
                        profile!.display_name ||
                        user!.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {userRole} • Active
                    </p>
                  </div>
                </div>
              </div>

              {/* Trophy Shelf - Mobile Condensed */}
              <PersonalTrophyShelf userId={user!.id} userRole={userRole} />

              {/* Team Feeds - Mobile Optimized */}
              <TeamFeeds userId={user!.id} />
            </div>
          )}

          {activeView === "quick-actions" && (
            <div className="px-4 py-4">
              <MobileQuickActions actions={quickActions} />
            </div>
          )}

          {activeView === "calendar" && (
            <div className="px-4 py-4">
              <PersonalCalendar userId={user!.id} />
            </div>
          )}
        </div>
        {/* Desktop Layout - Hidden on mobile */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <ProfileCard
                profile={profile!}
                userRole={userRole}
                onEditClick={() => {
                  window.location.href = "/profile?edit=true";
                }}
              />
            </div>

            {/* Middle & Right Columns */}
            <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Trophy Shelf spanning both middle and right */}
              <div className="lg:col-span-2">
                <PersonalTrophyShelf userId={user!.id} userRole={userRole} />
              </div>

              {/* Team Feeds - Middle Column */}
              <div className="lg:col-span-1">
                <TeamFeeds userId={user!.id} />
              </div>

              {/* Calendar - Right Column */}
              <div className="lg:col-span-1">
                <PersonalCalendar userId={user!.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation items={items} onNavigate={handleNavigation} />

      {/* Floating Action Button for Primary Mobile Action */}
      <FloatingActionButton
        icon="plus"
        label="Quick Add"
        onClick={() => setActiveView("quick-actions")}
        color="primary"
        position="bottom-right"
      />
    </div>
  );
};
