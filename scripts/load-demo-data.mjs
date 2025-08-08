#!/usr/bin/env node

/**
 * Demo Data Loader for BoxCall
 *
 * Loads sample data into your Supabase database for testing and demonstration
 * Run after authentication is working to populate the database with realistic data
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
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join("=").trim();
      }
    });

    return envVars;
  } catch (error) {
    console.error("Error loading .env file:", error.message);
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

// Sample data
const SAMPLE_TEAMS = [
  {
    name: "West Valley Warriors",
    school_name: "West Valley High School",
    mascot: "Warriors",
    season_year: 2025,
  },
  {
    name: "Metro Ravens",
    school_name: "Metro High School",
    mascot: "Ravens",
    season_year: 2025,
  },
  {
    name: "Eastside Eagles",
    school_name: "Eastside Regional High",
    mascot: "Eagles",
    season_year: 2025,
  },
];

const SAMPLE_PLAYS = [
  {
    formation: "I-Formation",
    play_name: "Power I Formation - Dive",
    p_type: "Run",
    notes: "Classic power running play with fullback lead blocking",
  },
  {
    formation: "Shotgun",
    play_name: "Shotgun - Quick Slants",
    p_type: "Pass",
    notes: "Quick passing attack to beat the blitz",
  },
  {
    formation: "Spread",
    play_name: "Spread - Four Verticals",
    p_type: "Pass",
    notes: "Deep passing concept to stretch the defense",
  },
  {
    formation: "Goal Line",
    play_name: "Goal Line - Power O",
    p_type: "Run",
    notes: "Goal line rushing attack with pulling guard",
  },
  {
    formation: "Wildcat",
    play_name: "Wildcat - Direct Snap",
    p_type: "Run",
    notes: "Direct snap to running back with multiple options",
  },
];

const SAMPLE_PLAYBOOKS = [
  {
    name: "Red Zone Offense",
    description: "High-percentage plays for scoring in the red zone",
  },
  {
    name: "Two-Minute Drill",
    description: "Fast-paced offense for end-of-half situations",
  },
  {
    name: "Short Yardage Package",
    description: "Power running plays for 3rd and short situations",
  },
  {
    name: "Nickel Defense",
    description: "Defensive package for passing situations",
  },
];

async function loadDemoData() {
  console.log("🚀 Loading demo data into BoxCall database...\n");

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

    // Get a system user to act as creator
    console.log("🔍 Finding or creating system user for demo data...");

    // Try to find existing admin user or create a system marker
    let systemUserId = "system"; // Default fallback

    const { data: adminUser, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (adminUser && adminUser.id) {
      systemUserId = adminUser.id;
      console.log("✅ Using admin user as creator:", systemUserId);
    } else {
      console.log("ℹ️ No admin user found, using system placeholder");
    }

    // Load Teams with proper creator field
    console.log("\n📊 Loading sample teams...");
    const teamsWithCreator = SAMPLE_TEAMS.map((team) => ({
      ...team,
      created_by: systemUserId,
    }));

    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .insert(teamsWithCreator)
      .select();

    if (teamsError) {
      console.error("❌ Error loading teams:", teamsError.message);
      console.log("Debug info:", teamsError);
      return;
    }

    console.log(`✅ Loaded ${teams.length} teams`);
    teams.forEach((team) => {
      console.log(`   • ${team.name} (${team.season_year})`);
    });

    // Load Playbooks first (plays need playbook_id)
    console.log("\n📚 Loading sample playbooks...");
    const playbooksWithTeam = SAMPLE_PLAYBOOKS.map((playbook) => ({
      ...playbook,
      team_id: teams[0].id, // Assign to first team for demo
      created_by: systemUserId, // Add creator field
    }));

    const { data: playbooks, error: playbooksError } = await supabase
      .from("playbooks")
      .insert(playbooksWithTeam)
      .select();

    if (playbooksError) {
      console.error("❌ Error loading playbooks:", playbooksError.message);
      return;
    }

    console.log(`✅ Loaded ${playbooks.length} playbooks`);
    playbooks.forEach((playbook) => {
      console.log(`   • ${playbook.name}`);
    });

    // Load Plays (assign to first playbook)
    console.log("\n🏈 Loading sample plays...");
    const playsWithPlaybook = SAMPLE_PLAYS.map((play) => ({
      ...play,
      playbook_id: playbooks[0].id, // Assign to first playbook for demo
      created_by: systemUserId, // Add creator field
    }));

    const { data: plays, error: playsError } = await supabase
      .from("plays")
      .insert(playsWithPlaybook)
      .select();

    if (playsError) {
      console.error("❌ Error loading plays:", playsError.message);
      return;
    }

    console.log(`✅ Loaded ${plays.length} plays`);
    plays.forEach((play) => {
      console.log(`   • ${play.play_name} (${play.formation})`);
    });

    // Summary
    console.log("\n🎉 Demo data loading complete!");
    console.log("\n📊 Summary:");
    console.log(`   • ${teams.length} Teams created`);
    console.log(`   • ${plays.length} Plays created`);
    console.log(`   • ${playbooks.length} Playbooks created`);

    console.log("\n🔗 Next Steps:");
    console.log("   1. Visit http://localhost:5173/login");
    console.log("   2. Create a new account or sign in");
    console.log("   3. Navigate to the dashboard to see the loaded data");
    console.log(
      '   4. Join the "West Valley Warriors" team to access the demo data'
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Run the demo data loader
loadDemoData()
  .then(() => {
    console.log("\n✨ Demo data loading script completed!");
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
  });
