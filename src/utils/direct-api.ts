// Direct HTTP API approach to bypass Supabase client issues
import { logError } from "./logger";
export async function createTeamDirectly(teamData: {
  name: string;
  school_name: string;
  mascot: string;
  season_year: number;
}) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log("🌐 Using direct HTTP approach to bypass Supabase client");

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        Prefer: "return=representation",
      },
      body: JSON.stringify(teamData),
    });

    console.log("📡 Direct HTTP response status:", response.status);
    console.log(
      "📡 Direct HTTP response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("❌ Direct HTTP error response:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Direct HTTP success:", result);
    return { data: result[0], error: null };
  } catch (error) {
    logError("❌ Direct HTTP failed:", error);
    return { data: null, error };
  }
}

export async function createTeamMembershipDirectly(membershipData: {
  team_id: string;
  user_id: string;
  team_role: string;
  capabilities?: any;
}) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log("🌐 Using direct HTTP approach for team membership");

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/team_members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        Prefer: "return=representation",
      },
      body: JSON.stringify(membershipData),
    });

    console.log("📡 Membership HTTP response status:", response.status);
    console.log(
      "📡 Membership HTTP response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      logError("❌ Membership HTTP error response:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Membership HTTP success:", result);
    return { data: result[0], error: null };
  } catch (error) {
    logError("❌ Membership HTTP failed:", error);
    return { data: null, error };
  }
}
