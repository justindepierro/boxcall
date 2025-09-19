import { supabase } from "./supabase";

import type {
  Game,
  Play,
  PlayCall,
  PostReaction,
  Profile,
  Team,
  TeamFile,
  TeamGoal,
  UserProfile,
} from "../types/database";
// Test connection and verify table access
export async function testDatabaseConnection() {
  try {
    // Test basic connection
    const { error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, email")
      .limit(1)
      .single();
    if (profileError && profileError.code !== "PGRST116") {
      return false;
    }
    // Profile check completed - connection working
    // Test only accessible tables (skip protected ones to avoid 500 errors)
    const testTables = [
      "teams",
      "plays",
      "team_members",
      "playbooks",
      "play_calls",
      "team_goals",
      "team_files",
      "post_reactions",
      "team_memberships",
    ] as const;

    const accessibleTables: string[] = [];
    const protectedCount: string[] = [];

    for (const tableName of testTables) {
      try {
        const { error } = await supabase.from(tableName).select("id").limit(1);
        if (!error) {
          accessibleTables.push(tableName);
        } else if (
          error.code === "PGRST116" ||
          error.message.includes("permission denied")
        ) {
          protectedCount.push(tableName);
        }
      } catch {
        // Table doesn't exist or access denied
        protectedCount.push(tableName);
      }
    }

    // Only log in development mode to reduce console noise
    if (import.meta.env.DEV) {
      // console.info(`🔗 Database: ${accessibleTables.length} accessible tables, ${protectedCount.length} protected`);
      if (protectedCount.length > 0) {
        /* console.info(`🔒 Protected tables:`, protectedCount); */
      }
    }

    return true;
  } catch (_error) {
    // console.error("❌ Database connection failed:", error);
    return false;
  }
}
// Helper functions for common operations
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error: _error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (_error) {
    // console.error("Error fetching user profile:", _error);
    return null;
  }
  return data;
}
export async function getTeams(): Promise<Team[]> {
  const { data, error: _error } = await supabase
    .from("teams")
    .select("*")
    .order("created_at", { ascending: false });
  if (_error) {
    // console.error("Error fetching teams:", _error);
    return [];
  }
  return data || [];
}
export async function getTeamGames(teamId: string): Promise<Game[]> {
  const { data, error: _error } = await supabase
    .from("games")
    .select("*")
    .eq("team_id", teamId)
    .order("game_date", { ascending: false });
  if (_error) {
    // console.error("Error fetching games:", _error);
    return [];
  }
  return data || [];
}
export async function getPlaybookPlays(playbookId: string): Promise<Play[]> {
  const { data, error: _error } = await supabase
    .from("plays")
    .select("*")
    .eq("playbook_id", playbookId)
    .order("play_name");
  if (_error) {
    // console.error("Error fetching plays:", _error);
    return [];
  }
  return data || [];
}
// New helper functions for additional tables
export async function getGamePlayCalls(gameId: string): Promise<PlayCall[]> {
  const { data, error: _error } = await supabase
    .from("play_calls")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at");
  if (_error) {
    // console.error("Error fetching play calls:", _error);
    return [];
  }
  return data || [];
}
export async function getTeamGoals(teamId: string): Promise<TeamGoal[]> {
  const { data, error: _error } = await supabase
    .from("team_goals")
    .select("*")
    .eq("team_id", teamId)
    .order("deadline", { ascending: true });
  if (_error) {
    // console.error("Error fetching team goals:", _error);
    return [];
  }
  return data || [];
}
export async function getTeamFiles(teamId: string): Promise<TeamFile[]> {
  const { data, error: _error } = await supabase
    .from("team_files")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });
  if (_error) {
    // console.error("Error fetching team files:", _error);
    return [];
  }
  return data || [];
}
export async function getUserProfileByUserId(
  userId: string
): Promise<UserProfile | null> {
  const { data, error: _error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (_error) {
    // console.error("Error fetching user profile:", _error);
    return null;
  }
  return data;
}
export async function getPostReactions(
  postId: string
): Promise<PostReaction[]> {
  const { data, error: _error } = await supabase
    .from("post_reactions")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });
  if (_error) {
    // console.error("Error fetching post reactions:", _error);
    return [];
  }
  return data || [];
}
