import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Typography } from "../components/design-system";
import { Button } from "../components/ui";
import { Card } from "../components/ui";
import { Icon } from "../components/ui/Icon/Icon";
import { Dropdown } from "../components/ui/Dropdown";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import { PracticeService } from "../services/practiceService";
import { GamePlanService } from "../services/gamePlanService";
import { ExecutionTrackingService } from "../services/executionTrackingService";
import { triggerHapticFeedback } from "../lib/hapticFeedback";
import { formatRelativeDate } from "../utils/dateFormatting";
import type { PracticeScript } from "../services/practiceService";
import type { GamePlan } from "../services/gamePlanService";
import type { PracticeSession, GameSession } from "../types/session";
import { logError } from "../utils/logger";
import { useToast } from "../hooks/useToast";

/**
 * Skeleton loading state for BoxCall page
 * Matches the actual layout for smooth transition
 */
const BoxCallSkeleton: React.FC = () => (
  <div className="py-4 sm:py-6">
    <div className="container-page">
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8">
        <div className="h-8 sm:h-10 bg-secondary rounded-lg w-48 animate-pulse" />
        <div className="h-5 bg-secondary rounded-lg w-64 mt-2 animate-pulse" />
      </div>

      {/* Session Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-secondary rounded-xl p-4 sm:p-6 animate-pulse"
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl" />
              <div className="flex-1">
                <div className="h-6 bg-primary rounded w-36 mb-2" />
                <div className="h-4 bg-primary rounded w-48" />
              </div>
            </div>
            <div className="h-11 bg-primary rounded-lg mb-4" />
            <div className="flex gap-3">
              <div className="h-11 bg-primary rounded-lg flex-1" />
              <div className="h-11 bg-primary rounded-lg flex-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Sessions Skeleton */}
      <div className="bg-secondary rounded-xl p-4 sm:p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-primary rounded w-36" />
          <div className="h-8 bg-primary rounded w-20" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-primary rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

interface RecentSession {
  id: string;
  type: "practice" | "game";
  name: string;
  date: string;
  /** The script/plan ID to navigate to for resuming or viewing */
  sourceId?: string;
  stats: {
    totalPlays: number;
    successRate: number;
  };
}

/**
 * Transform session data to display format
 */
const mapSessionToDisplay = (
  session: PracticeSession | GameSession
): RecentSession => {
  if (session.type === "practice") {
    const practiceSession = session as PracticeSession;
    console.log("📋 [BoxCall] Mapping practice session:", {
      sessionId: practiceSession.id,
      practiceScriptId: practiceSession.practiceScriptId,
      rawPracticeScriptId: (practiceSession as any).practice_script_id,
    });
    return {
      id: practiceSession.id,
      type: "practice",
      name:
        (practiceSession as any).practice_scripts?.title || `Practice Session`,
      date: formatRelativeDate(practiceSession.sessionDate),
      sourceId: practiceSession.practiceScriptId, // The script ID to navigate to
      stats: {
        totalPlays: practiceSession.totalReps || 0,
        successRate: Math.round(practiceSession.successRate || 0),
      },
    };
  } else {
    const gameSession = session as GameSession;
    return {
      id: gameSession.id,
      type: "game",
      name:
        (gameSession as any).game_plans?.name ||
        `vs ${gameSession.opponent || "Unknown"}`,
      date: formatRelativeDate(gameSession.gameDate),
      sourceId: gameSession.gamePlanId, // The game plan ID to navigate to
      stats: {
        totalPlays: gameSession.totalPlays || 0,
        successRate: Math.round(gameSession.successRate || 0),
      },
    };
  }
};

/**
 * BoxCall - Live Session Tracking Platform
 * Available to coaches only
 *
 * Features:
 * - Live practice session tracking with rep counting
 * - Live game session tracking with situational awareness
 * - Retroactive session recording
 * - Real-time execution analytics
 */
const BoxCall: React.FC = () => {
  const navigate = useNavigate();
  const { activeTeamId } = useActiveTeamStore();
  const toast = useToast();
  const [practiceScripts, setPracticeScripts] = useState<PracticeScript[]>([]);
  const [gamePlans, setGamePlans] = useState<GamePlan[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPracticeScript, setSelectedPracticeScript] =
    useState<string>("");
  const [selectedGamePlan, setSelectedGamePlan] = useState<string>("");

  const loadData = useCallback(async () => {
    if (!activeTeamId) {
      console.log("📋 [BoxCall] No active team ID, skipping data load");
      setLoading(false);
      return;
    }

    console.log("📋 [BoxCall] Loading data for team:", activeTeamId);

    try {
      setLoading(true);
      const [scripts, plans, sessions] = await Promise.all([
        PracticeService.getPracticeScripts(activeTeamId),
        GamePlanService.getGamePlans(activeTeamId),
        ExecutionTrackingService.getRecentSessions(activeTeamId, 5).catch(
          () => []
        ), // Graceful fallback if tables don't exist yet
      ]);

      console.log("📋 [BoxCall] Loaded:", {
        scripts: scripts.length,
        plans: plans.length,
        sessions: sessions.length,
      });

      setPracticeScripts(scripts);
      setGamePlans(plans);
      setRecentSessions(sessions.map(mapSessionToDisplay));
    } catch (error) {
      logError("Error loading BoxCall data:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTeamId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartPractice = (mode: "live" | "retroactive") => {
    if (!selectedPracticeScript) {
      toast.error("Please select a practice script");
      return;
    }
    triggerHapticFeedback("light");
    navigate(`/boxcall/practice/${selectedPracticeScript}?mode=${mode}`);
  };

  const handleStartGame = (mode: "live" | "retroactive") => {
    if (!selectedGamePlan) {
      toast.error("Please select a game plan");
      return;
    }
    triggerHapticFeedback("light");
    navigate(`/boxcall/game/${selectedGamePlan}?mode=${mode}`);
  };

  if (loading) {
    return <BoxCallSkeleton />;
  }

  // Show message if no team is selected
  if (!activeTeamId) {
    return (
      <div className="py-4 sm:py-6">
        <div className="container-page">
          <div className="mb-6 sm:mb-8">
            <Typography variant="headline-xl" className="text-primary">
              BoxCall Live
            </Typography>
          </div>
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Icon name="team" size="xl" className="text-muted" />
            </div>
            <Typography variant="headline-md" className="mb-2">
              No Team Selected
            </Typography>
            <Typography variant="body-md" color="muted" className="mb-4">
              Please select a team from the navigation to start tracking
              sessions.
            </Typography>
            <Button variant="primary" onClick={() => navigate("/teams")}>
              <Icon name="users" size="sm" />
              Go to Teams
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6">
      <div className="container-page">
        {/* Header - Mobile-optimized spacing */}
        <div className="mb-6 sm:mb-8">
          <Typography variant="headline-xl" className="text-primary">
            BoxCall Live
          </Typography>
          <Typography variant="body-lg" color="muted" className="mt-1 sm:mt-2">
            Track practice and game sessions in real-time
          </Typography>
        </div>

        {/* Session Type Cards - Mobile-first responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Practice Session Card */}
          <Card className="card-orange p-4 sm:p-6 rounded-2xl">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="bg-[var(--card-orange-bg-light)] p-2.5 sm:p-3 rounded-xl border-2 border-[var(--card-orange-border)] flex-shrink-0">
                <Icon
                  name="clipboard-list"
                  size="lg"
                  className="card-orange-icon"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Typography variant="headline-md" className="mb-0.5 sm:mb-1">
                  Practice Session
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Track reps and execution quality during practice
                </Typography>
              </div>
            </div>

            {/* Practice Script Selector - Using Dropdown component */}
            <div className="mb-4">
              <Dropdown
                label="Select Practice Script"
                options={practiceScripts.map((script) => ({
                  value: script.id,
                  label: script.title || script.name || "Untitled Script",
                }))}
                value={selectedPracticeScript}
                onChange={(value) => setSelectedPracticeScript(value)}
                placeholder={
                  practiceScripts.length === 0
                    ? "No practice scripts available"
                    : "Choose a script..."
                }
                disabled={practiceScripts.length === 0}
                fullWidth
                size="md"
              />
            </div>

            {/* Action Buttons - Stacked on small mobile, side-by-side otherwise */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleStartPractice("live")}
                disabled={!selectedPracticeScript}
                className="flex-1 h-11"
              >
                <Icon name="play" size="sm" />
                Start Live
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleStartPractice("retroactive")}
                disabled={!selectedPracticeScript}
                className="flex-1 h-11"
              >
                <Icon name="clock" size="sm" />
                Record Past
              </Button>
            </div>
          </Card>

          {/* Game Session Card */}
          <Card className="card-emerald p-4 sm:p-6 rounded-2xl">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="bg-[var(--card-emerald-bg-light)] p-2.5 sm:p-3 rounded-xl border-2 border-[var(--card-emerald-border)] flex-shrink-0">
                <Icon name="zap" size="lg" className="card-emerald-icon" />
              </div>
              <div className="flex-1 min-w-0">
                <Typography variant="headline-md" className="mb-0.5 sm:mb-1">
                  Game Session
                </Typography>
                <Typography variant="body-sm" color="muted">
                  Track plays and performance during games
                </Typography>
              </div>
            </div>

            {/* Game Plan Selector - Using Dropdown component */}
            <div className="mb-4">
              <Dropdown
                label="Select Game Plan"
                options={gamePlans.map((plan) => ({
                  value: plan.id,
                  label: plan.name,
                }))}
                value={selectedGamePlan}
                onChange={(value) => setSelectedGamePlan(value)}
                placeholder={
                  gamePlans.length === 0
                    ? "No game plans available"
                    : "Choose a game plan..."
                }
                disabled={gamePlans.length === 0}
                fullWidth
                size="md"
              />
            </div>

            {/* Action Buttons - Stacked on small mobile, side-by-side otherwise */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleStartGame("live")}
                disabled={!selectedGamePlan}
                className="flex-1 h-11"
              >
                <Icon name="play" size="sm" />
                Start Live
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleStartGame("retroactive")}
                disabled={!selectedGamePlan}
                className="flex-1 h-11"
              >
                <Icon name="clock" size="sm" />
                Record Past
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card className="p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="headline-md">Recent Sessions</Typography>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/boxcall/history")}
              className="h-11 px-3"
            >
              View All
            </Button>
          </div>

          {recentSessions.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <div className="flex justify-center mb-3">
                <Icon name="calendar" size="lg" className="text-muted" />
              </div>
              <Typography variant="body-md" color="muted">
                No sessions recorded yet
              </Typography>
              <Typography variant="body-sm" color="muted" className="mt-1">
                Start your first practice or game session above
              </Typography>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {recentSessions.map((session) => (
                <button
                  key={session.id}
                  className="w-full flex items-center justify-between p-3 sm:p-4 border border-border rounded-lg hover:bg-secondary active:bg-secondary transition-colors cursor-pointer text-left h-16"
                  onClick={() => {
                    triggerHapticFeedback("light");
                    // Navigate using the source ID (script/plan ID), not the session ID
                    if (session.sourceId) {
                      navigate(`/boxcall/${session.type}/${session.sourceId}`);
                    } else {
                      // Fallback to history if no source ID
                      navigate("/boxcall/history");
                    }
                  }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <Icon
                      name={
                        session.type === "practice" ? "clipboard-list" : "zap"
                      }
                      size="md"
                      color="primary"
                      className="flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <Typography
                        variant="body-md"
                        className="font-medium truncate"
                      >
                        {session.name}
                      </Typography>
                      <Typography variant="body-sm" color="muted">
                        {session.date}
                      </Typography>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <Typography variant="body-sm" className="font-medium">
                      {session.stats.successRate}%
                    </Typography>
                    <Typography variant="body-xs" color="muted">
                      {session.stats.totalPlays} plays
                    </Typography>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BoxCall;
