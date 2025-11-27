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

import { useAuth } from "../app/auth-store";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { Card } from "../components/ui/Card";
import { Typography } from "../components/design-system/Typography";
import { Icon } from "../components/ui/Icon";
import { useNavigate } from "react-router-dom";
import { shimmerSkeleton, statusIndicator } from "../utils/animations";

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
export default function DashboardPage() {
  const { user, profile, loading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const dashboardStats = useDashboardStats(user?.id);

  // Get user info
  const displayName = profile?.display_name || profile?.full_name || "Coach";
  const userRole = profile?.role || "player";

  // Loading state
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-secondary p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className={shimmerSkeleton.base + " h-12"}>
            <div className={shimmerSkeleton.overlay} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={shimmerSkeleton.base + " h-32"}>
              <div className={shimmerSkeleton.overlay} />
            </div>
            <div className={shimmerSkeleton.base + " h-32"}>
              <div className={shimmerSkeleton.overlay} />
            </div>
            <div className={shimmerSkeleton.base + " h-32"}>
              <div className={shimmerSkeleton.overlay} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
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
            onClick={() => navigate("/login")}
            className="w-full px-4 py-2 bg-gradient-to-r from-jade-500 to-jade-600 text-white font-semibold rounded-lg shadow-jade-md hover:shadow-jade-lg transition-all duration-300 hover:scale-105"
          >
            Log In
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
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

        {/* Stats Grid - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* My Role Card */}
          <Card
            variant="elevated"
            size="lg"
            interactive
            onClick={() => navigate("/profile")}
            className="shadow-jade-md hover:shadow-jade-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-4 bg-gradient-to-br from-jade-50 to-jade-100 rounded-xl">
                <Icon name="user" className="text-jade-600 w-8 h-8" />
              </div>
              <span className="px-3 py-1.5 bg-gradient-to-r from-jade-500 to-jade-600 text-white text-xs font-bold rounded-lg shadow-jade-sm">
                {userRole.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <Typography variant="headline-md" className="text-primary mb-2">
              {displayName}
            </Typography>
            <Typography variant="body" className="text-secondary mb-4">
              {userRole === "head_coach"
                ? "Leading the team"
                : "Platform Admin"}
            </Typography>
            <div className="pt-4 border-t border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary">Status</span>
                <span className="flex items-center text-jade-600 font-semibold">
                  <span className={statusIndicator.active + " mr-2"}></span>
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
            onClick={() => navigate("/bulletin")}
            className="shadow-orange-md hover:shadow-orange-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <Icon name="users" className="text-orange-600 w-8 h-8" />
              </div>
              <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-lg shadow-orange-sm">
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
                <span className="text-primary font-semibold">
                  View Bulletin →
                </span>
              </div>
            </div>
          </Card>

          {/* Playbook Card */}
          <Card
            variant="elevated"
            size="lg"
            interactive
            onClick={() => navigate("/playbook")}
            className="shadow-purple-md hover:shadow-purple-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <Icon name="book" className="text-purple-600 w-8 h-8" />
              </div>
              <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-purple-sm flex flex-col items-center">
                <span className="text-2xl font-black leading-none">
                  {dashboardStats.totalPlays || 0}
                </span>
                <span className="text-xs font-medium opacity-90">PLAYS</span>
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
                  {dashboardStats.totalPlays || 0} plays
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions - Colorful gradient buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/playbook")}
            className="group relative h-28 p-6 bg-gradient-to-br from-jade-50 to-jade-100 hover:from-jade-100 hover:to-jade-200 border-2 border-jade-200 hover:border-jade-300 rounded-2xl shadow-jade-sm hover:shadow-jade-md transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon
              name="plus-circle"
              className="w-7 h-7 text-jade-600 group-hover:scale-110 transition-transform relative z-10"
            />
            <span className="text-jade-900 font-bold relative z-10">
              New Play
            </span>
          </button>

          <button
            onClick={() => navigate("/practice")}
            className="group relative h-28 p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-2 border-orange-200 hover:border-orange-300 rounded-2xl shadow-orange-sm hover:shadow-orange-md transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon
              name="clipboard-list"
              className="w-7 h-7 text-orange-600 group-hover:scale-110 transition-transform relative z-10"
            />
            <span className="text-orange-900 font-bold relative z-10">
              Practice Plan
            </span>
          </button>

          <button
            onClick={() => navigate("/game-plans")}
            className="group relative h-28 p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-300 rounded-2xl shadow-purple-sm hover:shadow-purple-md transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon
              name="target"
              className="w-7 h-7 text-purple-600 group-hover:scale-110 transition-transform relative z-10"
            />
            <span className="text-purple-900 font-bold relative z-10">
              Game Plan
            </span>
          </button>

          <button
            onClick={() => navigate("/roster")}
            className="group relative h-28 p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-300 rounded-2xl shadow-blue-sm hover:shadow-blue-md transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon
              name="users"
              className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform relative z-10"
            />
            <span className="text-blue-900 font-bold relative z-10">
              Roster
            </span>
          </button>
        </div>

        {/* Getting Started Section */}
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
                Your professional football coaching platform is ready. Here's
                how to get started:
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
                    <strong>Prepare game plans</strong> - Use Billick's
                    situational methodology
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
      </div>
    </div>
  );
}
