#!/usr/bin/env node

/**
 * Clear Demo Data Script for BoxCall
 *
 * Removes all demo/sample data from your Supabase database
 * Run this to clean your database and remove mock data
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load environment variables manually from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile() {
  try {
    const envPath = resolve(__dirname, "../.env");
    const envContent = readFileSync(envPath, "utf8");
    const envVars = {};

    envContent.split("\n").forEach((line) => {
      const [key, value] = line.split("=");
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
      }
    });

    return envVars;
  } catch (error) {
    console.error("❌ Could not load .env file:", error.message);
    return {};
  }
}

const envVars = loadEnvFile();

// Initialize Supabase client
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables in .env");
  console.error("Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearDemoData() {
  console.log("🧹 Clearing demo data from BoxCall database...\n");

  try {
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("❌ Database connection failed:", testError.message);
      return;
    }

    console.log("✅ Database connection successful!\n");

    // Clear demo data in dependency order (foreign keys)
    console.log("🗑️  Clearing plays...");
    const { error: playsError } = await supabase
      .from("plays")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all except system

    if (playsError) {
      console.warn("⚠️  Could not clear plays:", playsError.message);
    } else {
      console.log("✅ Plays cleared");
    }

    console.log("🗑️  Clearing playbooks...");
    const { error: playbooksError } = await supabase
      .from("playbooks")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all except system

    if (playbooksError) {
      console.warn("⚠️  Could not clear playbooks:", playbooksError.message);
    } else {
      console.log("✅ Playbooks cleared");
    }

    console.log("🗑️  Clearing team members...");
    const { error: membersError } = await supabase
      .from("team_members")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all except system

    if (membersError) {
      console.warn("⚠️  Could not clear team members:", membersError.message);
    } else {
      console.log("✅ Team members cleared");
    }

    console.log("🗑️  Clearing teams...");
    const { error: teamsError } = await supabase
      .from("teams")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all except system

    if (teamsError) {
      console.warn("⚠️  Could not clear teams:", teamsError.message);
    } else {
      console.log("✅ Teams cleared");
    }

    console.log("🗑️  Clearing helmet stickers...");
    const { error: stickersError } = await supabase
      .from("helmet_stickers")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all except system

    if (stickersError) {
      console.warn(
        "⚠️  Could not clear helmet stickers:",
        stickersError.message
      );
    } else {
      console.log("✅ Helmet stickers cleared");
    }

    console.log("🗑️  Clearing achievements...");
    const { error: achievementsError } = await supabase
      .from("achievements")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all except system

    if (achievementsError) {
      console.warn(
        "⚠️  Could not clear achievements:",
        achievementsError.message
      );
    } else {
      console.log("✅ Achievements cleared");
    }

    // Summary
    console.log("\n🎉 Demo data clearing complete!");

    console.log("\n📊 Next Steps:");
    console.log("   1. Your database is now clean of demo data");
    console.log("   2. Switch to 'Blank Slate' mode in dev tools for clean UI");
    console.log("   3. Start creating your real teams and data");
    console.log("   4. Refresh your browser to see the changes");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Run the demo data cleaner
clearDemoData()
  .then(() => {
    console.log("\n✨ Demo data clearing script completed!");
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
  });
