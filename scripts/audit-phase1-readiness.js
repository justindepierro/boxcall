#!/usr/bin/env node
/**
 * Quick audit of current plays and formation data
 * Run: node scripts/audit-phase1-readiness.js
 */

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

async function auditPhase1Readiness() {
  console.log("🔍 PHASE 1 READINESS AUDIT\n");
  console.log("=".repeat(70));

  // 1. Check total plays
  console.log("\n📊 PLAYS COUNT:");
  const {
    data: plays,
    error: playsError,
    count: totalPlays,
  } = await supabase.from("plays").select("*", { count: "exact" });

  if (playsError) {
    console.log("❌ Error fetching plays:", playsError.message);
    return;
  }

  console.log(`   Total plays: ${totalPlays || 0}`);

  // 2. Check formation_id population
  const playsWithFormationId = plays?.filter((p) => p.formation_id) || [];
  const playsWithoutFormationId = plays?.filter((p) => !p.formation_id) || [];

  console.log(
    `   With formation_id: ${playsWithFormationId.length} (${Math.round((playsWithFormationId.length / (totalPlays || 1)) * 100)}%)`
  );
  console.log(`   Without formation_id: ${playsWithoutFormationId.length}`);

  // 3. Check formation text field
  const playsWithFormationText = plays?.filter((p) => p.formation) || [];
  console.log(`\n   With formation text: ${playsWithFormationText.length}`);

  // 4. Show sample plays
  if (plays && plays.length > 0) {
    console.log("\n📋 SAMPLE PLAYS:");
    console.log("-".repeat(70));
    plays.slice(0, 10).forEach((play, i) => {
      console.log(`\n${i + 1}. ${play.play_name || play.name || "(unnamed)"}`);
      console.log(`   formation_id: ${play.formation_id || "❌ NULL"}`);
      console.log(`   formation (text): ${play.formation || "(none)"}`);
    });
  }

  // 5. Check formations table
  console.log("\n\n📐 FORMATIONS TABLE:");
  console.log("-".repeat(70));
  const {
    data: formations,
    error: formError,
    count: totalFormations,
  } = await supabase.from("formations").select("*", { count: "exact" });

  if (formError) {
    console.log("❌ Error fetching formations:", formError.message);
  } else {
    console.log(`   Total formations: ${totalFormations || 0}`);

    if (formations && formations.length > 0) {
      console.log("\n   Sample formations:");
      formations.slice(0, 5).forEach((f) => {
        console.log(`      • ${f.name} (id: ${f.id.substring(0, 8)}...)`);
      });
    }
  }

  // 6. Summary and recommendations
  console.log("\n\n" + "=".repeat(70));
  console.log("📋 PHASE 1 READINESS SUMMARY\n");

  if (totalPlays === 0) {
    console.log("✅ NO PLAYS YET - Perfect time to start Phase 1!");
    console.log("   → Begin with fresh data and proper linking from day 1");
  } else if (playsWithFormationId.length === totalPlays) {
    console.log("✅ ALL PLAYS LINKED - Phase 1 already complete!");
    console.log("   → You can skip ahead to Phase 2 (Playbook Health Score)");
  } else if (playsWithoutFormationId.length > 0) {
    console.log("⚠️  MIGRATION NEEDED:");
    console.log(
      `   → ${playsWithoutFormationId.length} plays need formation_id links`
    );
    console.log(
      `   → Estimated time: ${playsWithoutFormationId.length < 20 ? "15-30 minutes (manual)" : "1-2 hours (with tool)"}`
    );
    console.log("\n   NEXT STEPS:");
    console.log("   1. Implement FormationService.getOrCreateFormation()");
    console.log("   2. Update AddNewPlayModal to use formation_id");
    console.log("   3. Build PlayMigrationTool for existing plays");
    console.log("   4. Run migration on existing plays");
  }

  console.log("\n=".repeat(70));
  console.log("✅ Audit complete!\n");
}

auditPhase1Readiness().catch(console.error);
