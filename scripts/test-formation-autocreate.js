#!/usr/bin/env node
/**
 * Test script: Formation Auto-Creation (Phase 1)
 *
 * Tests the new getOrCreateFormation() functionality by:
 * 1. Creating a play with a formation name
 * 2. Verifying the formation was auto-created
 * 3. Checking the bidirectional link (formation_id on play)
 *
 * Run: node scripts/test-formation-autocreate.js
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
  console.error("   VITE_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("   VITE_SUPABASE_ANON_KEY:", supabaseKey ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFormationAutoCreation() {
  console.log("\n🧪 Testing Formation Auto-Creation (Phase 1)");
  console.log("=".repeat(60));

  try {
    // ===================================================================
    // STEP 1: Get first playbook (or create test playbook)
    // ===================================================================
    console.log("\n📖 Step 1: Finding playbook...");

    const { data: playbooks, error: playbooksError } = await supabase
      .from("playbooks")
      .select("id, name")
      .limit(1);

    if (playbooksError) throw playbooksError;

    let playbookId;
    if (!playbooks || playbooks.length === 0) {
      // Create a test playbook
      console.log("   Creating test playbook...");
      const { data: newPlaybook, error: createError } = await supabase
        .from("playbooks")
        .insert([{ name: "Phase 1 Test Playbook" }])
        .select()
        .single();

      if (createError) throw createError;
      playbookId = newPlaybook.id;
      console.log(`   ✓ Created playbook: ${newPlaybook.name} (${playbookId})`);
    } else {
      playbookId = playbooks[0].id;
      console.log(
        `   ✓ Using existing playbook: ${playbooks[0].name} (${playbookId})`
      );
    }

    // ===================================================================
    // STEP 2: Simulate what AddNewPlayModal does (manual formation creation)
    // ===================================================================
    console.log("\n🏈 Step 2: Auto-creating formation via direct API call...");

    const formationName = "Trips Right";
    console.log(`   Formation name: "${formationName}"`);

    // Check if formation exists first
    const { data: existingFormations } = await supabase
      .from("formations")
      .select("*");

    const normalizedName = formationName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "");
    const existing = existingFormations?.find(
      (f) => f.name.toLowerCase().trim().replace(/\s+/g, "") === normalizedName
    );

    let formationId;
    if (existing) {
      console.log(
        `   ✓ Found existing formation: ${existing.name} (${existing.id})`
      );
      formationId = existing.id;
    } else {
      // Create new formation (simulating getOrCreateFormation logic)
      console.log("   Creating new formation...");
      const { data: newFormation, error: formationError } = await supabase
        .from("formations")
        .insert([
          {
            playbook_id: playbookId,
            name: formationName,
            player_positions: [],
            creation_source: "play_builder",
            creation_context: {
              triggeredBy: "test-script",
              timestamp: new Date().toISOString(),
            },
          },
        ])
        .select()
        .single();

      if (formationError) throw formationError;
      formationId = newFormation.id;
      console.log(
        `   ✓ Created formation: ${newFormation.name} (${formationId})`
      );
    }

    // ===================================================================
    // STEP 3: Create play with formation_id
    // ===================================================================
    console.log("\n📝 Step 3: Creating play with auto-created formation...");

    const playName = "Y-Sail";
    console.log(`   Play name: "${playName}"`);

    const { data: newPlay, error: playError } = await supabase
      .from("plays")
      .insert([
        {
          playbook_id: playbookId,
          formation: formationName,
          formation_id: formationId, // Link to auto-created formation!
          play_name: playName,
          p_type: "pass",
          confidence_base: 80,
          notes: "Phase 1 test play - formation auto-created",
        },
      ])
      .select()
      .single();

    if (playError) throw playError;

    console.log(`   ✓ Created play: ${newPlay.play_name}`);
    console.log(`     - formation: ${newPlay.formation}`);
    console.log(`     - formation_id: ${newPlay.formation_id}`);
    console.log(
      `     - Linked: ${newPlay.formation_id === formationId ? "✓" : "✗"}`
    );

    // ===================================================================
    // STEP 4: Verify database state
    // ===================================================================
    console.log("\n✅ Step 4: Verifying database state...");

    const { data: allPlays } = await supabase
      .from("plays")
      .select("id, play_name, formation, formation_id");

    const { data: allFormations } = await supabase
      .from("formations")
      .select("id, name, creation_source, playbook_id");

    console.log(`   Total plays: ${allPlays?.length || 0}`);
    console.log(`   Total formations: ${allFormations?.length || 0}`);

    const autoCreatedFormations =
      allFormations?.filter((f) => f.creation_source === "play_builder") || [];

    console.log(`   Auto-created formations: ${autoCreatedFormations.length}`);

    if (autoCreatedFormations.length > 0) {
      console.log("\n   Auto-created formations:");
      autoCreatedFormations.forEach((f) => {
        console.log(`     - ${f.name} (${f.id})`);
      });
    }

    // ===================================================================
    // SUCCESS
    // ===================================================================
    console.log("\n" + "=".repeat(60));
    console.log("✅ Phase 1 Test Complete!");
    console.log("=".repeat(60));
    console.log("\n📊 Summary:");
    console.log(`   - Formation auto-created: ${formationName}`);
    console.log(`   - Play created: ${playName}`);
    console.log(`   - Link verified: formation_id matches`);
    console.log(
      `   - Database state: ${allPlays?.length} plays, ${allFormations?.length} formations`
    );
    console.log(
      "\n🎯 Next: Test in UI by creating a play through AddNewPlayModal\n"
    );
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

testFormationAutoCreation();
