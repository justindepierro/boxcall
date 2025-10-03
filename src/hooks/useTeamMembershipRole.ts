import { useQuery } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";

import type { PostgrestError } from "@supabase/supabase-js";

interface TeamMembershipRow {
  team_role: string | null;
}

async function fetchTeamMembershipRole(teamId: string, userId: string) {
  if (!teamId || !userId) return null;
  
  const { data, error } = await supabase
    .from("team_members")
    .select("team_role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .maybeSingle<TeamMembershipRow>();
  if (error) {
    const pgErr = error as PostgrestError;
    if (pgErr.code === "42P01") return null; // relation missing
    throw error;
  }
  return data?.team_role || null;
}

export function useTeamMembershipRole(teamId?: string, userId?: string) {
  return useQuery({
    queryKey: ["team", teamId, "membership_role", userId],
    queryFn: () => fetchTeamMembershipRole(teamId || "", userId || ""),
    enabled: !!teamId && !!userId,
    staleTime: 60_000, // 1m
  });
}
