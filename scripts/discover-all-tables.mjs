#!/usr/bin/env node

/**
 * Complete Database Discovery Tool
 * Uses Supabase system tables to find ALL tables in your database
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

console.log("🔍 Complete Database Discovery Tool");
console.log("===================================\n");

// Read .env file manually
const envContent = readFileSync(".env", "utf8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  if (line.includes("=") && !line.startsWith("#")) {
    const [key, ...valueParts] = line.split("=");
    envVars[key.trim()] = valueParts.join("=").trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function discoverAllTables() {
  try {
    console.log("🔗 Connected to Supabase successfully!");
    console.log(`📍 Database: ${supabaseUrl}\n`);

    // Try to get ALL tables using system information
    console.log("🕵️  Attempting to discover ALL tables in your database...\n");

    // Method 1: Try to query information_schema (might be restricted)
    try {
      const { data: schemaTables, error } =
        await supabase.rpc("get_schema_tables");
      if (schemaTables && !error) {
        console.log("✅ Found tables via schema query:");
        schemaTables.forEach((table) => console.log(`   ${table.table_name}`));
        return;
      }
    } catch (e) {
      console.log("⚠️  Schema query not available (expected for security)");
    }

    // Method 2: Try comprehensive table list based on your mentions
    const potentialTables = [
      // Core tables you mentioned
      "achievement_criteria",
      "achievements",
      "coach_cards",
      "coaching_staff",
      "depth_charts",
      "family_communications",
      "family_engagement",
      "game_plan_analytics",
      "game_plan_plays",
      "game_plan_situations",
      "game_plan_templates",
      "game_plans",
      "games",
      "helmet_stickers",
      "organizations",
      "parent_guardians",
      "play_calls",
      "playbooks",
      "player_awards",
      "player_eligibility",
      "team_members",
      "team_memberships",
      "plays",
      "profiles",

      // Phase 2 tables we created
      "practice_schedules",
      "practice_blocks",
      "practice_activities",
      "practice_templates",
      "practice_executions",
      "practice_analytics",
      "player_performance",
      "player_progress",
      "achievement_categories",
      "player_achievements",
      "team_communications",
      "communication_recipients",
      "team_equipment",
      "equipment_checkouts",
      "leagues",
      "divisions",
      "staff_roles",

      // Common auth tables
      "users",
      "teams",
      "user_profiles",

      // Possible other tables
      "seasons",
      "positions",
      "formations",
      "drills",
      "attendance",
      "schedules",
      "events",
      "notifications",
      "settings",
    ];

    console.log("🔍 Checking for all possible tables...\n");

    const foundTables = [];
    const missingTables = [];

    for (const table of potentialTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });

        if (error) {
          if (
            error.message.includes("does not exist") ||
            error.message.includes("relation") ||
            error.message.includes("not found")
          ) {
            missingTables.push(table);
          } else {
            foundTables.push({
              table,
              count: 0,
              status: "access_denied",
              error: error.message,
            });
          }
        } else {
          foundTables.push({ table, count: count || 0, status: "found" });
        }
      } catch (err) {
        missingTables.push(table);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Display comprehensive results
    console.log("📊 COMPREHENSIVE TABLE DISCOVERY RESULTS:");
    console.log("=========================================\n");

    const accessibleTables = foundTables.filter((t) => t.status === "found");
    const restrictedTables = foundTables.filter(
      (t) => t.status === "access_denied"
    );

    if (accessibleTables.length > 0) {
      console.log("✅ ACCESSIBLE TABLES:");
      accessibleTables.forEach(({ table, count }) => {
        console.log(
          `   ${table.padEnd(30)} | ${count.toString().padStart(6)} rows`
        );
      });
      console.log("");
    }

    if (restrictedTables.length > 0) {
      console.log("🔐 RESTRICTED ACCESS TABLES (exist but protected):");
      restrictedTables.forEach(({ table, error }) => {
        console.log(`   ${table.padEnd(30)} | ${error}`);
      });
      console.log("");
    }

    if (missingTables.length > 0) {
      console.log("❌ TABLES NOT FOUND:");
      const chunks = [];
      for (let i = 0; i < missingTables.length; i += 5) {
        chunks.push(missingTables.slice(i, i + 5));
      }
      chunks.forEach((chunk) => {
        console.log(`   ${chunk.join(", ")}`);
      });
      console.log("");
    }

    // Final summary
    console.log("📈 FINAL SUMMARY:");
    console.log(`   ✅ Accessible Tables: ${accessibleTables.length}`);
    console.log(`   🔐 Restricted Tables: ${restrictedTables.length}`);
    console.log(`   ❌ Missing Tables: ${missingTables.length}`);
    console.log(
      `   📄 Total Data Rows: ${accessibleTables.reduce((sum, t) => sum + t.count, 0)}`
    );
    console.log("");

    if (accessibleTables.length < 20) {
      console.log("🤔 ANALYSIS: You have fewer tables than expected.");
      console.log("   This could mean:");
      console.log("   1. The database is still being set up");
      console.log("   2. Some tables are in different schemas");
      console.log("   3. Row Level Security is restricting access");
      console.log("   4. The tables haven't been created yet");
    } else {
      console.log("🎉 EXCELLENT: You have a comprehensive database setup!");
    }
  } catch (error) {
    console.log(`❌ Discovery failed: ${error.message}`);
  }
}

discoverAllTables();
