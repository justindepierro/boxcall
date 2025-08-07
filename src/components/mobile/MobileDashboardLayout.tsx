import React, { useState } from "react";
import { useAuth } from "../../app/auth-store";
import { PersonalCalendar } from "../dashboard/PersonalCalendar";
import { PersonalTrophyShelf } from "../dashboard/PersonalTrophyShelf";
import { ProfileCard } from "../dashboard/ProfileCard";
import { TeamFeeds } from "../dashboard/TeamFeeds";
import { Typography } from "../design-system";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { MobileQuickActions, FloatingActionButton } from "./MobileQuickActions";
import { MobileCalendarInterface } from "./MobileCalendarInterface";
import { MobileTeamBulletin, type Message } from "./MobileTeamBulletin";
import { MobileQuickEvent } from "./MobileQuickEvent";
import {
  MobilePlaybookBrowser,
  type PlayPreview,
} from "./MobilePlaybookBrowser";
import { MobileAnalyticsDashboard } from "./MobileAnalyticsDashboard";
import type { QuickAction } from "./MobileQuickActions";
import type { CalendarEventCreate } from "../../services/calendarService";
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
    | "overview"
    | "quick-actions"
    | "calendar"
    | "team-chat"
    | "playbook"
    | "analytics"
  >("overview");
  const [showQuickEvent, setShowQuickEvent] = useState(false);
  const [selectedCalendarDate] = useState<Date | null>(null);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<
    "week" | "month" | "season"
  >("week");

  // Sample messages for team bulletin
  const [messages] = useState<Message[]>([
    {
      id: "1",
      userId: "coach-1",
      userName: "Coach Johnson",
      userRole: "coach",
      content:
        "Great practice today everyone! Remember we have a game this Saturday at 2 PM.",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      type: "announcement",
      isImportant: true,
    },
    {
      id: "2",
      userId: "player-1",
      userName: "Mike Chen",
      userRole: "player",
      content: "Thanks coach! I'll be there early for warmup 💪",
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      type: "text",
    },
  ]);

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

  // Event handlers for mobile components
  const handleEventCreate = (eventData: CalendarEventCreate) => {
    // TODO: Integrate with calendar service
    console.log("Creating event:", eventData);
    setShowQuickEvent(false);
    // Show success message or refresh calendar
  };

  const handleSendMessage = (
    content: string,
    type: Message["type"],
    attachmentUrl?: string
  ) => {
    // TODO: Integrate with team communication service
    console.log("Sending message:", { content, type, attachmentUrl });
  };

  const handleSendVoice = (audioBlob: Blob) => {
    // TODO: Upload voice message
    console.log("Sending voice message:", audioBlob);
  };

  const handleTakePhoto = () => {
    // TODO: Integrate with camera/photo upload
    console.log("Taking photo for team chat");
  };

  const handlePlaySelect = (play: PlayPreview) => {
    // TODO: Navigate to play detail view
    console.log("Selected play:", play);
  };

  const handlePlayFavorite = (playId: string, favorite: boolean) => {
    // TODO: Update play favorite status
    console.log("Toggle play favorite:", playId, favorite);
  };

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
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {(
            [
              { id: "overview", label: "Overview" },
              { id: "quick-actions", label: "Actions" },
              { id: "calendar", label: "Calendar" },
              { id: "team-chat", label: "Team Chat", badge: messages.length },
              { id: "playbook", label: "Playbook" },
              { id: "analytics", label: "Analytics" },
            ] as Array<{ id: string; label: string; badge?: number }>
          ).map((view) => {
            return (
              <button
                key={view.id}
                onClick={() =>
                  setActiveView(
                    view.id as
                      | "overview"
                      | "quick-actions"
                      | "calendar"
                      | "team-chat"
                      | "playbook"
                      | "analytics"
                  )
                }
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === view.id
                    ? "bg-brand-jade text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {view.label}
                {view.badge && view.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {view.badge > 9 ? "9+" : view.badge}
                  </span>
                )}
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
              <MobileCalendarInterface
                userId={user!.id}
                onEventCreate={() => setShowQuickEvent(true)}
                onEventSelect={(event) => console.log("Selected event:", event)}
              />
            </div>
          )}

          {activeView === "team-chat" && (
            <div className="h-[calc(100vh-180px)]">
              <MobileTeamBulletin
                teamId="team-1"
                messages={messages}
                onSendMessage={handleSendMessage}
                onSendVoice={handleSendVoice}
                onTakePhoto={handleTakePhoto}
              />
            </div>
          )}

          {activeView === "playbook" && (
            <div className="h-[calc(100vh-180px)]">
              <MobilePlaybookBrowser
                teamId="team-1"
                onPlaySelect={handlePlaySelect}
                onPlayFavorite={handlePlayFavorite}
              />
            </div>
          )}

          {activeView === "analytics" && (
            <div className="h-[calc(100vh-180px)]">
              <MobileAnalyticsDashboard
                teamId="team-1"
                timeframe={analyticsTimeframe}
                onTimeframeChange={setAnalyticsTimeframe}
              />
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
        color="jade"
        position="bottom-right"
      />

      {/* Quick Event Modal */}
      {showQuickEvent && (
        <MobileQuickEvent
          selectedDate={selectedCalendarDate}
          onEventCreate={handleEventCreate}
          onCancel={() => setShowQuickEvent(false)}
        />
      )}
    </div>
  );
};
