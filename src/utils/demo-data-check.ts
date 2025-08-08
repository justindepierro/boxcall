/**
 * Demo Data Check Utility
 *
 * Simple functions to check what data exists in the database
 * for demo purposes (bypasses auth requirements)
 */

import { supabase } from "../lib/supabase";

export async function checkDatabaseData() {
  console.log("🔍 CHECKING DATABASE CONTENT FOR DEMO...");

  try {
    // Check teams table
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("*")
      .limit(5);

    if (teamsError) {
      console.log("❌ Teams error:", teamsError.message);
    } else {
      console.log(`✅ Teams found: ${teams?.length || 0}`, teams);
    }

    // Check playbooks table
    const { data: playbooks, error: playbooksError } = await supabase
      .from("playbooks")
      .select("*")
      .limit(5);

    if (playbooksError) {
      console.log("❌ Playbooks error:", playbooksError.message);
    } else {
      console.log(`✅ Playbooks found: ${playbooks?.length || 0}`, playbooks);
    }

    // Check plays table
    const { data: plays, error: playsError } = await supabase
      .from("plays")
      .select("*")
      .limit(5);

    if (playsError) {
      console.log("❌ Plays error:", playsError.message);
    } else {
      console.log(`✅ Plays found: ${plays?.length || 0}`, plays);
    }

    return {
      teams: teams || [],
      playbooks: playbooks || [],
      plays: plays || [],
    };
  } catch (error) {
    console.error("❌ Database check failed:", error);
    return { teams: [], playbooks: [], plays: [] };
  }
}
