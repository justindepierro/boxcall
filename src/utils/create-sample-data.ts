/**
 * Sample Data Creator for Demo
 *
 * Creates sample teams, playbooks, and plays for demo purposes
 */

import { supabase } from "../lib/supabase";

export async function createSampleData() {
  console.log("🌱 CREATING SAMPLE DATA FOR DEMO...");

  try {
    // Create a sample team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: "Demo Eagles",
        school_name: "BoxCall High School",
        mascot: "Eagles",
        season_year: 2025,
      })
      .select()
      .single();

    if (teamError) {
      console.error("❌ Failed to create team:", teamError.message);
      return { success: false, error: teamError.message };
    }

    console.log("✅ Created demo team:", team);

    // Create a sample playbook
    const { data: playbook, error: playbookError } = await supabase
      .from("playbooks")
      .insert({
        team_id: team.id,
        name: "Offensive Playbook",
        description: "Main offensive plays for the season",
        is_active: true,
      })
      .select()
      .single();

    if (playbookError) {
      console.error("❌ Failed to create playbook:", playbookError.message);
      return { success: false, error: playbookError.message };
    }

    console.log("✅ Created demo playbook:", playbook);

    // Create sample plays
    const samplePlays = [
      {
        playbook_id: playbook.id,
        formation: "I-Formation",
        play_name: "Power Run Left",
        p_type: "run",
        notes: "Basic power running play to the left side",
      },
      {
        playbook_id: playbook.id,
        formation: "Shotgun",
        play_name: "Quick Slant",
        p_type: "pass",
        notes: "Quick 3-step slant route for easy completion",
      },
      {
        playbook_id: playbook.id,
        formation: "Goal Line",
        play_name: "QB Sneak",
        p_type: "run",
        notes: "Short yardage quarterback sneak",
      },
    ];

    const { data: plays, error: playsError } = await supabase
      .from("plays")
      .insert(samplePlays)
      .select();

    if (playsError) {
      console.error("❌ Failed to create plays:", playsError.message);
      return { success: false, error: playsError.message };
    }

    console.log(`✅ Created ${plays?.length} demo plays:`, plays);

    return {
      success: true,
      data: {
        team,
        playbook,
        plays: plays || [],
      },
    };
  } catch (error) {
    console.error("❌ Sample data creation failed:", error);
    return { success: false, error: String(error) };
  }
}
