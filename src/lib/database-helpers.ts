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
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  timeout: 30000, // 30 seconds
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
 * Enhanced database connection test with retry logic
 * Tests authenticated user's database access
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log("🔗 Testing authenticated database connection...");

    // Test basic connection - check current user's profile (respects RLS)
    const connectionTest = await withDatabaseRetry(async () => {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("No authenticated user found for database test");
      }

      // Use maybeSingle() to avoid 406 when profile doesn't exist yet
      const { error } = await supabase
        .from("profiles")
        .select("id, full_name, email, is_active")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return true;
    });

    if (!connectionTest) {
      return false;
    }

    // Test only accessible tables (skip protected ones to avoid 500 errors)
    const testTables = [
      "teams",
      "plays",
      "team_members",
      "playbooks",
      "play_calls",
      "team_posts",
      "practice_schedules",
    ] as const;

    const accessibleTables: string[] = [];
    const protectedCount: string[] = [];

    // Test tables with individual retry logic
    const tableTests = testTables.map(async (tableName) => {
      try {
        await withDatabaseRetry(
          async () => {
            const { error } = await supabase
              .from(tableName)
              .select("id")
              .limit(1);
            if (!error) {
              accessibleTables.push(tableName);
            } else if (
              error.code === "PGRST116" ||
              error.message.includes("permission denied")
            ) {
              protectedCount.push(tableName);
            }
          },
          { maxRetries: 1 }
        ); // Only retry once for table tests
      } catch {
        // Table doesn't exist or access denied
        protectedCount.push(tableName);
      }
    });

    await Promise.allSettled(tableTests);

    // Only log in development mode to reduce console noise
    if (import.meta.env.DEV) {
      console.info(
        `🔗 Database: ${accessibleTables.length} accessible tables, ${protectedCount.length} protected`
      );
      if (protectedCount.length > 0) {
        console.info(`🔒 Protected tables:`, protectedCount);
      }
    }

    console.log("✅ Database connection test completed successfully");
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
