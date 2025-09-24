#!/usr/bin/env tsx

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env file
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log("🔍 Environment check:");
console.log("URL:", supabaseUrl ? "present" : "missing");
console.log("Anon key:", anonKey ? "present" : "missing");
console.log("Service key:", serviceRoleKey ? "present" : "missing");

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

async function checkWithAnonKey() {
  try {
    console.log("\n🔍 Testing anon key...");
    const supabase = createClient(supabaseUrl!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase
      .from('achievement_definitions')
      .select('name, description');

    if (error) {
      console.log('❌ Anon key query error:', error.message);
    } else {
      console.log(`✅ Anon key found ${data?.length || 0} achievements:`);
      data?.slice(0, 3).forEach(a => console.log(`   - ${a.name}`));
      if (data && data.length > 3) console.log(`   ... and ${data.length - 3} more`);
    }
  } catch (error: any) {
    console.error('❌ Anon key error:', error.message);
  }
}

async function checkWithServiceRole() {
  try {
    console.log("\n🔍 Testing service role key...");
    const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase
      .from('achievement_definitions')
      .select('name, description')
      .limit(5);

    if (error) {
      console.log('❌ Service role query error:', error.message);
    } else {
      console.log(`✅ Service role found ${data?.length} achievements:`);
      data?.forEach(a => console.log(`   - ${a.name}`));
    }

  } catch (error: any) {
    console.error('❌ Service role error:', error.message);
  }
}

async function main() {
  await checkWithAnonKey();
  await checkWithServiceRole();
}

main();