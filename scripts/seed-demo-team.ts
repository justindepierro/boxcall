#!/usr/bin/env npx tsx

/**
 * Seed demo team data for development
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://lvmuiqwihlpnwppdqqfl.supabase.co";
const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bXVpcXdpaGxwbndwcGRxcWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjIzNDgsImV4cCI6MjA2NzU5ODM0OH0.3SreGdPAJ2J5XcQVbNIbzK378j15ZJnwQqscBE2HkII";

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDemoTeam() {
  console.log("🌱 Seeding demo team data...");

  try {
    // Insert demo team
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Demo Team",
        school_name: "BoxCall High",
        mascot: "Eagles",
        season_year: 2025,
      })
      .select()
      .single();

    if (teamError) {
      console.error("❌ Error inserting team:", teamError.message);
      return;
    }

    console.log("✅ Created team:", teamData.name);

    // Insert demo playbook
    const { data: playbookData, error: playbookError } = await supabase
      .from("playbooks")
      .insert({
        id: "550e8400-e29b-41d4-a716-446655440001",
        team_id: teamData.id,
        name: "Main Playbook",
        description: "Primary offensive playbook for demo",
      })
      .select()
      .single();

    if (playbookError) {
      console.error("❌ Error inserting playbook:", playbookError.message);
      return;
    }

    console.log("✅ Created playbook:", playbookData.name);

    // Insert some sample plays
    const samplePlays = [
      {
        playbook_id: playbookData.id,
        formation: "I-Formation",
        play_name: "Power O",
        one_word_play: "Thunder",
        p_type: "Run",
        personnel: "21",
        notes: "Strong side power run",
        created_by: "demo-coach",
      },
      {
        playbook_id: playbookData.id,
        formation: "Shotgun",
        play_name: "Four Verticals",
        one_word_play: "Smash",
        p_type: "Pass",
        personnel: "11",
        notes: "Vertical stretch concept",
        created_by: "demo-coach",
      },
      {
        playbook_id: playbookData.id,
        formation: "Singleback",
        play_name: "Inside Zone",
        one_word_play: "Zorro",
        p_type: "Run",
        personnel: "11",
        notes: "Gap scheme running play",
        created_by: "demo-coach",
      },
    ];

    const { data: playsData, error: playsError } = await supabase
      .from("plays")
      .insert(samplePlays)
      .select();

    if (playsError) {
      console.error("❌ Error inserting plays:", playsError.message);
      return;
    }

    console.log(`✅ Created ${playsData?.length || 0} sample plays`);
    console.log("");
    console.log("🎉 Demo data seeded successfully!");
    console.log(
      '📱 You can now navigate to /teams and click on the "Demo Team" card'
    );
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}

seedDemoTeam();
