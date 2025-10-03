#!/usr/bin/env tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env file
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function checkPolicies() {
  try {
    console.log("🔍 Checking RLS policies on achievement_definitions...");

    // Try to get policy info via RPC if it exists
    const { data, error } = await supabase.rpc('get_policies', {
      table_name: 'achievement_definitions'
    });

    if (error) {
      console.log('❌ Could not get policies via RPC:', error.message);
    } else {
      console.log('✅ Policies:', data);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkPolicies();