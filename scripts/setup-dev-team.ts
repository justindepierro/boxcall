#!/usr/bin/env tsx
/**
 * Development Setup Script - Create Team and Assign User
 *
 * This script creates a development team and assigns the current user to it
 * so they can test team-based features.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env.local") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration");
  console.log(
    "Required env vars: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDevelopmentTeam() {
  console.log("🏗️  Setting up development team...");

  try {
    // The user ID from the logs
    const userId = "fafcaafd-0154-4f87-9752-95fbfa2372a0";

    // 1. Check if user profile exists, create if needed
    console.log("👤 Checking user profile...");
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      console.log("ℹ️  Profile check result:", profileCheckError.message);
    }

    if (!existingProfile) {
      console.log("📝 Creating user profile...");
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          full_name: "Development User",
          role: "coach",
          display_name: "Dev Coach",
          email: "dev@boxcall.com",
          is_active: true,
        },
      ]);

      if (profileError) {
        console.log("⚠️  Profile creation result:", profileError.message);
      } else {
        console.log("✅ User profile created");
      }
    } else {
      console.log(
        "✅ User profile exists:",
        existingProfile.full_name || "Unnamed User"
      );
    }

    // 2. Check if a development team exists
    console.log("🏈 Checking for development team...");
    const { data: existingTeam, error: teamCheckError } = await supabase
      .from("teams")
      .select("*")
      .eq("name", "Development Team")
      .single();

    if (teamCheckError && teamCheckError.code !== "PGRST116") {
      console.log("ℹ️  Team check result:", teamCheckError.message);
    }

    let teamId;
    if (!existingTeam) {
      console.log("🏗️  Creating development team...");
      const { data: newTeam, error: teamError } = await supabase
        .from("teams")
        .insert([
          {
            name: "Development Team",
            school_name: "Development High School",
            mascot: "Developers",
            season_year: 2025,
          },
        ])
        .select()
        .single();

      if (teamError) {
        console.log("⚠️  Team creation result:", teamError.message);
        return;
      }

      teamId = newTeam.id;
      console.log("✅ Development team created:", teamId);
    } else {
      teamId = existingTeam.id;
      console.log("✅ Development team exists:", teamId);
    }

    // 3. Check if user is already a team member
    console.log("👥 Checking team membership...");
    const { data: existingMembership, error: membershipCheckError } =
      await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .single();

    if (membershipCheckError && membershipCheckError.code !== "PGRST116") {
      console.log("ℹ️  Membership check result:", membershipCheckError.message);
    }

    if (!existingMembership) {
      console.log("🎯 Adding user to development team...");
      const { error: membershipError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: teamId,
            user_id: userId,
            team_role: "head_coach",
            status: "active",
            assigned_at: new Date().toISOString(),
            capabilities: {
              can_manage_team: true,
              can_manage_games: true,
              can_manage_social: true,
              can_manage_players: true,
              can_view_analytics: true,
              can_manage_playbook: true,
              can_manage_practice: true,
              can_manage_equipment: true,
            },
          },
        ]);

      if (membershipError) {
        console.log("⚠️  Membership creation result:", membershipError.message);
      } else {
        console.log("✅ User added to development team as head coach");
      }
    } else {
      console.log("✅ User is already a member of the development team");
    }

    // 4. Add some sample players to the team
    console.log("👨‍🎓 Checking for sample players...");
    const { data: existingPlayers, error: playersCheckError } = await supabase
      .from("player_roster")
      .select("*")
      .eq("team_id", teamId);

    if (playersCheckError) {
      console.log("ℹ️  Players check result:", playersCheckError.message);
    }

    if (!existingPlayers || existingPlayers.length === 0) {
      console.log("👥 Adding sample players...");
      const samplePlayers = [
        {
          user_id: "player1_dev",
          team_id: teamId,
          first_name: "John",
          last_name: "Quarterback",
          primary_position: "QB",
          jersey_number: 7,
          height_inches: 74,
          weight_pounds: 195,
          class_year: "senior",
          roster_status: "active",
        },
        {
          user_id: "player2_dev",
          team_id: teamId,
          first_name: "Mike",
          last_name: "Runningback",
          primary_position: "RB",
          jersey_number: 23,
          height_inches: 70,
          weight_pounds: 180,
          class_year: "junior",
          roster_status: "active",
        },
        {
          user_id: "player3_dev",
          team_id: teamId,
          first_name: "Chris",
          last_name: "Receiver",
          primary_position: "WR",
          jersey_number: 11,
          height_inches: 72,
          weight_pounds: 175,
          class_year: "sophomore",
          roster_status: "active",
        },
      ];

      const { error: playersError } = await supabase
        .from("player_roster")
        .insert(samplePlayers);

      if (playersError) {
        console.log(
          "⚠️  Sample players creation result:",
          playersError.message
        );
      } else {
        console.log("✅ Sample players added to team");
      }
    } else {
      console.log(`✅ Team already has ${existingPlayers.length} players`);
    }

    console.log("\n🎉 Development setup complete!");
    console.log(`👤 User: ${userId}`);
    console.log(`🏈 Team: ${teamId}`);
    console.log("🔄 Please refresh your browser to see the changes");
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

// Run the setup
setupDevelopmentTeam()
  .then(() => {
    console.log("🏁 Setup script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Setup script error:", error);
    process.exit(1);
  });
