import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";
import { logError } from "../utils/logger";

type RawTeamMember = Database["public"]["Tables"]["team_members"]["Row"] & {
  teams: Database["public"]["Tables"]["teams"]["Row"] | null;
};

type TeamMember = Database["public"]["Tables"]["team_members"]["Row"] & {
  teams: Database["public"]["Tables"]["teams"]["Row"];
};

async function fetchUserTeamMemberships(userId: string): Promise<TeamMember[]> {
  console.log(
    "🔍 [useUserTeamMemberships] Fetching memberships for userId:",
    userId
  );
  if (!userId) {
    console.log(
      "🔍 [useUserTeamMemberships] No userId provided, returning empty"
    );
    return [];
  }

  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      *,
      teams (*)
    `
    )
    .eq("user_id", userId)
    .eq("status", "active");

  console.log("🔍 [useUserTeamMemberships] Result:", {
    data,
    error,
    count: data?.length,
  });

  if (error) {
    console.error("🔍 [useUserTeamMemberships] ERROR:", error);
    logError("Error fetching user team memberships:", error);
    return [];
  }

  const typed = (data || []) as RawTeamMember[];
  return typed.filter((m): m is TeamMember => !!m.teams);
}

export function useUserTeamMemberships(userId?: string) {
  return useQuery({
    queryKey: ["user", userId, "team_memberships"],
    queryFn: () => fetchUserTeamMemberships(userId || ""),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
