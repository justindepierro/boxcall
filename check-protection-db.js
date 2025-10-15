#!/usr/bin/env node

/**
 * Quick script to check if protection field is saving to database
 * Run with: node check-protection-db.js
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// Need to use service role key to bypass RLS
// You'll need to add SUPABASE_SERVICE_ROLE_KEY to your .env.local
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_KEY;

if (!serviceRoleKey) {
  console.error("❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local");
  console.log("\n💡 To fix this:");
  console.log("1. Go to your Supabase dashboard");
  console.log("2. Settings → API → Service Role Key");
  console.log("3. Copy the key");
  console.log("4. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your_key_here");
  process.exit(1);
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkProtection() {
  console.log('🔍 Checking database for play "Smaug"...\n');

  const { data, error } = await supabase
    .from("plays")
    .select("id, play_name, protection, updated_at")
    .eq("play_name", "Smaug")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("❌ Error:", error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('❌ No play named "Smaug" found in database');
    return;
  }

  const play = data[0];
  console.log("✅ Found play in database:");
  console.log("---");
  console.log("ID:", play.id);
  console.log("Name:", play.play_name);
  console.log("Protection:", JSON.stringify(play.protection));
  console.log("Updated:", play.updated_at);
  console.log("---\n");

  if (play.protection === null) {
    console.log("⚠️  Protection is NULL (not set)");
  } else if (play.protection === "") {
    console.log("⚠️  Protection is EMPTY STRING");
  } else {
    console.log("✅ Protection has value:", play.protection);
  }
}

checkProtection().catch(console.error);
