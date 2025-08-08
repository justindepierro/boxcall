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
    division: "varsity",
    season: "2025",
    location: "West Valley High School",
    description:
      "Defending division champions focused on teamwork and excellence.",
  },
  {
    name: "Metro Ravens",
    division: "jv",
    season: "2025",
    location: "Metro High School",
    description: "Young talented team building for the future.",
  },
  {
    name: "Eastside Eagles",
    division: "varsity",
    season: "2025",
    location: "Eastside Regional High",
    description: "Traditional powerhouse with strong fundamentals.",
  },
];

const SAMPLE_PLAYS = [
  {
    name: "Power I Formation - Dive",
    description: "Classic power running play with fullback lead blocking",
    formation: "I-Formation",
    play_type: "run",
    down_distance: "1st and 10",
    field_position: "between_20s",
    tags: ["power", "running", "short-yardage"],
    success_rate: 75.5,
  },
  {
    name: "Shotgun - Quick Slants",
    description: "Quick passing attack to beat the blitz",
    formation: "Shotgun",
    play_type: "pass",
    down_distance: "3rd and short",
    field_position: "between_20s",
    tags: ["quick-pass", "slant", "anti-blitz"],
    success_rate: 82.3,
  },
  {
    name: "Spread - Four Verticals",
    description: "Deep passing concept to stretch the defense",
    formation: "Spread",
    play_type: "pass",
    down_distance: "2nd and long",
    field_position: "own_territory",
    tags: ["deep-pass", "verticals", "big-play"],
    success_rate: 68.9,
  },
  {
    name: "Goal Line - Power O",
    description: "Goal line rushing attack with pulling guard",
    formation: "Goal Line",
    play_type: "run",
    down_distance: "goal_line",
    field_position: "red_zone",
    tags: ["goal-line", "power", "touchdown"],
    success_rate: 89.2,
  },
  {
    name: "Wildcat - Direct Snap",
    description: "Direct snap to running back with multiple options",
    formation: "Wildcat",
    play_type: "run",
    down_distance: "1st and 10",
    field_position: "between_20s",
    tags: ["wildcat", "option", "misdirection"],
    success_rate: 71.4,
  },
];

const SAMPLE_PLAYBOOKS = [
  {
    name: "Red Zone Offense",
    description: "High-percentage plays for scoring in the red zone",
    category: "offense",
    tags: ["red-zone", "scoring", "high-percentage"],
  },
  {
    name: "Two-Minute Drill",
    description: "Fast-paced offense for end-of-half situations",
    category: "offense",
    tags: ["hurry-up", "two-minute", "clock-management"],
  },
  {
    name: "Short Yardage Package",
    description: "Power running plays for 3rd and short situations",
    category: "offense",
    tags: ["short-yardage", "power", "3rd-down"],
  },
  {
    name: "Nickel Defense",
    description: "Defensive package for passing situations",
    category: "defense",
    tags: ["passing-downs", "nickel", "coverage"],
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

    // Load Teams
    console.log("📊 Loading sample teams...");
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .insert(SAMPLE_TEAMS)
      .select();

    if (teamsError) {
      console.error("❌ Error loading teams:", teamsError.message);
      return;
    }

    console.log(`✅ Loaded ${teams.length} teams`);
    teams.forEach((team) => {
      console.log(`   • ${team.name} (${team.division})`);
    });

    // Load Plays
    console.log("\n🏈 Loading sample plays...");
    const playsWithTeam = SAMPLE_PLAYS.map((play) => ({
      ...play,
      team_id: teams[0].id, // Assign to first team for demo
    }));

    const { data: plays, error: playsError } = await supabase
      .from("plays")
      .insert(playsWithTeam)
      .select();

    if (playsError) {
      console.error("❌ Error loading plays:", playsError.message);
      return;
    }

    console.log(`✅ Loaded ${plays.length} plays`);
    plays.forEach((play) => {
      console.log(`   • ${play.name} (${play.formation})`);
    });

    // Load Playbooks
    console.log("\n📚 Loading sample playbooks...");
    const playbooksWithTeam = SAMPLE_PLAYBOOKS.map((playbook) => ({
      ...playbook,
      team_id: teams[0].id, // Assign to first team for demo
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
      console.log(`   • ${playbook.name} (${playbook.category})`);
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
