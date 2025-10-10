#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function checkCount() {
  try {
    console.log("🔍 Checking achievement_definitions count...");

    const { count, error } = await supabase
      .from("achievement_definitions")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log("❌ Query error:", error);
    } else {
      console.log(`✅ Table has ${count} rows`);
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

checkCount();
