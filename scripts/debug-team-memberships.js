#!/usr/bin/env node

/**
 * Debug script to check team membership issues
 * This script will help us understand why teams aren't showing up
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Read environment variables from .env file
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const envLines = envContent.split("\n");

  envLines.forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim();
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, "");
      process.env[key.trim()] = cleanValue;
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("VITE_SUPABASE_URL:", !!supabaseUrl);
  console.error("VITE_SUPABASE_ANON_KEY:", !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTeamMemberships() {
  console.log("🔍 Debugging team membership issues...\n");

  try {
    // 1. Check teams table
    console.log("1️⃣ Checking teams table...");
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select(
        "id, name, school_name, mascot, season_year, created_at, created_by"
      )
      .order("created_at", { ascending: false });

    if (teamsError) {
      console.error("❌ Error fetching teams:", teamsError);
      return;
    }

    console.log(`Found ${teams?.length || 0} teams:`);
    teams?.forEach((team, index) => {
      console.log(`  ${index + 1}. ${team.name}`);
      console.log(`     ID: ${team.id}`);
      console.log(`     School: ${team.school_name}`);
      console.log(`     Created by: ${team.created_by || "Unknown"}`);
      console.log(`     Created at: ${team.created_at}`);
      console.log("");
    });

    // 2. Check team_members table
    console.log("2️⃣ Checking team_members table...");
    const { data: memberships, error: membershipsError } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (membershipsError) {
      console.error("❌ Error fetching team memberships:", membershipsError);
      return;
    }

    console.log(`Found ${memberships?.length || 0} team memberships:`);
    memberships?.forEach((membership, index) => {
      console.log(`  ${index + 1}. User: ${membership.user_id}`);
      console.log(`     Team: ${membership.team_id}`);
      console.log(`     Role: ${membership.team_role}`);
      console.log(`     Status: ${membership.status}`);
      console.log(`     Created: ${membership.created_at}`);
      console.log("");
    });

    // 3. Check for orphaned teams (teams without memberships)
    console.log("3️⃣ Checking for orphaned teams...");
    const teamIds = teams?.map((t) => t.id) || [];
    const membershipTeamIds = memberships?.map((m) => m.team_id) || [];

    const orphanedTeams =
      teams?.filter((team) => !membershipTeamIds.includes(team.id)) || [];

    if (orphanedTeams.length > 0) {
      console.log("⚠️ Found orphaned teams (teams without memberships):");
      orphanedTeams.forEach((team) => {
        console.log(`  - ${team.name} (ID: ${team.id})`);
        console.log(`    Created by: ${team.created_by}`);
        console.log(`    This team has no members!`);
      });
      console.log("");
    } else {
      console.log("✅ No orphaned teams found");
    }

    // 4. Check for duplicate teams
    console.log("4️⃣ Checking for duplicate teams...");
    const duplicateGroups = [];
    const processed = new Set();

    teams?.forEach((team1, i) => {
      if (processed.has(team1.id)) return;

      const similar = [team1];
      processed.add(team1.id);

      teams?.forEach((team2, j) => {
        if (i !== j && !processed.has(team2.id)) {
          // Check if teams are very similar
          const schoolMatch = team1.school_name === team2.school_name;
          const nameMatch = team1.name === team2.name;
          const mascotMatch = team1.mascot === team2.mascot;

          if (schoolMatch && (nameMatch || mascotMatch)) {
            similar.push(team2);
            processed.add(team2.id);
          }
        }
      });

      if (similar.length > 1) {
        duplicateGroups.push(similar);
      }
    });

    if (duplicateGroups.length > 0) {
      console.log("🔄 Found duplicate team groups:");
      duplicateGroups.forEach((group, index) => {
        console.log(`  Group ${index + 1}:`);
        group.forEach((team) => {
          console.log(`    - ${team.name} (ID: ${team.id})`);
          console.log(`      Created: ${team.created_at}`);
          console.log(`      Created by: ${team.created_by}`);
        });
        console.log("");
      });
    } else {
      console.log("✅ No duplicate teams found");
    }

    // 5. Get current user's teams (if we can identify the user)
    console.log("5️⃣ Summary and recommendations:");

    if (orphanedTeams.length > 0) {
      console.log("🛠️ ACTION NEEDED: Orphaned teams detected");
      console.log(
        "   These teams exist but have no members, so they won't show in the dropdown."
      );
      console.log("   You need to either:");
      console.log("   a) Add team memberships for these teams");
      console.log("   b) Delete the orphaned teams");
      console.log("");

      // Show how to fix orphaned teams
      orphanedTeams.forEach((team) => {
        console.log(`   To add membership for "${team.name}":`);
        console.log(
          `   INSERT INTO team_members (team_id, user_id, team_role, status)`
        );
        console.log(
          `   VALUES ('${team.id}', 'YOUR_USER_ID', 'head_coach', 'active');`
        );
        console.log("");
      });
    }

    if (duplicateGroups.length > 0) {
      console.log("🛠️ ACTION NEEDED: Duplicate teams detected");
      console.log("   You should merge or delete duplicate teams.");
      console.log("   Keep the newer one and delete the older one.");
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Run the debug
debugTeamMemberships()
  .then(() => {
    console.log("✅ Debug completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
