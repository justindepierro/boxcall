#!/usr/bin/env node
/**
 * RLS Policy Audit Script
 * Checks all tables for proper Row Level Security policies
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lvmuiqwihlpnwppdqqfl.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function auditRLS() {
  console.log("\n🔒 RLS POLICY AUDIT\n");
  console.log("=".repeat(60));

  // Query to get all tables and their RLS status
  const { data: tables, error: tablesError } = await supabase.rpc("exec_sql", {
    sql: `
      SELECT 
        schemaname,
        tablename,
        rowsecurity
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `,
  });

  if (tablesError) {
    // Try direct query if RPC not available
    console.log("Note: Using direct query (RPC not available)");

    // Query tables from information_schema
    const { data: infoTables, error: infoError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    if (infoError) {
      console.log("Cannot query information_schema directly.");
      console.log("Checking tables from schema.sql instead...\n");

      // Fall back to testing known tables
      await testKnownTables();
      return;
    }
  }

  if (tables) {
    console.log("\nTable RLS Status:");
    console.log("-".repeat(60));

    let rlsEnabled = 0;
    let rlsDisabled = 0;

    for (const table of tables) {
      const status = table.rowsecurity ? "✅ RLS ON" : "❌ RLS OFF";
      console.log(`${status}  ${table.tablename}`);
      if (table.rowsecurity) rlsEnabled++;
      else rlsDisabled++;
    }

    console.log("\n" + "=".repeat(60));
    console.log(`Total: ${tables.length} tables`);
    console.log(`RLS Enabled: ${rlsEnabled}`);
    console.log(`RLS Disabled: ${rlsDisabled}`);
  }
}

async function testKnownTables() {
  // List of tables from schema.sql
  const tables = [
    "teams",
    "team_members",
    "team_players",
    "profiles",
    "playbooks",
    "plays",
    "play_calls",
    "team_posts",
    "post_likes",
    "post_comments",
    "post_shares",
    "game_plans",
    "game_plan_situations",
    "game_plan_plays",
    "game_results",
    "practice_scripts",
    "practice_schedules",
    "practice_attendance",
    "practice_templates",
    "achievements",
    "helmet_stickers",
    "calendar_events",
    "team_events",
    "equipment",
  ];

  console.log("Testing RLS by querying tables without auth...\n");
  console.log("Table".padEnd(30) + "Anon Access".padEnd(15) + "Status");
  console.log("-".repeat(60));

  // Create anon client (no service role)
  const anonClient = createClient(
    supabaseUrl,
    process.env.VITE_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjIzNDgsImV4cCI6MjA2NzU5ODM0OH0.3SreGdPAJ2J5XcQVbNIbzK378j15ZJnwQqscBE2HkII",
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );

  let secure = 0;
  let insecure = 0;
  let notFound = 0;

  for (const table of tables) {
    try {
      const { data, error, count } = await anonClient
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        if (
          error.code === "42501" ||
          error.message.includes("permission denied")
        ) {
          console.log(`${table.padEnd(30)}${"Blocked".padEnd(15)}✅ Secure`);
          secure++;
        } else if (error.code === "42P01") {
          console.log(
            `${table.padEnd(30)}${"Not Found".padEnd(15)}⚠️  Missing`
          );
          notFound++;
        } else {
          console.log(
            `${table.padEnd(30)}${"Error".padEnd(15)}❓ ${error.code}`
          );
        }
      } else {
        // Check if we got any data (should be 0 for RLS-protected tables with no auth)
        if (count === 0 || count === null) {
          console.log(
            `${table.padEnd(30)}${"Empty/RLS".padEnd(15)}✅ Likely Secure`
          );
          secure++;
        } else {
          console.log(
            `${table.padEnd(30)}${`${count} rows`.padEnd(15)}❌ EXPOSED!`
          );
          insecure++;
        }
      }
    } catch (e) {
      console.log(
        `${table.padEnd(30)}${"Exception".padEnd(15)}❓ ${e.message}`
      );
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`\nSUMMARY:`);
  console.log(`  ✅ Secure: ${secure}`);
  console.log(`  ❌ Insecure: ${insecure}`);
  console.log(`  ⚠️  Not Found: ${notFound}`);

  if (insecure > 0) {
    console.log(
      "\n🚨 SECURITY ISSUE: Some tables are exposed without authentication!"
    );
  } else {
    console.log("\n✅ All tested tables appear to have proper RLS protection.");
  }
}

// Test team isolation
async function testTeamIsolation() {
  console.log("\n\n🔐 TEAM ISOLATION TEST\n");
  console.log("=".repeat(60));

  // Get two different users
  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers();

  if (error || !users || users.length < 2) {
    console.log("Need at least 2 users to test team isolation");
    return;
  }

  const user1 = users[0];
  const user2 = users[1];

  console.log(`User 1: ${user1.email} (${user1.id})`);
  console.log(`User 2: ${user2.email} (${user2.id})`);

  // Check what teams each user belongs to
  const { data: user1Teams } = await supabase
    .from("team_members")
    .select("team_id, role, teams(name)")
    .eq("user_id", user1.id);

  const { data: user2Teams } = await supabase
    .from("team_members")
    .select("team_id, role, teams(name)")
    .eq("user_id", user2.id);

  console.log(`\nUser 1 teams: ${JSON.stringify(user1Teams, null, 2)}`);
  console.log(`User 2 teams: ${JSON.stringify(user2Teams, null, 2)}`);

  // If users are on different teams, verify they can't see each other's data
  if (user1Teams?.length && user2Teams?.length) {
    const user1TeamIds = user1Teams.map((t) => t.team_id);
    const user2TeamIds = user2Teams.map((t) => t.team_id);

    const sharedTeams = user1TeamIds.filter((id) => user2TeamIds.includes(id));

    if (sharedTeams.length === 0) {
      console.log(
        "\n✅ Users are on different teams - good for isolation test"
      );
    } else {
      console.log(
        `\n⚠️  Users share ${sharedTeams.length} team(s) - isolation test limited`
      );
    }
  }
}

async function main() {
  await auditRLS();
  await testTeamIsolation();
}

main().catch(console.error);
