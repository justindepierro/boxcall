import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";

type TeamMember = Database["public"]["Tables"]["team_members"]["Row"] & {
  teams: Database["public"]["Tables"]["teams"]["Row"];
};

async function fetchUserTeamMemberships(userId: string): Promise<TeamMember[]> {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("team_members")
    .select(`
      *,
      teams (*)
    `)
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching user team memberships:", error);
    return [];
  }

  return data || [];
}

export function useUserTeamMemberships(userId?: string) {
  return useQuery({
    queryKey: ["user", userId, "team_memberships"],
    queryFn: () => fetchUserTeamMemberships(userId || ""),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}