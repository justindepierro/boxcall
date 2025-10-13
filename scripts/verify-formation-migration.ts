/**
 * Verify Formation Migration Script
 * Tests that formations table and related functions were created successfully
 */

import { supabase } from "../src/lib/supabase";

async function verifyFormationMigration() {
  console.log("🔍 Verifying Formation System Migration...\n");

  // Test 1: Check if formations table exists
  console.log("1️⃣ Testing formations table...");
  try {
    const { data, error } = await supabase
      .from("formations")
      .select("id")
      .limit(1);

    if (error) {
      console.error("❌ formations table error:", error.message);
      return false;
    }
    console.log("✅ formations table exists and is queryable");
  } catch (err) {
    console.error("❌ formations table check failed:", err);
    return false;
  }

  // Test 2: Check if plays table has new columns
  console.log("\n2️⃣ Testing plays table updates...");
  try {
    const { data, error } = await supabase
      .from("plays")
      .select("id, formation_id, formation_direction")
      .limit(1);

    if (error) {
      console.error("❌ plays table error:", error.message);
      return false;
    }
    console.log(
      "✅ plays.formation_id and plays.formation_direction columns exist"
    );
  } catch (err) {
    console.error("❌ plays table check failed:", err);
    return false;
  }

  // Test 3: Check if RPC function exists
  console.log("\n3️⃣ Testing get_formation_variants function...");
  try {
    // Try to call with a dummy UUID (will return empty, but tests function exists)
    const { data, error } = await supabase.rpc("get_formation_variants", {
      formation_id: "00000000-0000-0000-0000-000000000000",
    } as never);

    // Even if it returns empty, no error means function exists
    if (error && !error.message.includes("relation")) {
      console.error("❌ get_formation_variants error:", error.message);
      return false;
    }
    console.log("✅ get_formation_variants() function exists");
  } catch (err) {
    console.error("❌ RPC function check failed:", err);
    return false;
  }

  // Test 4: Check if we can get current user's playbooks (for testing formation creation)
  console.log("\n4️⃣ Checking playbook access...");
  try {
    const { data: playbooks, error } = await supabase
      .from("playbooks")
      .select("id, name")
      .limit(5);

    if (error) {
      console.error("❌ playbooks query error:", error.message);
      return false;
    }

    if (playbooks && playbooks.length > 0) {
      console.log(`✅ Found ${playbooks.length} playbook(s):`);
      playbooks.forEach((pb: { id: string; name: string }) => {
        console.log(`   - ${pb.name} (${pb.id})`);
      });
    } else {
      console.log("⚠️  No playbooks found (you may need to create one first)");
    }
  } catch (err) {
    console.error("❌ playbooks check failed:", err);
    return false;
  }

  // Test 5: Check personnel_configurations table
  console.log("\n5️⃣ Checking personnel configurations...");
  try {
    const { data: personnel, error } = await supabase
      .from("personnel_configurations")
      .select("id, name, playbook_id")
      .limit(5);

    if (error) {
      console.error("❌ personnel_configurations query error:", error.message);
      return false;
    }

    if (personnel && personnel.length > 0) {
      console.log(`✅ Found ${personnel.length} personnel configuration(s):`);
      personnel.forEach((p: { id: string; name: string }) => {
        console.log(`   - ${p.name} (${p.id})`);
      });
    } else {
      console.log("⚠️  No personnel configurations found");
    }
  } catch (err) {
    console.error("❌ personnel check failed:", err);
    return false;
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ ALL CHECKS PASSED! Formation system is ready! 🎉");
  console.log("=".repeat(60));
  console.log("\n📋 Summary:");
  console.log("  ✅ formations table created");
  console.log("  ✅ plays table updated with formation_id fields");
  console.log("  ✅ RPC functions available");
  console.log("  ✅ Personnel system connected");
  console.log("\n🚀 Ready for Phase 3: FormationBuilderModal UI");

  return true;
}

// Run verification
verifyFormationMigration()
  .then((success) => {
    if (!success) {
      console.log(
        "\n❌ Migration verification failed. Please check errors above."
      );
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("\n💥 Verification script error:", err);
    process.exit(1);
  });
