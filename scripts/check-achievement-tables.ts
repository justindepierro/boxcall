#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function checkTables() {
  try {
    console.log("🔍 Checking achievement tables...");

    // Check achievement_definitions table
    const { data: _defData, error: defError } = await supabase
      .from("achievement_definitions")
      .select("count")
      .limit(1);

    if (defError) {
      console.log(
        "❌ achievement_definitions table not found:",
        defError.message
      );
      console.log("🚀 Attempting to create achievement tables...");

      // Try to execute the migration SQL directly
      const { error: createError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS achievement_definitions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            icon TEXT NOT NULL DEFAULT 'trophy',
            category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('gameplay', 'social', 'teamwork', 'leadership', 'milestone', 'special')),
            trigger_type TEXT NOT NULL CHECK (trigger_type IN ('action_count', 'streak', 'milestone', 'special')),
            trigger_target TEXT NOT NULL,
            trigger_count INTEGER,
            points INTEGER NOT NULL DEFAULT 10,
            rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `,
      });

      if (createError) {
        console.log(
          "❌ Failed to create achievement_definitions:",
          createError.message
        );
      } else {
        console.log("✅ Created achievement_definitions table");
      }
    } else {
      console.log("✅ achievement_definitions table exists");
    }

    // Check achievement_progress table
    const { data: _progData, error: progError } = await supabase
      .from("achievement_progress")
      .select("count")
      .limit(1);

    if (progError) {
      console.log(
        "❌ achievement_progress table not found:",
        progError.message
      );
    } else {
      console.log("✅ achievement_progress table exists");
    }

    // Check if default achievements were inserted
    const { data: achievements, error: achError } = await supabase
      .from("achievement_definitions")
      .select("title, description")
      .limit(5);

    if (achError) {
      console.log("❌ Could not query achievements:", achError.message);
    } else {
      console.log(`📊 Found ${achievements.length} achievements in database`);
      achievements.forEach((ach) =>
        console.log(`   - ${ach.title}: ${ach.description}`)
      );
    }
  } catch (error) {
    console.error("❌ Error checking tables:", error);
  }
}

checkTables();
