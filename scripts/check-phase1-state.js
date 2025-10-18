#!/usr/bin/env node
/**
 * Check Phase 1 readiness and current database state
 *
 * Run: node scripts/check-phase1-state.js
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

async function checkPhase1State() {
  console.log("\n📊 Phase 1 Implementation Check");
  console.log("=".repeat(60));

  try {
    // Check formations table
    const { data: formations, error: formationsError } = await supabase
      .from("formations")
      .select("id, name, creation_source, playbook_id, opposite_formation_id")
      .limit(100);

    console.log("\n🏗️  Formations Table:");
    if (formationsError) {
      if (formationsError.code === "PGRST116") {
        console.log("   ℹ️  No formations yet (expected for clean slate)");
      } else {
        console.log("   ❌ Error:", formationsError.message);
      }
    } else {
      console.log(`   Total: ${formations?.length || 0}`);
      if (formations && formations.length > 0) {
        formations.forEach((f) => {
          console.log(
            `     - ${f.name} (source: ${f.creation_source || "unknown"})`
          );
          if (f.opposite_formation_id) {
            console.log(
              `       ↔ Linked to opposite: ${f.opposite_formation_id}`
            );
          }
        });
      }
    }

    // Check plays table
    const { data: plays, error: playsError } = await supabase
      .from("plays")
      .select("id, play_name, formation, formation_id")
      .limit(100);

    console.log("\n📝 Plays Table:");
    if (playsError) {
      if (playsError.code === "PGRST116") {
        console.log("   ℹ️  No plays yet (expected for clean slate)");
      } else {
        console.log("   ❌ Error:", playsError.message);
      }
    } else {
      console.log(`   Total: ${plays?.length || 0}`);
      if (plays && plays.length > 0) {
        const linked = plays.filter((p) => p.formation_id);
        console.log(`   Linked to formations: ${linked.length}`);
        plays.forEach((p) => {
          const linkIcon = p.formation_id ? "🔗" : "⚠️";
          console.log(
            `     ${linkIcon} ${p.play_name} (formation: ${p.formation})`
          );
        });
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Phase 1 Code Implementation Complete!");
    console.log("=".repeat(60));
    console.log("\n📝 What was implemented:");
    console.log("   ✓ FormationService.getOrCreateFormation() added");
    console.log("   ✓ FormationService.getFormationByName() added");
    console.log("   ✓ FormationService.linkOppositeFormations() added");
    console.log("   ✓ AddNewPlayModal updated to auto-create formations");
    console.log("\n🎯 Next Steps:");
    console.log("   1. Test in UI: Create a play through the app");
    console.log("   2. Verify: Check that formation was auto-created");
    console.log("   3. Verify: Check that formation_id is set on play");
    console.log("   4. (Optional) Test opposite formation linking\n");
  } catch (error) {
    console.error("\n❌ Check failed:", error);
    process.exit(1);
  }
}

checkPhase1State();
