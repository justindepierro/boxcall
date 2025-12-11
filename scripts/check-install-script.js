#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  // Check all plays (skip team_id since it doesn't exist on plays table)
  console.log("=== All Plays (first 10) ===");
  const { data: plays, error: playsErr } = await supabase
    .from("plays")
    .select("id, play_name, formation, playbook_id")
    .limit(10);

  if (playsErr) {
    console.log("Error:", playsErr.message);
  } else {
    console.log("Plays found:", plays ? plays.length : 0);
    if (plays) {
      plays.forEach((p) =>
        console.log(
          "  -",
          p.play_name,
          "|",
          p.formation,
          "| playbook:",
          p.playbook_id
        )
      );
    }
  }

  // Check all practice scripts
  console.log("\n=== All Practice Scripts ===");
  const { data: scripts, error: scriptsErr } = await supabase
    .from("practice_scripts")
    .select("*");

  if (scriptsErr) {
    console.log("Error:", scriptsErr.message);
  } else {
    console.log("Scripts found:", scripts ? scripts.length : 0);
    if (scripts) {
      scripts.forEach((s) => {
        console.log("  - ID:", s.id);
        console.log("    Title:", s.title);
        console.log("    Team ID:", s.team_id);
        console.log("    Created:", s.created_at);
      });
    }
  }

  // Check practice_script_plays with play details
  console.log("\n=== Practice Script Plays (join table) ===");
  const { data: scriptPlays, error: scriptPlaysErr } = await supabase
    .from("practice_script_plays")
    .select("*, plays(id, play_name, formation)");

  if (scriptPlaysErr) {
    console.log("Error:", scriptPlaysErr.message);
  } else {
    console.log("Script plays found:", scriptPlays ? scriptPlays.length : 0);
    if (scriptPlays) {
      scriptPlays.forEach((sp) => {
        console.log("  - Script ID:", sp.practice_script_id);
        console.log("    Play:", sp.plays?.play_name || "Unknown");
        console.log("    Formation:", sp.plays?.formation || "Unknown");
        console.log("    Reps:", sp.repetitions);
        console.log("    ---");
      });
    }
  }

  // Check teams
  console.log("\n=== Teams ===");
  const { data: teams, error: teamsErr } = await supabase
    .from("teams")
    .select("id, name");

  if (teamsErr) {
    console.log("Error:", teamsErr.message);
  } else {
    console.log("Teams found:", teams ? teams.length : 0);
    if (teams) {
      teams.forEach((t) => console.log("  -", t.name, "(", t.id, ")"));
    }
  }
}

check();
