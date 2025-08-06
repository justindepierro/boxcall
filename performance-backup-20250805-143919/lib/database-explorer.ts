import { supabase } from "../lib/supabase";

// Test Supabase connection and explore existing database structure
export async function testSupabaseConnection() {
  try {
    console.log("[Search/Investigate] Testing Supabase connection...");

    // Test basic connection by checking auth
    const { data: authData, error: authError } =
      await supabase.auth.getSession();

    if (authError) {
      console.error(
        "[Error/Failed] Auth connection failed:",
        authError.message
      );
      return false;
    }

    console.log("[Success/Complete] Supabase connection successful!");
    console.log(
      " Current auth state:",
      authData?.session ? "Session exists" : "No session"
    );

    return true;
  } catch (error) {
    console.error("[Error/Failed] Connection test failed:", error);
    return false;
  }
}

// Check what tables exist by trying common ones
export async function checkExistingTables() {
  const commonTables = [
    "profiles",
    "teams",
    "players",
    "coaches",
    "team_members",
  ];
  const existingTables: string[] = [];

  for (const tableName of commonTables) {
    try {
      const { error } = await supabase.from(tableName).select("id").limit(1);

      if (!error) {
        existingTables.push(tableName);
        console.log(
          `[Success/Complete] Table "${tableName}" exists and accessible`
        );
      } else if (!error.message.includes("does not exist")) {
        console.log(
          `[Warning] Table "${tableName}" exists but has access issues:`,
          error.message
        );
        existingTables.push(`${tableName} (restricted)`);
      }
    } catch {
      console.log(
        `[Error/Failed] Table "${tableName}" does not exist or is not accessible`
      );
    }
  }

  console.log("[Clipboard/List] Existing tables found:", existingTables);

  // Test sample data
  if (existingTables.includes("teams")) {
    const { data: teams, error } = await supabase
      .from("teams")
      .select("*")
      .limit(3);
    if (!error && teams) {
      console.log("[Football] Sample teams:", teams);
    }
  }

  return existingTables;
}
