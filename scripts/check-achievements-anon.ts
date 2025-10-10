#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function checkAchievements() {
  try {
    console.log("🔍 Checking achievement tables with anon key...");

    const { data, error } = await supabase
      .from("achievement_definitions")
      .select("name, description, category, rarity")
      .limit(5);

    if (error) {
      console.log(
        "❌ achievement_definitions table not found or not accessible:",
        error.message
      );
    } else {
      console.log(
        `✅ achievement_definitions table exists with ${data.length} achievements:`
      );
      data.forEach((ach) =>
        console.log(
          `   - ${ach.name} (${ach.category}, ${ach.rarity}): ${ach.description}`
        )
      );
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

checkAchievements();
