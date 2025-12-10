#!/usr/bin/env node
/**
 * Extended RLS Audit - Check all tables used in services
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lvmuiqwihlpnwppdqqfl.supabase.co";
const anonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjIzNDgsImV4cCI6MjA2NzU5ODM0OH0.3SreGdPAJ2J5XcQVbNIbzK378j15ZJnwQqscBE2HkII";

const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// All tables found in services
const tables = [
  // Core tables (from schema.sql)
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

  // Additional tables found in services
  "achievement_definitions",
  "achievement_progress",
  "activities",
  "activity_feed",
  "comment_reactions",
  "comments",
  "follows",
  "formations",
  "game_plan_analytics",
  "game_sessions",
  "invitation_attempts",
  "live_sessions",
  "mentions",
  "notifications",
  "personnel_configurations",
  "personnel_players",
  "play_executions",
  "practice_script_plays",
  "practice_sessions",
  "reactions",
  "support_tickets",

  // Social tables from copilot-instructions
  "team_announcements",
  "announcement_reactions",
  "announcement_comments",
];

async function auditAllTables() {
  console.log("\n🔒 EXTENDED RLS AUDIT - All Service Tables\n");
  console.log("=".repeat(70));
  console.log("\nTable".padEnd(35) + "Anon Access".padEnd(15) + "Status");
  console.log("-".repeat(70));

  let secure = 0;
  let insecure = 0;
  let notFound = 0;
  const issues = [];

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
          console.log(`${table.padEnd(35)}${"Blocked".padEnd(15)}✅ Secure`);
          secure++;
        } else if (
          error.code === "42P01" ||
          error.message.includes("does not exist")
        ) {
          console.log(
            `${table.padEnd(35)}${"Not Found".padEnd(15)}⚠️  Missing`
          );
          notFound++;
        } else {
          console.log(
            `${table.padEnd(35)}${"Error".padEnd(15)}❓ ${error.code}: ${error.message.slice(0, 30)}`
          );
        }
      } else {
        if (count === 0 || count === null) {
          console.log(
            `${table.padEnd(35)}${"Empty/RLS".padEnd(15)}✅ Likely Secure`
          );
          secure++;
        } else {
          console.log(
            `${table.padEnd(35)}${`${count} rows`.padEnd(15)}❌ EXPOSED!`
          );
          insecure++;
          issues.push(table);
        }
      }
    } catch (e) {
      console.log(
        `${table.padEnd(35)}${"Exception".padEnd(15)}❓ ${e.message?.slice(0, 30)}`
      );
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`\nSUMMARY:`);
  console.log(`  ✅ Secure: ${secure}`);
  console.log(`  ❌ Insecure: ${insecure}`);
  console.log(`  ⚠️  Not Found: ${notFound} (may need migrations)`);

  if (insecure > 0) {
    console.log("\n🚨 SECURITY ISSUE: Tables exposed without auth:");
    issues.forEach((t) => console.log(`   - ${t}`));
  }

  if (notFound > 0) {
    console.log("\n📋 Tables referenced in code but not in database:");
    console.log("   These may need migrations or are views/functions.");
  }
}

auditAllTables().catch(console.error);
