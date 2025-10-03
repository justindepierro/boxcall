#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: "../.env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function auditDatabase() {
  console.log("🔍 DATABASE AUDIT");
  console.log("================\n");

  // Test connections
  console.log("1. CONNECTION TESTS");
  console.log("-------------------");

  try {
    const { data: _serviceData, error: serviceError } = await serviceClient
      .from("profiles")
      .select("count(*)", { count: "exact", head: true });

    if (serviceError) {
      console.log("❌ Service key connection:", serviceError.message);
    } else {
      console.log("✅ Service key connection: OK");
    }
  } catch (err) {
    console.log("❌ Service key connection:", (err as Error).message);
  }

  try {
    const { data: _anonData, error: anonError } = await anonClient
      .from("profiles")
      .select("count(*)", { count: "exact", head: true });

    if (anonError) {
      console.log("❌ Anon key connection:", anonError.message);
    } else {
      console.log("✅ Anon key connection: OK");
    }
  } catch (err) {
    console.log("❌ Anon key connection:", (err as Error).message);
  }

  console.log("");

  // Check tables and RLS
  console.log("2. TABLE STATUS");
  console.log("---------------");

  const tables = [
    "teams",
    "team_members",
    "profiles",
    "playbooks",
    "plays",
    "play_calls",
    "team_posts",
    "practice_schedules",
    "game_plans",
    "equipment",
    "game_results",
    "calendar_events",
    "practice_scripts",
    "achievements",
  ];

  for (const table of tables) {
    try {
      // Check if table exists and get record count
      const { count, error: countError } = await serviceClient
        .from(table)
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.log(`❌ ${table}: Table error - ${countError.message}`);
        continue;
      }

      // Test RLS with service key (should work)
      const { data: _serviceTest, error: serviceRlsError } = await serviceClient
        .from(table)
        .select("*")
        .limit(1);

      const serviceRlsStatus = serviceRlsError ? "❌" : "✅";

      // Test RLS with anon key (may be restricted)
      const { data: _anonTest, error: anonRlsError } = await anonClient
        .from(table)
        .select("*")
        .limit(1);

      const anonRlsStatus = anonRlsError ? "🔒" : "✅";

      console.log(
        `${serviceRlsStatus} ${table}: ${count || 0} records (Service: ${serviceRlsStatus}, Anon: ${anonRlsStatus})`
      );
    } catch (err) {
      console.log(`❌ ${table}: ${(err as Error).message}`);
    }
  }

  console.log("");

  // Check admin user
  console.log("3. ADMIN USER STATUS");
  console.log("--------------------");

  try {
    const { data: adminUsers, error: adminError } = await serviceClient
      .from("profiles")
      .select("email, role")
      .eq("role", "admin");

    if (adminError) {
      console.log("❌ Admin check failed:", adminError.message);
    } else if (adminUsers && adminUsers.length > 0) {
      console.log(`✅ Admin users found: ${adminUsers.length}`);
      adminUsers.forEach((user) => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    } else {
      console.log("❌ No admin users found");
    }
  } catch (err) {
    console.log("❌ Admin check error:", (err as Error).message);
  }

  console.log("");

  // Summary
  console.log("4. SUMMARY");
  console.log("----------");
  console.log("✅ Database audit complete");
  console.log("💡 Use this script to monitor database state during rebuild");
}

auditDatabase().catch(console.error);
