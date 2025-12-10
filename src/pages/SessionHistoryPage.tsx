import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Typography } from "../components/design-system";
import { Button } from "../components/ui";
import { Card } from "../components/ui";
import { Icon } from "../components/ui/Icon/Icon";
import { Dropdown } from "../components/ui/Dropdown";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import { ExecutionTrackingService } from "../services/executionTrackingService";
import { triggerHapticFeedback } from "../lib/hapticFeedback";
import { formatRelativeDate } from "../utils/dateFormatting";
import type { PracticeSession, GameSession } from "../types/session";
import { logError } from "../utils/logger";

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
      stats: {
        totalPlays: practiceSession.totalReps || 0,
        successRate: Math.round(practiceSession.successRate || 0),
      },
      isArchived: practiceSession.isArchived,
    };
  } else {
    const gameSession = session as GameSession;
    return {
      id: gameSession.id,
      type: "game",
      name:
        (gameSession as any).game_plans?.name ||
        `vs ${gameSession.opponent || "Unknown"}`,
      date: gameSession.gameDate,
      dateDisplay: formatRelativeDate(gameSession.gameDate),
      stats: {
        totalPlays: gameSession.totalPlays || 0,
        successRate: Math.round(gameSession.successRate || 0),
        totalYards: gameSession.totalYards,
      },
      opponent: gameSession.opponent,
      isArchived: gameSession.isArchived,
    };
  }
};

type FilterType = "all" | "practice" | "game";

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
  const { activeTeamId } = useActiveTeamStore();
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
    navigate(`/boxcall/${session.type}/${session.id}`);
  };

  const filteredSessions = sessions.filter((session) => {
    if (filterType === "all") return true;
    return session.type === filterType;
  });

  if (loading) {
    return <SessionHistorySkeleton />;
  }

  return (
    <div className="py-4 sm:py-6">
      <div className="container-page">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/boxcall")}
              className="p-2 -ml-2 text-secondary hover:text-primary active:text-primary rounded-lg transition-colors"
            >
              <Icon name="arrow-left" className="h-5 w-5" />
            </button>
            <Typography variant="headline-xl" className="text-primary">
              Session History
            </Typography>
          </div>
          <Typography variant="body-lg" color="muted" className="ml-8">
            View and manage your past practice and game sessions
          </Typography>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 max-w-xs">
            <Dropdown
              options={[
                { value: "all", label: "All Sessions" },
                { value: "practice", label: "Practice Only" },
                { value: "game", label: "Game Only" },
              ]}
              value={filterType}
              onChange={(value) => setFilterType(value as FilterType)}
              fullWidth
              size="md"
            />
          </div>
          <Button
            variant={showArchived ? "primary" : "secondary"}
            size="md"
            onClick={() => setShowArchived(!showArchived)}
            className="h-11"
          >
            <Icon name="folder" size="sm" />
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Icon name="calendar" size="xl" className="text-muted" />
            </div>
            <Typography variant="headline-md" className="mb-2">
              No Sessions Found
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-4">
              {filterType === "all"
                ? "You haven't recorded any sessions yet."
                : `No ${filterType} sessions found.`}
            </Typography>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/boxcall")}
            >
              <Icon name="play" size="sm" />
              Start a Session
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <Card
                key={session.id}
                className={`p-4 sm:p-5 cursor-pointer hover:shadow-md transition-all ${
                  session.isArchived ? "opacity-60" : ""
                }`}
                onClick={() => handleSessionClick(session)}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-xl flex-shrink-0 ${
                      session.type === "practice"
                        ? "bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200"
                        : "bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200"
                    }`}
                  >
                    <Icon
                      name={
                        session.type === "practice" ? "clipboard-list" : "zap"
                      }
                      size="md"
                      className={
                        session.type === "practice"
                          ? "text-orange-600"
                          : "text-emerald-600"
                      }
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Typography
                        variant="body-md"
                        className="font-semibold truncate"
                      >
                        {session.name}
                      </Typography>
                      {session.isArchived && (
                        <span className="px-2 py-0.5 text-xs bg-secondary rounded-full text-secondary">
                          Archived
                        </span>
                      )}
                    </div>
                    <Typography variant="body-sm" color="muted">
                      {session.dateDisplay}
                      {session.opponent && ` • vs ${session.opponent}`}
                    </Typography>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <Typography variant="body-md" className="font-semibold">
                      {session.stats.successRate}%
                    </Typography>
                    <Typography variant="body-xs" color="muted">
                      {session.stats.totalPlays}{" "}
                      {session.type === "practice" ? "reps" : "plays"}
                      {session.stats.totalYards !== undefined &&
                        ` • ${session.stats.totalYards} yds`}
                    </Typography>
                  </div>

                  {/* Arrow */}
                  <Icon
                    name="chevron-right"
                    size="sm"
                    className="text-muted flex-shrink-0"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredSessions.length > 0 && (
          <Card className="mt-6 p-4 sm:p-5 bg-secondary">
            <Typography variant="body-sm" color="muted" className="mb-3">
              Summary
            </Typography>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <Typography variant="headline-md">
                  {filteredSessions.length}
                </Typography>
                <Typography variant="body-xs" color="muted">
                  Total Sessions
                </Typography>
              </div>
              <div>
                <Typography variant="headline-md">
                  {filteredSessions.filter((s) => s.type === "practice").length}
                </Typography>
                <Typography variant="body-xs" color="muted">
                  Practices
                </Typography>
              </div>
              <div>
                <Typography variant="headline-md">
                  {filteredSessions.filter((s) => s.type === "game").length}
                </Typography>
                <Typography variant="body-xs" color="muted">
                  Games
                </Typography>
              </div>
              <div>
                <Typography variant="headline-md">
                  {Math.round(
                    filteredSessions.reduce(
                      (acc, s) => acc + s.stats.successRate,
                      0
                    ) / filteredSessions.length || 0
                  )}
                  %
                </Typography>
                <Typography variant="body-xs" color="muted">
                  Avg Success
                </Typography>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SessionHistoryPage;
