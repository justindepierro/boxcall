#!/usr/bin/env node
/**
 * Detailed Play & Formation Audit
 * Shows ALL plays across all playbooks with formation linking status
 *
 * Run: node scripts/detailed-play-audit.js
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function detailedPlayAudit() {
  console.log("\n📊 Detailed Play & Formation Audit");
  console.log("=".repeat(80));

  try {
    // ===================================================================
    // STEP 1: Get all playbooks
    // ===================================================================
    console.log("\n📚 Playbooks:");
    const { data: playbooks, error: playbooksError } = await supabase
      .from("playbooks")
      .select("id, name")
      .order("created_at", { ascending: false });

    if (playbooksError) {
      console.log("   ❌ Error fetching playbooks:", playbooksError.message);
      return;
    }

    if (!playbooks || playbooks.length === 0) {
      console.log("   ℹ️  No playbooks found");
      return;
    }

    console.log(`   Total: ${playbooks.length}`);
    playbooks.forEach((pb, idx) => {
      console.log(
        `   ${idx + 1}. ${pb.name} (ID: ${pb.id.substring(0, 8)}...)`
      );
    });

    // ===================================================================
    // STEP 2: Get all plays (without RLS filtering if possible)
    // ===================================================================
    console.log("\n🏈 Plays Analysis:");

    for (const playbook of playbooks) {
      console.log(`\n   📖 Playbook: ${playbook.name}`);
      console.log(`   ${"─".repeat(70)}`);

      const { data: plays, error: playsError } = await supabase
        .from("plays")
        .select("id, play_name, formation, formation_id, p_type")
        .eq("playbook_id", playbook.id)
        .order("created_at", { ascending: false });

      if (playsError) {
        console.log(`   ❌ Error fetching plays: ${playsError.message}`);
        continue;
      }

      if (!plays || plays.length === 0) {
        console.log("   ℹ️  No plays in this playbook");
        continue;
      }

      console.log(`   Total Plays: ${plays.length}`);

      // Count linked vs unlinked
      const linked = plays.filter((p) => p.formation_id);
      const unlinked = plays.filter((p) => !p.formation_id);

      console.log(
        `   Linked to formations: ${linked.length} (${Math.round((linked.length / plays.length) * 100)}%)`
      );
      console.log(
        `   NOT linked (legacy): ${unlinked.length} (${Math.round((unlinked.length / plays.length) * 100)}%)`
      );

      console.log("\n   Plays:");
      plays.forEach((play, idx) => {
        const linkIcon = play.formation_id ? "🔗" : "⚠️";
        const linkStatus = play.formation_id
          ? "LINKED"
          : "LEGACY (no formation_id)";
        console.log(`   ${idx + 1}. ${linkIcon} ${play.play_name}`);
        console.log(`      Formation: "${play.formation}"`);
        console.log(`      Type: ${play.p_type || "unknown"}`);
        console.log(`      Status: ${linkStatus}`);
        if (play.formation_id) {
          console.log(
            `      Formation ID: ${play.formation_id.substring(0, 8)}...`
          );
        }
        console.log("");
      });
    }

    // ===================================================================
    // STEP 3: Get all formations
    // ===================================================================
    console.log("\n🏗️  Formations:");
    const { data: formations, error: formationsError } = await supabase
      .from("formations")
      .select("id, name, playbook_id, creation_source, opposite_formation_id")
      .order("created_at", { ascending: false });

    if (formationsError) {
      console.log("   ❌ Error fetching formations:", formationsError.message);
    } else if (!formations || formations.length === 0) {
      console.log("   ℹ️  No formations yet (expected for clean slate)");
    } else {
      console.log(`   Total: ${formations.length}`);
      formations.forEach((f, idx) => {
        const oppositeIcon = f.opposite_formation_id ? "↔" : "";
        console.log(`   ${idx + 1}. ${f.name} ${oppositeIcon}`);
        console.log(
          `      Playbook: ${playbooks.find((pb) => pb.id === f.playbook_id)?.name || "Unknown"}`
        );
        console.log(`      Source: ${f.creation_source || "unknown"}`);
        if (f.opposite_formation_id) {
          const opposite = formations.find(
            (fo) => fo.id === f.opposite_formation_id
          );
          console.log(`      Opposite: ${opposite?.name || "Unknown"}`);
        }
        console.log("");
      });
    }

    // ===================================================================
    // STEP 4: Summary & Recommendations
    // ===================================================================
    console.log("=".repeat(80));
    console.log("📋 SUMMARY & RECOMMENDATIONS");
    console.log("=".repeat(80));

    const totalPlays = playbooks.reduce((sum, pb) => {
      const { count } = supabase
        .from("plays")
        .select("*", { count: "exact", head: true })
        .eq("playbook_id", pb.id);
      return sum;
    }, 0);

    // Get actual counts
    let allPlaysCount = 0;
    let allLinkedCount = 0;

    for (const playbook of playbooks) {
      const { data: pbPlays } = await supabase
        .from("plays")
        .select("formation_id")
        .eq("playbook_id", playbook.id);

      if (pbPlays) {
        allPlaysCount += pbPlays.length;
        allLinkedCount += pbPlays.filter((p) => p.formation_id).length;
      }
    }

    console.log(`\n📊 Overall Statistics:`);
    console.log(`   Playbooks: ${playbooks.length}`);
    console.log(`   Total Plays: ${allPlaysCount}`);
    console.log(
      `   Linked Plays: ${allLinkedCount} (${allPlaysCount > 0 ? Math.round((allLinkedCount / allPlaysCount) * 100) : 0}%)`
    );
    console.log(
      `   Legacy Plays: ${allPlaysCount - allLinkedCount} (${allPlaysCount > 0 ? Math.round(((allPlaysCount - allLinkedCount) / allPlaysCount) * 100) : 0}%)`
    );
    console.log(`   Formations: ${formations?.length || 0}`);

    if (allPlaysCount > allLinkedCount) {
      console.log(
        `\n⚠️  You have ${allPlaysCount - allLinkedCount} legacy plays without formation_id links!`
      );
      console.log(`\n💡 OPTIONS:`);
      console.log(
        `\n   Option 1: BACKFILL (Recommended for keeping existing plays)`
      );
      console.log(
        `   ─────────────────────────────────────────────────────────`
      );
      console.log(`   Create a migration script to:`);
      console.log(`   • Loop through each legacy play`);
      console.log(
        `   • Call FormationService.getOrCreateFormation(play.formation)`
      );
      console.log(`   • Update play with formation_id`);
      console.log(
        `   • Result: All plays linked, formations created from existing data`
      );
      console.log(`\n   Option 2: FRESH START (Clean slate approach)`);
      console.log(
        `   ─────────────────────────────────────────────────────────`
      );
      console.log(`   • Keep legacy plays as-is (they still work!)`);
      console.log(`   • New plays will auto-create formations`);
      console.log(
        `   • Legacy plays show "formation" text, new plays link to formations`
      );
      console.log(`   • Analytics only work on new plays (which is fine!)`);
      console.log(`\n   Option 3: MANUAL BACKFILL (Selective approach)`);
      console.log(
        `   ─────────────────────────────────────────────────────────`
      );
      console.log(`   • Keep important plays, delete test plays`);
      console.log(`   • Manually backfill the keepers`);
      console.log(
        `   • Or just recreate them through the UI (formations auto-create!)`
      );

      console.log(`\n   💭 My Recommendation: Option 2 (Fresh Start)`);
      console.log(`      • Simplest approach`);
      console.log(`      • Legacy plays still work for reference`);
      console.log(`      • All new plays get proper linking from day 1`);
      console.log(
        `      • You're just getting started, so minimal legacy data to worry about`
      );
    } else {
      console.log(`\n✅ All plays are properly linked! You're good to go! 🎉`);
    }

    console.log(`\n${"=".repeat(80)}\n`);
  } catch (error) {
    console.error("\n❌ Audit failed:", error);
    process.exit(1);
  }
}

detailedPlayAudit();
