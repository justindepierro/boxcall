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

async function checkMigrations() {
  try {
    console.log("🔍 Checking migration history...");

    // Check if migration 067 ran
    const { data: migrations, error } = await supabase
      .from("supabase_migrations")
      .select("version, name")
      .order("version", { ascending: false })
      .limit(5);

    if (error) {
      console.log("❌ Migration check error:", error.message);
    } else {
      console.log("✅ Recent migrations:");
      migrations?.forEach((m) => console.log(`   ${m.version}: ${m.name}`));
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

checkMigrations();
