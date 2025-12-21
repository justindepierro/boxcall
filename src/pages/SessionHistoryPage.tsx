/**
 * SessionHistoryPage - View all past practice and game sessions
 *
 * Modernized Dec 2025: Premium visual design with gradients
 *
 * NOTE: This component intentionally uses raw Tailwind colors for:
 * - Gradient effects (indigo-*, purple-*, slate-*)
 * - Visual polish (shadows, subtle backgrounds)
 * These are design choices that don't need dark mode variants.
 */

/* eslint-disable boxcall-design/no-raw-tailwind-colors */

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Typography } from "../components/design-system";
import { Icon } from "../components/ui/Icon/Icon";
import { Dropdown } from "../components/ui/Dropdown";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import { ExecutionTrackingService } from "../services/executionTrackingService";
import { triggerHapticFeedback } from "../lib/hapticFeedback";
import { formatRelativeDate } from "../utils/dateFormatting";
import type { PracticeSession, GameSession } from "../types/session";
import { debug, logError } from "../utils/logger";

/**
 * Skeleton loading state for Session History page
 */
const SessionHistorySkeleton: React.FC = () => (
  <div className="py-4 sm:py-6">
    <div className="container-page">
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8">
        <div className="h-8 sm:h-10 bg-secondary rounded-lg w-48 animate-pulse" />
        <div className="h-5 bg-secondary rounded-lg w-64 mt-2 animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="h-11 bg-secondary rounded-lg flex-1 animate-pulse" />
        <div className="h-11 bg-secondary rounded-lg w-32 animate-pulse" />
      </div>

      {/* Sessions List Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-secondary rounded-xl p-4 sm:p-5 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-xl" />
              <div className="flex-1">
                <div className="h-5 bg-primary rounded w-48 mb-2" />
                <div className="h-4 bg-primary rounded w-32" />
              </div>
              <div className="text-right">
                <div className="h-5 bg-primary rounded w-16 mb-2" />
                <div className="h-4 bg-primary rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface SessionDisplayItem {
  id: string;
  type: "practice" | "game";
  name: string;
  date: Date;
  dateDisplay: string;
  sourceId?: string; // The script/plan ID to navigate to for replay
  stats: {
    totalPlays: number;
    successRate: number;
    totalYards?: number;
  };
  opponent?: string;
  isArchived: boolean;
}

/**
 * Transform session data to display format
 */
const mapSessionToDisplay = (
  session: PracticeSession | GameSession
): SessionDisplayItem => {
  if (session.type === "practice") {
    const practiceSession = session as PracticeSession;
    return {
      id: practiceSession.id,
      type: "practice",
      name:
        (practiceSession as any).practice_scripts?.title || "Practice Session",
      date: practiceSession.sessionDate,
      dateDisplay: formatRelativeDate(practiceSession.sessionDate),
      sourceId: practiceSession.practiceScriptId, // For replay navigation
      stats: {
        totalPlays: practiceSession.totalReps || 0,
        successRate: Math.round(practiceSession.successRate || 0),
      },
      isArchived: practiceSession.isArchived,
    };
  }
  const gameSession = session as GameSession;
  return {
    id: gameSession.id,
    type: "game",
    name: (() => {
      if ((gameSession as any).game_plans?.name)
        return (gameSession as any).game_plans.name;
      if (gameSession.opponent) return `vs ${gameSession.opponent}`;
      return "vs Unknown";
    })(),
    date: gameSession.gameDate,
    dateDisplay: formatRelativeDate(gameSession.gameDate),
    sourceId: gameSession.gamePlanId, // For replay navigation
    stats: {
      totalPlays: gameSession.totalPlays || 0,
      successRate: Math.round(gameSession.successRate || 0),
      totalYards: gameSession.totalYards,
    },
    opponent: gameSession.opponent,
    isArchived: gameSession.isArchived,
  };
};

type FilterType = "all" | "practice" | "game";

const SessionHistoryHeader: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <Icon name="arrow-left" className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <Typography
            variant="headline-xl"
            className="text-slate-800 font-bold"
          >
            Session History
          </Typography>
          <Typography variant="body-md" color="muted">
            View and analyze your past sessions
          </Typography>
        </div>
      </div>
    </div>
  );
};

SessionHistoryHeader.displayName = "SessionHistoryHeader";

const SessionHistoryFilters: React.FC<{
  filterType: FilterType;
  onFilterTypeChange: (value: FilterType) => void;
  showArchived: boolean;
  onToggleArchived: () => void;
}> = ({ filterType, onFilterTypeChange, showArchived, onToggleArchived }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1 max-w-xs">
        <Dropdown
          options={[
            { value: "all", label: "📊 All Sessions" },
            { value: "practice", label: "🏈 Practice Only" },
            { value: "game", label: "🎯 Game Only" },
          ]}
          value={filterType}
          onChange={(value) => onFilterTypeChange(value as FilterType)}
          fullWidth
          size="md"
        />
      </div>
      <button
        onClick={onToggleArchived}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
          showArchived
            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
            : "bg-white border-2 border-border text-secondary hover:border-indigo-300"
        }`}
      >
        <Icon name="folder" size="sm" />
        {showArchived ? "Hide Archived" : "Show Archived"}
      </button>
    </div>
  );
};

SessionHistoryFilters.displayName = "SessionHistoryFilters";

const SessionHistoryEmptyState: React.FC<{
  filterType: FilterType;
  onStartSession: () => void;
}> = ({ filterType, onStartSession }) => {
  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
        <Icon name="calendar" size="xl" className="text-slate-400" />
      </div>
      <Typography variant="headline-md" className="mb-2 text-slate-800">
        No Sessions Found
      </Typography>
      <Typography variant="body-md" color="muted" className="mb-6">
        {(() => {
          if (filterType === "all") {
            return "You haven't recorded any sessions yet.";
          }
          return `No ${filterType} sessions found.`;
        })()}
      </Typography>
      <button
        onClick={onStartSession}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all"
      >
        <Icon name="play" size="sm" />
        Start a Session
      </button>
    </div>
  );
};

SessionHistoryEmptyState.displayName = "SessionHistoryEmptyState";

const SessionHistoryCard: React.FC<{
  session: SessionDisplayItem;
  onClick: (session: SessionDisplayItem) => void;
}> = ({ session, onClick }) => {
  return (
    <div
      className={`rounded-2xl bg-white border-2 p-4 sm:p-5 cursor-pointer hover:shadow-lg transition-all group ${(() => {
        if (session.isArchived) {
          return "opacity-60 border-slate-200";
        }
        if (session.type === "practice") {
          return "border-orange-200 hover:border-orange-300 shadow-md shadow-orange-500/5";
        }
        return "border-emerald-200 hover:border-emerald-300 shadow-md shadow-emerald-500/5";
      })()}`}
      onClick={() => onClick(session)}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
            session.type === "practice"
              ? "bg-gradient-to-br from-orange-400 to-amber-500 shadow-orange-500/25"
              : "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/25"
          }`}
        >
          <Icon
            name={session.type === "practice" ? "clipboard-list" : "zap"}
            size="md"
            className="text-white"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Typography
              variant="body-md"
              className="font-bold text-slate-800 truncate"
            >
              {session.name}
            </Typography>
            {session.isArchived && (
              <span className="px-2 py-0.5 text-xs bg-slate-100 rounded-full text-slate-500 font-medium">
                Archived
              </span>
            )}
            {!session.sourceId && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 rounded-full text-amber-600 font-medium">
                View Only
              </span>
            )}
          </div>
          <Typography variant="body-sm" color="muted">
            {session.dateDisplay}
            {session.opponent && ` • vs ${session.opponent}`}
          </Typography>
        </div>

        <div className="text-right flex-shrink-0">
          <div
            className={`text-2xl font-black ${(() => {
              if (session.stats.successRate >= 70) return "text-emerald-500";
              if (session.stats.successRate >= 50) return "text-amber-500";
              return "text-rose-500";
            })()}`}
          >
            {session.stats.successRate}%
          </div>
          <Typography variant="body-xs" color="muted">
            {session.stats.totalPlays}{" "}
            {session.type === "practice" ? "reps" : "plays"}
            {session.stats.totalYards !== undefined &&
              ` • ${session.stats.totalYards} yds`}
          </Typography>
        </div>

        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
          <Icon
            name="chevron-right"
            size="sm"
            className="text-slate-400 group-hover:text-slate-600"
          />
        </div>
      </div>
    </div>
  );
};

SessionHistoryCard.displayName = "SessionHistoryCard";

const SessionHistorySummary: React.FC<{ sessions: SessionDisplayItem[] }> = ({
  sessions,
}) => {
  if (sessions.length === 0) return null;

  return (
    <div className="mt-6 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 shadow-xl shadow-indigo-500/25">
      <Typography variant="body-sm" className="text-white/80 mb-4 font-medium">
        📊 Performance Summary
      </Typography>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-white">
            {sessions.length}
          </div>
          <div className="text-xs text-white/70 font-medium uppercase tracking-wide mt-1">
            Total Sessions
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-white">
            {sessions.filter((s) => s.type === "practice").length}
          </div>
          <div className="text-xs text-white/70 font-medium uppercase tracking-wide mt-1">
            Practices
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-white">
            {sessions.filter((s) => s.type === "game").length}
          </div>
          <div className="text-xs text-white/70 font-medium uppercase tracking-wide mt-1">
            Games
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-white">
            {Math.round(
              sessions.reduce((acc, s) => acc + s.stats.successRate, 0) /
                sessions.length || 0
            )}
            %
          </div>
          <div className="text-xs text-white/70 font-medium uppercase tracking-wide mt-1">
            Avg Success
          </div>
        </div>
      </div>
    </div>
  );
};

SessionHistorySummary.displayName = "SessionHistorySummary";

/**
 * SessionHistoryPage - View all past practice and game sessions
 *
 * Features:
 * - Filter by session type (practice/game)
 * - View session details and stats
 * - Archive/restore sessions
 * - Navigate to session replay
 */
const SessionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const activeTeamId = useActiveTeamStore((state) => state.activeTeamId);
  const [sessions, setSessions] = useState<SessionDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showArchived, setShowArchived] = useState(false);

  const loadSessions = useCallback(async () => {
    if (!activeTeamId) return;

    try {
      setLoading(true);

      // Fetch both session types
      const [practiceSessions, gameSessions] = await Promise.all([
        ExecutionTrackingService.getPracticeSessions(activeTeamId, {
          limit: 50,
          isArchived: showArchived ? undefined : false,
        }).catch(() => []),
        ExecutionTrackingService.getGameSessions(activeTeamId, {
          limit: 50,
          isArchived: showArchived ? undefined : false,
        }).catch(() => []),
      ]);

      // Combine and sort by date
      const allSessions = [
        ...practiceSessions.map(mapSessionToDisplay),
        ...gameSessions.map(mapSessionToDisplay),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setSessions(allSessions);
    } catch (error) {
      logError("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTeamId, showArchived]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSessionClick = (session: SessionDisplayItem) => {
    triggerHapticFeedback("light");
    // Navigate to replay using source ID (script/plan), or show session detail if no source
    if (session.sourceId) {
      navigate(`/boxcall/${session.type}/${session.sourceId}`);
    } else {
      // TODO: Navigate to session detail page when implemented
      // For now, just show a toast that replay isn't available
      debug(
        `Session ${session.id} has no linked ${session.type === "practice" ? "script" : "plan"}`
      );
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (filterType === "all") return true;
    return session.type === filterType;
  });

  if (loading) {
    return <SessionHistorySkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 py-4 sm:py-6">
      <div className="container-page">
        <SessionHistoryHeader onBack={() => navigate("/boxcall")} />
        <SessionHistoryFilters
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived(!showArchived)}
        />

        {filteredSessions.length === 0 ? (
          <SessionHistoryEmptyState
            filterType={filterType}
            onStartSession={() => navigate("/boxcall")}
          />
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <SessionHistoryCard
                key={session.id}
                session={session}
                onClick={handleSessionClick}
              />
            ))}
          </div>
        )}
        <SessionHistorySummary sessions={filteredSessions} />
      </div>
    </div>
  );
};

export default SessionHistoryPage;
