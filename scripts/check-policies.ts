#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function checkPolicies() {
  console.log("🔍 CHECKING CURRENT RLS POLICIES");
  console.log("=================================\n");

  try {
    // Check if security definer functions exist
    console.log("1. SECURITY DEFINER FUNCTIONS");
    console.log("-----------------------------");

    const { data: _functions, error: funcError } = await supabase.rpc(
      "is_user_team_member",
      { team_uuid: "00000000-0000-0000-0000-000000000000" }
    );

    if (funcError) {
      console.log("❌ is_user_team_member function:", funcError.message);
    } else {
      console.log("✅ is_user_team_member function exists");
    }

    // Check team_members policies
    console.log("\n2. TEAM_MEMBERS POLICIES");
    console.log("------------------------");

    const { data: policies, error: policyError } = await supabase
      .from("pg_policies")
      .select("*")
      .eq("tablename", "team_members");

    if (policyError) {
      console.log("❌ Failed to query policies:", policyError.message);
    } else {
      console.log(`Found ${policies.length} policies on team_members:`);
      policies.forEach((policy) => {
        console.log(
          `  - ${policy.policyname}: ${policy.cmd} (${policy.roles?.join(", ") || "all"})`
        );
        console.log(`    Using: ${policy.qual}`);
      });
    }

    // Test a simple query that should work
    console.log("\n3. TESTING TEAM MEMBERS ACCESS");
    console.log("------------------------------");

    const { data: members, error: membersError } = await supabase
      .from("team_members")
      .select("*")
      .limit(1);

    if (membersError) {
      console.log("❌ Team members query failed:", membersError.message);
    } else {
      console.log(
        `✅ Team members query successful: ${members.length} records`
      );
    }
  } catch (err) {
    console.error("❌ Error:", (err as Error).message);
  }
}

checkPolicies().catch(console.error);
