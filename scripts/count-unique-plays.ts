#!/usr/bin/env tsx
/**
 * Count Unique Play Names
 * Queries database to find unique play names vs total plays
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countUniquePlays() {
  console.log("\n🏈 Analyzing Play Names...");
  console.log("=".repeat(60));

  try {
    // Get all plays
    const { data: plays, error } = await supabase
      .from("plays")
      .select("id, play_name, formation, formation_direction");

    if (error) throw error;

    if (!plays || plays.length === 0) {
      console.log("❌ No plays found in database");
      return;
    }

    // Count unique play names (case-insensitive)
    const uniqueNames = new Set(
      plays.map((p) => p.play_name.trim().toLowerCase())
    );

    // Count variations per play name
    const nameCount: Record<string, number> = {};
    plays.forEach((p) => {
      const name = p.play_name.trim();
      nameCount[name] = (nameCount[name] || 0) + 1;
    });

    // Find plays with multiple variations
    const playsWithVariations = Object.entries(nameCount)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);

    // Results
    console.log(`\n📊 RESULTS:`);
    console.log(`   Total plays in database: ${plays.length}`);
    console.log(`   Unique play names: ${uniqueNames.size}`);
    console.log(
      `   Average variations per play: ${(plays.length / uniqueNames.size).toFixed(2)}`
    );
    console.log(
      `   Plays with multiple variations: ${playsWithVariations.length}`
    );

    if (playsWithVariations.length > 0) {
      console.log(`\n🔄 Plays with Multiple Formations/Variations:`);
      console.log("   " + "-".repeat(56));
      playsWithVariations.slice(0, 15).forEach(([name, count]) => {
        console.log(`   ${name.padEnd(45)} × ${count}`);
      });
      if (playsWithVariations.length > 15) {
        console.log(`   ... and ${playsWithVariations.length - 15} more`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(
      `✅ Answer: You have ${uniqueNames.size} unique individual plays`
    );
    console.log("=".repeat(60) + "\n");
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

countUniquePlays();
