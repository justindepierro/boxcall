import { useState, useEffect } from "react";
import { useTeamsData } from "../hooks/useTeamsData";
import { supabase } from "../lib/supabase";

export interface DataFlowMetrics {
  totalPlays: number;
  playsInPractice: number;
  playsInGamePlans: number;
  averageMaturity: number;
  recentActivity: DataFlowActivity[];
}

export interface DataFlowActivity {
  id: string;
  playId: string;
  playName: string;
  action: "added_to_practice" | "added_to_gameplan" | "executed_in_game";
  section: "practice" | "gameplan" | "boxcall";
  timestamp: Date;
}

export interface PlayMaturity {
  level: "new" | "practice_tested" | "game_ready" | "proven";
  score: number; // 0-100
  usageCount: number;
  lastUsed: Date | null;
  sectionsUsed: string[];
}

// Real implementation using Supabase database
export const useDataFlowTracking = () => {
  const { plays: allPlays, teams } = useTeamsData();
  const [metrics, setMetrics] = useState<DataFlowMetrics>({
    totalPlays: 0,
    playsInPractice: 0,
    playsInGamePlans: 0,
    averageMaturity: 0,
    recentActivity: [],
  });

  useEffect(() => {
    const fetchDataFlowMetrics = async () => {
      if (!allPlays || teams.length === 0) return;

      // Use the first team for now - you may want to add team selection later
      const currentTeam = teams[0];

      try {
        // Fetch recent activity from play_usage_events table
        const { data: recentEvents, error: eventsError } = await supabase
          .from("play_usage_events")
          .select(
            `
            id,
            event_type,
            context_type,
            created_at,
            play_id
          `
          )
          .eq("team_id", currentTeam.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (eventsError) {
          console.error("Error fetching recent events:", eventsError);
        }

        // Transform events to DataFlowActivity format
        // For now, use play_id as playName - you can enhance this later with a separate query
        const recentActivity: DataFlowActivity[] = (recentEvents || []).map(
          (event) => ({
            id: event.id,
            playId: event.play_id,
            playName: `Play ${event.play_id.slice(-8)}`, // Temporary display using ID
            action:
              event.event_type === "practice_script_added"
                ? "added_to_practice"
                : event.event_type === "game_plan_added"
                  ? "added_to_gameplan"
                  : "executed_in_game",
            section:
              event.context_type === "practice_script"
                ? "practice"
                : event.context_type === "game_plan"
                  ? "gameplan"
                  : "boxcall",
            timestamp: new Date(event.created_at),
          })
        );

        // Fetch maturity data from play_maturity_levels table
        const { data: maturityData, error: maturityError } = await supabase
          .from("play_maturity_levels")
          .select("maturity_score")
          .eq("team_id", currentTeam.id);

        if (maturityError) {
          console.error("Error fetching maturity data:", maturityError);
        }

        // Calculate average maturity score
        const maturityScores = (maturityData || []).map(
          (m) => m.maturity_score
        );
        const averageMaturity =
          maturityScores.length > 0
            ? Math.round(
                maturityScores.reduce((sum, score) => sum + score, 0) /
                  maturityScores.length
              )
            : 0;

        // Count plays in different sections using the correct table structure
        // Note: These queries may need adjustment based on your exact table relationships
        const { data: practiceCount } = await supabase
          .from("script_plays")
          .select("play_id", { count: "exact" });

        const { data: gamePlanCount } = await supabase
          .from("game_plan_plays")
          .select("play_id", { count: "exact" });

        // For now, use simple counts - you may need to adjust these queries based on your exact table structure
        const playsInPractice = practiceCount?.length || 0;
        const playsInGamePlans = gamePlanCount?.length || 0;

        setMetrics({
          totalPlays: allPlays.length,
          playsInPractice,
          playsInGamePlans,
          averageMaturity,
          recentActivity,
        });
      } catch (error) {
        console.error("Error fetching data flow metrics:", error);
        // Fall back to basic metrics
        setMetrics({
          totalPlays: allPlays.length,
          playsInPractice: 0,
          playsInGamePlans: 0,
          averageMaturity: 0,
          recentActivity: [],
        });
      }
    };

    fetchDataFlowMetrics();
  }, [allPlays, teams]);

  const getPlayMaturity = async (
    playId: string
  ): Promise<PlayMaturity | null> => {
    if (teams.length === 0) return null;

    const currentTeam = teams[0];

    try {
      const { data, error } = await supabase
        .from("play_maturity_levels")
        .select("*")
        .eq("team_id", currentTeam.id)
        .eq("play_id", playId)
        .single();

      if (error || !data) return null;

      return {
        level: data.maturity_level as PlayMaturity["level"],
        score: data.maturity_score,
        usageCount: data.usage_count,
        lastUsed: data.last_used_at ? new Date(data.last_used_at) : null,
        sectionsUsed: data.sections_used || [],
      };
    } catch (error) {
      console.error("Error fetching play maturity:", error);
      return null;
    }
  };

  const getMaturityLevelColor = (level: PlayMaturity["level"]): string => {
    switch (level) {
      case "new":
        return "text-slate-500";
      case "practice_tested":
        return "text-blue-600";
      case "game_ready":
        return "text-green-600";
      case "proven":
        return "text-purple-600";
      default:
        return "text-slate-500";
    }
  };

  const getMaturityLevelLabel = (level: PlayMaturity["level"]): string => {
    switch (level) {
      case "new":
        return "New";
      case "practice_tested":
        return "Practice-Tested";
      case "game_ready":
        return "Game-Ready";
      case "proven":
        return "Proven";
      default:
        return "Unknown";
    }
  };

  return {
    metrics,
    getPlayMaturity,
    getMaturityLevelColor,
    getMaturityLevelLabel,
  };
};
