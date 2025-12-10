import { supabase } from "./supabase";
import { getCurrentUserId } from "./auth-helpers";

import type {
  Game,
  Play,
  PlayCall,
  // PostReaction, // Unused - table doesn't exist
  Profile,
  Team,
  // TeamFile, // Unused - table doesn't exist
  // TeamGoal, // Unused - table doesn't exist
  UserProfile,
} from "../types/database";

// Database operation configuration
interface DatabaseOperationConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  timeout?: number;
}

// Default configuration for database operations
const DEFAULT_DB_CONFIG: Required<DatabaseOperationConfig> = {
  maxRetries: 2, // Reduced from 3 - faster failure detection
  baseDelay: 500, // Reduced from 1000ms - faster retries
  maxDelay: 5000, // Reduced from 10000ms
  timeout: 10000, // Reduced from 30000ms - 10 seconds is plenty for simple queries
};

/**
 * Generic database operation wrapper with retry logic and error handling
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  config: DatabaseOperationConfig = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, timeout } = {
    ...DEFAULT_DB_CONFIG,
    ...config,
  };

  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(`Database operation timed out after ${timeout}ms`)
            ),
          timeout
        );
      });

      // Race between the operation and timeout
      const result = await Promise.race([operation(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (isNonRetryableError(lastError)) {
        console.error(`❌ Non-retryable database error:`, lastError);
        throw lastError;
      }

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        console.warn(
          `⚠️ Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`,
          lastError.message
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error(
    `❌ Database operation failed after ${maxRetries + 1} attempts:`,
    lastError
  );
  throw lastError;
}

/**
 * Check if an error is non-retryable (permanent failures)
 */
function isNonRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Authentication/permission errors
  if (
    message.includes("permission denied") ||
    message.includes("unauthorized") ||
    message.includes("invalid credentials")
  ) {
    return true;
  }

  // Schema/validation errors
  if (
    message.includes("violates") ||
    message.includes("constraint") ||
    message.includes("invalid input")
  ) {
    return true;
  }

  // Not found errors (for specific queries)
  if (message.includes("not found") && !message.includes("network")) {
    return true;
  }

  return false;
}

/**
 * Basic database connectivity test (no auth required)
 * Tests if we can reach the database without authentication
 */
export async function testBasicDatabaseConnectivity(): Promise<boolean> {
  try {
    console.log("🔗 Testing basic database connectivity...");

    // Test basic Supabase connection without requiring auth
    // We'll try to access a public table or make a simple query
    const { error } = await supabase
      .from("teams")
      .select("count", { count: "exact", head: true });

    if (error) {
      // If we get a permission error, that's actually good - it means we can reach the DB
      // but RLS is working as expected
      if (
        error.code === "PGRST116" ||
        error.message.includes("permission denied")
      ) {
        console.log("✅ Database reachable (RLS working as expected)");
        return true;
      }
      throw error;
    }

    console.log("✅ Basic database connectivity confirmed");
    return true;
  } catch (error) {
    console.error("❌ Basic database connectivity failed:", error);
    return false;
  }
}

/**
 * Lightweight database connection test
 * Tests authenticated user's database access with a single simple query
 * Designed to be fast and non-blocking
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log("🔗 Testing database connection...");

    const userId = getCurrentUserId();
    if (!userId) {
      console.warn("⚠️ No authenticated user - skipping database test");
      return false;
    }

    // Single fast query to verify connection - profiles table with user's own data
    const { error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("❌ Database connection test failed:", error.message);
      return false;
    }

    console.log("✅ Database connection verified");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}
// Helper functions for common operations with enhanced error handling
export function getCurrentUser(): { id: string } | null {
  const userId = getCurrentUserId();
  return userId ? { id: userId } : null;
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    return await withDatabaseRetry(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    return null;
  }
}

/**
 * Enhanced team operations with retry logic
 */
export async function getUserTeams(userId: string): Promise<Team[]> {
  try {
    return await withDatabaseRetry(async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("head_coach_id", userId);

      if (error) {
        throw error;
      }

      return data || [];
    });
  } catch (error) {
    console.error("❌ Error fetching user teams:", error);
    return [];
  }
}

/**
 * Enhanced team member operations
 */
export async function getTeamMembers(teamId: string): Promise<any[]> {
  try {
    return await withDatabaseRetry(async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select(
          `
          *,
          profiles:user_id (
            id,
            full_name,
            display_name,
            role,
            avatar_url
          )
        `
        )
        .eq("team_id", teamId);

      if (error) {
        throw error;
      }

      return data || [];
    });
  } catch (error) {
    console.error("❌ Error fetching team members:", error);
    return [];
  }
}
export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
  return data || [];
}
export async function getTeamGames(teamId: string): Promise<Game[]> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("team_id", teamId)
    .order("game_date", { ascending: false });
  if (error) {
    console.error("Error fetching games:", error);
    return [];
  }
  return data || [];
}
export async function getPlaybookPlays(playbookId: string): Promise<Play[]> {
  const { data, error } = await supabase
    .from("plays")
    .select("*")
    .eq("playbook_id", playbookId)
    .order("play_name");
  if (error) {
    console.error("Error fetching plays:", error);
    return [];
  }
  return data || [];
}
// New helper functions for additional tables
export async function getGamePlayCalls(gameId: string): Promise<PlayCall[]> {
  const { data, error } = await supabase
    .from("play_calls")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at");
  if (error) {
    console.error("Error fetching play calls:", error);
    return [];
  }
  return data || [];
}

// DEPRECATED: These tables don't exist in production
// Commenting out to prevent 404 errors in browser console
/*
export async function getTeamGoals(teamId: string): Promise<TeamGoal[]> {
  const { data, error } = await supabase
    .from("team_goals")
    .select("*")
    .eq("team_id", teamId)
    .order("deadline", { ascending: true });
  if (error) {
    console.error("Error fetching team goals:", error);
    return [];
  }
  return data || [];
}
export async function getTeamFiles(teamId: string): Promise<TeamFile[]> {
  const { data, error } = await supabase
    .from("team_files")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching team files:", error);
    return [];
  }
  return data || [];
}
*/

export async function getUserProfileByUserId(
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  return data;
}

// DEPRECATED: post_reactions table doesn't exist
/*
export async function getPostReactions(
  postId: string
): Promise<PostReaction[]> {
  const { data, error } = await supabase
    .from("post_reactions")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching post reactions:", error);
    return [];
  }
  return data || [];
}
*/
