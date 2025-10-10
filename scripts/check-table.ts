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

async function checkTableStructure() {
  try {
    console.log("🔍 Checking table structure...");

    // Check if table exists by trying to describe it
    const { error } = await supabase
      .from("achievement_definitions")
      .select("*")
      .limit(0); // Just check if table exists

    if (error) {
      console.log("❌ Table check error:", error.message);
    } else {
      console.log("✅ achievement_definitions table exists");
    }

    // Try to get table info
    const { data: info, error: infoError } = await supabase.rpc(
      "get_table_info",
      { table_name: "achievement_definitions" }
    );

    if (infoError) {
      console.log("❌ Could not get table info:", infoError.message);
    } else {
      console.log("✅ Table info:", info);
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

checkTableStructure();
