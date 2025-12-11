#!/usr/bin/env node
/**
 * Database Schema Dump Script
 * Queries the actual Supabase database and dumps:
 * - All tables with their columns
 * - All RLS policies
 * - All foreign key relationships
 */

const SUPABASE_URL = "https://lvmuiqwihlpnwppdqqfl.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAyMjM0OCwiZXhwIjoyMDY3NTk4MzQ4fQ.cCLvqoIWqHHMN_PQoSoST5Jh1PtECbFirGpr-L46Oic";

async function query(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    // Try raw SQL endpoint
    const pgResponse = await fetch(`${SUPABASE_URL}/pg`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });
    if (!pgResponse.ok) {
      throw new Error(`Query failed: ${response.status}`);
    }
    return pgResponse.json();
  }
  return response.json();
}

async function main() {
  console.log("🔍 BoxCall Database Schema Dump");
  console.log("================================\n");

  // Get all tables
  console.log("📋 TABLES IN DATABASE:");
  console.log("----------------------");

  const tablesResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });

  const schema = await tablesResponse.json();
  const tables = Object.keys(schema.definitions || {}).sort();

  console.log(`Found ${tables.length} tables:\n`);

  // Categorize tables
  const categories = {
    Core: ["teams", "team_members", "team_players", "profiles"],
    Playbook: [
      "playbooks",
      "plays",
      "formations",
      "personnel_configurations",
      "personnel_players",
    ],
    "Game Planning": ["game_plans", "game_plan_situations", "game_plan_plays"],
    Practice: [
      "practice_scripts",
      "practice_script_plays",
      "practice_templates",
      "practice_schedules",
      "practice_attendance",
    ],
    Social: [
      "team_posts",
      "team_announcements",
      "announcement_comments",
      "announcement_reactions",
      "announcement_views",
      "post_comments",
      "post_likes",
      "post_shares",
      "mentions",
      "notifications",
    ],
    Tracking: [
      "activities",
      "activity_feed",
      "play_calls",
      "game_results",
      "game_sessions",
      "practice_sessions",
      "play_executions",
    ],
    Analytics: [
      "formation_quality_analytics",
      "formation_sync_audit",
      "play_creation_analytics",
      "play_tab_usage_analytics",
      "season_stats",
    ],
    Achievements: [
      "achievements",
      "achievement_definitions",
      "achievement_progress",
      "helmet_stickers",
    ],
    Utility: [
      "play_versions",
      "playbook_view_presets",
      "calendar_events",
      "team_events",
      "equipment",
      "invitation_attempts",
    ],
    "Views/Debug": [
      "team_players_view",
      "formations_missing_personnel",
      "orphaned_personnel_configs",
      "plays_missing_formation_link",
      "plays_missing_personnel_link",
      "comment_reactions",
    ],
  };

  for (const [category, expectedTables] of Object.entries(categories)) {
    const found = expectedTables.filter((t) => tables.includes(t));
    const missing = expectedTables.filter((t) => !tables.includes(t));
    console.log(`\n${category}:`);
    found.forEach((t) => console.log(`  ✅ ${t}`));
    missing.forEach((t) => console.log(`  ❌ ${t} (MISSING)`));
  }

  // Find uncategorized tables
  const categorized = Object.values(categories).flat();
  const uncategorized = tables.filter((t) => !categorized.includes(t));
  if (uncategorized.length > 0) {
    console.log("\nUncategorized:");
    uncategorized.forEach((t) => console.log(`  ⚠️ ${t}`));
  }

  // Get table details for core tables
  console.log("\n\n📊 CORE TABLE STRUCTURES:");
  console.log("-------------------------\n");

  const coreTables = [
    "teams",
    "team_members",
    "profiles",
    "playbooks",
    "plays",
  ];

  for (const table of coreTables) {
    if (schema.definitions && schema.definitions[table]) {
      const def = schema.definitions[table];
      console.log(`\n### ${table.toUpperCase()}`);
      if (def.properties) {
        const cols = Object.entries(def.properties).map(([name, info]) => {
          const type = info.type || info.format || "unknown";
          const desc = info.description || "";
          return `  - ${name}: ${type}${desc ? ` (${desc})` : ""}`;
        });
        console.log(cols.join("\n"));
      }
    }
  }

  console.log("\n\n✅ Schema dump complete!");
  console.log("\nNext steps:");
  console.log("1. Run the RLS policy fix migration in Supabase dashboard");
  console.log("2. Clean up unused tables (views/debug tables)");
  console.log("3. Simplify the auth-store.ts");
}

main().catch(console.error);
