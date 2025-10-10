#!/usr/bin/env tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env file
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !anonKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function initializeAchievements() {
  try {
    console.log("🔍 Checking current achievement definitions...");

    const { data: existing, error: checkError } = await supabase
      .from("achievement_definitions")
      .select("id")
      .limit(1);

    if (checkError) {
      console.error("❌ Error checking existing achievements:", checkError);
      return;
    }

    if (existing && existing.length > 0) {
      console.log("✅ Achievement definitions already exist");
      return;
    }

    console.log("🔄 Initializing achievement definitions...");

    const defaultAchievements = [
      // Gameplay achievements
      {
        name: "First Play",
        description: "Create your first play in BoxCall",
        icon: "football",
        category: "gameplay" as const,
        trigger_type: "action_count" as const,
        trigger_target: "play_created" as const,
        trigger_count: 1,
        points: 10,
        rarity: "common" as const,
      },
      {
        name: "Playbook Builder",
        description: "Create 10 plays for your team",
        icon: "book",
        category: "gameplay" as const,
        trigger_type: "action_count" as const,
        trigger_target: "play_created" as const,
        trigger_count: 10,
        points: 25,
        rarity: "uncommon" as const,
      },
      {
        name: "Master Strategist",
        description: "Create 50 plays for your team",
        icon: "crown",
        category: "gameplay" as const,
        trigger_type: "action_count" as const,
        trigger_target: "play_created" as const,
        trigger_count: 50,
        points: 100,
        rarity: "rare" as const,
      },

      // Social achievements
      {
        name: "Team Communicator",
        description: "Send your first team post",
        icon: "message-circle",
        category: "social" as const,
        trigger_type: "action_count" as const,
        trigger_target: "post_sent" as const,
        trigger_count: 1,
        points: 10,
        rarity: "common" as const,
      },
      {
        name: "Social Butterfly",
        description: "Send 25 team posts",
        icon: "users",
        category: "social" as const,
        trigger_type: "action_count" as const,
        trigger_target: "post_sent" as const,
        trigger_count: 25,
        points: 50,
        rarity: "uncommon" as const,
      },
      {
        name: "Team Captain",
        description: "Send 100 team posts",
        icon: "star",
        category: "social" as const,
        trigger_type: "action_count" as const,
        trigger_target: "post_sent" as const,
        trigger_count: 100,
        points: 150,
        rarity: "epic" as const,
      },

      // Teamwork achievements
      {
        name: "Roster Ready",
        description: "Add your first player to the roster",
        icon: "user-plus",
        category: "teamwork" as const,
        trigger_type: "action_count" as const,
        trigger_target: "player_added" as const,
        trigger_count: 1,
        points: 15,
        rarity: "common" as const,
      },
      {
        name: "Team Builder",
        description: "Add 10 players to your roster",
        icon: "users",
        category: "teamwork" as const,
        trigger_type: "action_count" as const,
        trigger_target: "player_added" as const,
        trigger_count: 10,
        points: 40,
        rarity: "uncommon" as const,
      },
      {
        name: "Squad Leader",
        description: "Add 25 players to your roster",
        icon: "shield",
        category: "teamwork" as const,
        trigger_type: "action_count" as const,
        trigger_target: "player_added" as const,
        trigger_count: 25,
        points: 75,
        rarity: "rare" as const,
      },

      // Leadership achievements
      {
        name: "First Victory",
        description: "Win your first game",
        icon: "trophy",
        category: "leadership" as const,
        trigger_type: "action_count" as const,
        trigger_target: "game_won" as const,
        trigger_count: 1,
        points: 50,
        rarity: "uncommon" as const,
      },
      {
        name: "Undefeated",
        description: "Win 5 games in a row",
        icon: "zap",
        category: "leadership" as const,
        trigger_type: "streak" as const,
        trigger_target: "game_won_streak" as const,
        trigger_count: 5,
        points: 200,
        rarity: "epic" as const,
      },
      {
        name: "Champion",
        description: "Win 10 games",
        icon: "crown",
        category: "leadership" as const,
        trigger_type: "action_count" as const,
        trigger_target: "game_won" as const,
        trigger_count: 10,
        points: 300,
        rarity: "legendary" as const,
      },

      // Milestone achievements
      {
        name: "Century Club",
        description: "Reach 100 total achievement points",
        icon: "target",
        category: "milestone" as const,
        trigger_type: "special" as const,
        trigger_target: "points_milestone" as const,
        trigger_count: 100,
        points: 100,
        rarity: "rare" as const,
      },
      {
        name: "Achievement Hunter",
        description: "Earn 25 different achievements",
        icon: "award",
        category: "milestone" as const,
        trigger_type: "special" as const,
        trigger_target: "achievements_earned" as const,
        trigger_count: 25,
        points: 250,
        rarity: "epic" as const,
      },
      {
        name: "BoxCall Legend",
        description: "Earn 50 different achievements",
        icon: "gem",
        category: "milestone" as const,
        trigger_type: "special" as const,
        trigger_target: "achievements_earned" as const,
        trigger_count: 50,
        points: 500,
        rarity: "legendary" as const,
      },
    ];

    const { data, error } = await supabase
      .from("achievement_definitions")
      .insert(defaultAchievements)
      .select();

    if (error) {
      console.error("❌ Error initializing achievements:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
    } else {
      console.log(
        `✅ Successfully initialized ${data?.length || 0} achievement definitions`
      );
      data?.slice(0, 3).forEach((a) => console.log(`   - ${a.name}`));
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

initializeAchievements();
