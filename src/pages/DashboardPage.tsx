/**
 * DashboardPage - Modern Command Center
 *
 * Clean, always-useful dashboard following SaaS best practices:
 * - Stats always visible (never empty states)
 * - Quick actions front and center
 * - Progressive enhancement (shows what you have)
 *
 * Design: Vibrant brand colors, elevated cards, responsive grid
 */

import React from "react";
import { useAuth } from "../app/auth-store";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { Card } from "../components/ui/Card";
import { Typography } from "../components/design-system/Typography";
import { Icon } from "../components/ui/Icon";
import { CompactTrophyShelf } from "../components/dashboard/CompactTrophyShelf";
import { useNavigate } from "react-router-dom";
import { shimmerSkeleton, statusIndicator } from "../utils/animations";

type DashboardStats = {
  totalPlays?: number;
};

function DashboardLoadingState() {
  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className={`${shimmerSkeleton.base} h-12`}>
          <div className={shimmerSkeleton.overlay} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${shimmerSkeleton.base} h-32`}>
            <div className={shimmerSkeleton.overlay} />
          </div>
          <div className={`${shimmerSkeleton.base} h-32`}>
            <div className={shimmerSkeleton.overlay} />
          </div>
          <div className={`${shimmerSkeleton.base} h-32`}>
            <div className={shimmerSkeleton.overlay} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardLoggedOutState({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <Card variant="default" size="lg" className="max-w-md text-center">
        <Icon
          name="alert-circle"
          className="mx-auto mb-4 text-warning-500"
          size="xl"
        />
        <Typography variant="headline-md" className="mb-2">
          Please log in
        </Typography>
        <Typography variant="body" color="muted" className="mb-6">
          Access your dashboard by logging in to your account
        </Typography>
        <button
          onClick={onLogin}
          className="w-full px-4 py-2 bg-gradient-to-r from-jade-500 to-jade-600 text-white font-semibold rounded-lg shadow-jade-md hover:shadow-jade-lg transition-all duration-300 hover:scale-105"
        >
          Log In
        </button>
      </Card>
    </div>
  );
}

function DashboardHeader({ displayName }: { displayName: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Typography variant="headline-lg" className="text-primary mb-1">
          Welcome back, {displayName}
        </Typography>
        <Typography variant="body" className="text-secondary">
          Your command center for plays, practices, and progress
        </Typography>
      </div>
    </div>
  );
}

function DashboardStatsGrid({
  displayName,
  userRole,
  stats,
  onNavigate,
}: {
  displayName: string;
  userRole: string;
  stats: DashboardStats;
  onNavigate: (path: string) => void;
}) {
  const totalPlays = stats.totalPlays || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* My Role Card */}
      <Card
        variant="elevated"
        size="lg"
        interactive
        onClick={() => onNavigate("/profile")}
        className="relative overflow-hidden bg-gradient-to-br from-white via-jade-50/20 to-transparent shadow-md shadow-jade-500/10 hover:shadow-2xl hover:shadow-jade-500/25 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-4 bg-gradient-to-br from-jade-50 to-jade-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Icon
              name="user"
              className="text-jade-600 w-8 h-8 group-hover:scale-110 transition-transform"
            />
          </div>
          <span className="px-3 py-1.5 bg-gradient-to-r from-jade-500 to-jade-600 text-white text-xs font-bold rounded-lg shadow-jade-sm">
            {userRole.replace("_", " ").toUpperCase()}
          </span>
        </div>
        <Typography variant="headline-md" className="text-primary mb-2">
          {displayName}
        </Typography>
        <Typography variant="body" className="text-secondary mb-4">
          {userRole === "head_coach" ? "Leading the team" : "Platform Admin"}
        </Typography>
        <div className="pt-4 border-t border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Status</span>
            <span className="flex items-center text-jade-600 font-semibold">
              <span className={`${statusIndicator.active} mr-2`}></span>
              Active
            </span>
          </div>
        </div>
      </Card>

      {/* Team Activity Card */}
      <Card
        variant="elevated"
        size="lg"
        interactive
        onClick={() => onNavigate("/bulletin")}
        className="card-orange relative overflow-hidden rounded-2xl group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-4 bg-[var(--card-orange-bg-light)] rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Icon
              name="users"
              className="card-orange-icon w-8 h-8 group-hover:scale-110 transition-transform"
            />
          </div>
          <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-lg shadow-sm">
            LIVE
          </span>
        </div>
        <Typography variant="headline-md" className="text-primary mb-2">
          Team Activity
        </Typography>
        <Typography variant="body" className="text-secondary mb-4">
          Stay connected with announcements and updates
        </Typography>
        <div className="pt-4 border-t border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Latest</span>
            <span className="text-primary font-semibold">View Bulletin →</span>
          </div>
        </div>
      </Card>

      {/* Playbook Card */}
      <Card
        variant="elevated"
        size="lg"
        interactive
        onClick={() => onNavigate("/playbook")}
        className="card-purple relative overflow-hidden rounded-2xl group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-4 bg-[var(--card-purple-bg-light)] rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Icon
              name="book"
              className="card-purple-icon w-8 h-8 group-hover:scale-110 transition-transform"
            />
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg shadow-[var(--card-purple-shadow)] group-hover:shadow-xl group-hover:shadow-[var(--card-purple-shadow-hover)] transition-all duration-300 flex flex-col items-center">
            <span className="text-3xl font-black leading-none bg-gradient-to-br from-white to-purple-100 bg-clip-text text-transparent">
              {totalPlays}
            </span>
            <span className="text-xs font-bold tracking-wider opacity-90">
              PLAYS
            </span>
          </div>
        </div>
        <Typography variant="headline-md" className="text-primary mb-2">
          Playbook
        </Typography>
        <Typography variant="body" className="text-secondary mb-4">
          Build and organize your game strategy
        </Typography>
        <div className="pt-4 border-t border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Total Plays</span>
            <span className="text-primary font-semibold">
              {totalPlays} plays
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DashboardQuickActions({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <button
        onClick={() => onNavigate("/playbook")}
        className="group relative h-32 p-6 bg-gradient-to-br from-jade-100 via-jade-50 to-white border-2 border-jade-300 hover:border-jade-400 rounded-2xl shadow-lg shadow-jade-500/20 hover:shadow-2xl hover:shadow-jade-500/40 transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1 flex flex-col items-center justify-center gap-3"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-jade-500/0 via-jade-500/0 to-jade-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="p-2 bg-jade-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform relative z-10">
          <Icon name="plus-circle" className="w-6 h-6 text-white" />
        </div>
        <span className="text-jade-900 font-bold text-base relative z-10">
          New Play
        </span>
      </button>

      <button
        onClick={() => onNavigate("/practice")}
        className="card-orange group relative h-32 p-6 rounded-2xl flex flex-col items-center justify-center gap-3"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="p-2 bg-orange-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform relative z-10">
          <Icon name="clipboard-list" className="w-6 h-6 text-white" />
        </div>
        <span className="card-orange-text font-bold text-base relative z-10">
          Practice Plan
        </span>
      </button>

      <button
        onClick={() => onNavigate("/game-plans")}
        className="card-purple group relative h-32 p-6 rounded-2xl flex flex-col items-center justify-center gap-3"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="p-2 bg-purple-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform relative z-10">
          <Icon name="target" className="w-6 h-6 text-white" />
        </div>
        <span className="card-purple-text font-bold text-base relative z-10">
          Game Plan
        </span>
      </button>

      <button
        onClick={() => onNavigate("/roster")}
        className="card-blue group relative h-32 p-6 rounded-2xl flex flex-col items-center justify-center gap-3"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="p-2 bg-blue-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform relative z-10">
          <Icon name="users" className="w-6 h-6 text-white" />
        </div>
        <span className="card-blue-text font-bold text-base relative z-10">
          Roster
        </span>
      </button>
    </div>
  );
}

function DashboardGettingStartedCard() {
  return (
    <Card variant="default" size="lg">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-jade-100 rounded-xl">
          <Icon name="lightbulb" className="text-jade-600 w-6 h-6" />
        </div>
        <div className="flex-1">
          <Typography variant="headline-md" className="text-primary mb-2">
            Welcome to BoxCall
          </Typography>
          <Typography variant="body" className="text-secondary mb-4">
            Your professional football coaching platform is ready. Here's how to
            get started:
          </Typography>
          <ul className="space-y-2 text-sm text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-jade-500 mt-0.5">✓</span>
              <span>
                <strong>Build your playbook</strong> - Create plays with our
                visual diagram editor
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-jade-500 mt-0.5">✓</span>
              <span>
                <strong>Plan practices</strong> - Organize time blocks and
                drills efficiently
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-jade-500 mt-0.5">✓</span>
              <span>
                <strong>Prepare game plans</strong> - Use Billick's situational
                methodology
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-jade-500 mt-0.5">✓</span>
              <span>
                <strong>Manage your roster</strong> - Track players and send
                invitations
              </span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

/**
 * DashboardPage - Your command center
 *
 * Features:
 * - Stats overview with elevated cards
 * - Personal calendar and feed
 * - Team activity feeds
 * - Roster quick add
 * - Mobile-first responsive design
 */
const DashboardPage = React.memo(() => {
  const { user, profile, loading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const dashboardStats = useDashboardStats(user?.id);

  // Get user info
  const displayName = profile?.display_name || profile?.full_name || "Coach";
  const userRole = profile?.role || "player";

  // Loading state
  if (loading || profileLoading) {
    return <DashboardLoadingState />;
  }

  if (!user) {
    return <DashboardLoggedOutState onLogin={() => navigate("/login")} />;
  }

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <DashboardHeader displayName={displayName} />

        {/* Stats Grid - Always visible */}
        <DashboardStatsGrid
          displayName={displayName}
          userRole={userRole}
          stats={dashboardStats as DashboardStats}
          onNavigate={(path) => navigate(path)}
        />

        <Card variant="default" size="lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Typography variant="headline-md" className="text-primary mb-1">
                Achievements
              </Typography>
              <Typography variant="body" color="muted">
                Track streaks, stickers, and medals.
              </Typography>
            </div>

            <CompactTrophyShelf userId={user.id} />
          </div>
        </Card>

        {/* Quick Actions - Colorful gradient buttons */}
        <DashboardQuickActions onNavigate={(path) => navigate(path)} />

        {/* Getting Started Section */}
        <DashboardGettingStartedCard />
      </div>
    </div>
  );
});

export default DashboardPage;
