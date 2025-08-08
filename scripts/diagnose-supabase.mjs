#!/usr/bin/env node

/**
 * Supabase Database Diagnostic Tool - Simple Version
 * Connects to your Supabase database and lists all tables and their row counts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

console.log("🔍 BoxCall Database Diagnostic Tool");
console.log("=====================================\n");

// Read .env file manually
let envContent = "";
try {
  envContent = readFileSync(".env", "utf8");
} catch (error) {
  console.log("❌ Could not read .env file");
  console.log("Make sure you have a .env file in your project root");
  process.exit(1);
}

// Parse environment variables
const envVars = {};
envContent.split("\n").forEach((line) => {
  if (line.includes("=") && !line.startsWith("#")) {
    const [key, ...valueParts] = line.split("=");
    envVars[key.trim()] = valueParts.join("=").trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log("🔍 BoxCall Database Diagnostic Tool");
console.log("=====================================\n");

console.log("Environment Check:");
console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? "✅ Set" : "❌ Missing"}`);
console.log(
  `VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✅ Set" : "❌ Missing"}`
);
console.log("");

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("❌ Missing Supabase credentials in .env file");
  console.log("");
  console.log("To fix this:");
  console.log("1. Go to your Supabase dashboard → Settings → API");
  console.log("2. Copy your Project URL and anon key");
  console.log("3. Update your .env file with real credentials");
  console.log("");
  process.exit(1);
}

// Check if we have placeholder values
if (
  supabaseUrl.includes("your-project") ||
  supabaseAnonKey.includes("your-anon")
) {
  console.log("⚠️  Found placeholder values in .env file");
  console.log("");
  console.log("Current values:");
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key: ${supabaseAnonKey.substring(0, 20)}...`);
  console.log("");
  console.log(
    "🎯 ACTION NEEDED: Please update .env with your real Supabase credentials!"
  );
  console.log("");
  console.log("📋 Steps to get your credentials:");
  console.log("1. Go to https://supabase.com/dashboard");
  console.log("2. Select your BoxCall project");
  console.log("3. Go to Settings → API");
  console.log("4. Copy the Project URL and anon/public key");
  console.log("5. Update your .env file");
  console.log("");
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseDatabaseConnection() {
  try {
    console.log("🔗 Testing Supabase connection...");

    // Test basic connection with a simple query
    const { data, error } = await supabase.auth.getUser();

    if (error && !error.message.includes("session")) {
      console.log(`❌ Connection failed: ${error.message}`);
      return;
    }

    console.log("✅ Connected to Supabase successfully!\n");

    // Try to get database schema information
    console.log("📊 Analyzing your database tables...\n");

    // List of tables we expect to find (based on your existing schema)
    const expectedTables = [
      "achievements",
      "games",
      "plays",
      "playbooks",
      "teams",
      "team_members",
      "profiles",
      "helmet_stickers",
      "coach_cards",
      "play_calls",
      // Phase 2 tables we created
      "practice_schedules",
      "practice_blocks",
      "practice_activities",
      "player_performance",
      "game_plans",
      "coaching_staff",
    ];

    const tableResults = [];

    for (const table of expectedTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });

        if (error) {
          tableResults.push({
            table,
            status: "missing",
            count: 0,
            error: error.message,
          });
        } else {
          tableResults.push({ table, status: "found", count: count || 0 });
        }
      } catch (err) {
        tableResults.push({
          table,
          status: "error",
          count: 0,
          error: err.message,
        });
      }
    }

    // Display results
    console.log("TABLE ANALYSIS RESULTS:");
    console.log("======================\n");

    const foundTables = tableResults.filter((r) => r.status === "found");
    const missingTables = tableResults.filter((r) => r.status === "missing");
    const errorTables = tableResults.filter((r) => r.status === "error");

    if (foundTables.length > 0) {
      console.log("✅ EXISTING TABLES:");
      foundTables.forEach(({ table, count }) => {
        console.log(`   ${table.padEnd(25)} | ${count} rows`);
      });
      console.log("");
    }

    if (missingTables.length > 0) {
      console.log("⚠️  MISSING TABLES (Phase 2):");
      missingTables.forEach(({ table }) => {
        console.log(`   ${table}`);
      });
      console.log("");
    }

    if (errorTables.length > 0) {
      console.log("❌ TABLES WITH ERRORS:");
      errorTables.forEach(({ table, error }) => {
        console.log(`   ${table}: ${error}`);
      });
      console.log("");
    }

    // Summary
    console.log("📊 SUMMARY:");
    console.log(`   Found Tables: ${foundTables.length}`);
    console.log(`   Missing Tables: ${missingTables.length}`);
    console.log(
      `   Total Rows: ${foundTables.reduce((sum, t) => sum + t.count, 0)}`
    );
    console.log("");

    if (foundTables.length >= 10) {
      console.log("🎉 Great! You have a substantial database already set up.");
      console.log("   Ready to add Phase 2 tables and connect your app!");
    } else if (foundTables.length > 0) {
      console.log("👍 You have some tables set up.");
      console.log("   We can build on this foundation!");
    } else {
      console.log("🤔 No tables found. This might be a new project.");
      console.log("   Ready to set up your complete database!");
    }
  } catch (error) {
    console.log(`❌ Database analysis failed: ${error.message}`);
    console.log("");
    console.log("This might mean:");
    console.log("1. Your credentials are incorrect");
    console.log("2. Your Supabase project is not accessible");
    console.log("3. There are network connectivity issues");
  }
}

// Run the diagnostic
diagnoseDatabaseConnection();
